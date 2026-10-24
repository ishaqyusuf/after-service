"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const serverSnapshot = () => "UTC";
const browserSnapshot = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

// Keep hydration stable, then use a distinct query key for the browser's calendar.
export function useTimeZone() {
  return useSyncExternalStore(subscribe, browserSnapshot, serverSnapshot);
}
