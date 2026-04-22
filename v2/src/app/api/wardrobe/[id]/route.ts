import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { getSessionFromRequest, verifySession } from "@/lib/session";

const COLLECTION_NAME = "wardrobe";

async function requireSession(request: Request): Promise<{ uid: string } | NextResponse> {
  const token = getSessionFromRequest(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const session = await verifySession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return { uid: session.uid };
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(_request);
  if (session instanceof NextResponse) return session;
  const { uid } = session;
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const docRef = adminDb().collection(COLLECTION_NAME).doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = snap.data();
    if (data?.userId !== uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const imageUrl = data?.imageUrl as string | undefined;
    await docRef.delete();
    if (imageUrl) {
      try {
        const bucket = adminStorage().bucket();
        const path = imageUrl.split("/o/")[1]?.split("?")[0];
        if (path) {
          const decoded = decodeURIComponent(path);
          await bucket.file(decoded).delete();
        }
      } catch {
        // ignore storage delete errors
      }
    }
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Wardrobe DELETE", e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
