export type ProxyUserRole = "ADMIN" | "PATIENT" | "PHYSIOTHERAPIST";

const EXACT_PUBLIC = new Set([
  "/",
  "/login",
  "/register",
  "/services",
  "/about",
  "/kebijakan",
  "/status",
]);

const PUBLIC_PREFIXES = ["/api/", "/_next/"];

/** Path yang boleh diakses tanpa JWT (static assets handled by matcher). */
export function isPublicPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (EXACT_PUBLIC.has(path)) return true;
  return PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export function isAuthEntryPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return path === "/login" || path === "/register";
}

/**
 * Daftar role yang diizinkan, atau `null` jika route tidak perlu auth di proxy.
 */
export function requiredRolesForPath(pathname: string): ProxyUserRole[] | null {
  const path = normalizePath(pathname);

  if (path === "/appointment" || path.startsWith("/reviews")) {
    return ["PATIENT"];
  }
  if (path.startsWith("/physiotherapist")) {
    return ["PHYSIOTHERAPIST"];
  }
  if (path.startsWith("/admin")) {
    return ["ADMIN"];
  }

  const anyAuthenticated: ProxyUserRole[] = [
    "ADMIN",
    "PATIENT",
    "PHYSIOTHERAPIST",
  ];
  const authPrefixes = [
    "/profile",
    "/bookings",
    "/consultations",
    "/transactions",
    "/notifications",
    "/chat",
    "/therapists",
  ];
  if (authPrefixes.some((p) => path === p || path.startsWith(`${p}/`))) {
    return anyAuthenticated;
  }

  return null;
}

export function roleAllowed(
  role: string | null,
  allowed: ProxyUserRole[],
): boolean {
  if (!role) return false;
  return allowed.includes(role as ProxyUserRole);
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}
