import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const COLLECTION = "trends";

export async function GET() {
  try {
    const snap = await adminDb().collection(COLLECTION).get();
    const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{ id: string; active?: boolean; order?: number }>;
    const items = raw.filter((i) => i.active === true);
    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return NextResponse.json(items);
  } catch (e) {
    console.error("Trends GET", e);
    return NextResponse.json([]);
  }
}
