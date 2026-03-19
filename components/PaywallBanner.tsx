"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckIcon } from "lucide-react";
import { SERVICES, BRAND_COLOR } from "@/lib/config";

interface PaywallBannerProps {
  resumeText: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

function loadRazorpayScript(): Promise<void> {
  if ((window as Window & { Razorpay?: unknown }).Razorpay) return Promise.resolve();
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

export function PaywallBanner({ resumeText }: PaywallBannerProps) {
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

      const rzp = new (window as Window & { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay({
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
    <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-b from-orange-500/[0.06] to-transparent p-6 space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Fix it. Instantly.</h3>
          <div className="text-right">
            <div className="text-2xl font-black text-orange-500">{service.priceLabel}</div>
            <div className="text-[10px] text-zinc-500">one-time · no subscription</div>
          </div>
        </div>
        <p className="text-zinc-400 text-sm">
          Claude AI rewrites your entire resume from scratch — keeping your info, fixing everything else.
        </p>
      </div>

      {/* Benefits */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-center gap-2 text-xs text-zinc-300">
            <CheckIcon className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            {b}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        onClick={handleUnlock}
        disabled={isLoading}
        size="lg"
        className="
          w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold
          text-[15px] tracking-wide rounded-xl transition-all duration-150
          disabled:opacity-60 disabled:cursor-not-allowed
          shadow-[0_4px_24px_rgba(249,115,22,0.25)]
        "
      >
        {isLoading ? "Opening checkout..." : `Pay ${service.priceLabel} & Get Rewrite`}
      </Button>

      <p className="text-center text-zinc-600 text-[10px]">
        Secure payment via Razorpay · Your card never touches our servers
      </p>
    </div>
  );
}
