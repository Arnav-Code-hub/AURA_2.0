import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { createSession } from "@/lib/session";

const AUTH_CODES = "authCodes";
const SECRET = process.env.AUTH_EXCHANGE_SECRET;

export async function POST(request: NextRequest) {
  if (!SECRET) {
    return NextResponse.json(
      { error: "AUTH_EXCHANGE_SECRET not configured" },
      { status: 500 }
    );
  }
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const body = await request.json().catch(() => ({}));
  const secret = bearer || body.secret;
  if (secret !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const code = (body.code ?? request.nextUrl.searchParams.get("code")) as string | undefined;
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const codeRef = adminDb().collection(AUTH_CODES).doc(code);
  const snap = await codeRef.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }
  const data = snap.data() as { uid: string; email: string | null };
  await codeRef.delete();

  const token = await createSession(data.uid, data.email ?? null);
  return NextResponse.json({ token });
}
