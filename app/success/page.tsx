"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckIcon, ClipboardIcon, DownloadIcon, FileTextIcon } from "lucide-react";
import { StructuredResume } from "@/types";

export default function SuccessPage() {
  const [rewrittenResume, setRewrittenResume] = useState("");
  const [structured, setStructured] = useState<StructuredResume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    couponCode?: string;
  } | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);

  async function fetchRewrite(
    payment: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; couponCode?: string },
    resume: string,
  ) {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payment, resumeText: resume }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate rewrite");
      setRewrittenResume(data.rewrittenResume);
      if (data.structured) setStructured(data.structured);
      sessionStorage.removeItem("paymentData");
      setPaymentData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const storedPayment = sessionStorage.getItem("paymentData");
    const storedResume  = sessionStorage.getItem("resumeText");

    if (!storedPayment || !storedResume) {
      setSessionExpired(true);
      setIsLoading(false);
      return;
    }

    let payment: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
      couponCode?: string;
    };
    try {
      payment = JSON.parse(storedPayment);
    } catch {
      setError("Invalid payment data. Please contact support.");
      setIsLoading(false);
      return;
    }

    setPaymentData(payment);
    setResumeText(storedResume);
    fetchRewrite(payment, storedResume);
  }, []); // intentionally empty — runs once on mount

  function handleRetry() {
    if (paymentData && resumeText) {
      fetchRewrite(paymentData, resumeText);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(rewrittenResume);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadPDF() {
    if (!structured) {
      // Fallback: download plain text if structured data missing
      handleDownloadTxt();
      return;
    }
    try {
      const { generateAndDownloadResumePDF } = await import("@/lib/generateResumePDF");
      await generateAndDownloadResumePDF(structured, "resume-rewritten.pdf");
      toast.success("PDF downloaded!");
    } catch {
      toast.error("PDF generation failed. Downloading as text instead.");
      handleDownloadTxt();
    }
  }

  function handleDownloadTxt() {
    const blob = new Blob([rewrittenResume], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "resume-rewritten.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-[100dvh] bg-[#050508] text-white flex flex-col">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-red-500/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] px-4 sm:px-6 py-4">
        <Link href="/" className="font-black text-base tracking-tight text-[#f8f8f8] hover:opacity-70 transition-opacity">
          ResumeRoaster
        </Link>
      </header>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-5 py-10 sm:py-14 w-full space-y-8">
        {isLoading ? (
          <LoadingState />
        ) : sessionExpired ? (
          <SessionExpiredState />
        ) : error ? (
          <ErrorState error={error} canRetry={!!paymentData} onRetry={handleRetry} />
        ) : (
          <ReadyState
            resume={rewrittenResume}
            structured={structured}
            copied={copied}
            onCopy={handleCopy}
            onDownloadPDF={handleDownloadPDF}
          />
        )}
      </div>
    </main>
  );
}

// ── Loading ────────────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  "Parsing your resume...",
  "Identifying weak points...",
  "Rewriting experience bullets...",
  "Optimizing for ATS...",
  "Polishing the final draft...",
];

function LoadingState() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center space-y-8 animate-fade-in">
      <div className="space-y-3">
        <div className="flex justify-center">
          <div className="w-10 h-10 border-2 border-white/[0.10] border-t-[#ff4444]/80 rounded-full animate-spin" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#f8f8f8]">AI is rewriting your resume…</h1>
        <p className="text-zinc-500 text-sm font-mono">{LOADING_STEPS[step]}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-[2px] bg-white/[0.07] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#ff4444] rounded-full transition-all duration-[2800ms] ease-out"
          style={{ width: `${((step + 1) / LOADING_STEPS.length) * 100}%` }}
        />
      </div>

      {/* Skeleton lines */}
      <div className="space-y-2.5 text-left">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`h-3 rounded-full bg-white/[0.07] animate-pulse ${
              i % 4 === 3 ? "w-1/2" : i % 4 === 2 ? "w-3/4" : "w-full"
            }`}
            style={{ animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Session expired ────────────────────────────────────────────────────────────

function SessionExpiredState() {
  return (
    <div className="text-center space-y-5 animate-fade-in">
      <div className="text-5xl">🕐</div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#f8f8f8]">Session expired</h1>
      <p className="text-zinc-500 text-sm max-w-sm mx-auto">
        Looks like you&apos;ve already received your rewrite, or this session has expired.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link href="/" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-[#ff4444] text-white font-semibold hover:bg-[#ff2222]">
            Roast another resume →
          </Button>
        </Link>
        <a href="mailto:support@resumeroaster.in">
          <Button variant="outline" className="border-white/[0.10] text-zinc-400 hover:bg-white/[0.05] hover:text-[#f8f8f8]">
            Contact support
          </Button>
        </a>
      </div>
    </div>
  );
}

// ── Error ──────────────────────────────────────────────────────────────────────

function ErrorState({ error, canRetry, onRetry }: { error: string; canRetry: boolean; onRetry: () => void }) {
  return (
    <div className="text-center space-y-5 animate-fade-in">
      <div className="text-5xl">😕</div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#f8f8f8]">Something went wrong</h1>
      <p className="text-zinc-500 text-sm max-w-sm mx-auto">{error}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        {canRetry && (
          <Button onClick={onRetry} className="bg-[#ff4444] text-white font-semibold hover:bg-[#ff2222]">
            Retry
          </Button>
        )}
        <Link href="/">
          <Button variant="outline" className="border-white/[0.10] text-zinc-400 hover:bg-white/[0.05] hover:text-[#f8f8f8]">
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ── Ready ──────────────────────────────────────────────────────────────────────

function ReadyState({
  resume,
  structured,
  copied,
  onCopy,
  onDownloadPDF,
}: {
  resume: string;
  structured: StructuredResume | null;
  copied: boolean;
  onCopy: () => void;
  onDownloadPDF: () => void;
}) {
  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-[#ff4444]/30 bg-[#ff4444]/10 mb-2">
          <CheckIcon className="w-4 h-4 text-[#ff4444]" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#f8f8f8]">Your rewritten resume is ready</h1>
        <p className="text-zinc-500 text-sm font-mono">
          ATS-optimized · Achievement-focused · PDF ready to send
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Primary: Download PDF */}
        <Button
          onClick={onDownloadPDF}
          className="flex-1 bg-[#ff4444] text-white font-bold h-12 hover:bg-[#ff2222] gap-2"
        >
          <DownloadIcon className="w-4 h-4" />
          {structured ? "Download PDF" : "Download .txt"}
        </Button>

        {/* Secondary: Copy text */}
        <Button
          onClick={onCopy}
          variant="outline"
          className="flex-1 border-white/[0.10] text-zinc-400 hover:bg-white/[0.05] hover:text-[#f8f8f8] h-12 gap-2"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <ClipboardIcon className="w-4 h-4" />
              Copy text
            </>
          )}
        </Button>
      </div>

      {/* If we have structured data, show a section preview */}
      {structured ? (
        <StructuredPreview data={structured} />
      ) : (
        <PlainTextPreview resume={resume} />
      )}

      {/* Footer */}
      <div className="text-center pt-2 border-t border-white/[0.05] space-y-3">
        <p className="text-zinc-700 text-xs">Want to improve a different resume?</p>
        <Link href="/">
          <Button variant="ghost" className="text-zinc-400 hover:text-[#f8f8f8] text-sm">
            Roast Another Resume →
          </Button>
        </Link>
        <div className="pt-1">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("I just got my resume rewritten by AI for ₹99. It's actually good. Try it free → https://resumeroaster.in")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="border-white/[0.10] text-zinc-500 hover:bg-white/[0.05] hover:text-[#f8f8f8] text-sm"
            >
              Share on X →
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Structured resume preview ──────────────────────────────────────────────────

function StructuredPreview({ data }: { data: StructuredResume }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0e0e14] overflow-hidden">
      {/* Title bar */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff4444]/60" />
          <span className="text-[11px] text-zinc-600 font-mono tracking-widest uppercase">
            Rewritten Resume Preview
          </span>
        </div>
        <span className="text-[10px] text-zinc-700 font-mono">PDF ↓</span>
      </div>

      <div className="p-5 space-y-5 max-h-[500px] overflow-y-auto">
        {/* Header */}
        <div className="text-center space-y-0.5">
          <p className="font-bold text-[#f8f8f8] text-base">{data.name}</p>
          <p className="text-zinc-500 text-xs">{data.contact}</p>
        </div>

        {/* Sections */}
        {data.sections.map((section, i) => (
          <div key={i} className="space-y-2">
            {/* Section heading with divider */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] tracking-[0.18em] text-zinc-500 uppercase font-semibold">
                {section.heading}
              </span>
              <div className="flex-1 border-t border-white/[0.07]" />
            </div>

            {/* Free text */}
            {section.text && (
              <p className="text-zinc-400 text-xs leading-relaxed">{section.text}</p>
            )}

            {/* Items */}
            {section.items?.map((item, j) => (
              <div key={j} className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#f8f8f8] text-xs font-semibold leading-snug">{item.title}</span>
                  {item.period && (
                    <span className="text-zinc-600 text-[10px] font-mono whitespace-nowrap flex-shrink-0">{item.period}</span>
                  )}
                </div>
                {item.organization && (
                  <p className="text-zinc-500 text-[11px] italic">{item.organization}{item.location ? ` · ${item.location}` : ""}</p>
                )}
                {item.bullets && item.bullets.length > 0 && (
                  <ul className="space-y-0.5 mt-1">
                    {item.bullets.map((b, k) => (
                      <li key={k} className="text-zinc-400 text-xs leading-relaxed flex gap-1.5">
                        <span className="text-[#ff4444]/70 flex-shrink-0 mt-0.5">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Plain text fallback preview ────────────────────────────────────────────────

function PlainTextPreview({ resume }: { resume: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0e0e14] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
        <span className="text-[11px] text-zinc-600 font-mono tracking-widest uppercase">
          Rewritten Resume
        </span>
        <FileTextIcon className="w-3 h-3 text-zinc-700 ml-auto" />
      </div>
      <pre className="p-5 whitespace-pre-wrap text-sm text-zinc-300 font-mono leading-relaxed overflow-x-auto max-h-[500px]">
        {resume}
      </pre>
    </div>
  );
}
