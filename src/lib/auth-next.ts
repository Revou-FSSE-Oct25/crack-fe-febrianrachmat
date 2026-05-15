/** Path internal aman untuk redirect setelah login/daftar. */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  if (next.startsWith("/login") || next.startsWith("/register")) return null;
  return next;
}

export function buildLoginHref(returnTo?: string | null): string {
  const safe = safeNextPath(returnTo ?? null);
  if (!safe) return "/login";
  return `/login?next=${encodeURIComponent(safe)}`;
}

export function buildRegisterHref(returnTo?: string | null): string {
  const safe = safeNextPath(returnTo ?? null);
  if (!safe) return "/register";
  return `/register?next=${encodeURIComponent(safe)}`;
}

export function currentReturnPath(pathname: string, search: string): string {
  if (!search) return pathname;
  const q = search.startsWith("?") ? search.slice(1) : search;
  return q ? `${pathname}?${q}` : pathname;
}
