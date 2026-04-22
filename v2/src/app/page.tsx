"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { OutfitMixer } from "@/components/OutfitMixer";
import { useUserAuth } from "@/context/AuthContext";
import { useWardrobe } from "@/hooks/useWardrobe";

export default function Home() {
  const { user, isSessionUser, getUid } = useUserAuth();
  const uid = getUid();
  const { items: wardrobeItems, isLoading: wardrobeLoading } = useWardrobe({
    uid,
    isSessionUser,
    enabled: !!user,
  });
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.92]);
  const mixerY = useTransform(scrollYProgress, [0.25, 0.55], [40, 0]);
  const mixerOpacity = useTransform(scrollYProgress, [0.2, 0.45], [0, 1]);

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Hero — Cinematic */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-24">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 z-0"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(204,255,0,0.08),transparent_50%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_100%,rgba(255,255,255,0.03),transparent_60%)] pointer-events-none" />

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(3rem,14vw,10rem)] font-extrabold leading-[0.85] tracking-tighter text-center uppercase"
          >
            <span className="block text-foreground">Future</span>
            <span className="block text-primary drop-shadow-[0_0_40px_rgba(204,255,0,0.25)]">Fashion</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 max-w-xl text-center text-lg md:text-xl text-muted-foreground tracking-wide"
          >
            The world’s first <span className="text-primary font-semibold">Daily Outfit Mixer</span> that answers &ldquo;What do I wear?&rdquo;
          </motion.p>

          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10"
            >
              <Link href="/login">
                <button className="px-10 py-4 rounded-full font-bold text-base bg-primary text-primary-foreground hover:shadow-[0_0_40px_rgba(204,255,0,0.35)] hover:scale-105 active:scale-95 transition-all duration-200">
                  Get Early Access
                </button>
              </Link>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-xs text-muted-foreground uppercase tracking-[0.3em]"
          >
            Scroll toStyle
          </motion.p>
        </motion.div>
      </section>

      {/* Outfit Mixer — Hero feature */}
      <section className="relative py-24 md:py-32 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(204,255,0,0.04),transparent_50%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 md:gap-20 items-center">
          <motion.div style={{ y: mixerY, opacity: mixerOpacity }} className="order-2 md:order-1">
            <OutfitMixer
              items={user ? wardrobeItems : undefined}
              isLoading={!!user && wardrobeLoading}
            />
          </motion.div>

          <div className="order-1 md:order-2">
            <motion.h2
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase leading-tight tracking-tighter"
            >
              Stop thinking.<br />
              <span className="text-primary">Start wearing.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-md"
            >
              Valid Top / Bottom / Shoe combinations from your digital wardrobe—shuffled in one tap. No more decision fatigue.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 pt-10 border-t border-white/10 flex flex-wrap gap-10"
            >
              <div>
                <div className="font-display text-3xl font-bold text-foreground">10k+</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Outfits created</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-display text-3xl font-bold text-foreground">4.9</div>
                <Star className="w-5 h-5 fill-primary text-primary" />
                <div className="text-xs text-muted-foreground uppercase tracking-widest">App Store</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="relative py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center px-6">
          <motion.h3
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6"
          >
            Ready to upgrade your style?
          </motion.h3>
          <Link href={user ? "/wardrobe" : "/login"}>
            <span className="inline-flex items-center gap-2 text-primary font-semibold underline underline-offset-8 decoration-2 hover:text-foreground transition-colors cursor-pointer">
              Launch the Atelier <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
          <p className="mt-16 text-xs text-muted-foreground uppercase tracking-widest">
            © 2026 AURA. Electric Midnight.
          </p>
        </div>
      </footer>
    </main>
  );
}
