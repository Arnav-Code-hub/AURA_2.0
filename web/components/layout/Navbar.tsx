"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import GooeyNav from "@/components/GooeyNav";

const navItems = [
    { name: "Home", href: "/" },
    { name: "Generate", href: "/upload" },
    { name: "Wardrobe", href: "/wardrobe" },
    { name: "Community", href: "/community" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
            <nav className="glass-panel container-width rounded-full h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 pl-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        A
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight">Aura</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center justify-center flex-1 relative h-full">
                    <GooeyNav
                        items={navItems.map(item => ({ label: item.name, href: item.href }))}
                        particleCount={15}
                        particleDistances={[40, 10]} // Reduced distance for navbar
                        particleR={50} // Reduced radius for navbar
                        initialActiveIndex={0}
                        animationTime={600}
                        timeVariance={300}
                        colors={[1, 2, 3, 4]}
                    />
                </div>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-2 pr-2">
                    <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
                        <Search className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
                        <ShoppingBag className="w-5 h-5" />
                    </Button>
                    <Link href="/settings">
                        <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
                            <User className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Button variant="primary" size="sm" className="ml-2">
                        Sign In
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-neutral-600 dark:text-neutral-300"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute top-24 left-4 right-4 glass-panel rounded-3xl p-6 md:hidden flex flex-col gap-4"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "text-lg font-medium py-2 border-b border-neutral-100 dark:border-neutral-800",
                                    pathname === item.href ? "text-blue-500" : "text-neutral-600 dark:text-neutral-400"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className="flex gap-4 mt-4">
                            <Button className="flex-1" variant="secondary">
                                Search
                            </Button>
                            <Button className="flex-1">Sign In</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header >
    );
}
