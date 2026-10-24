"use client";
import type { AssistantCard } from "@afterservice/assistant";
import { Button, Input, Textarea } from "@afterservice/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, Loader2, Plus, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { AssistantResultCard } from "./assistant-cards";
import { AssistantProposalCard } from "./assistant-proposal";
import { useAssistant } from "./assistant-provider";
export function AssistantWorkspace({ compact = false }: { compact?: boolean }) {
  const a = useAssistant();
  const trpc = useTRPC();
  const qc = useQueryClient();
  const end = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState("");
  const rename = useMutation(
    trpc.assistant.renameConversation.mutationOptions(),
  );
  const remove = useMutation(
    trpc.assistant.deleteConversation.mutationOptions(),
  );
  const scrollKey = `${a.liveText}:${a.liveCards.length}:${a.conversation.data?.messages.length}`;
  useEffect(() => {
    if (!scrollKey) return;
    end.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [scrollKey]);
  useEffect(() => {
    if (a.open || !compact) composer.current?.focus();
  }, [a.open, compact]);
  if (a.availability.isPending)
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading assistant…
      </div>
    );
  if (a.availability.isError)
    return (
      <div className="p-6 text-sm">
        <p role="alert">Could not check assistant access.</p>
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => a.availability.refetch()}
        >
          Try again
        </Button>
      </div>
    );
  if (!a.enabled)
    return (
      <div className="p-6 text-sm">
        <p className="font-medium">Assistant is not enabled</p>
        <p className="mt-2 text-muted-foreground">
          Your workspace can continue using customers, jobs and the follow-up
          board.
        </p>
      </div>
    );
  const saved = a.conversation.data;
  const pending = saved?.proposals.filter((p) => p.state === "draft") ?? [];
  const shown = new Set<string>();
  function renderCards(cards: unknown, key: string) {
    if (!Array.isArray(cards)) return null;
    return (cards as AssistantCard[]).map((card) => {
      if (card.kind === "proposal") {
        shown.add(card.id);
        const proposal = saved?.proposals.find((p) => p.id === card.id);
        return proposal ? (
          <AssistantProposalCard
            key={proposal.id}
            proposal={proposal}
            receipt={saved?.receipts.find((r) => r.proposalId === proposal.id)}
          />
        ) : null;
      }
      return (
        <AssistantResultCard
          key={`${key}-${card.kind}-${card.title}-${"asOf" in card ? card.asOf : card.body.slice(0, 40)}`}
          card={card}
          disabled={a.busy}
        />
      );
    });
  }
  return (
    <div
      className={`flex min-h-0 flex-1 flex-col ${compact ? "" : "h-[calc(100dvh-190px)] min-h-[360px]"}`}
    >
      <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
        <select
          aria-label="Saved conversations"
          value={a.conversationId ?? ""}
          disabled={a.busy}
          onChange={(e) => a.selectChat(e.target.value)}
          className="min-w-0 flex-1 rounded border bg-background px-2 py-1.5 text-xs"
        >
          <option value="" disabled>
            {a.conversations.isPending
              ? "Loading conversations…"
              : "Choose conversation"}
          </option>
          {a.conversations.data?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <Button
          size="icon"
          variant="ghost"
          aria-label="New conversation"
          disabled={a.busy || a.creating}
          onClick={() => a.newChat()}
        >
          <Plus className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={!saved || a.busy}
          onClick={() => {
            setTitle(saved?.title ?? "");
            setRenaming(!renaming);
          }}
        >
          Rename
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Delete conversation"
          disabled={!saved || a.busy}
          onClick={() => setDeleting(!deleting)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      {renaming && (
        <form
          className="flex gap-2 border-b p-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!a.conversationId) return;
            try {
              await rename.mutateAsync({ id: a.conversationId, title });
              setRenaming(false);
              await a.refresh();
            } catch (e) {
              a.setError(
                e instanceof Error ? e.message : "Could not rename chat.",
              );
            }
          }}
        >
          <Input
            aria-label="Conversation title"
            value={title}
            maxLength={80}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button size="sm" disabled={rename.isPending || !title.trim()}>
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setRenaming(false)}
          >
            Cancel
          </Button>
        </form>
      )}
      {deleting && (
        <div className="border-b p-3 text-xs">
          <p>
            Delete this conversation and its drafts? Saved business records
            remain.
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={remove.isPending}
              onClick={async () => {
                if (!a.conversationId) return;
                try {
                  await remove.mutateAsync({ id: a.conversationId });
                  setDeleting(false);
                  await qc.invalidateQueries({
                    queryKey: trpc.assistant.conversations.queryKey(),
                  });
                  await a.newChat();
                } catch (e) {
                  a.setError(
                    e instanceof Error ? e.message : "Could not delete chat.",
                  );
                }
              }}
            >
              Delete chat
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleting(false)}
            >
              Keep chat
            </Button>
          </div>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {(a.conversations.isError || a.conversation.isError) && (
          <div role="alert" className="rounded border p-3 text-sm">
            <p>Could not load your saved conversation.</p>
            <Button
              className="mt-2"
              size="sm"
              variant="outline"
              onClick={() => a.refresh()}
            >
              Retry
            </Button>
          </div>
        )}
        {a.conversation.isPending && a.conversationId && (
          <p className="text-sm text-muted-foreground">Loading conversation…</p>
        )}
        {saved && !saved.messages.length && !a.busy && (
          <div className="py-6">
            <p className="text-lg font-medium">What needs attention?</p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Find a customer, record completed work, or prepare your next
              follow-up. You review every change before it is saved. Selected
              business details and your messages are processed by your
              workspace’s AI provider.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "What needs attention today?",
                "Help me add a customer",
                "Draft a friendly post-service check-in",
                "Show my message templates",
              ].map((prompt) => (
                <Button
                  key={prompt}
                  size="sm"
                  variant="outline"
                  className="h-auto whitespace-normal text-left"
                  onClick={() => {
                    a.setInput(prompt);
                    composer.current?.focus();
                  }}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}
        {saved?.messages.map((message) => (
          <div
            key={message.id}
            className={`mb-5 text-sm ${message.role === "user" ? "ml-6 rounded-md bg-muted p-3" : ""}`}
          >
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {message.role === "user" ? "You" : "Assistant"}
            </p>
            <p className="whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </p>
            {renderCards(message.cards, message.id)}
          </div>
        ))}
        {a.busy && (
          <div className="mb-4 text-sm">
            <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Working on your request
            </p>
            <p className="whitespace-pre-wrap break-words">{a.liveText}</p>
            {renderCards(a.liveCards, "live")}
          </div>
        )}
        {pending
          .filter((p) => !shown.has(p.id))
          .map((proposal) => (
            <AssistantProposalCard key={proposal.id} proposal={proposal} />
          ))}
        {!a.busy && saved?.run?.state === "running" && (
          <p role="status" className="text-xs text-muted-foreground">
            A reply is still finishing. Saved results will appear here.
          </p>
        )}
        {!a.busy && saved?.run?.state === "interrupted" && (
          <p role="status" className="text-xs text-muted-foreground">
            The previous reply stopped. Review saved drafts before trying again.
          </p>
        )}
        <div ref={end} />
      </div>
      <div className="shrink-0 border-t bg-background p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        {!a.availability.data?.configured && (
          <p className="mb-2 text-xs text-muted-foreground">
            The AI provider is not configured. Saved conversations and drafts
            remain available.
          </p>
        )}
        {a.error && (
          <p role="alert" className="mb-2 text-sm text-destructive">
            {a.error}
          </p>
        )}
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void a.send();
          }}
        >
          <Textarea
            ref={composer}
            aria-label="Message assistant"
            placeholder="Ask about your work…"
            className="max-h-36 min-h-20 resize-none"
            value={a.input}
            maxLength={4000}
            onChange={(e) => a.setInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                void a.send();
              }
            }}
          />
          {a.busy ? (
            <Button
              type="button"
              size="icon"
              aria-label="Stop reply"
              onClick={a.stop}
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              aria-label="Send message"
              disabled={
                !a.input.trim() ||
                !a.conversationId ||
                !a.availability.data?.configured ||
                (a.allowance.data !== undefined &&
                  a.allowance.data.remaining <
                    a.allowance.data.minimumTurnTokens) ||
                saved?.run?.state === "running"
              }
            >
              <ArrowUp className="size-4" />
            </Button>
          )}
        </form>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {a.allowance.data
            ? `${a.allowance.data.remaining.toLocaleString()} tokens available · resets ${new Date(a.allowance.data.resetsAt).toLocaleDateString(undefined, { timeZone: "UTC" })} UTC`
            : "Your workspace's assistant allowance is shared across the team."}
        </p>
      </div>
    </div>
  );
}
