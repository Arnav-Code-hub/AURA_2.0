"use client";

import { motion } from "framer-motion";
import { Sparkles, Shirt, Zap, Globe } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-tighter uppercase mb-4">
            About <span className="text-primary">AURA</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The Digital Atelier — where future fashion meets your daily “What do I wear?”
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-12"
        >
          <div className="rounded-2xl border border-white/10 bg-card/50 p-8 md:p-10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              AURA solves the daily outfit dilemma with a single tap. We combine your digital wardrobe with smart mixing so you get valid Top / Bottom / Shoe combinations—no more decision fatigue. Built for people who care about style but not about spending minutes in front of the closet.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card/50 p-8 md:p-10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <Shirt className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Daily Outfit Mixer</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our hero feature: a slot-machine style mixer that pulls from your uploaded pieces and shuffles valid combinations. Add tops, bottoms, and shoes to your digital wardrobe—then hit “Mix It” for an instant outfit suggestion.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline underline-offset-4"
            >
              Try the Mixer <Zap className="w-4 h-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card/50 p-8 md:p-10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Electric Midnight</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              AURA’s visual identity—deep charcoal and electric lime—reflects a neo-modern, high-fashion tech feel. We’re building the kind of experience that sits at the intersection of Balenciaga and Apple: bold, minimal, and unmistakably forward.
            </p>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Link
            href="/"
            className="inline-block rounded-full bg-primary px-8 py-3 font-bold text-primary-foreground transition-all hover:shadow-[0_0_24px_rgba(204,255,0,0.3)] hover:scale-105"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
