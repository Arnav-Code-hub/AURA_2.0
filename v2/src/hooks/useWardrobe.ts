"use client";

import useSWR from "swr";
import { WardrobeService, type WardrobeItem } from "@/services/wardrobe";

export type UseWardrobeOptions = {
  uid: string | null;
  isSessionUser: boolean;
  /** When false, no request is made (e.g. guest). */
  enabled?: boolean;
};

async function fetchSessionWardrobe(): Promise<WardrobeItem[]> {
  const res = await fetch("/api/wardrobe", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch wardrobe");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Cached wardrobe list keyed by uid and auth mode (Firebase vs session cookie).
 */
export function useWardrobe({ uid, isSessionUser, enabled = true }: UseWardrobeOptions) {
  const shouldFetch = Boolean(enabled && uid);
  const swrKey = shouldFetch ? (["wardrobe", uid, isSessionUser ? "session" : "firebase"] as const) : null;

  const { data, error, isLoading, mutate, isValidating } = useSWR(
    swrKey,
    async () => {
      if (!uid) return [];
      if (isSessionUser) return fetchSessionWardrobe();
      return WardrobeService.getUserItems(uid);
    },
    { revalidateOnFocus: true, dedupingInterval: 3000 }
  );

  return {
    items: data ?? [],
    isLoading: shouldFetch && isLoading,
    error,
    mutate,
    isValidating,
  };
}
