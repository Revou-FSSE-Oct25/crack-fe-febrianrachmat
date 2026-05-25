import { notifyUnauthorized } from "@/lib/auth/session";
import { getStoredAccessToken } from "@/lib/auth/storage";
import { getApiBaseUrl } from "./config";
import { ApiRequestError } from "./client";

export type ChatStreamMessage = {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    email?: string;
    role?: string;
  };
};

type ParsedSseEvent = {
  event?: string;
  data?: string;
};

function buildStreamUrl(conversationId: string, since?: string): string {
  const base = getApiBaseUrl();
  const q = new URLSearchParams();
  if (since) {
    q.set("since", since);
  }
  const suffix = q.toString() ? `?${q.toString()}` : "";
  return `${base}/chat/conversations/${conversationId}/messages/stream${suffix}`;
}

/** Split accumulated SSE text into complete events (blocks separated by blank line). */
export function parseSseBuffer(buffer: string): {
  events: ParsedSseEvent[];
  rest: string;
} {
  const parts = buffer.split(/\r?\n\r?\n/);
  const rest = parts.pop() ?? "";
  const events: ParsedSseEvent[] = [];

  for (const block of parts) {
    if (!block.trim()) continue;
    let event: string | undefined;
    const dataLines: string[] = [];
    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith("event:")) {
        event = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }
    events.push({
      event,
      data: dataLines.length ? dataLines.join("\n") : undefined,
    });
  }

  return { events, rest };
}

export function mapStreamPayload(data: string): ChatStreamMessage | null {
  if (!data) return null;
  try {
    const raw = JSON.parse(data) as Record<string, unknown>;
    const sender = raw.sender as Record<string, unknown> | undefined;
    return {
      id: String(raw.id ?? ""),
      content: String(raw.content ?? ""),
      createdAt: String(raw.createdAt ?? ""),
      sender: {
        id: String(sender?.id ?? ""),
        fullName: String(sender?.fullName ?? ""),
        email: sender?.email != null ? String(sender.email) : undefined,
        role: sender?.role != null ? String(sender.role) : undefined,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Long-lived fetch to chat SSE endpoint (Authorization header; no 20s timeout).
 * Calls `onMessage` for each new message event; ignores `ping`.
 */
export function subscribeChatMessageStream(options: {
  conversationId: string;
  since?: string;
  signal?: AbortSignal;
  onMessage: (message: ChatStreamMessage) => void;
  onError?: (error: Error) => void;
}): void {
  const { conversationId, since, signal, onMessage, onError } = options;

  void (async () => {
    const token = getStoredAccessToken();
    if (!token) {
      onError?.(new ApiRequestError("Sesi habis. Silakan masuk kembali.", 401));
      return;
    }

    let res: Response;
    try {
      res = await fetch(buildStreamUrl(conversationId, since), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
        signal,
        cache: "no-store",
      });
    } catch (err) {
      if (signal?.aborted) return;
      onError?.(
        err instanceof Error ? err : new Error("Gagal membuka stream chat."),
      );
      return;
    }

    if (res.status === 401) {
      notifyUnauthorized();
      onError?.(new ApiRequestError("Sesi habis. Silakan masuk kembali.", 401));
      return;
    }

    if (!res.ok || !res.body) {
      onError?.(
        new ApiRequestError(
          `Stream chat gagal (${res.status})`,
          res.status,
        ),
      );
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const { events, rest } = parseSseBuffer(buffer);
        buffer = rest;

        for (const ev of events) {
          if (ev.event === "ping" || !ev.data) continue;
          const msg = mapStreamPayload(ev.data);
          if (msg?.id) {
            onMessage(msg);
          }
        }
      }
    } catch (err) {
      if (signal?.aborted) return;
      onError?.(
        err instanceof Error ? err : new Error("Stream chat terputus."),
      );
    }
  })();
}
