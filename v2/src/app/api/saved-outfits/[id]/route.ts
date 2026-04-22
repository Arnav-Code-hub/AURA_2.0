import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireUid } from "@/lib/api-auth";

const COLLECTION = "savedOutfits";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUid(request);
  if (auth instanceof NextResponse) return auth;
  const { uid } = auth;
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const docRef = adminDb().collection(COLLECTION).doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = snap.data();
    if (data?.userId !== uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await docRef.delete();
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("saved-outfits DELETE", e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
