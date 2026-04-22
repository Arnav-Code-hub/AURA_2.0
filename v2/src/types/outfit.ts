/** Firestore `savedOutfits` document. */
export interface SavedOutfit {
  id?: string;
  userId: string;
  topId: string;
  bottomId: string;
  shoeId: string;
  name?: string;
  /** Snapshot URLs if wardrobe items are deleted later */
  topImageUrl?: string;
  bottomImageUrl?: string;
  shoeImageUrl?: string;
  createdAt?: unknown;
}
