import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { safeNextPath } from "@/lib/auth-next";
import {
  isAuthEntryPath,
  isPublicPath,
  requiredRolesForPath,
  roleAllowed,
} from "@/lib/auth/proxy-routes";
import { ACCESS_TOKEN_KEY } from "@/lib/auth/storage";

async function getVerifiedRole(token: string): Promise<string | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      {
        algorithms: ["HS256"],
      },
    );

    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

function readAccessToken(request: NextRequest): string | null {
  const raw = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  return raw ? decodeURIComponent(raw) : null;
}

function loginRedirect(request: NextRequest, pathname: string): NextResponse {
  const login = new URL("/login", request.url);
  const returnPath = `${pathname}${request.nextUrl.search}`;
  login.searchParams.set("next", returnPath);
  return NextResponse.redirect(login);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = readAccessToken(request);
  const role = token ? await getVerifiedRole(token) : null;

  if (isAuthEntryPath(pathname) && role) {
    const next = safeNextPath(request.nextUrl.searchParams.get("next"));
    const destination = next ?? "/profile";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const allowedRoles = requiredRolesForPath(pathname);
  if (!allowedRoles) {
    return NextResponse.next();
  }

  if (!token || !role) {
    return loginRedirect(request, pathname);
  }

  if (!roleAllowed(role, allowedRoles)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Jalankan proxy untuk semua route app kecuali file statis Next dan aset gambar.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
