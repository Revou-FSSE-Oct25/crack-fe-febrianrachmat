"use client";

import { useAuth } from "@/contexts/auth-context";
import { ApiRequestError } from "@/lib/api/client";
import { listMessages, sendMessage } from "@/lib/api/chat";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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

  const load = useCallback(async (opts?: { silent?: boolean }) => {
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
  }, [conversationId]);

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
      // Phase 1 pay-first: backend returns 400 with "Chat is locked..." when
      // the consultation is not IN_PROGRESS yet. Detect it so we can guide
      // the user back to the consultation page to pay.
      if (msg.toLowerCase().includes("chat is locked")) {
        setLocked(true);
      }
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  if (!isReady) {
    return (
      <main className="max-w-2xl mx-auto py-16 px-6 text-gray-600">Memuat…</main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto py-16 px-6 text-center">
        <Link href="/login" className="text-teal-600 underline">
          Masuk
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto py-12 px-6 flex flex-col min-h-[70vh]">
      <div className="mb-4 flex items-center gap-4">
        <Link href="/chat" className="text-sm text-teal-700 underline">
          ← Daftar chat
        </Link>
      </div>
      <h1 className="text-xl font-semibold mb-4 font-mono break-all">
        {conversationId}
      </h1>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-3 mb-4">
          {error}
        </p>
      )}
      {locked && (
        <p className="text-amber-900 text-sm bg-amber-50 border border-amber-200 rounded p-3 mb-4">
          Chat masih terkunci karena sesi belum aktif. Buka{" "}
          <Link href="/consultations" className="underline font-medium">
            halaman konsultasi
          </Link>{" "}
          untuk menyelesaikan pembayaran. Setelah admin mengkonfirmasi, chat
          akan otomatis aktif.
        </p>
      )}

      <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-4 bg-gray-50 mb-4 max-h-[50vh]">
        {loading ? (
          <p className="text-gray-600 text-sm">Memuat pesan…</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-600 text-sm">Belum ada pesan.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="text-sm">
              <p className="font-medium text-teal-800">{m.sender.fullName}</p>
              <p className="text-gray-800 whitespace-pre-wrap mt-1">{m.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(m.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder={locked ? "Chat terkunci. Selesaikan pembayaran dulu." : "Tulis pesan…"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={sending || locked}
        />
        <button
          type="submit"
          disabled={sending || locked || !text.trim()}
          className="bg-teal-500 text-white px-5 py-2 rounded disabled:opacity-50"
        >
          Kirim
        </button>
      </form>
    </main>
  );
}
