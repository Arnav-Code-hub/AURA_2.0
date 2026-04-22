"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, Plus, Loader2, Trash2, RotateCw } from "lucide-react";
import Link from "next/link";
import { useUserAuth } from "@/context/AuthContext";
import { WardrobeService, type WardrobeItem } from "@/services/wardrobe";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useWardrobe } from "@/hooks/useWardrobe";
import { isFirebaseStorageUrl } from "@/lib/remote-image";

export default function WardrobePage() {
    const { user, loading: authLoading, isSessionUser, getUid } = useUserAuth();
    const router = useRouter();
    const uid = getUid();

    const { items, isLoading, mutate, isValidating, error } = useWardrobe({
        uid,
        isSessionUser,
        enabled: !!user,
    });

    const [searchQuery, setSearchQuery] = React.useState("");
    const [activeCategory, setActiveCategory] = React.useState("All");

    const categories = ["All", "Tops", "Bottoms", "Outerwear", "Shoes", "Accessories"];

    useEffect(() => {
        if (error) toast.error("Failed to load wardrobe.");
    }, [error]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    const handleDelete = async (e: React.MouseEvent, item: WardrobeItem) => {
        e.stopPropagation();
        if (!confirm("Remove this item from your closet?")) return;

        try {
            if (item.id) {
                if (isSessionUser) {
                    await fetch(`/api/wardrobe/${item.id}`, { method: "DELETE", credentials: "include" });
                } else {
                    await WardrobeService.deleteItem(item.id, item.imageUrl);
                }
                await mutate((prev) => (prev ?? []).filter((i) => i.id !== item.id), { revalidate: false });
                toast.success("Item removed from your closet.");
            }
        } catch (err) {
            toast.error("Failed to remove item.");
        }
    };

    const filteredItems = items.filter((item) => {
        const matchesCategory = activeCategory === "All" || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (authLoading || !user) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const showGridLoader = isLoading && items.length === 0;

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 px-6 md:px-12 pb-24">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2">Digital Wardrobe</h1>
                    <p className="text-muted-foreground">{items.length} items collected</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => mutate()}
                        disabled={isValidating}
                        className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-all disabled:opacity-50"
                        aria-label="Refresh wardrobe"
                    >
                        <RotateCw className={cn("w-5 h-5", isValidating && "animate-spin")} />
                        Refresh
                    </button>
                    <Link href="/upload">
                        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-[1.02] transition-all">
                            <Plus className="w-5 h-5" />
                            Add Piece
                        </button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 mb-8 sticky top-4 z-20 bg-background/80 backdrop-blur-xl p-4 -mx-4 rounded-2xl border border-white/5">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search your collection..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-white/20 transition-colors"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                                ? "bg-primary text-primary-foreground"
                                : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {showGridLoader ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
            ) : filteredItems.length > 0 ? (
                <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    <AnimatePresence>
                        {filteredItems.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/5 cursor-pointer"
                            >
                                <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                    unoptimized={!isFirebaseStorageUrl(item.imageUrl)}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                    <h3 className="font-bold text-white truncate">{item.name}</h3>
                                    <p className="text-xs text-muted-foreground">{item.category}</p>

                                    <button
                                        type="button"
                                        onClick={(e) => handleDelete(e, item)}
                                        className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                        aria-label={`Remove ${item.name} from closet`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/5">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Closet Empty</h3>
                    <p className="text-muted-foreground mb-6">Start building your digital wardrobe today.</p>
                    <Link href="/upload">
                        <button className="text-white underline underline-offset-4 hover:text-blue-400">
                            Upload your first item
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
