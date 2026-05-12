import { apiFetch } from "./client";

/** Selaras `CreateOrGetConversationDto` */
export type CreateOrGetConversationBody = {
  consultationId: string;
};

/** Selaras `SendMessageDto` */
export type SendMessageBody = {
  content: string;
};

function paginationQuery(params: { page?: number; limit?: number }): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function createOrGetConversation(
  body: CreateOrGetConversationBody,
): Promise<unknown> {
  return apiFetch<unknown>("/chat/conversations", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listMyConversations(params?: {
  page?: number;
  limit?: number;
}): Promise<unknown[]> {
  return apiFetch<unknown[]>(
    `/chat/conversations${paginationQuery(params ?? {})}`,
  );
}

export async function listMessages(
  conversationId: string,
  params?: { page?: number; limit?: number },
): Promise<unknown[]> {
  return apiFetch<unknown[]>(
    `/chat/conversations/${conversationId}/messages${paginationQuery(params ?? {})}`,
  );
}

export async function sendMessage(
  conversationId: string,
  body: SendMessageBody,
): Promise<unknown> {
  return apiFetch<unknown>(
    `/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}
