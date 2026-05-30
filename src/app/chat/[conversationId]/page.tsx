"use client";

import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { ApiRequestError } from "@/lib/api/client";
import { listMessages, sendMessage } from "@/lib/api/chat";
import {
  subscribeChatMessageStream,
  type ChatStreamMessage,
} from "@/lib/api/chat-sse";
import {
  AlertBanner,
  btnPrimary,
  cardSurface,
  inputBase,
  PageHeader,
  PageLoading,
  SignInRequired,
  widePageShell,
} from "@/components/ui/page-shell";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type MsgRow = {
  id: string;
  content: string;
  createdAt: string;
  sender: { fullName: string; id: string };
};

function asMsgRow(item: Record<string, unknown> | ChatStreamMessage): MsgRow {
  const sender = item.sender as Record<string, unknown> | undefined;
  return {
    id: String(item.id ?? ""),
    content: String(item.content ?? ""),
    createdAt: String(item.createdAt ?? ""),
    sender: {
      id: String(sender?.id ?? ""),
      fullName: String(sender?.fullName ?? ""),
    },
  };
}

function asMsgRows(data: unknown): MsgRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => asMsgRow(item as Record<string, unknown>));
}

function appendUniqueMessage(prev: MsgRow[], incoming: MsgRow): MsgRow[] {
  if (prev.some((m) => m.id === incoming.id)) return prev;
  return [...prev, incoming].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function latestSince(messages: MsgRow[]): string | undefined {
  if (messages.length === 0) return undefined;
  const last = messages[messages.length - 1];
  return last?.createdAt || undefined;
}

export default function ChatConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { user, isReady } = useAuth();
  const { t } = useLanguage();

  const [messages, setMessages] = useState<MsgRow[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamLive, setStreamLive] = useState(false);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!conversationId) return;
      if (!opts?.silent) setLoading(true);
      setError(null);
      try {
        const list = await listMessages(conversationId, {
          page: 1,
          limit: 100,
        });
        setMessages(asMsgRows(list));
      } catch (err) {
        setError(
          err instanceof ApiRequestError
            ? err.message
            : t("chat.loadMessagesError"),
        );
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [conversationId, t],
  );

  useEffect(() => {
    if (!isReady || !user || !conversationId) return;
    void load();
  }, [isReady, user, conversationId, load]);

  useEffect(() => {
    if (!isReady || !user || !conversationId || loading) return;

    const abort = new AbortController();
    setStreamLive(true);

    subscribeChatMessageStream({
      conversationId,
      since: latestSince(messages),
      signal: abort.signal,
      onMessage: (incoming) => {
        setMessages((prev) => appendUniqueMessage(prev, asMsgRow(incoming)));
        setStreamLive(true);
      },
      onError: (err) => {
        if (abort.signal.aborted) return;
        setStreamLive(false);
        setError(
          err instanceof ApiRequestError
            ? err.message
            : t("chat.streamDisconnectedError"),
        );
      },
    });

    return () => {
      abort.abort();
      setStreamLive(false);
    };
    // Reconnect when conversation changes or initial history finishes loading.
    // `messages` is intentionally omitted to avoid reconnecting on every new message.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, user, conversationId, loading]);

  const [locked, setLocked] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !conversationId) return;
    setSending(true);
    setError(null);
    try {
      const created = await sendMessage(conversationId, { content: trimmed });
      setText("");
      setLocked(false);
      if (created && typeof created === "object") {
        setMessages((prev) =>
          appendUniqueMessage(prev, asMsgRow(created as Record<string, unknown>)),
        );
      } else {
        await load({ silent: true });
      }
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : t("chat.sendMessageError");
      if (msg.toLowerCase().includes("chat is locked")) {
        setLocked(true);
      }
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return <SignInRequired message={t("chat.signInToOpen")} />;
  }

  return (
    <main
      className={`${widePageShell} flex min-h-[calc(100vh-10rem)] flex-col pb-16`}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col min-h-0">
        <Link
        href="/chat"
        className="inline-flex text-sm font-medium text-teal-700 hover:text-teal-800 mb-2"
      >
        ← {t("chat.backToList")}
      </Link>

      <PageHeader
        eyebrow={t("chat.conversationEyebrow")}
        title="Chat"
        description={
          <span className="flex flex-col gap-1 text-xs text-slate-500">
            <span className="font-mono break-all">{conversationId}</span>
            {streamLive ? (
              <span className="inline-flex items-center gap-1.5 text-teal-700">
                <span
                  className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"
                  aria-hidden
                />
                Live (SSE)
              </span>
            ) : (
              <span className="text-amber-700">{t("chat.liveDisconnected")}</span>
            )}
          </span>
        }
      />

      <div className="flex-1 flex flex-col gap-4 min-h-0 mt-4">
        {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

        {locked ? (
          <div
            className="rounded-xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-sm border-l-4 border-l-amber-500"
            role="status"
          >
            {t("chat.lockedPrefix")}
            <Link href="/consultations" className="font-semibold underline">
              {t("chat.lockedLink")}
            </Link>
            {t("chat.lockedSuffix")}
          </div>
        ) : null}

        <div
          className={`${cardSurface} flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[min(52vh,520px)] min-h-[200px] bg-slate-50/50`}
        >
          {loading ? (
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
                aria-hidden
              />
              {t("chat.loadingMessages")}
            </p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              {t("chat.emptyMessages")}
            </p>
          ) : (
            messages.map((m) => {
              const mine = m.sender.id === user.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[85%] ${mine ? "ml-auto items-end" : "mr-auto items-start"}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      mine
                        ? "bg-teal-600 text-white rounded-br-md"
                        : "bg-white text-slate-800 ring-1 ring-slate-200/90 rounded-bl-md"
                    }`}
                  >
                    {!mine ? (
                      <p className="text-xs font-semibold text-teal-800 mb-1">
                        {m.sender.fullName}
                      </p>
                    ) : null}
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {m.content}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 px-1">
                    {new Date(m.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <form
          onSubmit={handleSend}
          className={`${cardSurface} flex gap-2 p-3 sm:p-4 shrink-0`}
        >
          <input
            className={`${inputBase} flex-1`}
            placeholder={
              locked
                ? t("chat.inputLockedPlaceholder")
                : t("chat.inputPlaceholder")
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={sending || locked}
          />
          <button
            type="submit"
            disabled={sending || locked || !text.trim()}
            className={`${btnPrimary} min-h-[44px] shrink-0 px-5`}
          >
            {t("chat.send")}
          </button>
        </form>
      </div>
      </div>
    </main>
  );
}
