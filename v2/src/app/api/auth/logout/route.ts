import { NextResponse } from "next/server";
import { getSessionCookieName } from "@/lib/session";

export async function POST() {
  const res = new NextResponse(null, { status: 204 });
  res.cookies.set(getSessionCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
