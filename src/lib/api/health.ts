import { fetchWithTimeout } from "./fetch-reliable";

export type ApiHealthStatus = {
  status: "ok" | "degraded";
  database: "connected" | "disconnected";
};

/** GET /health — publik, tanpa JWT. */
export async function fetchApiHealth(): Promise<ApiHealthStatus> {
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  const res = await fetchWithTimeout(
    `${base}/health`,
    {
      cache: "no-store",
      headers: { Accept: "application/json" },
    },
    10_000,
  );
  if (!res.ok) {
    throw new Error(`Health check failed (${res.status})`);
  }
  const body = (await res.json()) as { success?: boolean; data?: ApiHealthStatus };
  if (body && typeof body === "object" && "data" in body && body.data) {
    return body.data;
  }
  return body as unknown as ApiHealthStatus;
}
