"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Heart } from "lucide-react";
import { useUserAuth } from "@/context/AuthContext";
import { useSavedOutfits } from "@/hooks/useSavedOutfits";
import { useAuthorizedFetch } from "@/hooks/useAuthorizedFetch";
import { isFirebaseStorageUrl } from "@/lib/remote-image";
import { toast } from "sonner";
import type { SavedOutfit } from "@/types/outfit";

export default function SavedOutfitsPage() {
  const { user, loading: authLoading } = useUserAuth();
  const router = useRouter();
  const authFetch = useAuthorizedFetch();
  const { savedOutfits, isLoading, mutate } = useSavedOutfits();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const handleDelete = async (outfit: SavedOutfit & { id: string }) => {
    try {
      const res = await authFetch(`/api/saved-outfits/${outfit.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await mutate((prev) => (prev ?? []).filter((o) => o.id !== outfit.id), { revalidate: false });
      toast.success("Saved outfit removed.");
    } catch {
      toast.error("Could not remove outfit.");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 px-6 md:px-12 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
            <Heart className="w-9 h-9 text-primary" />
            Saved outfits
          </h1>
          <p className="text-muted-foreground">
            Outfits you saved from the Daily Mix.{" "}
            <Link href="/" className="text-primary hover:underline">
              Back to Home
            </Link>
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
          </div>
        ) : savedOutfits.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-16 text-center">
            <p className="text-muted-foreground mb-6">No saved outfits yet. Mix one on the home page, then tap Save outfit.</p>
            <Link
              href="/"
              className="inline-flex rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground hover:opacity-90"
            >
              Open Daily Mix
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {savedOutfits.map((o) => (
              <SavedCard key={o.id} outfit={o as SavedOutfit & { id: string }} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SavedCard({
  outfit,
  onDelete,
}: {
  outfit: SavedOutfit & { id: string };
  onDelete: (o: SavedOutfit & { id: string }) => void;
}) {
  const top = outfit.topImageUrl;
  const mid = outfit.bottomImageUrl;
  const shoe = outfit.shoeImageUrl;
  const title = outfit.name?.trim() || "Saved look";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-card/50 overflow-hidden flex flex-col"
    >
      <div className="grid grid-cols-3 gap-1 p-2 bg-black/20">
        {[top, mid, shoe].map((src, i) => (
          <div key={i} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
            {src ? (
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 200px"
                unoptimized={!isFirebaseStorageUrl(src)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">—</div>
            )}
          </div>
        ))}
      </div>
      <div className="p-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="font-display font-bold text-lg truncate">{title}</h2>
          <p className="text-xs text-muted-foreground mt-1">Saved look</p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(outfit)}
          className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
          aria-label="Delete saved outfit"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
