"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckIcon, ClipboardIcon, FileTextIcon, SparklesIcon } from "lucide-react";
import { SERVICES, BRAND_COLOR } from "@/lib/config";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

function loadRazorpayScript(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load payment SDK"));
    document.head.appendChild(script);
  });
}

interface CoverLetterBannerProps {
  resumeText: string;
}

export function CoverLetterBanner({ resumeText }: CoverLetterBannerProps) {
  const [phase, setPhase] = useState<"idle" | "input" | "paying" | "loading" | "done" | "error">("idle");
  const [jobDescription, setJobDescription] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const service = SERVICES.coverLetter;

  async function handlePay() {
    if (jobDescription.trim().length < 50) {
      toast.error("Please paste more of the job description (at least 50 characters).");
      return;
    }

    setPhase("paying");
    try {
      const res = await fetch("/api/create-order-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create order");

      await loadRazorpayScript();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay({
        key: data.keyId,
        currency: data.currency,
        order_id: data.orderId,
        name: "Resume Roaster",
        description: service.description,
        prefill: { name: "", email: "", contact: "" },
        handler(response: RazorpayResponse) {
          generateCoverLetter(response);
        },
        modal: {
          ondismiss() { setPhase("input"); },
          escape: false,
        },
        theme: { color: BRAND_COLOR },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzp.on("payment.failed", (response: any) => {
        setPhase("input");
        toast.error(response?.error?.description ?? "Payment failed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setPhase("input");
    }
  }

  async function generateCoverLetter(payment: RazorpayResponse) {
    setPhase("loading");
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payment,
          resumeText,
          jobDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate cover letter");
      setCoverLetter(data.coverLetter);
      setPhase("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setPhase("error");
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  if (phase === "done") {
    return (
      <div className="rounded-2xl border border-white/[0.10] bg-white/[0.02] p-6 space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-emerald-500/30 bg-emerald-500/10">
            <CheckIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-[#f8f8f8]">Your cover letter is ready</h3>
        </div>

        <Button
          onClick={handleCopy}
          className="w-full h-11 bg-[#ff4444] text-white font-bold hover:bg-[#ff2222] gap-2"
        >
          {copied ? (
            <><CheckIcon className="w-4 h-4" /> Copied!</>
          ) : (
            <><ClipboardIcon className="w-4 h-4" /> Copy Cover Letter</>
          )}
        </Button>

        <div className="rounded-xl border border-white/[0.07] bg-[#0e0e14] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2">
            <FileTextIcon className="w-3 h-3 text-zinc-600" />
            <span className="text-[11px] text-zinc-600 font-mono tracking-widest uppercase">Cover Letter</span>
          </div>
          <pre className="p-5 whitespace-pre-wrap text-sm text-zinc-300 font-mono leading-relaxed max-h-[400px] overflow-y-auto">
            {coverLetter}
          </pre>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="rounded-2xl border border-white/[0.10] bg-white/[0.02] p-6 space-y-4 animate-fade-in">
        <p className="text-zinc-400 text-sm">{errorMsg}</p>
        <Button onClick={() => setPhase("input")} variant="outline" className="border-white/[0.10] text-zinc-400">
          Try again
        </Button>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="rounded-2xl border border-white/[0.10] bg-white/[0.02] p-6 flex items-center gap-3 animate-fade-in">
        <div className="w-5 h-5 border-2 border-white/[0.10] border-t-[#ff4444]/80 rounded-full animate-spin flex-shrink-0" />
        <p className="text-zinc-400 text-sm font-mono">Writing your cover letter…</p>
      </div>
    );
  }

  if (phase === "input") {
    return (
      <div className="rounded-2xl border border-white/[0.10] bg-white/[0.02] p-6 space-y-4 animate-fade-in">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#f8f8f8]">Paste the job description</h3>
          <p className="text-zinc-500 text-xs">
            The more detail you paste, the better the cover letter matches the role.
          </p>
        </div>
        <textarea
          className="w-full h-36 bg-[#0e0e14] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-[#ff4444]/40 font-mono"
          placeholder="Paste the job description here…"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <span className="text-zinc-600 text-xs font-mono">{service.priceLabel} · one-time</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setPhase("idle")}
              className="text-zinc-600 hover:text-zinc-400 text-sm h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePay}
              disabled={jobDescription.trim().length < 50}
              className="h-9 bg-[#ff4444] text-white font-bold hover:bg-[#ff2222] disabled:opacity-40 text-sm"
            >
              Generate for {service.priceLabel} →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // idle — teaser card
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-5 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] flex-shrink-0 mt-0.5">
          <SparklesIcon className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-[#f8f8f8]">AI Cover Letter</p>
          <p className="text-xs text-zinc-500">Tailored to the job description · {service.priceLabel}</p>
        </div>
      </div>
      <Button
        onClick={() => setPhase("input")}
        size="sm"
        className="bg-white/[0.07] hover:bg-white/[0.12] text-zinc-300 border border-white/[0.08] font-semibold text-xs h-8 flex-shrink-0"
      >
        Add →
      </Button>
    </div>
  );
}
