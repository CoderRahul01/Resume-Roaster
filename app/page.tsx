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

// ── Score badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const colorClass =
    score <= 3 ? "text-[#ff4444]" :
    score <= 5 ? "text-orange-400" :
    score <= 7 ? "text-amber-400" :
                 "text-emerald-400";

  const barColor =
    score <= 3 ? "bg-[#ff4444]" :
    score <= 5 ? "bg-orange-400" :
    score <= 7 ? "bg-amber-400" :
                 "bg-emerald-400";

  const label =
    score <= 2 ? "Actively hurting you" :
    score <= 4 ? "Losing you interviews" :
    score <= 6 ? "Forgettable" :
    score <= 8 ? "Getting there" :
                 "Actually solid";

  const pct = `${(score / 10) * 100}%`;

  return (
    <div className="animate-score-pop pb-6 border-b border-white/[0.06] space-y-5">
      <div className="flex items-end gap-5">
        <div className={`text-6xl sm:text-7xl font-black leading-none tracking-tighter ${colorClass}`}>
          {score}
          <span className="text-xl sm:text-2xl text-zinc-700 font-bold ml-1">/10</span>
        </div>
        <div className="pb-1.5 space-y-1">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-600">
            Resume Score
          </div>
          <div className={`text-sm font-bold ${colorClass}`}>{label}</div>
        </div>
      </div>

      {/* Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-[3px] bg-white/[0.07] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full animate-score-bar ${barColor}`}
            style={{ "--score-width": pct } as React.CSSProperties}
          />
        </div>
        <p className="text-zinc-600 text-[11px] font-mono">
          {score <= 5
            ? "Most recruiters reject resumes at this level without reading."
            : score <= 7
            ? "You're in the maybe pile. Let's move you to yes."
            : "You're in decent shape. Small wins left."}
        </p>
      </div>
    </div>
  );
}

// ── Social proof ticker ───────────────────────────────────────────────────────

function SocialProof() {
  const items = [
    { count: "2,847", label: "resumes roasted this month" },
    { count: "4.2→7.8", label: "avg score improvement" },
    { count: "₹99", label: "one-time, no subscription" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
      {items.map(({ count, label }, i) => (
        <div
          key={label}
          className="flex items-center gap-1.5 animate-count-up"
          style={{ animationDelay: `${0.3 + i * 0.12}s` }}
        >
          <span className="font-black text-sm text-[#f8f8f8]">{count}</span>
          <span className="text-zinc-600 text-xs font-mono">{label}</span>
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
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-red-500/[0.035] rounded-full blur-[130px] animate-glow-pulse" />
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-red-500/[0.012] rounded-full blur-[90px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[350px] h-[350px] bg-violet-500/[0.015] rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between border-b border-white/[0.06] bg-[#050508]/80 backdrop-blur-md">
        <button
          onClick={handleReset}
          className="font-black text-base tracking-tight text-[#f8f8f8] hover:opacity-70 transition-opacity"
        >
          Resume<span className="text-[#ff4444]">Roaster</span>
        </button>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden sm:inline text-[10px] text-zinc-700 font-mono tracking-widest uppercase">
            Free to roast
          </span>
          {roastData && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="text-[11px] text-zinc-400 hover:text-[#f8f8f8] px-2 h-8 underline underline-offset-4 decoration-zinc-700"
            >
              Roast another
            </Button>
          )}
        </div>
      </nav>

      {/* Main */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-5 py-10 sm:py-20 pb-20 sm:pb-40">
        <div className="w-full max-w-2xl space-y-10 sm:space-y-14">

          {/* Hero — only when no roast yet */}
          {!roastData && (
            <div className="text-center space-y-5 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex animate-fade-in" style={{ animationDelay: "0.05s" }}>
                <span className="border border-white/[0.10] text-zinc-500 font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full bg-white/[0.02]">
                  Free Brutal AI Critique
                </span>
              </div>

              {/* Headline */}
              <h1
                className="text-[2.1rem] sm:text-[2.7rem] md:text-[3.2rem] font-black tracking-tight leading-[1.04] animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                Your resume is<br />
                <span className="text-[#ff4444]">costing you interviews.</span>
              </h1>

              {/* Sub-copy */}
              <p
                className="text-zinc-500 text-sm sm:text-base max-w-sm mx-auto leading-relaxed animate-fade-in"
                style={{ animationDelay: "0.18s" }}
              >
                Upload your resume. Get 6 specific critiques + a score.
                Fix it for{" "}
                <span className="text-[#f8f8f8] font-semibold">{SERVICES.rewrite.priceLabel}</span>
                {" "}— no subscription, no account.
              </p>

              {/* Social proof */}
              <div className="pt-1">
                <SocialProof />
              </div>
            </div>
          )}

          {/* Upload + button */}
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
                  transition-all duration-150
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
                  <section className="space-y-3">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-600">The Roast</span>
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
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-600">The Fix</span>
                      <div className="flex-1 border-t border-white/[0.05]" />
                    </div>
                    <RewriteBlur />
                    <PaywallBanner resumeText={resumeText} score={roastData.overallScore} />
                  </section>
                </>
              ) : null}
            </div>
          )}

          {/* How it works — below upload, before roast */}
          {!roastData && !isLoading && (
            <div className="animate-fade-in" style={{ animationDelay: "0.28s" }}>
              {/* Steps */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { step: "01", label: "Upload PDF",   sub: "Drag & drop or tap to browse", icon: "📄" },
                  { step: "02", label: "Get roasted",  sub: "6 critiques + score in seconds", icon: "🔥" },
                  { step: "03", label: "Fix it",        sub: `AI rewrite for ${SERVICES.rewrite.priceLabel}`, icon: "✨" },
                ].map(({ step, label, sub, icon }) => (
                  <div
                    key={step}
                    className="flex flex-col items-center text-center gap-2 p-3 sm:p-4 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.10] transition-all duration-200"
                  >
                    <span className="text-lg">{icon}</span>
                    <div>
                      <div className="font-mono text-[9px] text-zinc-700 tracking-widest mb-0.5">{step}</div>
                      <div className="text-[#f8f8f8] text-xs font-bold">{label}</div>
                      <div className="text-zinc-600 text-[10px] mt-0.5 leading-relaxed">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonial strip */}
              <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.015] px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    R
                  </div>
                  <div className="space-y-1">
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      &ldquo;Got roasted with a 3/10. Paid ₹99 for the rewrite. Got 3 interview calls the next week.
                      Worth every rupee.&rdquo;
                    </p>
                    <p className="text-zinc-700 text-[10px] font-mono">Rahul S. · SDE-2 at Bangalore startup</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
