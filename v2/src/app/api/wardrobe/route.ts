import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { getSessionFromRequest, verifySession } from "@/lib/session";
import { getDownloadURL } from "firebase-admin/storage";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION_NAME = "wardrobe";

async function requireSession(request: Request): Promise<{ uid: string } | NextResponse> {
  const token = getSessionFromRequest(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const session = await verifySession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return { uid: session.uid };
}

export async function GET(request: Request) {
  const session = await requireSession(request);
  if (session instanceof NextResponse) return session;
  const { uid } = session;
  try {
    const snap = await adminDb()
      .collection(COLLECTION_NAME)
      .where("userId", "==", uid)
      .get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<
      Record<string, unknown> & { id: string; createdAt?: { toMillis?: () => number } }
    >;
    items.sort((a, b) => {
      const at = a.createdAt?.toMillis?.() ?? 0;
      const bt = b.createdAt?.toMillis?.() ?? 0;
      return bt - at;
    });
    return NextResponse.json(items);
  } catch (e) {
    console.error("Wardrobe GET", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (session instanceof NextResponse) return session;
  const { uid } = session;
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const file = formData.get("file") as File | null;
  const name = (formData.get("name") as string) || "Item";
  const category = (formData.get("category") as string) || "Tops";
  const tagsRaw = formData.get("tags");
  const tags = Array.isArray(tagsRaw)
    ? (tagsRaw as string[])
    : typeof tagsRaw === "string"
      ? (JSON.parse(tagsRaw) as string[]).filter(Boolean)
      : [];
  const sponsorIdRaw = formData.get("sponsorId");
  const sponsorId =
    typeof sponsorIdRaw === "string" && sponsorIdRaw.trim() ? sponsorIdRaw.trim() : undefined;
  if (!file || !file.size) return NextResponse.json({ error: "Missing file" }, { status: 400 });

  try {
    const bucket = adminStorage().bucket();
    const path = `wardrobe/${uid}/${Date.now()}_${file.name}`;
    const fileRef = bucket.file(path);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fileRef.save(buffer, { contentType: file.type });
    const downloadURL = await getDownloadURL(fileRef);

    const docPayload: Record<string, unknown> = {
      userId: uid,
      imageUrl: downloadURL,
      name,
      category,
      tags,
      createdAt: FieldValue.serverTimestamp(),
    };
    if (sponsorId) docPayload.sponsorId = sponsorId;

    const docRef = await adminDb().collection(COLLECTION_NAME).add(docPayload);
    return NextResponse.json({
      id: docRef.id,
      userId: uid,
      imageUrl: downloadURL,
      name,
      category,
      tags,
      ...(sponsorId ? { sponsorId } : {}),
    });
  } catch (e) {
    console.error("Wardrobe POST", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
