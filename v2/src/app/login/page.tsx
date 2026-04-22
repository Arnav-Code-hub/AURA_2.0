"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useUserAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

function LoginContent() {
  const { googleSignIn, user, getUid } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "";

  // If we landed with a code (from authorized domain), exchange it and redirect
  useEffect(() => {
    const code = searchParams.get("code");
    if (code && typeof window !== "undefined") {
      window.location.replace(`/api/auth/callback?code=${encodeURIComponent(code)}`);
      return;
    }
  }, [searchParams]);

  // If we're on a non-authorized domain and APP_URL is set, redirect to authorized domain for login
  useEffect(() => {
    if (!APP_URL || typeof window === "undefined") return;
    const currentOrigin = window.location.origin;
    const code = searchParams.get("code");
    if (code) return; // we're handling code above
    if (currentOrigin !== APP_URL) {
      const returnToUrl = encodeURIComponent(window.location.href);
      window.location.replace(`${APP_URL}/login?returnTo=${returnToUrl}`);
    }
  }, [searchParams]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const cred = await googleSignIn();
      const firebaseUser = cred?.user;
      if (!firebaseUser) return;

      const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
      const returnToOrigin = returnTo ? new URL(returnTo).origin : "";

      // If we need to send user back to another domain (e.g. preview), create one-time code
      if (returnTo && returnToOrigin !== currentOrigin) {
        const idToken = await firebaseUser.getIdToken();
        const res = await fetch("/api/auth/create-code", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ returnTo }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to create session");
        }
        const { code } = (await res.json()) as { code: string };
        window.location.replace(`${returnTo}${returnTo.includes("?") ? "&" : "?"}code=${code}`);
        return;
      }

      router.push("/wardrobe");
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e?.code === "auth/unauthorized-domain") {
        setError(
          "This domain is not authorized. Set NEXT_PUBLIC_APP_URL to your production URL (the one added in Firebase) and use that URL to sign in—no need to add every preview URL."
        );
      } else if (e?.code === "auth/popup-closed-by-user") {
        setError("Login cancelled.");
      } else {
        setError(e?.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already logged in (same origin)
  useEffect(() => {
    if (getUid() && !returnTo) router.replace("/wardrobe");
  }, [getUid(), returnTo, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 z-0 opacity-40">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-primary/10 rounded-full blur-3xl filter"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-3xl filter"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 w-full max-w-md p-8"
      >
        <div className="backdrop-blur-xl bg-card/40 border border-white/5 p-8 rounded-3xl shadow-2xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 mb-6 shadow-lg shadow-primary/20"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="font-display text-4xl font-bold mb-2 tracking-tight">AURA</h1>
            <p className="text-muted-foreground text-lg">The Digital Atelier</p>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm text-center">
                {error}
              </div>
            )}
            <button
              onClick={handleLogin}
              disabled={loading}
              className={cn(
                "group relative w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300",
                "bg-white/5 hover:bg-white/10 hover:scale-[1.02] border border-white/10 hover:border-white/20",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              <div className="w-5 h-5">
                <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12S5.867 24 12.48 24c3.44 0 6.147-1.133 7.947-3.053 1.84-2.093 2.12-5.387 1.947-7.2h-3.2l-6.693-.827Z"
                    fill="#fff"
                    opacity="0.8"
                  />
                </svg>
              </div>
              <span>{loading ? "Connecting..." : "Continue with Google"}</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>

            <p className="text-xs text-center text-muted-foreground mt-8">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
