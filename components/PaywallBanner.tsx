"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckIcon, ArrowRightIcon } from "lucide-react";
import { SERVICES, BRAND_COLOR, FREE_MODE } from "@/lib/config";
import { CouponInput } from "@/components/CouponInput";
import { PricingModal } from "@/components/PricingModal";

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

const QUICK_WINS = [
  "ATS keywords injected",
  "Weak bullets rewritten",
  "Strong action verbs",
  "Summary sharpened",
];

export function PaywallBanner({ resumeText, score }: PaywallBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const router = useRouter();
  const service = SERVICES.rewrite;

  const effectivePrice = appliedCoupon
    ? Math.max(Math.floor(service.pricePaise * (1 - appliedCoupon.discountPercent / 100)), 0)
    : service.pricePaise;
  const effectivePriceLabel = effectivePrice === 0 ? "FREE" : `₹${effectivePrice / 100}`;

  async function handleValidateCoupon(code: string) {
    const res = await fetch("/api/validate-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (data.valid) setAppliedCoupon({ code: data.code, discountPercent: data.discountPercent });
    return data as { valid: boolean; discountPercent?: number; message?: string };
  }

  function handleClearCoupon() { setAppliedCoupon(null); }

  async function handleUnlock() {
    setIsLoading(true);
    try {
      if (FREE_MODE) {
        sessionStorage.setItem("paymentData", JSON.stringify({
          razorpay_payment_id: "free_mode",
          razorpay_order_id:   "free_mode",
          razorpay_signature:  "free_mode",
        }));
        router.push("/success");
        return;
      }

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, couponCode: appliedCoupon?.code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create order");

      if (data.isFree) {
        sessionStorage.setItem("paymentData", JSON.stringify({
          razorpay_payment_id: `coupon_${appliedCoupon?.code ?? "free"}`,
          razorpay_order_id:   "coupon_order",
          razorpay_signature:  "coupon_exempt",
          couponCode:          appliedCoupon?.code,
        }));
        router.push("/success");
        return;
      }

      await loadRazorpayScript();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay({
        key:         data.keyId,
        currency:    data.currency,
        order_id:    data.orderId,
        name:        "Resume Roaster",
        description: service.description,
        prefill:     { name: "", email: "", contact: "" },
        handler(response: RazorpayResponse) {
          sessionStorage.setItem("paymentData", JSON.stringify(response));
          setIsLoading(false);
          setShowModal(false);
          router.push("/success");
        },
        modal: {
          ondismiss() { setIsLoading(false); },
          escape: false,
        },
        theme: { color: BRAND_COLOR },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzp.on("payment.failed", (response: any) => {
        setIsLoading(false);
        toast.error(response?.error?.description ?? "Payment failed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  }

  function handleOpenModal() { setShowModal(true); }
  function handleCloseModal() { if (!isLoading) setShowModal(false); }

  const isCouponFree = appliedCoupon?.discountPercent === 100;
  const scoreSeverity = score <= 4 ? "critical" : score <= 6 ? "moderate" : "good";

  return (
    <>
      {/* Pricing modal */}
      <PricingModal
        score={score}
        isOpen={showModal}
        isLoading={isLoading}
        appliedCoupon={appliedCoupon}
        onClose={handleCloseModal}
        onPay={handleUnlock}
      />

      {/* Banner card */}
      <div className="rounded-2xl border border-white/[0.10] bg-white/[0.02] overflow-hidden animate-border-glow">

        {/* Score severity bar at top */}
        <div className={`h-[3px] w-full ${
          scoreSeverity === "critical" ? "bg-gradient-to-r from-[#ff4444] to-orange-500" :
          scoreSeverity === "moderate" ? "bg-gradient-to-r from-orange-500 to-amber-400" :
                                          "bg-gradient-to-r from-amber-400 to-emerald-400"
        }`} />

        <div className="p-6 space-y-5">
          {/* Header — personalised to score */}
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-[#f8f8f8] leading-snug">
              {score <= 4
                ? <>Your resume scored {score}/10. <span className="text-[#ff4444]">It&apos;s actively hurting you.</span></>
                : score <= 6
                ? <>You scored {score}/10. <span className="text-orange-400">You&apos;re in the &apos;maybe&apos; pile.</span></>
                : <>You scored {score}/10. <span className="text-amber-400">Let&apos;s make it a yes.</span></>
              }
            </h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              The AI rewrote your entire resume — preserving your story, fixing everything else.
              {" "}<span className="text-zinc-400">One tap to unlock.</span>
            </p>
          </div>

          {/* Quick wins */}
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {QUICK_WINS.map((w, i) => (
              <li key={w} className="flex items-center gap-1.5 text-xs text-zinc-400 animate-stagger-in" style={{ animationDelay: `${i * 0.07}s` }}>
                <CheckIcon className="w-3 h-3 text-[#ff4444] flex-shrink-0" />
                {w}
              </li>
            ))}
          </ul>

          {/* Coupon input */}
          <CouponInput
            onApply={handleValidateCoupon}
            onClear={handleClearCoupon}
            applied={appliedCoupon}
          />

          {/* Price + CTA */}
          <div className="space-y-3">
            {/* Price display */}
            <div className="flex items-baseline gap-2">
              {isCouponFree ? (
                <>
                  <span className="text-3xl font-black text-[#ff4444] tracking-tight">FREE</span>
                  <span className="text-xs text-zinc-600 font-mono line-through">{service.priceLabel}</span>
                  <span className="text-xs text-green-400 font-mono">coupon applied</span>
                </>
              ) : appliedCoupon ? (
                <>
                  <span className="text-3xl font-black text-[#f8f8f8] tracking-tight">{effectivePriceLabel}</span>
                  <span className="text-xs text-zinc-600 font-mono line-through">{service.priceLabel}</span>
                  <span className="text-xs text-green-400 font-mono">{appliedCoupon.discountPercent}% off</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-black text-[#f8f8f8] tracking-tight">{service.priceLabel}</span>
                  <span className="text-xs text-zinc-600 font-mono">one-time · no subscription</span>
                </>
              )}
            </div>

            {/* Primary CTA — opens modal */}
            <Button
              onClick={handleOpenModal}
              size="lg"
              className="btn-shimmer w-full h-12 bg-[#ff4444] text-white font-black text-sm tracking-wide rounded-xl hover:bg-[#ff2222] active:scale-[0.99] transition-all duration-150 shadow-lg shadow-red-900/20 gap-2"
            >
              {FREE_MODE
                ? "Get Free Rewrite →"
                : isCouponFree
                ? "Get My Free Rewrite →"
                : `Fix My Resume for ${effectivePriceLabel}`
              }
              <ArrowRightIcon className="w-4 h-4" />
            </Button>

            {/* See what you get link */}
            <button
              onClick={handleOpenModal}
              className="w-full text-center text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors font-mono underline underline-offset-2 decoration-zinc-700"
            >
              See exactly what you get →
            </button>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1 border-t border-white/[0.05]">
            {["⚡ Instant delivery", "🔒 Razorpay secured", "🗑️ Text never stored"].map((item) => (
              <span key={item} className="text-zinc-600 text-[10px] font-mono">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
