import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const COLLECTION = "sponsors";

export async function GET() {
  try {
    const snap = await adminDb().collection(COLLECTION).get();
    const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{ id: string; active?: boolean; priority?: number }>;
    const items = raw.filter((i) => i.active === true);
    items.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    return NextResponse.json(items);
  } catch (e) {
    console.error("Sponsors GET", e);
    return NextResponse.json([]);
  }
}
