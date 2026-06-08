"use client";

import { LogEvents } from "@afterservice/events";
import { useTrack } from "@afterservice/events/client";
import { useEffect } from "react";

const FIRST_VISIT_ID_COOKIE = "AFTERSERVICE_FIRST_SITE_VISIT_ID";
const FIRST_VISIT_TRACKED_COOKIE = "AFTERSERVICE_FIRST_SITE_VISIT_TRACKED";
const FIRST_VISIT_TRACKED_STORAGE_KEY = "afterservice:first-site-visit-tracked";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;

type CookieStoreLike = {
  set: (options: {
    expires: number;
    name: string;
    path: string;
    sameSite: "lax";
    secure?: boolean;
    value: string;
  }) => Promise<void>;
};

function getCookie(name: string) {
  const cookies = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean);
  const prefix = `${name}=`;
  const match = cookies.find((cookie) => cookie.startsWith(prefix));

  if (!match) {
    return null;
  }

  try {
    return decodeURIComponent(match.slice(prefix.length));
  } catch {
    return null;
  }
}

function setDocumentCookie(name: string, value: string, secure: boolean) {
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not available in every target browser yet.
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

function getCookieStore() {
  return (window as Window & { cookieStore?: CookieStoreLike }).cookieStore;
}

function setCookie(name: string, value: string) {
  const secure = window.location.protocol === "https:";
  const cookieStore = getCookieStore();

  if (cookieStore) {
    void cookieStore
      .set({
        expires: Date.now() + COOKIE_MAX_AGE_SECONDS * 1000,
        name,
        path: "/",
        sameSite: "lax",
        secure,
        value,
      })
      .catch(() => setDocumentCookie(name, value, secure));
    return;
  }

  setDocumentCookie(name, value, secure);
}

function createVisitId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function getUtmProperties(searchParams: URLSearchParams) {
  return {
    utmCampaign: searchParams.get("utm_campaign"),
    utmContent: searchParams.get("utm_content"),
    utmMedium: searchParams.get("utm_medium"),
    utmSource: searchParams.get("utm_source"),
    utmTerm: searchParams.get("utm_term"),
  };
}

function getTrackedVisitId() {
  try {
    return (
      localStorage.getItem(FIRST_VISIT_TRACKED_STORAGE_KEY) ??
      getCookie(FIRST_VISIT_TRACKED_COOKIE)
    );
  } catch {
    return getCookie(FIRST_VISIT_TRACKED_COOKIE);
  }
}

function setTrackedVisitId(firstVisitId: string) {
  setCookie(FIRST_VISIT_TRACKED_COOKIE, firstVisitId);

  try {
    localStorage.setItem(FIRST_VISIT_TRACKED_STORAGE_KEY, firstVisitId);
  } catch {
    // The cookie fallback above is enough when localStorage is unavailable.
  }
}

export function FirstSiteVisitTracker() {
  const track = useTrack();

  useEffect(() => {
    let firstVisitId = getCookie(FIRST_VISIT_ID_COOKIE);

    if (!firstVisitId) {
      firstVisitId = createVisitId();
      setCookie(FIRST_VISIT_ID_COOKIE, firstVisitId);
    }

    if (getTrackedVisitId() === firstVisitId) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);

    track({
      event: LogEvents.FirstSiteVisit.name,
      channel: LogEvents.FirstSiteVisit.channel,
      firstVisitId,
      firstVisitedAt: new Date().toISOString(),
      landingPath: window.location.pathname,
      landingSearch: window.location.search,
      referrer: document.referrer || null,
      ...getUtmProperties(searchParams),
    });

    setTrackedVisitId(firstVisitId);
  }, [track]);

  return null;
}
