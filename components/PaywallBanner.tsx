"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckIcon } from "lucide-react";
import { SERVICES, BRAND_COLOR } from "@/lib/config";

interface PaywallBannerProps {
  resumeText: string;
  score: number;
}

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
    script.src    = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load payment SDK"));
    document.head.appendChild(script);
  });
}

const BENEFITS = [
  "ATS-optimized keywords injected",
  "Weak bullets rewritten with metrics",
  "Strong action verbs throughout",
  "Professional summary rewritten",
];

export function PaywallBanner({ resumeText, score }: PaywallBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router    = useRouter();
  const service   = SERVICES.rewrite;

  async function handleUnlock() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create order");

      await loadRazorpayScript();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay({
        key:       data.keyId,
        amount:    data.amount,
        currency:  data.currency,
        order_id:  data.orderId,
        name:      "Resume Roaster",
        description: service.description,
        handler(response: RazorpayResponse) {
          sessionStorage.setItem("paymentData", JSON.stringify(response));
          router.push("/success");
        },
        modal: { ondismiss() { setIsLoading(false); } },
        theme: { color: BRAND_COLOR },
      });

      rzp.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.10] bg-white/[0.02] p-6 space-y-5">
      {/* Mono label */}
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-600">
        The Fix
      </div>

      {/* Header */}
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-[#f8f8f8] leading-snug">
          Resume Score: {score}/10. Here&apos;s the fixed version.
        </h3>
        <p className="text-zinc-500 text-sm">
          Claude AI rewrites your entire resume — keeping your info, fixing everything else.
        </p>
      </div>

      {/* Benefits */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-center gap-2 text-xs text-zinc-400">
            <CheckIcon className="w-3 h-3 text-zinc-600 flex-shrink-0" />
            {b}
          </li>
        ))}
      </ul>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-[#f8f8f8] tracking-tight">
          {service.priceLabel}
        </span>
        <span className="text-xs text-zinc-600 font-mono">one-time</span>
      </div>

      {/* CTA */}
      <Button
        onClick={handleUnlock}
        disabled={isLoading}
        size="lg"
        className="
          w-full h-12 bg-white text-[#050508] font-bold
          text-sm tracking-wide rounded-xl
          hover:bg-zinc-100 active:scale-[0.99]
          transition-all duration-150
          disabled:opacity-40 disabled:cursor-not-allowed
          shadow-none
        "
      >
        {isLoading ? "Opening checkout..." : "Unlock My Rewritten Resume →"}
      </Button>

      {/* Trust pills */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        {["Instant delivery", "Razorpay secured", "Text never stored"].map((item) => (
          <span key={item} className="text-zinc-600 text-[10px] font-mono">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
