import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireUid } from "@/lib/api-auth";
import { FieldValue } from "firebase-admin/firestore";
import type { SavedOutfit } from "@/types/outfit";

const COLLECTION = "savedOutfits";

export async function GET(request: Request) {
  const auth = await requireUid(request);
  if (auth instanceof NextResponse) return auth;
  const { uid } = auth;
  try {
    const snap = await adminDb()
      .collection(COLLECTION)
      .where("userId", "==", uid)
      .get();
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<
      SavedOutfit & { id: string; createdAt?: { toMillis?: () => number } }
    >;
    list.sort((a, b) => {
      const at = a.createdAt?.toMillis?.() ?? 0;
      const bt = b.createdAt?.toMillis?.() ?? 0;
      return bt - at;
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error("saved-outfits GET", e);
    return NextResponse.json({ error: "Failed to list" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireUid(request);
  if (auth instanceof NextResponse) return auth;
  const { uid } = auth;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const topId = typeof body.topId === "string" ? body.topId.trim() : "";
  const bottomId = typeof body.bottomId === "string" ? body.bottomId.trim() : "";
  const shoeId = typeof body.shoeId === "string" ? body.shoeId.trim() : "";
  if (!topId || !bottomId || !shoeId) {
    return NextResponse.json({ error: "topId, bottomId, and shoeId are required" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : undefined;
  const topImageUrl = typeof body.topImageUrl === "string" ? body.topImageUrl : undefined;
  const bottomImageUrl = typeof body.bottomImageUrl === "string" ? body.bottomImageUrl : undefined;
  const shoeImageUrl = typeof body.shoeImageUrl === "string" ? body.shoeImageUrl : undefined;

  try {
    const docPayload: Record<string, unknown> = {
      userId: uid,
      topId,
      bottomId,
      shoeId,
      createdAt: FieldValue.serverTimestamp(),
    };
    if (name) docPayload.name = name;
    if (topImageUrl) docPayload.topImageUrl = topImageUrl;
    if (bottomImageUrl) docPayload.bottomImageUrl = bottomImageUrl;
    if (shoeImageUrl) docPayload.shoeImageUrl = shoeImageUrl;

    const ref = await adminDb().collection(COLLECTION).add(docPayload);
    return NextResponse.json({
      id: ref.id,
      userId: uid,
      topId,
      bottomId,
      shoeId,
      ...(name ? { name } : {}),
      ...(topImageUrl ? { topImageUrl } : {}),
      ...(bottomImageUrl ? { bottomImageUrl } : {}),
      ...(shoeImageUrl ? { shoeImageUrl } : {}),
    });
  } catch (e) {
    console.error("saved-outfits POST", e);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
