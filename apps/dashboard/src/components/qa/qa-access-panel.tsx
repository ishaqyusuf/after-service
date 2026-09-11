"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
} from "@afterservice/ui";
import { RefreshCw, Search, ShieldCheck, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const CONTRACT_VERSION = 1;
const BROADCAST_CHANNEL = "afterservice-qa-access-v1";

type QaAuthorization = {
  expiresAt: string;
  qaDomain: string;
  testerIdentity: string;
};

type QaProfile = {
  identity: { email: string; id: string; name: string };
  membership: { role: string };
  profileReference: string;
  workspace: { id: string; name: string; slug: string };
};

type Status =
  | "checking"
  | "needs_authorization"
  | "authorized"
  | "network_unavailable"
  | "unavailable"
  | "upgrade_required";

async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T & {
    message?: string;
  };
  if (!response.ok) {
    throw new Error(body.message || "QA access is unavailable.");
  }
  return body;
}

export function QaAccessPanel() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("checking");
  const [authorization, setAuthorization] = useState<QaAuthorization | null>(
    null,
  );
  const [profiles, setProfiles] = useState<QaProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [qaDomain, setQaDomain] = useState("");
  const [credential, setCredential] = useState("");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectingReference, setSelectingReference] = useState<string | null>(
    null,
  );

  const refreshProfiles = useCallback(async () => {
    const response = await fetch("/api/qa-access/profiles", {
      cache: "no-store",
      credentials: "same-origin",
    });
    const body = await readJson<{ profiles: QaProfile[] }>(response);
    setProfiles(body.profiles);
  }, []);

  const bootstrap = useCallback(async () => {
    setStatus("checking");
    setError(null);
    try {
      const capabilityResponse = await fetch(
        `/api/qa-access/capability?contractVersion=${CONTRACT_VERSION}`,
        { cache: "no-store" },
      );
      if (!capabilityResponse.ok) {
        const capability = (await capabilityResponse
          .json()
          .catch(() => null)) as { category?: string } | null;
        setStatus(
          capability?.category === "upgrade_required"
            ? "upgrade_required"
            : "unavailable",
        );
        return;
      }

      const revalidation = await fetch("/api/qa-access/revalidate", {
        cache: "no-store",
        credentials: "same-origin",
        method: "POST",
      });
      if (revalidation.status === 401) {
        setAuthorization(null);
        setProfiles([]);
        setStatus("needs_authorization");
        return;
      }
      const current = await readJson<QaAuthorization>(revalidation);
      setAuthorization(current);
      setQaDomain(current.qaDomain);
      setStatus("authorized");
      await refreshProfiles();
    } catch (bootstrapError) {
      setError(
        bootstrapError instanceof Error
          ? bootstrapError.message
          : "QA access is unavailable.",
      );
      setStatus("network_unavailable");
    }
  }, [refreshProfiles]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (status !== "authorized") return;
    const channel =
      typeof BroadcastChannel === "undefined"
        ? null
        : new BroadcastChannel(BROADCAST_CHANNEL);
    async function revalidate() {
      const response = await fetch("/api/qa-access/revalidate", {
        cache: "no-store",
        credentials: "same-origin",
        method: "POST",
      }).catch(() => null);
      if (response?.ok) return;
      setAuthorization(null);
      setProfiles([]);
      setStatus(response?.status === 401 ? "needs_authorization" : "unavailable");
    }
    const onFocus = () => void revalidate();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void revalidate();
    };
    const interval = window.setInterval(() => void revalidate(), 60_000);
    channel?.addEventListener("message", (event) => {
      if (event.data !== "revoked") return;
      setAuthorization(null);
      setProfiles([]);
      setStatus("needs_authorization");
    });
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      channel?.close();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [status]);

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return profiles;
    return profiles.filter((profile) =>
      [
        profile.workspace.name,
        profile.workspace.slug,
        profile.identity.email,
        profile.identity.name,
        profile.membership.role,
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [profiles, search]);

  async function authorize(event: React.FormEvent) {
    event.preventDefault();
    if (!qaDomain.trim() || !credential.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/qa-access/exchange", {
        body: JSON.stringify({
          contractVersion: CONTRACT_VERSION,
          credential: credential.trim(),
          qaDomain: qaDomain.trim(),
        }),
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const body = await readJson<{ authorization: QaAuthorization }>(response);
      setAuthorization(body.authorization);
      setStatus("authorized");
      setCredential("");
      await refreshProfiles();
    } catch (authorizeError) {
      setCredential("");
      setError(
        authorizeError instanceof Error
          ? authorizeError.message
          : "QA access could not be authorized.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function selectProfile(profileReference: string) {
    setSelectingReference(profileReference);
    setError(null);
    try {
      const response = await fetch("/api/qa-access/select", {
        body: JSON.stringify({ profileReference }),
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      await readJson(response);
      window.location.assign("/");
    } catch (selectionError) {
      setError(
        selectionError instanceof Error
          ? selectionError.message
          : "This QA workspace is unavailable.",
      );
      await refreshProfiles().catch(() => undefined);
      setSelectingReference(null);
    }
  }

  async function revoke() {
    await fetch("/api/qa-access/revoke", {
      credentials: "same-origin",
      method: "POST",
    }).catch(() => undefined);
    setAuthorization(null);
    setProfiles([]);
    setError(null);
    setStatus("needs_authorization");
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL);
      channel.postMessage("revoked");
      channel.close();
    }
  }

  return (
    <>
      <Button
        className="mt-4 w-full"
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
      >
        <ShieldCheck className="size-4" />
        {status === "authorized" ? "Choose QA workspace" : "QA access"}
      </Button>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="max-h-[88vh] overflow-hidden rounded-3xl p-0 shadow-2xl">
          <DialogHeader className="flex-row items-start gap-3 space-y-0 border-border border-b p-5 sm:p-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <DialogTitle className="text-xl font-bold tracking-tight">
                {status === "authorized"
                  ? "Choose a QA workspace"
                  : "Connect QA workspace"}
              </DialogTitle>
              <span className="mr-8 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                Internal
              </span>
            </div>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              {authorization
                ? `${authorization.qaDomain} · ordinary authenticated sessions`
                : "The domain limits data scope; the tester credential authorizes access."}
            </DialogDescription>
          </div>
          </DialogHeader>

        <div className="max-h-[68vh] overflow-y-auto p-5 sm:p-6">
          {status === "authorized" ? (
            <div>
              <label className="relative block">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <span className="sr-only">Search QA workspaces</span>
                <Input
                  className="h-11 rounded-2xl pl-10"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Workspace, identity, or role"
                  value={search}
                />
              </label>
              {error ? <ErrorMessage>{error}</ErrorMessage> : null}
              <div className="mt-4 space-y-2">
                {filteredProfiles.map((profile) => (
                  <button
                    className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-border px-4 py-3 text-left transition hover:bg-muted/60 disabled:opacity-60"
                    disabled={Boolean(selectingReference)}
                    key={profile.profileReference}
                    onClick={() => void selectProfile(profile.profileReference)}
                    type="button"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                      {profile.workspace.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">
                        {profile.workspace.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {profile.identity.name} · {profile.identity.email}
                      </span>
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase text-muted-foreground">
                      {selectingReference === profile.profileReference
                        ? "Opening"
                        : profile.membership.role}
                    </span>
                  </button>
                ))}
                {!filteredProfiles.length ? (
                  <p className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                    No active QA workspace matches this domain and search.
                  </p>
                ) : null}
              </div>
              <div className="mt-4 flex justify-end border-border border-t pt-3">
                <Button onClick={() => void revoke()} type="button" variant="ghost">
                  <X className="size-4" />
                  Change QA domain
                </Button>
              </div>
            </div>
          ) : status === "checking" ? (
            <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
              Checking this internal environment…
            </p>
          ) : status === "network_unavailable" || status === "unavailable" ? (
            <div className="space-y-3 rounded-2xl bg-muted p-4 text-sm">
              <p>
                {status === "network_unavailable"
                  ? "Reconnect to this server. QA access stays blocked until authorization can be checked."
                  : "This environment has not enabled the QA accelerator correctly."}
              </p>
              {error ? <ErrorMessage>{error}</ErrorMessage> : null}
              <Button onClick={() => void bootstrap()} type="button">
                <RefreshCw className="size-4" />
                Retry
              </Button>
            </div>
          ) : status === "upgrade_required" ? (
            <p className="rounded-2xl bg-muted p-4 text-sm">
              This client contract is out of date. Open the latest internal build.
            </p>
          ) : (
            <form className="space-y-4" onSubmit={authorize}>
              <label className="block space-y-1.5 text-sm font-medium">
                <span>QA domain</span>
                <Input
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="h-11 rounded-2xl"
                  onChange={(event) => setQaDomain(event.target.value)}
                  placeholder="ishaq.qa.test"
                  required
                  value={qaDomain}
                />
              </label>
              <label className="block space-y-1.5 text-sm font-medium">
                <span>Tester credential</span>
                <Input
                  autoCapitalize="none"
                  autoComplete="off"
                  className="h-11 rounded-2xl"
                  onChange={(event) => setCredential(event.target.value)}
                  placeholder="Enter tester credential"
                  required
                  type="password"
                  value={credential}
                />
              </label>
              {error ? <ErrorMessage>{error}</ErrorMessage> : null}
              <Button
                className="h-11 w-full rounded-2xl"
                disabled={submitting || !qaDomain.trim() || !credential.trim()}
                type="submit"
              >
                {submitting ? "Authorizing…" : "Load QA workspaces"}
              </Button>
            </form>
          )}
        </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {children}
    </p>
  );
}
