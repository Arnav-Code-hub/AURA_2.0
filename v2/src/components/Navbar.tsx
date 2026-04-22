"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUserAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const ADMIN_UIDS = (process.env.NEXT_PUBLIC_ADMIN_UIDS || "").split(",").map((s) => s.trim()).filter(Boolean);
function useIsAdmin() {
  const { getUid } = useUserAuth();
  const uid = getUid();
  return Boolean(uid && ADMIN_UIDS.length && ADMIN_UIDS.includes(uid));
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/suggestions", label: "AI Suggestions" },
  { href: "/wardrobe", label: "Digital Wardrobe", auth: true },
  { href: "/outfits", label: "Saved", auth: true },
  { href: "/upload", label: "Upload" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logOut } = useUserAuth();
  const isAdmin = useIsAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkItems = [
    ...navLinks.map((link) => {
      const { href, label, auth } = link as { href: string; label: string; auth?: boolean };
      if (auth && !user) return null;
      return { href, label };
    }).filter(Boolean) as { href: string; label: string }[],
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4" aria-label="Main navigation">
        <Link
          href="/"
          className="font-display text-xl font-extrabold tracking-tighter text-foreground transition-colors hover:text-primary"
          aria-label="AURA home"
        >
          AURA
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 md:gap-2">
          {navLinks.map((link) => {
            const { href, label, auth } = link as { href: string; label: string; auth?: boolean };
            if (auth && !user) return null;
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-foreground/80 hover:text-primary hover:bg-white/5"
                )}
              >
                {label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/admin"
                  ? "text-primary bg-primary/10"
                  : "text-foreground/80 hover:text-primary hover:bg-white/5"
              )}
            >
              Admin
            </Link>
          )}
          {user ? (
            <button
              type="button"
              onClick={() => logOut()}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary hover:bg-white/5"
              aria-label="Log out"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                pathname === "/login"
                  ? "text-primary bg-primary/10"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile: hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {user ? (
            <button
              type="button"
              onClick={() => logOut()}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80"
              aria-label="Log out"
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium bg-primary text-primary-foreground">
              Sign In
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="p-2 rounded-lg text-foreground/80 hover:text-primary hover:bg-white/5 transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-white/5 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {linkItems.map(({ href, label }) => {
                const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      isActive ? "text-primary bg-primary/10" : "text-foreground/80 hover:bg-white/5"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
