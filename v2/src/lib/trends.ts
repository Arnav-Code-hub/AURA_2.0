import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export interface Trend {
  id?: string;
  name: string;
  description: string;
  imageUrl?: string;
  categoryFocus?: string; // e.g. "Minimalist", "Y2K", "Quiet Luxury"
  active: boolean;
  order: number;
  createdAt?: unknown;
}

export interface Sponsor {
  id?: string;
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  /** Higher = more likely to appear in AI suggestions (1-10) */
  priority: number;
  /** Category to favor in suggestions, e.g. "Tops", "Shoes" */
  featuredCategory?: string;
  /** Optional: specific product/item IDs to push */
  featuredItemIds?: string[];
  active: boolean;
  createdAt?: unknown;
}

const TRENDS_COLLECTION = "trends";
const SPONSORS_COLLECTION = "sponsors";

export const TrendsService = {
  async listActive(): Promise<Trend[]> {
    const all = await this.listAll();
    return all.filter((t) => t.active);
  },

  async listAll(): Promise<Trend[]> {
    const q = query(collection(db, TRENDS_COLLECTION), orderBy("order", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Trend[];
  },

  async create(data: Omit<Trend, "id" | "createdAt">) {
    const ref = await addDoc(collection(db, TRENDS_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async update(id: string, data: Partial<Trend>) {
    await updateDoc(doc(db, TRENDS_COLLECTION, id), data);
  },

  async delete(id: string) {
    await deleteDoc(doc(db, TRENDS_COLLECTION, id));
  },
};

export const SponsorsService = {
  async listActive(): Promise<Sponsor[]> {
    const all = await this.listAll();
    return all.filter((s) => s.active);
  },

  async listAll(): Promise<Sponsor[]> {
    const snap = await getDocs(collection(db, SPONSORS_COLLECTION));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Sponsor[];
    list.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    return list;
  },

  async get(id: string): Promise<Sponsor | null> {
    const snap = await getDoc(doc(db, SPONSORS_COLLECTION, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Sponsor;
  },

  async create(data: Omit<Sponsor, "id" | "createdAt">) {
    const ref = await addDoc(collection(db, SPONSORS_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async update(id: string, data: Partial<Sponsor>) {
    await updateDoc(doc(db, SPONSORS_COLLECTION, id), data);
  },

  async delete(id: string) {
    await deleteDoc(doc(db, SPONSORS_COLLECTION, id));
  },
};
