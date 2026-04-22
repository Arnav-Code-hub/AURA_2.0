"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

// Mock Data
const mockWardrobe = [
    { id: 1, name: "Classic White Tee", category: "Tops", image: "bg-neutral-100", date: "2024-03-10" },
    { id: 2, name: "Blue Denim Jeans", category: "Bottoms", image: "bg-blue-100", date: "2024-03-12" },
    { id: 3, name: "Leather Jacket", category: "Outerwear", image: "bg-neutral-800", date: "2024-03-15" },
    { id: 4, name: "White Sneakers", category: "Shoes", image: "bg-neutral-50", date: "2024-03-18" },
    { id: 5, name: "Black Hoodie", category: "Tops", image: "bg-neutral-900", date: "2024-03-20" },
    { id: 6, name: "Chino Shorts", category: "Bottoms", image: "bg-amber-100", date: "2024-03-22" },
];

const categories = ["All", "Tops", "Bottoms", "Outerwear", "Shoes"];

export default function WardrobePage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = mockWardrobe.filter((item) => {
        const matchesCategory = activeCategory === "All" || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="container-width py-12 min-h-[80vh]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="font-display font-bold text-4xl mb-2">My Wardrobe</h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Manage your digital closet and saved outfits.
                    </p>
                </div>
                <Link href="/upload">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Item
                    </Button>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search your wardrobe..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                                    ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filteredItems.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="group cursor-pointer hover:shadow-md transition-all duration-300">
                                <div className={`aspect-square rounded-2xl mb-4 ${item.image} relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-semibold truncate">{item.name}</h3>
                                    <p className="text-sm text-neutral-500">{item.category}</p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                        <Filter className="w-6 h-6 text-neutral-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">No items found</h3>
                    <p className="text-neutral-500">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
}
