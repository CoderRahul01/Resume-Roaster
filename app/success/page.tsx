"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckIcon, ClipboardIcon, DownloadIcon } from "lucide-react";

export default function SuccessPage() {
  const [rewrittenResume, setRewrittenResume] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const paymentData = sessionStorage.getItem("paymentData");
    const resumeText  = sessionStorage.getItem("resumeText");

    if (!paymentData || !resumeText) {
      setError("No payment found. Did you complete checkout?");
      setIsLoading(false);
      return;
    }

    let payment: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    };
    try {
      payment = JSON.parse(paymentData);
    } catch {
      setError("Invalid payment data. Please contact support.");
      setIsLoading(false);
      return;
    }

    async function fetchRewrite() {
      try {
        const res = await fetch("/api/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payment, resumeText }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to generate rewrite");
        setRewrittenResume(data.rewrittenResume);
        sessionStorage.removeItem("paymentData");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRewrite();
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(rewrittenResume);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([rewrittenResume], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "resume-rewritten.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white flex flex-col">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/[0.04] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] px-6 py-4">
        <Link href="/" className="font-black text-base tracking-tight">
          Resume<span className="text-orange-500">Roaster</span>
        </Link>
      </header>

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-14 w-full space-y-8">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : (
          <ReadyState
            resume={rewrittenResume}
            copied={copied}
            onCopy={handleCopy}
            onDownload={handleDownload}
          />
        )}
      </div>
    </main>
  );
}

function LoadingState() {
  const steps = [
    "Parsing your resume...",
    "Identifying weak points...",
    "Rewriting experience bullets...",
    "Optimizing for ATS...",
    "Polishing the final draft...",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center space-y-8 animate-fade-in">
      <div className="space-y-3">
        <div className="text-5xl animate-pulse">✨</div>
        <h1 className="text-2xl font-bold">Rewriting your resume</h1>
        <p className="text-zinc-500 text-sm">{steps[step]}</p>
      </div>
      {/* Progress bar */}
      <div className="w-full h-[2px] bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-[2800ms] ease-out"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>
      {/* Skeleton lines */}
      <div className="space-y-2.5 text-left">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`h-3 rounded-full bg-zinc-800/80 animate-pulse ${
              i % 4 === 3 ? "w-1/2" : i % 4 === 2 ? "w-3/4" : "w-full"
            }`}
            style={{ animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="text-center space-y-5 animate-fade-in">
      <div className="text-5xl">😕</div>
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-zinc-400 text-sm max-w-sm mx-auto">{error}</p>
      <Link href="/">
        <Button className="bg-orange-500 hover:bg-orange-600 font-semibold mt-2">
          Back to home
        </Button>
      </Link>
    </div>
  );
}

function ReadyState({
  resume,
  copied,
  onCopy,
  onDownload,
}: {
  resume: string;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 mb-2">
          <CheckIcon className="w-5 h-5 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold">Your rewritten resume is ready</h1>
        <p className="text-zinc-500 text-sm">
          ATS-optimized · Achievement-focused · Ready to send
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onCopy}
          className="flex-1 bg-orange-500 hover:bg-orange-600 font-semibold h-11"
        >
          {copied ? (
            <span className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4" /> Copied!
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ClipboardIcon className="w-4 h-4" /> Copy to Clipboard
            </span>
          )}
        </Button>
        <Button
          onClick={onDownload}
          variant="outline"
          className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white h-11"
        >
          <span className="flex items-center gap-2">
            <DownloadIcon className="w-4 h-4" /> Download .txt
          </span>
        </Button>
      </div>

      {/* Resume content */}
      <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800/70 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500/60" />
          <span className="text-[11px] text-zinc-500 font-medium">Rewritten Resume</span>
        </div>
        <pre className="p-5 whitespace-pre-wrap text-sm text-zinc-300 font-mono leading-relaxed overflow-x-auto">
          {resume}
        </pre>
      </div>

      {/* Footer */}
      <div className="text-center pt-2 border-t border-white/[0.06] space-y-3">
        <p className="text-zinc-600 text-xs">Want to improve a different resume?</p>
        <Link href="/">
          <Button variant="ghost" className="text-orange-500 hover:text-orange-400 text-sm">
            Roast Another Resume →
          </Button>
        </Link>
      </div>
    </div>
  );
}
