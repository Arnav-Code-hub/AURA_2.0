"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, User, Bell, Shield, Palette } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="container-width py-12 min-h-[80vh]">
            <div className="max-w-3xl mx-auto">
                <h1 className="font-display font-bold text-4xl mb-2">Settings</h1>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                    Manage your account preferences and app settings.
                </p>

                <div className="space-y-6">
                    {/* Appearance */}
                    <Card className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Palette className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">Appearance</h2>
                                <p className="text-sm text-neutral-500">Customize how Aura looks on your device.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => setTheme("light")}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === "light"
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                                    }`}
                            >
                                <Sun className="w-6 h-6" />
                                <span className="font-medium">Light</span>
                            </button>
                            <button
                                onClick={() => setTheme("dark")}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === "dark"
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                                    }`}
                            >
                                <Moon className="w-6 h-6" />
                                <span className="font-medium">Dark</span>
                            </button>
                            <button
                                onClick={() => setTheme("system")}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === "system"
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                                    }`}
                            >
                                <Monitor className="w-6 h-6" />
                                <span className="font-medium">System</span>
                            </button>
                        </div>
                    </Card>

                    {/* Profile */}
                    <Card className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">Profile Settings</h2>
                                <p className="text-sm text-neutral-500">Update your personal information.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">First Name</label>
                                    <input
                                        type="text"
                                        defaultValue="Ashwwin"
                                        className="w-full px-4 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <input
                                        type="text"
                                        defaultValue="User"
                                        className="w-full px-4 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    defaultValue="ashwwin@example.com"
                                    className="w-full px-4 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div className="pt-2">
                                <Button>Save Changes</Button>
                            </div>
                        </div>
                    </Card>

                    {/* Notifications */}
                    <Card className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">Notifications</h2>
                                <p className="text-sm text-neutral-500">Manage your alert preferences.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">New Outfit Suggestions</p>
                                    <p className="text-sm text-neutral-500">Get notified when AI generates new looks.</p>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-blue-500">
                                    <span className="absolute left-6 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out transform translate-x-0"></span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
