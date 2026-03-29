"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RoastCard } from "@/components/RoastCard";
import { RoastSkeleton } from "@/components/RoastSkeleton";
import { RewriteBlur } from "@/components/RewriteBlur";
import { PaywallBanner } from "@/components/PaywallBanner";
import { ResumeDropzone } from "@/components/ResumeDropzone";
import { RoastResponse } from "@/types";
import { SERVICES } from "@/lib/config";

// ── Score badge with SVG gauge ────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  const colorClass =
    score <= 3 ? "text-[#ff4444]" :
    score <= 5 ? "text-orange-400" :
    score <= 7 ? "text-amber-400" :
                 "text-emerald-400";

  const ringColor =
    score <= 3 ? "#ff4444" :
    score <= 5 ? "#f97316" :
    score <= 7 ? "#fbbf24" : "#10b981";

  const label =
    score <= 2 ? "Actively hurting you" :
    score <= 4 ? "Losing you interviews" :
    score <= 6 ? "Forgettable" :
    score <= 8 ? "Getting there" :
                 "Actually solid";

  const verdict =
    score <= 5
      ? "Most recruiters reject resumes at this score without reading."
      : score <= 7
      ? "You're in the maybe pile. A few fixes could double your callbacks."
      : "You're in decent shape — let's make it undeniable.";

  // SVG gauge: semicircle from (8,62) to (112,62), r=52
  const pathLength = Math.PI * 52; // ≈ 163.4
  const fillLen = animated ? pathLength * (score / 10) : 0;

  return (
    <div className="animate-score-pop pb-7 border-b border-white/[0.07] space-y-4">
      <div className="flex items-center gap-5 sm:gap-8">
        {/* Gauge + Score */}
        <div className="flex flex-col items-center flex-shrink-0">
          <svg viewBox="0 0 120 72" className="w-28 sm:w-32 overflow-visible">
            {/* Track */}
            <path
              d="M 8 62 A 52 52 0 0 1 112 62"
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Progress */}
            <path
              d="M 8 62 A 52 52 0 0 1 112 62"
              fill="none"
              stroke={ringColor}
              strokeWidth="7"
              strokeLinecap="round"
              style={{
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength - fillLen,
                transition: "stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s",
                filter: `drop-shadow(0 0 6px ${ringColor}55)`,
              }}
            />
          </svg>
          {/* Score number below arc */}
          <div className="flex items-baseline gap-1 -mt-2">
            <span className={`text-5xl sm:text-6xl font-black leading-none tracking-tighter font-display ${colorClass}`}>
              {score}
            </span>
            <span className="text-lg text-zinc-700 font-bold">/10</span>
          </div>
        </div>

        {/* Label + verdict */}
        <div className="space-y-2 flex-1">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-600">
            Resume Score
          </div>
          <div className={`text-lg sm:text-xl font-black font-display leading-tight ${colorClass}`}>
            {label}
          </div>
          <p className="text-zinc-500 text-sm leading-relaxed">
            {verdict}
          </p>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full animate-score-bar"
          style={{
            background: `linear-gradient(90deg, ${ringColor}, ${ringColor}aa)`,
            "--score-width": `${(score / 10) * 100}%`,
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

// ── Social proof avatars ───────────────────────────────────────────────────────

function SocialProofRow() {
  const avatars = [
    { initial: "R", bg: "#ff6b6b" },
    { initial: "P", bg: "#6366f1" },
    { initial: "A", bg: "#f59e0b" },
    { initial: "S", bg: "#10b981" },
    { initial: "M", bg: "#8b5cf6" },
  ];
  return (
    <div className="flex items-center justify-center gap-2.5 animate-count-up" style={{ animationDelay: "0.4s" }}>
      <div className="flex -space-x-2">
        {avatars.map(({ initial, bg }, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full border-2 border-[#050508] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
            style={{ background: bg }}
          >
            {initial}
          </div>
        ))}
      </div>
      <span className="text-zinc-600 text-xs font-mono">
        Join{" "}
        <span className="text-zinc-300 font-semibold">1,247+</span>{" "}
        students &amp; professionals who fixed their resume this week
      </span>
    </div>
  );
}

// ── Value strip ───────────────────────────────────────────────────────────────

function ValueStrip() {
  const items = [
    { icon: "⚡", label: "Results in under 10 seconds" },
    { icon: "🎯", label: "Specific to your actual resume" },
    { icon: "💸", label: `${SERVICES.rewrite.priceLabel} one-time · no subscription` },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {items.map(({ icon, label }, i) => (
        <div
          key={label}
          className="flex items-center gap-1.5 animate-count-up"
          style={{ animationDelay: `${0.28 + i * 0.1}s` }}
        >
          <span className="text-sm">{icon}</span>
          <span className="text-zinc-500 text-xs font-mono">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Home page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [resumeText, setResumeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roastData, setRoastData] = useState<RoastResponse | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const isReady = resumeText.trim().length >= 100;

  useEffect(() => {
    if (roastData && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [roastData]);

  async function handleSubmit() {
    if (!isReady) {
      toast.error("Upload a resume PDF first.");
      return;
    }
    setIsLoading(true);
    setRoastData(null);
    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data: RoastResponse = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed to roast");

      setRoastData(data);
      sessionStorage.setItem("resumeText", resumeText);
      sessionStorage.setItem("roastData", JSON.stringify(data));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setResumeText("");
    setRoastData(null);
    sessionStorage.removeItem("resumeText");
    sessionStorage.removeItem("roastData");
  }

  return (
    <main className="min-h-[100dvh] bg-[#050508] text-white flex flex-col">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-red-500/[0.03] rounded-full blur-[140px] animate-glow-pulse" />
        <div className="absolute top-[20%] left-[-5%] w-[400px] h-[400px] bg-indigo-500/[0.025] rounded-full blur-[120px]" />
        <div className="absolute bottom-[5%] right-[15%] w-[300px] h-[300px] bg-violet-500/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 px-4 sm:px-8 py-4 flex items-center justify-between border-b border-white/[0.06] bg-[#050508]/85 backdrop-blur-md">
        {/* Logo */}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 font-black text-[15px] tracking-tight text-[#f0f0f4] hover:opacity-75 transition-opacity"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
            <path d="M12 2C8 6 6 9 7 13c1 4 5 5 5 9 0-2 2-4 2-7s-3-4-2-13z" fill="#ff4444" opacity="0.9"/>
            <path d="M9 14c0 3 2 5 3 8 0-2 1.5-3 1.5-5.5S11 13 9 14z" fill="#ff6b2b" opacity="0.7"/>
          </svg>
          Resume<span className="text-[#ff4444]">Roaster</span>
        </button>

        {/* Center — social proof (desktop) */}
        <div className="hidden sm:flex items-center gap-1.5 border border-white/[0.07] rounded-full px-3 py-1.5 bg-white/[0.02]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot flex-shrink-0" />
          <span className="text-[10px] text-zinc-500 font-mono tracking-wide">1,247+ resumes roasted free</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {roastData && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="text-[11px] text-zinc-400 hover:text-[#f0f0f4] px-2 h-8 underline underline-offset-4 decoration-zinc-700"
            >
              Roast another
            </Button>
          )}
        </div>
      </nav>

      {/* Main content */}
      <div className={`relative z-10 flex-1 flex flex-col items-center px-4 sm:px-5 py-10 sm:py-20 pb-20 sm:pb-40 ${!roastData ? "bg-grid" : ""}`}>
        <div className="w-full max-w-2xl space-y-10 sm:space-y-14">

          {/* Hero — only when no roast yet */}
          {!roastData && (
            <div className="text-center space-y-6 animate-fade-in">
              {/* Live badge */}
              <div className="inline-flex animate-fade-in" style={{ animationDelay: "0.05s" }}>
                <span className="inline-flex items-center gap-2 border border-white/[0.10] text-zinc-500 font-mono text-[10px] tracking-[0.18em] uppercase px-3.5 py-1.5 rounded-full bg-white/[0.02]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff4444] animate-pulse-dot flex-shrink-0" />
                  Free · No Signup Required
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-1" style={{ animationDelay: "0.1s" }}>
                <h1 className="text-[2.2rem] sm:text-[2.9rem] md:text-[3.4rem] font-black tracking-tight leading-[1.03] font-display animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  Your resume is<br />
                  <span className="bg-gradient-to-r from-[#ff4444] via-[#ff6b2b] to-orange-400 bg-clip-text text-transparent">
                    costing you interviews.
                  </span>
                </h1>
              </div>

              {/* Sub-copy */}
              <p
                className="text-zinc-400 text-sm sm:text-[15px] max-w-md mx-auto leading-relaxed animate-fade-in"
                style={{ animationDelay: "0.18s" }}
              >
                Upload your PDF. Get{" "}
                <span className="text-[#f0f0f4] font-medium">6 specific critiques + a score</span>{" "}
                in 10 seconds. Fix everything with a full AI rewrite for{" "}
                <span className="text-[#f0f0f4] font-semibold">{SERVICES.rewrite.priceLabel}</span>
                {" "}— one-time, no account needed.
              </p>

              {/* Value strip */}
              <div className="pt-1 animate-fade-in" style={{ animationDelay: "0.24s" }}>
                <ValueStrip />
              </div>

              {/* Social proof */}
              <SocialProofRow />
            </div>
          )}

          {/* Upload + CTA button */}
          <div className={`transition-all duration-500 ${roastData ? "opacity-40 hover:opacity-90 scale-[0.97] origin-top grayscale-[0.3]" : ""}`}>
            <div className="space-y-3">
              <ResumeDropzone
                onExtracted={(text) => setResumeText(text)}
                isDisabled={isLoading}
              />
              <Button
                onClick={handleSubmit}
                disabled={!isReady || isLoading}
                className="
                  btn-shimmer w-full h-12 sm:h-13
                  bg-[#ff4444] text-white font-black text-[15px] tracking-wide
                  rounded-xl hover:bg-[#ff2222] active:scale-[0.99]
                  transition-all duration-150 font-display
                  disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-[#ff4444]
                  shadow-lg shadow-red-900/20
                "
              >
                {isLoading ? (
                  <span className="flex items-center gap-2.5">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Roasting your resume…
                  </span>
                ) : (
                  roastData ? "Roast it again →" : "Roast My Resume →"
                )}
              </Button>
              {!roastData && !isLoading && (
                <p className="text-center text-[11px] text-zinc-700 font-mono">
                  Your resume text is never stored · 100% private
                </p>
              )}
            </div>
          </div>

          {/* Results */}
          {(isLoading || roastData) && (
            <div ref={resultsRef} className="space-y-10 sm:space-y-12 animate-slide-up pt-4">
              {isLoading ? (
                <div className="space-y-8">
                  <div className="h-28 sm:h-32 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-white/[0.10] border-t-[#ff4444]/60 rounded-full animate-spin" />
                    <p className="text-zinc-600 text-sm font-mono">Analyzing your resume…</p>
                  </div>
                  <RoastSkeleton />
                </div>
              ) : roastData ? (
                <>
                  <ScoreBadge score={roastData.overallScore} />

                  {/* The Roast */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ff4444]/60 flex-shrink-0" />
                        <span className="font-display font-bold text-xs tracking-[0.15em] uppercase text-zinc-400">The Roast</span>
                      </div>
                      <div className="flex-1 border-t border-white/[0.05]" />
                      <span className="text-[10px] text-zinc-700 font-mono">{roastData.roast.length} issues found</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {roastData.roast.map((point, i) => (
                        <RoastCard key={i} point={point} index={i} />
                      ))}
                    </div>
                  </section>

                  {/* The Fix — paywall */}
                  <section className="space-y-5 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400/60 flex-shrink-0" />
                        <span className="font-display font-bold text-xs tracking-[0.15em] uppercase text-zinc-400">The Fix</span>
                      </div>
                      <div className="flex-1 border-t border-white/[0.05]" />
                    </div>
                    <RewriteBlur />
                    <PaywallBanner resumeText={resumeText} score={roastData.overallScore} />
                  </section>
                </>
              ) : null}
            </div>
          )}

          {/* How it works — shown before first roast */}
          {!roastData && !isLoading && (
            <div className="animate-fade-in space-y-4" style={{ animationDelay: "0.32s" }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-zinc-700">How it works</span>
                <div className="flex-1 border-t border-white/[0.04]" />
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { step: "01", label: "Upload PDF",  sub: "Drag & drop or tap to browse. PDF up to 15 MB.", icon: "📄" },
                  { step: "02", label: "Get roasted",  sub: "6 brutal critiques + an honest score in seconds.", icon: "🔥" },
                  { step: "03", label: "Fix it",       sub: `Full AI rewrite for ${SERVICES.rewrite.priceLabel}. Download as PDF.`, icon: "✨" },
                ].map(({ step, label, sub, icon }) => (
                  <div
                    key={step}
                    className="group flex flex-col gap-3 p-3.5 sm:p-4 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:border-indigo-500/20 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{icon}</span>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/[0.05] border border-white/[0.09] font-mono text-[9px] text-zinc-600 font-semibold tracking-wider select-none">
                        {step}
                      </span>
                    </div>
                    <div>
                      <div className="text-[#f0f0f4] text-xs font-bold font-display mb-0.5">{label}</div>
                      <div className="text-zinc-600 text-[10px] leading-relaxed">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
