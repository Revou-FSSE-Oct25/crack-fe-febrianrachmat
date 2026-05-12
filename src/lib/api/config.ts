export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    return "http://localhost:3000";
  }
  return base.replace(/\/$/, "");
}
