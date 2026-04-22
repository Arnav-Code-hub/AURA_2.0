"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, TrendingUp, ArrowRight, Shirt } from "lucide-react";
import type { Trend, Sponsor } from "@/lib/trends";
import { isFirebaseStorageUrl } from "@/lib/remote-image";

export default function SuggestionsPage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/trends").then((r) => r.json()),
      fetch("/api/sponsors").then((r) => r.json()),
    ])
      .then(([t, s]) => {
        setTrends(Array.isArray(t) ? t : []);
        setSponsors(Array.isArray(s) ? s : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tighter uppercase mb-4">
            Style <span className="text-primary">Suggestions</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Current trends and AI-picked looks—personalized for what&apos;s hot right now.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-16"
            >
              <h2 className="font-display text-2xl font-bold flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-primary" />
                Current Trends
              </h2>
              {trends.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-12 text-center text-muted-foreground">
                  <p className="mb-2">No trends added yet. Check back soon for AI-curated style trends.</p>
                  <p className="text-sm mb-6">In the meantime, mix an outfit from your wardrobe.</p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground transition-all hover:shadow-[0_0_24px_rgba(204,255,0,0.3)] hover:scale-105"
                  >
                    Try the Outfit Mixer <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {trends.map((trend, i) => (
                    <motion.div
                      key={trend.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="rounded-2xl border border-white/10 bg-card/50 overflow-hidden backdrop-blur-sm"
                    >
                      {trend.imageUrl ? (
                        <div className="aspect-[4/3] overflow-hidden bg-muted">
                          <img
                            src={trend.imageUrl}
                            alt={trend.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                          <Shirt className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-5">
                        {trend.categoryFocus && (
                          <span className="text-xs font-medium text-primary uppercase tracking-wider">
                            {trend.categoryFocus}
                          </span>
                        )}
                        <h3 className="font-display text-xl font-bold mt-1">{trend.name}</h3>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {trend.description}
                        </p>
                        <Link
                          href="/"
                          className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary hover:underline"
                        >
                          Get this look <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>

            {sponsors.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-display text-2xl font-bold flex items-center gap-2 mb-6">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Featured by Our Partners
                </h2>
                <div className="flex flex-wrap gap-4">
                  {sponsors.map((s) => (
                    <a
                      key={s.id}
                      href={s.websiteUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/50 px-5 py-3 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                    >
                      {s.logoUrl ? (
                        <Image
                          src={s.logoUrl}
                          alt={s.name}
                          width={160}
                          height={32}
                          className="h-8 w-auto max-w-[160px] object-contain"
                          unoptimized={!isFirebaseStorageUrl(s.logoUrl)}
                        />
                      ) : (
                        <span className="font-display font-bold text-foreground">{s.name}</span>
                      )}
                      {s.websiteUrl && (
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </a>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  AI suggestions may prioritize looks from our partners. Support the brands that support AURA.
                </p>
              </motion.section>
            )}
          </>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-bold text-primary-foreground transition-all hover:shadow-[0_0_24px_rgba(204,255,0,0.3)] hover:scale-105"
          >
            Mix an Outfit <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
