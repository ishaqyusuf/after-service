"use client";

import { LogEvents } from "@afterservice/events";
import { useTrack } from "@afterservice/events/client";
import { Download, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type InstallOutcome = "accepted" | "dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: InstallOutcome;
    platform: string;
  }>;
};

const DISMISSED_UNTIL_KEY = "afterservice:pwa-install-dismissed-until";
const INSTALLED_KEY = "afterservice:pwa-installed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

function getStorageItem(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorageItem(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in restricted browser modes; install prompting still works.
  }
}

function getInstallSuppression() {
  if (typeof window === "undefined") {
    return true;
  }

  if (getStorageItem(INSTALLED_KEY) === "true") {
    return true;
  }

  const dismissedUntil = Number(getStorageItem(DISMISSED_UNTIL_KEY) ?? 0);

  return Number.isFinite(dismissedUntil) && Date.now() < dismissedUntil;
}

function suppressInstallPrompt() {
  setStorageItem(DISMISSED_UNTIL_KEY, String(Date.now() + DISMISS_DURATION));
}

export function MobileInstallTopSheet({
  onVisibilityChange,
}: {
  onVisibilityChange: (isVisible: boolean) => void;
}) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const promptShownTracked = useRef(false);
  const track = useTrack();

  const isVisible = useMemo(
    () => Boolean(deferredPrompt && isMobile && !isDismissed),
    [deferredPrompt, isDismissed, isMobile],
  );

  useEffect(() => {
    onVisibilityChange(isVisible);

    if (isVisible && !promptShownTracked.current) {
      promptShownTracked.current = true;
      track({
        event: LogEvents.PwaInstallPromptShown.name,
        channel: LogEvents.PwaInstallPromptShown.channel,
        location: "mobile_install_top_sheet",
      });
    }
  }, [isVisible, onVisibilityChange, track]);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const updateMobile = () => setIsMobile(mobileQuery.matches);

    updateMobile();
    mobileQuery.addEventListener("change", updateMobile);

    return () => mobileQuery.removeEventListener("change", updateMobile);
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      if (getInstallSuppression()) {
        return;
      }

      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsDismissed(false);
    };

    const onAppInstalled = () => {
      setStorageItem(INSTALLED_KEY, "true");
      setDeferredPrompt(null);
      setIsDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const dismissPrompt = useCallback(
    (reason: string) => {
      suppressInstallPrompt();
      setDeferredPrompt(null);
      setIsDismissed(true);
      track({
        event: LogEvents.PwaInstallDismissed.name,
        channel: LogEvents.PwaInstallDismissed.channel,
        location: "mobile_install_top_sheet",
        reason,
      });
    },
    [track],
  );

  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }

    track({
      event: LogEvents.PwaInstallClicked.name,
      channel: LogEvents.PwaInstallClicked.channel,
      location: "mobile_install_top_sheet",
    });

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setStorageItem(INSTALLED_KEY, "true");
      track({
        event: LogEvents.PwaInstallAccepted.name,
        channel: LogEvents.PwaInstallAccepted.channel,
        location: "mobile_install_top_sheet",
        platform: choice.platform,
      });
    } else {
      suppressInstallPrompt();
      track({
        event: LogEvents.PwaInstallDismissed.name,
        channel: LogEvents.PwaInstallDismissed.channel,
        location: "mobile_install_top_sheet",
        platform: choice.platform,
        reason: "browser_prompt",
      });
    }

    setDeferredPrompt(null);
    setIsDismissed(true);
  }, [deferredPrompt, track]);

  return (
    <div
      className={[
        "md:hidden fixed inset-x-3 top-[calc(4.5rem+0.75rem+env(safe-area-inset-top))] z-40",
        "rounded-[18px] bg-[#0a0a0a]/95 p-3 text-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.45),0_2px_8px_-2px_rgba(0,0,0,0.3)] backdrop-blur-md",
        "flex items-center gap-3",
        "transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-4 opacity-0",
      ].join(" ")}
      aria-hidden={!isVisible}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={32}
          height={32}
          className="h-8 w-8"
          aria-hidden="true"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold leading-tight text-white">
          Install afterservice
        </p>
        <p className="mt-0.5 text-xs font-medium leading-tight text-white/65">
          Open faster from your home screen
        </p>
      </div>

      <button
        type="button"
        onClick={installApp}
        className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold text-[#0a0a0a] shadow-sm transition-colors hover:bg-[#eef8f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
      >
        Install now
        <Download className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => dismissPrompt("manual_close")}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        aria-label="Dismiss install prompt"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
