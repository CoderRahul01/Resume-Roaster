"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckIcon } from "lucide-react";
import { SERVICES, BRAND_COLOR } from "@/lib/config";
import { CouponInput } from "@/components/CouponInput";

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
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const router = useRouter();
  const service = SERVICES.rewrite;

  const effectivePrice = appliedCoupon
    ? Math.max(Math.floor(service.pricePaise * (1 - appliedCoupon.discountPercent / 100)), 0)
    : service.pricePaise;
  const effectivePriceLabel = effectivePrice === 0
    ? "FREE"
    : `₹${effectivePrice / 100}`;

  async function handleValidateCoupon(code: string) {
    const res = await fetch("/api/validate-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (data.valid) {
      setAppliedCoupon({ code: data.code, discountPercent: data.discountPercent });
    }
    return data as { valid: boolean; discountPercent?: number; message?: string };
  }

  function handleClearCoupon() {
    setAppliedCoupon(null);
  }

  async function handleUnlock() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          couponCode: appliedCoupon?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create order");

      // 100% off coupon — skip Razorpay
      if (data.isFree) {
        sessionStorage.setItem(
          "paymentData",
          JSON.stringify({
            razorpay_payment_id: `coupon_${appliedCoupon?.code ?? "free"}`,
            razorpay_order_id:   "coupon_order",
            razorpay_signature:  "coupon_exempt",
            couponCode:          appliedCoupon?.code,
          }),
        );
        router.push("/success");
        return;
      }

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

  const isCouponFree = appliedCoupon?.discountPercent === 100;

  return (
    <div className="rounded-2xl border border-white/[0.10] bg-white/[0.02] p-6 space-y-5">
      {/* Header */}
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-[#f8f8f8] leading-snug">
          Your resume scored {score}/10. Here&apos;s the professional version.
        </h3>
        <p className="text-zinc-500 text-sm">
          Every day you send the old version, you lose an interview.
          Our AI rewrites your entire resume — keeping your story, fixing everything else.
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

      {/* Coupon input */}
      <CouponInput
        onApply={handleValidateCoupon}
        onClear={handleClearCoupon}
        applied={appliedCoupon}
      />

      {/* Price */}
      <div className="flex items-baseline gap-2">
        {isCouponFree ? (
          <>
            <span className="text-3xl font-black text-[#ff4444] tracking-tight">FREE</span>
            <span className="text-xs text-zinc-600 font-mono line-through mr-1">{service.priceLabel}</span>
            <span className="text-xs text-green-400 font-mono">coupon applied</span>
          </>
        ) : appliedCoupon ? (
          <>
            <span className="text-3xl font-black text-[#f8f8f8] tracking-tight">{effectivePriceLabel}</span>
            <span className="text-xs text-zinc-600 font-mono line-through mr-1">{service.priceLabel}</span>
            <span className="text-xs text-green-400 font-mono">{appliedCoupon.discountPercent}% off</span>
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
        {isCouponFree
          ? "Get My Free Rewrite →"
          : isLoading
          ? "Opening checkout..."
          : `Fix My Resume for ${effectivePriceLabel} →`
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
