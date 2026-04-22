import { NextRequest, NextResponse } from "next/server";
import { getSessionCookieName } from "@/lib/session";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const SECRET = process.env.AUTH_EXCHANGE_SECRET;

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code || !APP_URL || !SECRET) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const exchangeUrl = `${APP_URL.replace(/\/$/, "")}/api/auth/exchange`;
  const res = await fetch(exchangeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SECRET}` },
    body: JSON.stringify({ code, secret: SECRET }),
  });
  if (!res.ok) {
    return NextResponse.redirect(new URL("/login?error=exchange_failed", request.url));
  }
  const { token } = (await res.json()) as { token?: string };
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=no_token", request.url));
  }

  const redirect = NextResponse.redirect(new URL("/", request.url));
  redirect.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return redirect;
}
