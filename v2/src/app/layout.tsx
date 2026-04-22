import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "@/context/AuthContext";
import { LenisProvider } from "@/components/LenisProvider";
import { Navbar } from "@/components/Navbar";
import { OnboardingBanner } from "@/components/OnboardingBanner";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const syne = Syne({ subsets: ["latin"], variable: "--font-display", weight: ["400", "700", "800"] });

export const metadata: Metadata = {
  title: "AURA | The Digital Atelier",
  description: "AI-Powered Outfit Recommender",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${syne.variable} antialiased bg-background text-foreground`}
      >
        <AuthContextProvider>
          <LenisProvider>
            <Navbar />
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Skip to content
            </a>
            <div className="fixed inset-0 z-50 pointer-events-none noise-overlay opacity-[0.03]" />
            <div id="main" tabIndex={-1}>
              <OnboardingBanner />
              {children}
            </div>
            <Toaster position="bottom-right" theme="dark" richColors closeButton />
          </LenisProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
