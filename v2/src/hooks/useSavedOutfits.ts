"use client";

import useSWR from "swr";
import { useUserAuth } from "@/context/AuthContext";
import { useAuthorizedFetch } from "@/hooks/useAuthorizedFetch";
import type { SavedOutfit } from "@/types/outfit";

export function useSavedOutfits() {
  const { getUid, user } = useUserAuth();
  const authFetch = useAuthorizedFetch();
  const uid = getUid();
  const key = user && uid ? (["saved-outfits", uid] as const) : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const res = await authFetch("/api/saved-outfits");
      if (!res.ok) throw new Error("Failed to load saved outfits");
      return (await res.json()) as SavedOutfit[];
    },
    { revalidateOnFocus: true }
  );

  return {
    savedOutfits: data ?? [],
    isLoading,
    error,
    mutate,
  };
}
