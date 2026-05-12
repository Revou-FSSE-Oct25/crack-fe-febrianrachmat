import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
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

export async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const raw = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const token = raw ? decodeURIComponent(raw) : null;
  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  const role = await getVerifiedRole(token);
  if (role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
