import { NextResponse } from "next/server";
import { getSessionFromRequest, verifySession } from "@/lib/session";
import { adminAuth } from "@/lib/firebase-admin";

const ADMIN_UIDS = (process.env.ADMIN_UIDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export async function requireAdmin(request: Request): Promise<{ uid: string } | NextResponse> {
  const uidFromSession = await getUidFromSession(request);
  if (uidFromSession && ADMIN_UIDS.length && ADMIN_UIDS.includes(uidFromSession)) {
    return { uid: uidFromSession };
  }
  if (uidFromSession) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const uidFromToken = await getUidFromToken(request);
  if (uidFromToken && ADMIN_UIDS.length && ADMIN_UIDS.includes(uidFromToken)) {
    return { uid: uidFromToken };
  }
  if (uidFromToken) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function getUidFromSession(request: Request): Promise<string | null> {
  const token = getSessionFromRequest(request);
  if (!token) return null;
  const session = await verifySession(token);
  if (!session || session.exp < Math.floor(Date.now() / 1000)) return null;
  return session.uid;
}

async function getUidFromToken(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

export function isAdminUid(uid: string): boolean {
  if (!ADMIN_UIDS.length) return false;
  return ADMIN_UIDS.includes(uid);
}
