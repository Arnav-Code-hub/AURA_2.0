import type { WardrobeItem } from "@/services/wardrobe";
import type { Sponsor } from "@/lib/trends";

const MAX_WEIGHT_MULTIPLIER = 24;

/** Whether an item is favored by a sponsor (category, featured IDs, or explicit link). */
function matchesSponsor(item: WardrobeItem, sponsor: Sponsor): boolean {
  if (sponsor.active === false) return false;
  const fc = sponsor.featuredCategory?.trim();
  if (fc && item.category.trim().toLowerCase() === fc.toLowerCase()) return true;
  if (item.id && sponsor.featuredItemIds?.includes(item.id)) return true;
  if (item.sponsorId && sponsor.id && item.sponsorId === sponsor.id) return true;
  return false;
}

/**
 * Base weight 1 plus sponsor priorities for each matching sponsor.
 * Capped so pools do not explode.
 */
export function itemSponsorWeight(item: WardrobeItem, sponsors: Sponsor[]): number {
  let w = 1;
  for (const s of sponsors) {
    if (!matchesSponsor(item, s)) continue;
    w += Math.max(0, s.priority ?? 1);
  }
  return Math.min(w, MAX_WEIGHT_MULTIPLIER);
}

/** Expand items into a pool with duplicates by weight, then pick uniformly. */
export function pickWeightedRandomItem(items: WardrobeItem[], sponsors: Sponsor[]): WardrobeItem | null {
  if (items.length === 0) return null;
  const pool: WardrobeItem[] = [];
  for (const item of items) {
    const n = Math.max(1, itemSponsorWeight(item, sponsors));
    for (let i = 0; i < n; i++) pool.push(item);
  }
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}
