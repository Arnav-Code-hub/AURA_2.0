import { NextResponse } from "next/server";
import { getSessionFromRequest, verifySession } from "@/lib/session";

export async function GET(request: Request) {
  const token = getSessionFromRequest(request);
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const session = await verifySession(token);
  if (!session || session.exp < Math.floor(Date.now() / 1000)) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({
    user: { uid: session.uid, email: session.email },
  });
}
