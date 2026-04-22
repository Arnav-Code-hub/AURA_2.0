"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Shuffle, Sparkles, Shirt, Footprints, Loader2, LogIn, BookmarkPlus } from "lucide-react";
import Link from "next/link";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import type { WardrobeItem } from "@/services/wardrobe";
import type { Sponsor } from "@/lib/trends";
import { useUserAuth } from "@/context/AuthContext";
import { useAuthorizedFetch } from "@/hooks/useAuthorizedFetch";
import { cn } from "@/lib/utils";
import { isFirebaseStorageUrl } from "@/lib/remote-image";
import { pickWeightedRandomItem } from "@/lib/weighted-random";

const FIRST_MIX_KEY = "aura_first_mix_done";

function triggerFirstMixCelebration() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(FIRST_MIX_KEY)) return;
  localStorage.setItem(FIRST_MIX_KEY, "1");
  window.dispatchEvent(new Event("aura-first-mix"));
  void import("canvas-confetti").then(({ default: confetti }) => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.65 },
      colors: ["#ccff00", "#fafafa", "#e5e5e5"],
    });
  });
  toast.success("Nice — your first mix!");
}

interface OutfitMixerProps {
  /** Wardrobe items from `useWardrobe` (omit for guest view). */
  items?: WardrobeItem[];
  /** While SWR (or parent) is loading the wardrobe. */
  isLoading?: boolean;
}

const SLOT_TRANSITION = {
  initial: { y: -24, opacity: 0, filter: "blur(8px)" },
  animate: { y: 0, opacity: 1, filter: "blur(0px)" },
  exit: { y: 24, opacity: 0, filter: "blur(8px)" },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

function EmptySlot({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-white/10 rounded-xl bg-muted/60">
      <Icon className="w-8 h-8 mb-2 opacity-50" />
      <span className="text-xs uppercase tracking-widest">{label}</span>
    </div>
  );
}

export function OutfitMixer({ items: itemsProp, isLoading: isLoadingProp }: OutfitMixerProps) {
  const { user } = useUserAuth();
  const authFetch = useAuthorizedFetch();
  const { mutate: globalMutate } = useSWRConfig();
  const [items, setItems] = useState<WardrobeItem[]>(itemsProp ?? []);
  const loading = Boolean(isLoadingProp);
  const [currentTop, setCurrentTop] = useState<WardrobeItem | null>(null);
  const [currentBottom, setCurrentBottom] = useState<WardrobeItem | null>(null);
  const [currentShoe, setCurrentShoe] = useState<WardrobeItem | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [matchScore] = useState(() => Math.floor(Math.random() * 12) + 88);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [savePending, setSavePending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/sponsors")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (!cancelled && Array.isArray(data)) setSponsors(data as Sponsor[]);
      })
      .catch(() => {
        if (!cancelled) setSponsors([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const tops = items.filter((i) => i.category === "Tops" || i.category === "Outerwear");
  const bottoms = items.filter((i) => i.category === "Bottoms");
  const shoes = items.filter((i) => i.category === "Shoes");
  const hasValidCombos = tops.length > 0 && bottoms.length > 0 && shoes.length > 0;

  useEffect(() => {
    if (itemsProp !== undefined) setItems(itemsProp);
  }, [itemsProp]);

  const shuffle = useCallback(
    (fromUserAction = false) => {
      if (!hasValidCombos) return;
      setIsShuffling(true);
      let count = 0;
      const interval = setInterval(() => {
        if (tops.length) setCurrentTop(pickWeightedRandomItem(tops, sponsors));
        if (bottoms.length) setCurrentBottom(pickWeightedRandomItem(bottoms, sponsors));
        if (shoes.length) setCurrentShoe(pickWeightedRandomItem(shoes, sponsors));
        count++;
        if (count > 12) {
          clearInterval(interval);
          setIsShuffling(false);
          if (fromUserAction) triggerFirstMixCelebration();
        }
      }, 120);
    },
    [hasValidCombos, tops, bottoms, shoes, sponsors]
  );

  const saveOutfit = async () => {
    if (!currentTop?.id || !currentBottom?.id || !currentShoe?.id) return;
    setSavePending(true);
    try {
      const res = await authFetch("/api/saved-outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topId: currentTop.id,
          bottomId: currentBottom.id,
          shoeId: currentShoe.id,
          name: saveName.trim() || undefined,
          topImageUrl: currentTop.imageUrl,
          bottomImageUrl: currentBottom.imageUrl,
          shoeImageUrl: currentShoe.imageUrl,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      await globalMutate((key) => Array.isArray(key) && key[0] === "saved-outfits");
      toast.success("Outfit saved.");
      setSaveOpen(false);
      setSaveName("");
    } catch {
      toast.error("Could not save outfit.");
    } finally {
      setSavePending(false);
    }
  };

  const canSave =
    Boolean(user) &&
    hasValidCombos &&
    Boolean(currentTop?.id && currentBottom?.id && currentShoe?.id);

  // Initial shuffle when we first have valid combos (re-run when sponsor weights load); no first-mix celebration
  useEffect(() => {
    if (hasValidCombos && items.length > 0 && !loading) {
      shuffle(false);
    }
  }, [hasValidCombos, loading, sponsors, items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const isGuest = itemsProp === undefined && !loading;

  if (loading) {
    return (
      <div className="w-full max-w-xl mx-auto p-8 backdrop-blur-xl bg-card border border-white/10 rounded-3xl flex flex-col items-center justify-center min-h-[320px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground uppercase tracking-widest">Loading your wardrobe</p>
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="w-full max-w-xl mx-auto p-8 backdrop-blur-2xl bg-card border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[320px] gap-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
        <h2 className="font-display text-2xl font-extrabold tracking-tighter text-foreground relative z-10 text-center">
          Sign in to use the Mixer
        </h2>
        <p className="text-sm text-muted-foreground uppercase tracking-widest text-center relative z-10">
          Mix tops, bottoms & shoes from your digital wardrobe
        </p>
        <div className="flex gap-4 relative z-10">
          <div className="flex-1 w-20 h-40 rounded-xl bg-muted/40 border-2 border-dashed border-white/10 flex flex-col items-center justify-center">
            <Shirt className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Top</span>
          </div>
          <div className="flex-1 w-20 h-40 rounded-xl bg-muted/40 border-2 border-dashed border-white/10 flex flex-col items-center justify-center">
            <Shirt className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Bottom</span>
          </div>
          <div className="flex-1 w-20 h-40 rounded-xl bg-muted/40 border-2 border-dashed border-white/10 flex flex-col items-center justify-center">
            <Footprints className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Shoes</span>
          </div>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider bg-primary text-primary-foreground hover:shadow-[0_0_24px_rgba(204,255,0,0.4)] hover:scale-105 active:scale-95 transition-all relative z-10"
          aria-label="Sign in to use the Outfit Mixer"
        >
          <LogIn className="w-4 h-4" />
          Sign in to mix your wardrobe
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto p-6 backdrop-blur-2xl bg-card border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-primary/5 blur-3xl rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors" />

      <AnimatePresence>
        {saveOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-outfit-title"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-card p-6 shadow-2xl"
            >
              <h3 id="save-outfit-title" className="font-display text-xl font-bold mb-2">
                Save this outfit
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Optional name for your look.</p>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g. Weekend brunch"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 mb-4 outline-none focus:border-primary/50"
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSaveOpen(false);
                    setSaveName("");
                  }}
                  className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savePending}
                  onClick={() => void saveOutfit()}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground disabled:opacity-50"
                >
                  {savePending ? "Saving…" : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8 relative z-10">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tighter text-foreground">DAILY MIX</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Valid Top / Bottom / Shoe</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => setSaveOpen(true)}
            disabled={!canSave || isShuffling}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all border border-white/15",
              "text-foreground hover:bg-white/10 hover:border-primary/30",
              (!canSave || isShuffling) && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Save outfit"
          >
            <BookmarkPlus className="w-4 h-4" />
            Save outfit
          </button>
          <button
            type="button"
            onClick={() => shuffle(true)}
            disabled={isShuffling || !hasValidCombos}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all",
              "bg-primary text-primary-foreground hover:shadow-[0_0_24px_rgba(204,255,0,0.4)] hover:scale-105 active:scale-95",
              (!hasValidCombos || isShuffling) && "opacity-70 cursor-not-allowed hover:scale-100"
            )}
            aria-label={isShuffling ? "Mixing outfit" : "Mix random outfit"}
          >
            <Shuffle className={cn("w-4 h-4", isShuffling && "animate-spin")} />
            {isShuffling ? "Mixing…" : "Mix It"}
          </button>
        </div>
      </div>

      <div className="flex gap-4 h-64 relative z-10">
        <div className="flex-1 relative overflow-hidden rounded-xl bg-muted/40">
          <AnimatePresence mode="wait">
            {currentTop ? (
              <motion.div key={currentTop.id} {...SLOT_TRANSITION} className="absolute inset-0">
                <Image
                  src={currentTop.imageUrl}
                  alt={currentTop.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 34vw, 220px"
                  unoptimized={!isFirebaseStorageUrl(currentTop.imageUrl)}
                />
              </motion.div>
            ) : (
              <motion.div key="empty-top" {...SLOT_TRANSITION} className="absolute inset-0">
                <EmptySlot icon={Shirt} label="Add Tops" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur rounded text-[10px] font-mono text-primary border border-primary/30">TOP</div>
        </div>

        <div className="flex-1 relative overflow-hidden rounded-xl bg-muted/40">
          <AnimatePresence mode="wait">
            {currentBottom ? (
              <motion.div key={currentBottom.id} {...SLOT_TRANSITION} className="absolute inset-0">
                <Image
                  src={currentBottom.imageUrl}
                  alt={currentBottom.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 34vw, 220px"
                  unoptimized={!isFirebaseStorageUrl(currentBottom.imageUrl)}
                />
              </motion.div>
            ) : (
              <motion.div key="empty-bottom" {...SLOT_TRANSITION} className="absolute inset-0">
                <EmptySlot icon={Shirt} label="Add Bottoms" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur rounded text-[10px] font-mono text-primary border border-primary/30">BTM</div>
        </div>

        <div className="flex-1 relative overflow-hidden rounded-xl bg-muted/40">
          <AnimatePresence mode="wait">
            {currentShoe ? (
              <motion.div key={currentShoe.id} {...SLOT_TRANSITION} className="absolute inset-0">
                <Image
                  src={currentShoe.imageUrl}
                  alt={currentShoe.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 34vw, 220px"
                  unoptimized={!isFirebaseStorageUrl(currentShoe.imageUrl)}
                />
              </motion.div>
            ) : (
              <motion.div key="empty-shoe" {...SLOT_TRANSITION} className="absolute inset-0">
                <EmptySlot icon={Footprints} label="Add Shoes" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur rounded text-[10px] font-mono text-primary border border-primary/30">FTW</div>
        </div>
      </div>

      <div className="mt-6 flex justify-center relative z-10">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Compatibility: <strong className="text-primary">{matchScore}%</strong>
        </p>
      </div>
    </div>
  );
}
