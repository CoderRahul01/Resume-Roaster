"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckIcon, ClipboardIcon, LinkedinIcon } from "lucide-react";
import { SERVICES, BRAND_COLOR } from "@/lib/config";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface LinkedInResult {
  headline: string;
  summary: string;
  experienceBullets: { company: string; role: string; bullets: string[] }[];
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

interface LinkedInBannerProps {
  resumeText: string;
}

export function LinkedInBanner({ resumeText }: LinkedInBannerProps) {
  const [phase, setPhase] = useState<"idle" | "paying" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<LinkedInResult | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const service = SERVICES.linkedinOptimizer;

  async function handlePay() {
    setPhase("paying");
    try {
      const res = await fetch("/api/create-order-linkedin", {
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
          generateLinkedIn(response);
        },
        modal: {
          ondismiss() { setPhase("idle"); },
          escape: false,
        },
        theme: { color: BRAND_COLOR },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzp.on("payment.failed", (response: any) => {
        setPhase("idle");
        toast.error(response?.error?.description ?? "Payment failed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setPhase("idle");
    }
  }

  async function generateLinkedIn(payment: RazorpayResponse) {
    setPhase("loading");
    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payment, resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to optimize LinkedIn profile");
      setResult(data.linkedin);
      setPhase("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setPhase("error");
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    toast.success("Copied!");
    setTimeout(() => setCopiedSection(null), 2000);
  }

  if (phase === "done" && result) {
    return (
      <div className="rounded-2xl border border-white/[0.10] bg-white/[0.02] p-6 space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#0077b5]/30 bg-[#0077b5]/10">
            <CheckIcon className="w-4 h-4 text-[#0077b5]" />
          </div>
          <h3 className="text-base font-bold text-[#f8f8f8]">LinkedIn profile sections ready</h3>
        </div>

        {/* Headline */}
        <Section
          title="Headline"
          content={result.headline}
          copied={copiedSection === "headline"}
          onCopy={() => handleCopy(result.headline, "headline")}
        />

        {/* Summary */}
        <Section
          title="About / Summary"
          content={result.summary}
          copied={copiedSection === "summary"}
          onCopy={() => handleCopy(result.summary, "summary")}
        />

        {/* Experience bullets */}
        {result.experienceBullets.map((exp, i) => (
          <Section
            key={i}
            title={`${exp.role} @ ${exp.company}`}
            content={exp.bullets.map((b) => `• ${b}`).join("\n")}
            copied={copiedSection === `exp-${i}`}
            onCopy={() => handleCopy(exp.bullets.map((b) => `• ${b}`).join("\n"), `exp-${i}`)}
          />
        ))}
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="rounded-2xl border border-white/[0.10] bg-white/[0.02] p-6 space-y-4 animate-fade-in">
        <p className="text-zinc-400 text-sm">{errorMsg}</p>
        <Button onClick={() => setPhase("idle")} variant="outline" className="border-white/[0.10] text-zinc-400">
          Try again
        </Button>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="rounded-2xl border border-white/[0.10] bg-white/[0.02] p-6 flex items-center gap-3 animate-fade-in">
        <div className="w-5 h-5 border-2 border-white/[0.10] border-t-[#0077b5]/80 rounded-full animate-spin flex-shrink-0" />
        <p className="text-zinc-400 text-sm font-mono">Optimizing your LinkedIn profile…</p>
      </div>
    );
  }

  // idle — teaser card (also covers "paying" state with disabled button)
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-5 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#0077b5]/20 bg-[#0077b5]/10 flex-shrink-0 mt-0.5">
          <LinkedinIcon className="w-4 h-4 text-[#0077b5]" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-[#f8f8f8]">LinkedIn Profile Optimizer</p>
          <p className="text-xs text-zinc-500">Headline, summary &amp; experience bullets · {service.priceLabel}</p>
        </div>
      </div>
      <Button
        onClick={handlePay}
        disabled={phase === "paying"}
        size="sm"
        className="bg-white/[0.07] hover:bg-white/[0.12] text-zinc-300 border border-white/[0.08] font-semibold text-xs h-8 flex-shrink-0 disabled:opacity-40"
      >
        {phase === "paying" ? "Opening…" : "Add →"}
      </Button>
    </div>
  );
}

function Section({
  title,
  content,
  copied,
  onCopy,
}: {
  title: string;
  content: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-zinc-500 font-mono tracking-widest uppercase">{title}</span>
        <Button
          onClick={onCopy}
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-zinc-500 hover:text-zinc-300 gap-1.5 text-xs"
        >
          {copied ? (
            <><CheckIcon className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
          ) : (
            <><ClipboardIcon className="w-3 h-3" />Copy</>
          )}
        </Button>
      </div>
      <div className="rounded-lg border border-white/[0.06] bg-[#0e0e14] px-4 py-3">
        <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-mono leading-relaxed">{content}</pre>
      </div>
    </div>
  );
}
