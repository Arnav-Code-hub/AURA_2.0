import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDb } from "@/lib/firebase-admin";

const COLLECTION = "sponsors";

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
  if (body.logoUrl !== undefined) updates.logoUrl = body.logoUrl;
  if (body.websiteUrl !== undefined) updates.websiteUrl = body.websiteUrl;
  if (body.priority !== undefined) updates.priority = Number(body.priority) ?? 5;
  if (body.featuredCategory !== undefined) updates.featuredCategory = body.featuredCategory;
  if (body.featuredItemIds !== undefined) updates.featuredItemIds = Array.isArray(body.featuredItemIds) ? body.featuredItemIds : [];
  if (body.active !== undefined) updates.active = !!body.active;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates" }, { status: 400 });
  }
  try {
    await adminDb().collection(COLLECTION).doc(id).update(updates);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Admin sponsors PATCH", e);
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
    console.error("Admin sponsors DELETE", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
