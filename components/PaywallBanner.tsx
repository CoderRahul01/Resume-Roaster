"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaywallBannerProps {
  resumeText: string;
}

export function PaywallBanner({ resumeText }: PaywallBannerProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleUnlock() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create checkout");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-6 text-center space-y-4">
      <div className="text-3xl">✨</div>
      <div>
        <h3 className="text-xl font-bold text-white mb-1">
          Unlock Your Rewritten Resume
        </h3>
        <p className="text-zinc-400 text-sm">
          One-time payment · Instant access · No subscription
        </p>
      </div>
      <Button
        onClick={handleUnlock}
        disabled={isLoading}
        size="lg"
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-6 w-full sm:w-auto disabled:opacity-70"
      >
        {isLoading ? "Redirecting to checkout..." : "Pay $4.99 & Get Rewrite"}
      </Button>
      <p className="text-zinc-500 text-xs">
        Secure payment via Stripe · Your card data never touches our servers
      </p>
    </div>
  );
}
