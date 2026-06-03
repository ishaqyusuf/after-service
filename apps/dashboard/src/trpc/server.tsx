import "server-only";

import type { AppRouter } from "@afterservice/api/router";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCClient, httpLink, loggerLink } from "@trpc/client";
import {
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { cache } from "react";
import superjson from "superjson";
import { makeQueryClient } from "./query-client";
import { headers } from "next/headers";

export const getQueryClient = cache(makeQueryClient);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const SSR_FETCH_TIMEOUT_MS = 8_000;

function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(SSR_FETCH_TIMEOUT_MS);
  const signal = init?.signal
    ? AbortSignal.any([init.signal, timeoutSignal])
    : timeoutSignal;

  const headers = new Headers(init?.headers);

  return fetch(input, { ...init, signal, headers });
}

export const trpc = createTRPCOptionsProxy<AppRouter>({
  queryClient: getQueryClient,
  client: createTRPCClient({
    links: [
      httpLink({
        url: `${API_BASE_URL}/api/trpc`,
        transformer: superjson,
        fetch: fetchWithTimeout,
        async headers() {
          const headersList = await headers();
          const cookie = headersList.get("cookie");
          return {
            cookie: cookie ?? "",
          };
        },
      }),
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
      }),
    ],
  }),
});

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}



export function prefetch<T extends { queryKey: any }>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();

  if (queryOptions.queryKey[1]?.type === "infinite") {
    void queryClient.prefetchInfiniteQuery(queryOptions as any).catch(() => {});
  } else {
    void queryClient.prefetchQuery(queryOptions as any).catch(() => {});
  }
}

export function batchPrefetch<T extends { queryKey: any }>(
  queryOptionsArray: T[],
) {
  const queryClient = getQueryClient();

  for (const queryOptions of queryOptionsArray) {
    if (queryOptions.queryKey[1]?.type === "infinite") {
      void queryClient.prefetchInfiniteQuery(queryOptions as any).catch(() => {});
    } else {
      void queryClient.prefetchQuery(queryOptions as any).catch(() => {});
    }
  }
}
