import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "sponsors";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;
  try {
    const snap = await adminDb().collection(COLLECTION).get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{ id: string; priority?: number }>;
    items.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    return NextResponse.json(items);
  } catch (e) {
    console.error("Admin sponsors GET", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;
  const body = await request.json().catch(() => ({}));
  const {
    name,
    logoUrl,
    websiteUrl,
    priority = 5,
    featuredCategory,
    featuredItemIds,
    active = true,
  } = body;
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });
  try {
    const ref = await adminDb().collection(COLLECTION).add({
      name,
      logoUrl: logoUrl || null,
      websiteUrl: websiteUrl || null,
      priority: Number(priority) ?? 5,
      featuredCategory: featuredCategory || null,
      featuredItemIds: Array.isArray(featuredItemIds) ? featuredItemIds : [],
      active: !!active,
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: ref.id });
  } catch (e) {
    console.error("Admin sponsors POST", e);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
