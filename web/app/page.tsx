"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Scene } from "@/components/3d/Scene";
import { Humanoid } from "@/components/3d/Humanoid";

export default function Home() {
  return (
    <div className="container-width pb-20">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex flex-col md:flex-row items-center gap-12 py-12">
        <div className="flex-1 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
              AI-Powered Styling
            </span>
            <h1 className="font-display font-bold text-5xl md:text-7xl leading-tight mb-6">
              Your Personal <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                AI Stylist
              </span>
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-lg leading-relaxed">
              Upload your wardrobe, generate stunning outfits, and visualize them in 3D.
              Experience the future of fashion with Aura.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/upload">
              <Button size="lg" className="group">
                Start Styling
                <Sparkles className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
              </Button>
            </Link>
            <Link href="/wardrobe">
              <Button variant="outline" size="lg">
                My Wardrobe
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-8 pt-8"
          >
            <div>
              <p className="font-bold text-2xl">10k+</p>
              <p className="text-sm text-neutral-500">Outfits Generated</p>
            </div>
            <div>
              <p className="font-bold text-2xl">5k+</p>
              <p className="text-sm text-neutral-500">Happy Users</p>
            </div>
          </motion.div>
        </div>

        {/* 3D Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="flex-1 w-full h-[500px] md:h-[600px]"
        >
          <Card variant="glass" className="w-full h-full relative overflow-hidden border-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10" />
            <Scene>
              <Humanoid />
            </Scene>

            {/* Floating Cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-8 right-8 glass-panel p-4 rounded-2xl max-w-[150px]"
            >
              <p className="text-xs font-medium text-neutral-500 mb-1">Match Score</p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full w-[92%] bg-green-500" />
                </div>
                <span className="text-sm font-bold">92%</span>
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">How It Works</h2>
          <p className="text-neutral-600 dark:text-neutral-400">Three simple steps to your perfect look</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Upload,
              title: "Upload Clothes",
              desc: "Take photos of your clothes and upload them to your digital wardrobe."
            },
            {
              icon: Sparkles,
              title: "AI Generation",
              desc: "Our AI analyzes your style and creates perfect outfit combinations."
            },
            {
              icon: ArrowRight,
              title: "3D Visualization",
              desc: "See how the outfit looks on your personalized 3D avatar."
            }
          ].map((feature, i) => (
            <Card key={i} className="hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {feature.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div >
  );
}
