"use client";
import type { AssistantCard } from "@afterservice/assistant";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTRPC } from "@/trpc/client";
import { AssistantLauncher } from "./assistant-launcher";
export function useAssistantController() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [liveCards, setLiveCards] = useState<AssistantCard[]>([]);
  const [error, setError] = useState<string>();
  const abort = useRef<AbortController | null>(null);
  const initializing = useRef(false);
  const availability = useQuery(
    trpc.assistant.availability.queryOptions(undefined, { retry: false }),
  );
  const enabled = availability.data?.enabled ?? false;
  const active = enabled && (open || pathname === "/assistant");
  const conversations = useQuery(
    trpc.assistant.conversations.queryOptions(undefined, {
      enabled: active,
      retry: false,
    }),
  );
  const allowance = useQuery(
    trpc.assistant.allowance.queryOptions(undefined, {
      enabled: active,
      retry: false,
    }),
  );
  const conversation = useQuery(
    trpc.assistant.conversation.queryOptions(
      { id: conversationId ?? "" },
      {
        enabled: active && !!conversationId,
        retry: false,
        refetchInterval: (q) =>
          q.state.data?.run?.state === "running" && !busy ? 2000 : false,
      },
    ),
  );
  const create = useMutation(
    trpc.assistant.createConversation.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: trpc.assistant.conversations.queryKey(),
        }),
    }),
  );
  async function newChat() {
    if (busy) return;
    setError(undefined);
    try {
      const item = await create.mutateAsync();
      setConversationId(item.id);
      setLiveText("");
      setLiveCards([]);
      setInput("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not start a conversation.",
      );
    }
  }
  useEffect(() => {
    if (
      !active ||
      conversationId ||
      !conversations.isSuccess ||
      initializing.current
    )
      return;
    if (conversations.data[0]) {
      setConversationId(conversations.data[0].id);
      return;
    }
    initializing.current = true;
    void create
      .mutateAsync()
      .then((item) => setConversationId(item.id))
      .catch((e) =>
        setError(
          e instanceof Error ? e.message : "Could not start a conversation.",
        ),
      )
      .finally(() => {
        initializing.current = false;
      });
  }, [
    active,
    conversationId,
    conversations.isSuccess,
    conversations.data,
    create.mutateAsync,
  ]);
  useEffect(() => () => abort.current?.abort(), []);
  async function refresh() {
    await Promise.all([
      conversation.refetch(),
      conversations.refetch(),
      allowance.refetch(),
    ]);
  }
  async function send() {
    if (!conversationId || busy || !input.trim()) return;
    const message = input.trim();
    setBusy(true);
    setError(undefined);
    setLiveText("");
    setLiveCards([]);
    setInput("");
    const controller = new AbortController();
    abort.current = controller;
    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          requestKey: crypto.randomUUID(),
          message,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const data = await response.json();
        throw Error(data.error ?? "Could not start the reply.");
      }
      if (!response.body) throw Error("The reply stream is unavailable.");
      void conversation.refetch();
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let pending = "";
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        pending += decoder.decode(chunk.value, { stream: true });
        let end = pending.indexOf("\n");
        while (end >= 0) {
          const line = pending.slice(0, end);
          pending = pending.slice(end + 1);
          end = pending.indexOf("\n");
          if (!line) continue;
          const event: {
            type: string;
            text?: string;
            card?: AssistantCard;
            message?: string;
          } = JSON.parse(line);
          if (event.type === "text" && event.text)
            setLiveText((text) => text + event.text);
          if (event.type === "card" && event.card) {
            const card = event.card;
            setLiveCards((cards) => [...cards, card]);
            if (card.kind === "proposal") void conversation.refetch();
          }
          if (event.type === "error")
            setError(event.message ?? "The reply stopped.");
        }
      }
    } catch (e) {
      if (!controller.signal.aborted) {
        setError(e instanceof Error ? e.message : "The reply failed.");
        setInput(message);
      }
    } finally {
      abort.current = null;
      setBusy(false);
      await refresh();
      setLiveText("");
      setLiveCards([]);
    }
  }
  function stop() {
    abort.current?.abort();
  }
  function selectChat(id: string) {
    if (busy) return;
    setConversationId(id);
    setLiveText("");
    setLiveCards([]);
    setError(undefined);
  }
  return {
    open,
    setOpen,
    expanded,
    setExpanded,
    conversationId,
    input,
    setInput,
    busy,
    liveText,
    liveCards,
    error,
    setError,
    availability,
    enabled,
    conversations,
    conversation,
    allowance,
    newChat,
    send,
    stop,
    refresh,
    selectChat,
    creating: create.isPending,
  };
}
type AssistantState = ReturnType<typeof useAssistantController>;
const AssistantContext = createContext<AssistantState | null>(null);
export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) throw Error("Assistant provider is missing.");
  return context;
}
export function AssistantProvider({ children }: { children: ReactNode }) {
  const state = useAssistantController();
  return (
    <AssistantContext.Provider value={state}>
      {children}
      <AssistantLauncher />
    </AssistantContext.Provider>
  );
}
