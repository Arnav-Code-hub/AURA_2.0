import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "trends";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;
  try {
    const snap = await adminDb().collection(COLLECTION).get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{ id: string; order?: number }>;
    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return NextResponse.json(items);
  } catch (e) {
    console.error("Admin trends GET", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;
  const body = await request.json().catch(() => ({}));
  const name = body.name;
  const description = body.description;
  const imageUrl = body.imageUrl;
  const categoryFocus = body.categoryFocus;
  const active = body.active !== false;
  const order = Number(body.order) || 0;
  if (!name || typeof description !== "string") {
    return NextResponse.json({ error: "Missing name or description" }, { status: 400 });
  }
  try {
    const ref = await adminDb().collection(COLLECTION).add({
      name,
      description,
      imageUrl: imageUrl || null,
      categoryFocus: categoryFocus || null,
      active,
      order,
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: ref.id });
  } catch (e) {
    console.error("Admin trends POST", e);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
