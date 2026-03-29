"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { XIcon, CheckIcon, XCircleIcon, ZapIcon, SparklesIcon } from "lucide-react";
import { SERVICES } from "@/lib/config";

const FREE_FEATURES = [
  { text: "AI roast — 6 brutal critique points", included: true },
  { text: "Overall score out of 10", included: true },
  { text: "Section-level issue detection", included: true },
  { text: "Fix suggestions per critique", included: true },
  { text: "Full AI resume rewrite", included: false },
  { text: "ATS keyword optimization", included: false },
  { text: "Strong action verbs & metrics", included: false },
  { text: "Downloadable PDF", included: false },
];

const PRO_FEATURES = [
  { text: "Everything in Free", included: true, bold: true },
  { text: "Full AI resume rewrite", included: true },
  { text: "ATS keyword optimization", included: true },
  { text: "Strong action verbs & metrics", included: true },
  { text: "Professional summary rewritten", included: true },
  { text: "Instant PDF download", included: true },
  { text: "One-time payment, no subscription", included: true, note: true },
];

interface PricingModalProps {
  score: number;
  isOpen: boolean;
  isLoading: boolean;
  appliedCoupon: { code: string; discountPercent: number } | null;
  onClose: () => void;
  onPay: () => void;
}

export function PricingModal({ score, isOpen, isLoading, appliedCoupon, onClose, onPay }: PricingModalProps) {
  const service = SERVICES.rewrite;

  const effectivePaise = appliedCoupon
    ? Math.max(Math.floor(service.pricePaise * (1 - appliedCoupon.discountPercent / 100)), 0)
    : service.pricePaise;
  const priceLabel = effectivePaise === 0 ? "FREE" : `₹${effectivePaise / 100}`;
  const isFree = effectivePaise === 0;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!isOpen) return null;

  const scoreColor =
    score <= 3 ? "#ff4444" :
    score <= 5 ? "#f97316" :
    score <= 7 ? "#fbbf24" : "#10b981";

  const urgencyLine =
    score <= 3 ? "Most recruiters reject resumes at this score without reading." :
    score <= 5 ? "You're in the 'maybe' pile. Let's move you firmly to 'yes'." :
    score <= 7 ? "You're close — small fixes could mean 2× more callbacks." :
                 "Already decent — let's make it undeniable.";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-backdrop-in"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-white/[0.10] bg-[#0b0b0f] animate-pop-in shadow-2xl shadow-black/70">

        {/* Top drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/[0.12]" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.08] transition-all z-10"
        >
          <XIcon className="w-3.5 h-3.5" />
        </button>

        <div className="px-5 sm:px-8 pt-5 sm:pt-7 pb-7 sm:pb-8 space-y-6">

          {/* Score hook */}
          <div className="space-y-2.5 pr-8">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-black tracking-tighter leading-none font-display" style={{ color: scoreColor }}>
                {score}
                <span className="text-xl text-zinc-700 font-bold ml-1">/10</span>
              </span>
              <div className="space-y-0.5">
                <p className="text-xs text-zinc-600 font-mono tracking-widest uppercase">Your score</p>
                <p className="text-sm font-semibold text-[#f0f0f4]">The AI has already rewritten it.</p>
              </div>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">{urgencyLine}</p>

            {/* Social proof line */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot flex-shrink-0" />
              <span className="text-[11px] text-zinc-600 font-mono">
                1,247 job seekers improved their resume this month
              </span>
            </div>
          </div>

          {/* Comparison table */}
          <div className="grid grid-cols-2 gap-3">
            {/* Free col */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5 space-y-3">
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono tracking-widest uppercase text-zinc-600">Free</div>
                <div className="text-lg font-black text-[#f0f0f4] font-display">₹0</div>
                <div className="text-[11px] text-zinc-600">What you already got</div>
              </div>
              <ul className="space-y-2">
                {FREE_FEATURES.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 animate-stagger-in"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    {f.included ? (
                      <CheckIcon className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircleIcon className="w-3.5 h-3.5 text-zinc-800 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`text-xs leading-snug ${f.included ? "text-zinc-400" : "text-zinc-700"}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro col */}
            <div className="rounded-xl border border-[#ff4444]/30 bg-gradient-to-b from-[#ff4444]/[0.10] to-[#ff4444]/[0.02] p-4 sm:p-5 space-y-3 relative overflow-hidden animate-border-glow">
              {/* Unlock badge */}
              <div className="absolute top-3 right-3">
                <span className="text-[9px] font-bold bg-[#ff4444] text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Unlock
                </span>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-mono tracking-widest uppercase text-[#ff4444]/70">Pro</div>
                <div className="flex items-baseline gap-1.5">
                  <div className="text-lg font-black text-[#f0f0f4] font-display">{priceLabel}</div>
                  {appliedCoupon && effectivePaise > 0 && (
                    <span className="text-xs text-zinc-600 line-through">{service.priceLabel}</span>
                  )}
                  {isFree && <span className="text-[10px] text-emerald-400 font-mono">coupon applied</span>}
                </div>
                <div className="text-[11px] text-zinc-500">One-time · instant delivery</div>
              </div>

              <ul className="space-y-2.5">
                {PRO_FEATURES.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 animate-stagger-in"
                    style={{ animationDelay: `${0.15 + i * 0.04}s` }}
                  >
                    <CheckIcon className="w-3.5 h-3.5 text-[#ff4444] flex-shrink-0 mt-0.5" />
                    <span className={`text-xs leading-snug ${f.bold ? "text-[#f0f0f4] font-semibold" : f.note ? "text-zinc-500" : "text-zinc-300"}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button
              onClick={onPay}
              disabled={isLoading}
              className="btn-shimmer w-full h-14 bg-[#ff4444] text-white font-black text-base tracking-wide rounded-xl hover:bg-[#ff2222] active:scale-[0.99] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-900/20 gap-2 font-display"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Opening checkout…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ZapIcon className="w-4 h-4" />
                  {isFree ? "Get My Free Rewrite →" : `Fix My Resume for ${priceLabel} →`}
                </span>
              )}
            </Button>

            {/* Trust row */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              {[
                { icon: "⚡", text: "Instant delivery" },
                { icon: "🔒", text: "Razorpay secured" },
                { icon: "🚫", text: "No login required" },
              ].map(({ icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 text-zinc-600 text-[11px] font-mono">
                  <span className="text-[11px]">{icon}</span> {text}
                </span>
              ))}
            </div>

            {/* Guarantee */}
            <div className="flex items-start gap-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3">
              <SparklesIcon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-zinc-500 text-xs leading-relaxed">
                <span className="text-[#f0f0f4] font-medium">Not happy?</span>{" "}
                Email us within 24 hours and we&apos;ll refund you — no questions asked.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
