"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useUserAuth } from "@/context/AuthContext";
import { useWardrobe } from "@/hooks/useWardrobe";
const DISMISS_KEY = "aura_onboarding_dismissed";
const FIRST_MIX_KEY = "aura_first_mix_done";

function wardrobeProgress(items: { category: string }[]) {
  const hasTop = items.some((i) => i.category === "Tops" || i.category === "Outerwear");
  const hasBottom = items.some((i) => i.category === "Bottoms");
  const hasShoe = items.some((i) => i.category === "Shoes");
  const count = [hasTop, hasBottom, hasShoe].filter(Boolean).length;
  return { hasTop, hasBottom, hasShoe, count, hasAll: hasTop && hasBottom && hasShoe };
}

export function OnboardingBanner() {
  const { user, getUid, isSessionUser } = useUserAuth();
  const uid = getUid();
  const { items, isLoading } = useWardrobe({ uid, isSessionUser, enabled: !!user });
  const [dismissed, setDismissed] = useState(false);
  const [firstMix, setFirstMix] = useState(false);

  useEffect(() => {
    setDismissed(typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY) === "1");
    setFirstMix(typeof window !== "undefined" && localStorage.getItem(FIRST_MIX_KEY) === "1");
  }, []);

  useEffect(() => {
    const sync = () => {
      setFirstMix(typeof window !== "undefined" && localStorage.getItem(FIRST_MIX_KEY) === "1");
    };
    window.addEventListener("aura-first-mix", sync);
    return () => window.removeEventListener("aura-first-mix", sync);
  }, []);

  const progress = useMemo(() => wardrobeProgress(items), [items]);

  const isComplete = progress.hasAll && firstMix;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  if (!user || isLoading || dismissed || isComplete) return null;

  return (
    <div
      className="mx-auto max-w-4xl px-4 pt-20 pb-2 md:pt-24"
      role="region"
      aria-label="Getting started"
    >
      <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 md:px-5 md:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 relative pr-10">
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
        {!progress.hasAll ? (
          <>
            <p className="text-sm text-foreground flex-1">
              <span className="font-semibold text-primary">Get started:</span> add{" "}
              <strong>1 top</strong>, <strong>1 bottom</strong>, and <strong>1 pair of shoes</strong>{" "}
              so the Mixer can build outfits. Progress:{" "}
              <span className="font-mono text-primary">
                {progress.count}/3
              </span>
            </p>
            <Link
              href="/upload"
              className="shrink-0 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              Upload items
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-foreground flex-1">
              <span className="font-semibold text-primary">You&apos;re ready!</span>{" "}
              Scroll to the Daily Mix on{" "}
              <Link href="/" className="underline underline-offset-2 text-primary">
                Home
              </Link>{" "}
              and tap <strong>Mix It</strong> to shuffle your wardrobe.
            </p>
            <Link
              href="/"
              className="shrink-0 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              Go to Mixer
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
