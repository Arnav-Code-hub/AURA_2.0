import React from "react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm mt-20">
            <div className="container-width py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-display font-bold text-lg mb-4">Aura</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            AI-powered outfit recommendations for the modern wardrobe.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
                            <li><Link href="/upload">Generate Outfit</Link></li>
                            <li><Link href="/wardrobe">My Wardrobe</Link></li>
                            <li><Link href="/community">Community</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/careers">Careers</Link></li>
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Connect</h4>
                        <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
                            <li><a href="#">Twitter</a></li>
                            <li><a href="#">Instagram</a></li>
                            <li><a href="#">Discord</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-800 mt-12 pt-8 text-center text-sm text-neutral-500">
                    © {new Date().getFullYear()} Aura AI. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
