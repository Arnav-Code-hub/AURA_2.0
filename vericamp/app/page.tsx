"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Upload, CheckCircle2, Loader2, ShieldCheck, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WalletConnect = dynamic(() => import("../components/WalletConnect"), { ssr: false });

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "verifying" | "success" | "minting" | "minted">("idle");
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;
    setStatus("verifying");

    try {
      const res = await fetch("/api/verify", { method: "POST" });
      const data = await res.json();
      setResult(data);
      setStatus("success");
    } catch (e) {
      console.error(e);
      setStatus("idle");
    }
  };

  const handleMint = async () => {
    setStatus("minting");
    // Simulate Algorand Transaction Signing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setStatus("minted");
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-border/40 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">VeriCamp</span>
          </div>
          <WalletConnect onConnect={setAddress} />
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-2xl w-full relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-foreground">
              Trust-less Campus <br /> Verification
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload medical certificates, event photos, or attendance sheets. <br />
              Our <span className="text-primary font-semibold">AI Oracle</span> verifies them instantly on Algorand.
            </p>
          </div>

          {/* Main Action Card */}
          <div className="bg-card border border-border shadow-2xl rounded-2xl p-8 backdrop-blur-xl">
            {!address ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect Wallet to Begin</h3>
                <p className="text-muted-foreground mb-6">You need an Algorand wallet to receive verified credentials.</p>
                <div className="flex justify-center">
                  <WalletConnect onConnect={setAddress} />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Status: Idle / Upload */}
                {status === "idle" && (
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:bg-muted/50 transition-colors cursor-pointer group"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
                    }}
                  >
                    <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors mx-auto mb-4" />
                    {file ? (
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <button
                          onClick={handleUpload}
                          className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                          Verify Proof
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg font-medium text-foreground">Drag & Drop Proof Here</p>
                        <p className="text-sm text-muted-foreground mt-2">or click to browse files</p>
                        <input
                          type="file"
                          className="hidden"
                          id="file-upload"
                          onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                        />
                        <label htmlFor="file-upload" className="mt-4 inline-block text-primary hover:underline cursor-pointer">Browse Files</label>
                      </>
                    )}
                  </div>
                )}

                {/* Status: Verifying */}
                {status === "verifying" && (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">AI Oracle is Analyzing...</h3>
                    <p className="text-muted-foreground">Verifying document authenticity and extracting data.</p>
                  </div>
                )}

                {/* Status: Success */}
                {status === "success" && result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Verification Successful!</h3>
                    <p className="text-muted-foreground mb-8">The AI Oracle has validated your proof.</p>

                    <div className="bg-muted/50 rounded-xl p-4 text-left mb-8 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Document Type</span>
                        <span className="text-sm font-medium">{result.documentType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Confidence Score</span>
                        <span className="text-sm font-medium text-green-600">{(result.confidence * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Hash On-Chain</span>
                        <span className="text-sm font-mono text-xs">{result.hash}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleMint}
                      className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                    >
                      Mint Credential to Wallet
                    </button>
                  </motion.div>
                )}

                {/* Status: Minting */}
                {status === "minting" && (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Minting Asset...</h3>
                    <p className="text-muted-foreground">Please sign the transaction in your Pera Wallet.</p>
                  </div>
                )}

                {/* Status: Minted */}
                {status === "minted" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShieldCheck className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Credential Minted!</h3>
                    <p className="text-muted-foreground mb-8">You can now view this asset in your Pera Wallet.</p>

                    <button
                      onClick={() => setStatus("idle")}
                      className="text-primary hover:underline"
                    >
                      Verify another document
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center gap-8 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>AI Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>On-Chain Record</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
