import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDb } from "@/lib/firebase-admin";

const COLLECTION = "trends";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
  if (body.categoryFocus !== undefined) updates.categoryFocus = body.categoryFocus;
  if (body.active !== undefined) updates.active = !!body.active;
  if (body.order !== undefined) updates.order = Number(body.order) ?? 0;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates" }, { status: 400 });
  }
  try {
    await adminDb().collection(COLLECTION).doc(id).update(updates);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Admin trends PATCH", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(_request);
  if (admin instanceof NextResponse) return admin;
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    await adminDb().collection(COLLECTION).doc(id).delete();
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Admin trends DELETE", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
