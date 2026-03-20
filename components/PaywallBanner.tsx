"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckIcon } from "lucide-react";
import { SERVICES, BRAND_COLOR, FREE_MODE } from "@/lib/config";

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
    // FREE_MODE: skip Razorpay entirely — go straight to rewrite
    if (FREE_MODE) {
      sessionStorage.setItem(
        "paymentData",
        JSON.stringify({
          razorpay_payment_id: "free_mode",
          razorpay_order_id:   "free_mode",
          razorpay_signature:  "free_mode",
        }),
      );
      router.push("/success");
      return;
    }

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
      {/* Header */}
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-[#f8f8f8] leading-snug">
          Your resume scored {score}/10. Here&apos;s the professional version.
        </h3>
        <p className="text-zinc-500 text-sm">
          Every day you send the old version, you lose an interview.
          Claude AI rewrites your entire resume — keeping your story, fixing everything else.
        </p>
      </div>

      {/* Benefits */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-center gap-2 text-xs text-zinc-400">
            <CheckIcon className="w-3 h-3 text-[#ff4444] flex-shrink-0" />
            {b}
          </li>
        ))}
      </ul>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        {FREE_MODE ? (
          <>
            <span className="text-3xl font-black text-[#ff4444] tracking-tight">FREE</span>
            <span className="text-xs text-zinc-600 font-mono">limited time · no payment needed</span>
          </>
        ) : (
          <>
            <span className="text-3xl font-black text-[#f8f8f8] tracking-tight">{service.priceLabel}</span>
            <span className="text-xs text-zinc-600 font-mono">one-time · no subscription</span>
          </>
        )}
      </div>

      {/* CTA */}
      <Button
        onClick={handleUnlock}
        disabled={isLoading}
        size="lg"
        className="
          w-full h-12 bg-[#ff4444] text-white font-bold
          text-sm tracking-wide rounded-xl
          hover:bg-[#ff2222] active:scale-[0.99]
          transition-all duration-150
          disabled:opacity-40 disabled:cursor-not-allowed
          shadow-none
        "
      >
        {FREE_MODE
          ? "Get My Free Rewrite →"
          : isLoading
          ? "Opening checkout..."
          : "Fix My Resume for ₹499 →"
        }
      </Button>

      {/* Trust pills */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {["Instant delivery", "Razorpay secured", "Text never stored"].map((item, i, arr) => (
          <span key={item} className="flex items-center gap-4">
            <span className="text-zinc-500 text-[10px] font-mono">{item}</span>
            {i < arr.length - 1 && <span className="text-zinc-700 text-[10px]">·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
