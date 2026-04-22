import { NextResponse } from "next/server";
import { getSessionFromRequest, verifySession } from "@/lib/session";
import { adminAuth } from "@/lib/firebase-admin";

/** Resolves Firebase session cookie or `Authorization: Bearer <idToken>`. */
export async function getUidFromRequest(request: Request): Promise<string | null> {
  const cookieToken = getSessionFromRequest(request);
  if (cookieToken) {
    const session = await verifySession(cookieToken);
    if (session && session.exp >= Math.floor(Date.now() / 1000)) return session.uid;
  }
  const authHeader = request.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (idToken) {
    try {
      const decoded = await adminAuth().verifyIdToken(idToken);
      return decoded.uid;
    } catch {
      return null;
    }
  }
  return null;
}

export async function requireUid(request: Request): Promise<{ uid: string } | NextResponse> {
  const uid = await getUidFromRequest(request);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return { uid };
}
