"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, X, Loader2, CheckCircle2, Plus } from "lucide-react";
import { useUserAuth } from "@/context/AuthContext";
import { WardrobeService } from "@/services/wardrobe";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import type { Sponsor } from "@/lib/trends";

export default function UploadPage() {
    const { isSessionUser, getUid } = useUserAuth();
    const router = useRouter();
    const { mutate: globalMutate } = useSWRConfig();

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [category, setCategory] = useState("Tops");
    const [sponsorId, setSponsorId] = useState("");
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);

    useEffect(() => {
        fetch("/api/sponsors")
            .then((r) => r.json())
            .then((data: unknown) => {
                if (Array.isArray(data)) setSponsors(data as Sponsor[]);
            })
            .catch(() => setSponsors([]));
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFile = (f: File) => {
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setTags([]);
        setTagInput("");
    };

    const addTag = () => {
        const t = tagInput.trim();
        if (!t) return;
        if (!tags.includes(t)) setTags((prev) => [...prev, t]);
        setTagInput("");
    };

    const removeTag = (tag: string) => {
        setTags((prev) => prev.filter((x) => x !== tag));
    };

    const handleSave = async () => {
        const uid = getUid();
        if (!uid || !file) return;

        try {
            setUploading(true);
            const meta = {
                name: file.name.split(".")[0] || "Item",
                category,
                tags,
                ...(sponsorId ? { sponsorId } : {}),
            };
            if (isSessionUser) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("name", meta.name);
                formData.append("category", category);
                formData.append("tags", JSON.stringify(tags));
                if (sponsorId) formData.append("sponsorId", sponsorId);
                const res = await fetch("/api/wardrobe", {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                });
                if (!res.ok) throw new Error("Upload failed");
            } else {
                await WardrobeService.addItem(uid, file, meta);
            }
            await globalMutate((key) => Array.isArray(key) && key[0] === "wardrobe");
            toast.success("Item added to your closet.");
            router.push("/wardrobe");
        } catch (error) {
            toast.error("Failed to upload. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center pt-24 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <h1 className="font-display text-4xl font-bold mb-8 text-center">Add to Closet</h1>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                    {!preview ? (
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={onDrop}
                            className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => document.getElementById("file-upload")?.click()}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="file-upload"
                                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                            />
                            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                                <Upload className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-lg font-medium">Drop your photo here</p>
                            <p className="text-sm text-muted-foreground mt-2">or click to browse</p>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="relative w-full md:w-1/2 aspect-[3/4] rounded-xl overflow-hidden bg-black/50">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFile(null);
                                        setPreview(null);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-red-500 transition-colors"
                                    aria-label="Remove image"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div>
                                    <label className="text-sm text-muted-foreground uppercase tracking-wider mb-2 block">
                                        Tags
                                    </label>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Add your own tags to describe this piece (style, color, material, etc.).
                                    </p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addTag();
                                                }
                                            }}
                                            placeholder="e.g. denim, casual"
                                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/30 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={addTag}
                                            className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15"
                                            aria-label="Add tag"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {tags.map((tag) => (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="px-3 py-1 bg-white/10 text-foreground rounded-full text-xs font-medium border border-white/15 hover:border-red-500/50 hover:text-red-300"
                                                >
                                                    {tag} ×
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm text-muted-foreground uppercase tracking-wider mb-2 block">
                                        Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 outline-none focus:border-white/30"
                                    >
                                        {["Tops", "Bottoms", "Outerwear", "Shoes", "Accessories"].map((c) => (
                                            <option key={c} value={c} className="bg-neutral-900">
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {sponsors.length > 0 && (
                                    <div>
                                        <label className="text-sm text-muted-foreground uppercase tracking-wider mb-2 block">
                                            Partner link (optional)
                                        </label>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            If this piece spotlights a partner brand, link it so the mixer can favor it fairly.
                                        </p>
                                        <select
                                            value={sponsorId}
                                            onChange={(e) => setSponsorId(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 outline-none focus:border-white/30"
                                        >
                                            <option value="">None</option>
                                            {sponsors.map((s) => (
                                                <option key={s.id} value={s.id} className="bg-neutral-900">
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={uploading}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                                        uploading ? "bg-white/10 text-muted-foreground" : "bg-white text-black hover:scale-[1.02]"
                                    )}
                                >
                                    {uploading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Save to Closet
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
