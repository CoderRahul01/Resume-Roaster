"use client";

import { Button } from "@/components/ui/button";
import { CheckIcon, Zap } from "lucide-react";

const PRO_BENEFITS = [
  "50 roasts per day",
  "10 rewrites per month",
  "Priority AI processing",
  "Early access to new features",
];

interface SubscriptionBannerProps {
  currentTier: "FREE" | "PRO";
}

export function SubscriptionBanner({ currentTier }: SubscriptionBannerProps) {
  if (currentTier === "PRO") {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-zinc-900/30 p-5 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-white/10 px-3 py-1 rounded-full">
          <Zap className="w-3 h-3" />
          PRO
        </div>
        <p className="text-zinc-400 text-sm">You&apos;re on the Pro plan.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent p-6 space-y-5">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4" /> Upgrade to Pro
        </h3>
        <p className="text-zinc-400 text-sm">
          Unlimited roasting power for serious job seekers.
        </p>
      </div>

      <ul className="space-y-2">
        {PRO_BENEFITS.map((b) => (
          <li key={b} className="flex items-center gap-2 text-xs text-zinc-300">
            <CheckIcon className="w-3.5 h-3.5 text-white flex-shrink-0" />
            {b}
          </li>
        ))}
      </ul>

      <Button
        className="w-full h-11 bg-white text-black font-bold text-sm rounded-xl hover:bg-zinc-100 transition-all"
        disabled
      >
        Coming Soon
      </Button>
    </div>
  );
}
