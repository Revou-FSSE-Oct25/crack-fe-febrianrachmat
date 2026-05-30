import { notifyUnauthorized } from "@/lib/auth/session";
import { getStoredAccessToken } from "@/lib/auth/storage";
import { ApiRequestError } from "./client";
import { getApiBaseUrl } from "./config";

function parseFilename(
  contentDisposition: string | null,
  fallback: string,
): string {
  if (!contentDisposition) return fallback;
  const star = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1].trim());
    } catch {
      return fallback;
    }
  }
  const plain = /filename="([^"]+)"/i.exec(contentDisposition);
  if (plain?.[1]) return plain[1];
  return fallback;
}

/**
 * GET an iCalendar export endpoint and trigger a browser download (Bearer auth).
 */
export async function downloadIcsExport(
  path: string,
  fallbackFilename: string,
): Promise<void> {
  const token = getStoredAccessToken();
  if (!token) {
    throw new ApiRequestError("Sesi habis. Silakan masuk kembali.", 401);
  }

  const base = getApiBaseUrl();
  const url = path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/calendar, application/ics",
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    notifyUnauthorized();
    throw new ApiRequestError("Sesi habis. Silakan masuk kembali.", 401);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiRequestError(
      text.trim().slice(0, 200) || `Export gagal (${res.status})`,
      res.status,
    );
  }

  const blob = await res.blob();
  const filename = parseFilename(
    res.headers.get("Content-Disposition"),
    fallbackFilename,
  );

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
