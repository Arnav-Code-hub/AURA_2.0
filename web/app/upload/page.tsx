"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Wand2, Shirt, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Scene } from "@/components/3d/Scene";
import { Humanoid } from "@/components/3d/Humanoid";
import { cn } from "@/lib/utils";

export default function UploadPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showResult, setShowResult] = useState(false);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.length) {
            setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate AI processing
        setTimeout(() => {
            setIsGenerating(false);
            setShowResult(true);
        }, 3000);
    };

    return (
        <div className="container-width py-12 min-h-[80vh]">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="font-display font-bold text-4xl mb-4">Create Your Look</h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Upload your clothes and let our AI style you perfectly.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Left Column: Upload & Controls */}
                    <div className="space-y-8">
                        <Card className="p-8">
                            <div
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                className={cn(
                                    "border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer",
                                    isDragging
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                                )}
                            >
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    id="file-upload"
                                    onChange={handleFileSelect}
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                                        <Upload className="w-8 h-8 text-neutral-500" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Upload Clothes</h3>
                                    <p className="text-sm text-neutral-500 mb-4">
                                        Drag & drop or click to browse
                                    </p>
                                    <p className="text-xs text-neutral-400">
                                        Supports JPG, PNG, WEBP
                                    </p>
                                </label>
                            </div>

                            {/* File List */}
                            <AnimatePresence>
                                {files.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-6 space-y-3"
                                    >
                                        <h4 className="font-medium text-sm text-neutral-500">Uploaded Items</h4>
                                        {files.map((file, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                                                        <Shirt className="w-5 h-5 text-neutral-500" />
                                                    </div>
                                                    <div className="text-sm">
                                                        <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                                                        <p className="text-neutral-500">{(file.size / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeFile(i)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 rounded-full transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-8">
                                <Button
                                    size="lg"
                                    className="w-full"
                                    disabled={files.length === 0 || isGenerating}
                                    onClick={handleGenerate}
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="animate-spin mr-2">✨</span>
                                            Analyzing Wardrobe...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-4 h-4 mr-2" />
                                            Generate Outfit
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Result / Preview */}
                    <div className="relative h-[600px]">
                        <AnimatePresence mode="wait">
                            {!showResult ? (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full flex items-center justify-center"
                                >
                                    <div className="text-center space-y-4">
                                        <div className="w-24 h-24 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto animate-pulse">
                                            <Shirt className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
                                        </div>
                                        <p className="text-neutral-500">
                                            Upload items to see your 3D preview
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full w-full"
                                >
                                    <Card variant="glass" className="h-full relative overflow-hidden border-0">
                                        <div className="absolute top-4 left-4 z-10 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border border-green-500/20">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Outfit Generated
                                        </div>
                                        <Scene>
                                            <Humanoid />
                                        </Scene>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
