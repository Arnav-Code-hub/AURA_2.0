import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { randomBytes } from "crypto";

const AUTH_CODES = "authCodes";
const CODE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }
  let uid: string;
  let email: string | null;
  try {
    const decoded = await adminAuth().verifyIdToken(idToken);
    uid = decoded.uid;
    email = decoded.email ?? null;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const returnTo = (body.returnTo as string) || "";
  if (!returnTo || !returnTo.startsWith("http")) {
    return NextResponse.json({ error: "Invalid returnTo" }, { status: 400 });
  }

  const code = randomBytes(24).toString("hex");
  await adminDb().collection(AUTH_CODES).doc(code).set({
    uid,
    email,
    createdAt: Date.now(),
  });
  // Optional: delete after TTL via Cloud Function or cron; for now rely on one-time use in exchange
  return NextResponse.json({ code });
}
