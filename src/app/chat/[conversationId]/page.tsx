"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import { listMessages, sendMessage } from "@/lib/api/chat";
import {
  AlertBanner,
  btnPrimary,
  cardSurface,
  inputBase,
  PageHeader,
  PageLoading,
  SignInRequired,
} from "@/components/ui/page-shell";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const chatShell =
  "max-w-2xl mx-auto py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex flex-col pb-16 min-h-[calc(100vh-10rem)]";

type MsgRow = {
  id: string;
  content: string;
  createdAt: string;
  sender: { fullName: string; id: string };
};

function asMsgRows(data: unknown): MsgRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const r = item as Record<string, unknown>;
    const sender = r.sender as Record<string, unknown> | undefined;
    return {
      id: String(r.id ?? ""),
      content: String(r.content ?? ""),
      createdAt: String(r.createdAt ?? ""),
      sender: {
        id: String(sender?.id ?? ""),
        fullName: String(sender?.fullName ?? ""),
      },
    };
  });
}

export default function ChatConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { user, isReady } = useAuth();

  const [messages, setMessages] = useState<MsgRow[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          err instanceof ApiRequestError ? err.message : "Gagal memuat pesan.",
        );
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [conversationId],
  );

  useEffect(() => {
    if (!isReady || !user || !conversationId) return;
    void load();
    const t = setInterval(() => {
      void load({ silent: true });
    }, 10000);
    return () => clearInterval(t);
  }, [isReady, user, conversationId, load]);

  const [locked, setLocked] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !conversationId) return;
    setSending(true);
    setError(null);
    try {
      await sendMessage(conversationId, { content: trimmed });
      setText("");
      setLocked(false);
      await load({ silent: true });
    } catch (err) {
      const msg =
        err instanceof ApiRequestError ? err.message : "Gagal mengirim pesan.";
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
    return <SignInRequired message="Masuk untuk membuka percakapan." />;
  }

  return (
    <main className={chatShell}>
      <Link
        href="/chat"
        className="inline-flex text-sm font-medium text-teal-700 hover:text-teal-800 mb-2"
      >
        ← Daftar chat
      </Link>

      <PageHeader
        eyebrow="Percakapan"
        title="Chat"
        description={
          <span className="font-mono text-xs text-slate-500 break-all">
            {conversationId}
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
            Chat masih terkunci karena sesi belum aktif. Buka{" "}
            <Link href="/consultations" className="font-semibold underline">
              halaman konsultasi
            </Link>{" "}
            untuk menyelesaikan pembayaran. Setelah admin mengonfirmasi, chat
            akan aktif.
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
              Memuat pesan…
            </p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              Belum ada pesan. Mulai percakapan di bawah.
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
                ? "Chat terkunci — selesaikan pembayaran dulu"
                : "Tulis pesan…"
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={sending || locked}
          />
          <button
            type="submit"
            disabled={sending || locked || !text.trim()}
            className={`${btnPrimary} shrink-0 px-5`}
          >
            Kirim
          </button>
        </form>
      </div>
    </main>
  );
}
