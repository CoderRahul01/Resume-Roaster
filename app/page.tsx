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
            Overall Score
          </div>
          <div className={`text-sm font-semibold ${colorClass}`}>{label}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="w-full h-[3px] bg-white/[0.07] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full animate-score-bar ${barColor}`}
            style={{ "--score-width": pct } as React.CSSProperties}
          />
        </div>
        <p className="text-zinc-600 text-[11px] font-mono">
          {score <= 5
            ? "Most recruiters reject resumes at this level."
            : score <= 7
            ? "You're in the maybe pile. Let's fix that."
            : "You're in decent shape. Small wins left."
          }
        </p>
      </div>
    </div>
  );
}

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
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] bg-red-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[150px] sm:h-[200px] bg-red-500/[0.015] rounded-full blur-[80px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between border-b border-white/[0.06] bg-[#050508]/80 backdrop-blur-md">
        <button
          onClick={handleReset}
          className="font-black text-base tracking-tight text-[#f8f8f8] hover:opacity-70 transition-opacity"
        >
          ResumeRoaster
        </button>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden sm:inline text-[11px] text-zinc-600 font-mono">
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

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-5 py-10 sm:py-20 pb-20 sm:pb-40">
        <div className="w-full max-w-2xl space-y-10 sm:space-y-16">

          {/* Hero */}
          {!roastData && (
            <div className="text-center space-y-4 sm:space-y-5 animate-fade-in">
              <div className="inline-flex">
                <span className="border border-white/[0.10] text-zinc-500 font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full">
                  Free Brutal Critique
                </span>
              </div>
              <h1 className="text-[2.2rem] sm:text-[2.75rem] md:text-6xl font-black tracking-tight leading-[1.05]">
                Your resume is<br />
                <span className="text-[#ff4444]">costing you interviews.</span>
              </h1>
              <p className="text-zinc-500 text-sm sm:text-base md:text-lg max-w-md mx-auto leading-relaxed">
                Upload your resume PDF. Get 6 brutal critiques + a score in seconds.
                Fix it for{" "}
                <span className="text-[#f8f8f8] font-semibold">{SERVICES.rewrite.priceLabel}</span>.
              </p>
            </div>
          )}

          {/* Upload Zone */}
          <div className={`transition-all duration-500 ${roastData ? "opacity-40 hover:opacity-100 scale-95 origin-top grayscale-[0.5]" : ""}`}>
            <div className="space-y-3">
              <ResumeDropzone
                onExtracted={(text) => setResumeText(text)}
                isDisabled={isLoading}
              />

              <Button
                onClick={handleSubmit}
                disabled={!isReady || isLoading}
                className="
                  w-full h-12 sm:h-13 bg-[#ff4444] text-white font-bold text-[15px] tracking-wide
                  rounded-xl hover:bg-[#ff2222] active:scale-[0.99]
                  transition-all duration-150
                  disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-[#ff4444]
                  shadow-none
                "
              >
                {isLoading ? (
                  <span className="flex items-center gap-2.5">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Roasting your resume...
                  </span>
                ) : (
                  roastData ? "Roast it again →" : "Roast My Resume →"
                )}
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {(isLoading || roastData) && (
            <div ref={resultsRef} className="space-y-10 sm:space-y-12 animate-slide-up pt-4">
              {isLoading ? (
                <div className="space-y-8">
                  <div className="h-28 sm:h-32 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-white/[0.10] border-t-[#ff4444]/60 rounded-full animate-spin" />
                    <p className="text-zinc-600 text-sm font-mono">Reading your resume...</p>
                  </div>
                  <RoastSkeleton />
                </div>
              ) : roastData ? (
                <>
                  <ScoreBadge score={roastData.overallScore} />

                  <section className="space-y-3">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-600">
                        The Roast
                      </span>
                      <div className="flex-1 border-t border-white/[0.05]" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {roastData.roast.map((point, i) => (
                        <RoastCard key={i} point={point} index={i} />
                      ))}
                    </div>
                  </section>

                  {/* Rewrite paywall */}
                  <section className="space-y-6 pt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-600">
                        The Fix
                      </span>
                      <div className="flex-1 border-t border-white/[0.05]" />
                    </div>
                    <div className="relative">
                      <RewriteBlur />
                      <div className="mt-6">
                        <PaywallBanner resumeText={resumeText} score={roastData.overallScore} />
                      </div>
                    </div>
                  </section>
                </>
              ) : null}
            </div>
          )}

          {/* How it works */}
          {!roastData && !isLoading && (
            <div
              className="animate-fade-in grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-2"
              style={{ animationDelay: "0.2s" }}
            >
              {[
                { step: "01", label: "Upload PDF",  sub: "Drag & drop or tap to browse" },
                { step: "02", label: "Get roasted", sub: "6 brutal critiques + score" },
                { step: "03", label: "Fix it",       sub: `AI rewrite for ${SERVICES.rewrite.priceLabel}` },
              ].map(({ step, label, sub }) => (
                <div
                  key={step}
                  className="flex sm:flex-col items-center sm:items-center sm:text-center gap-3 sm:gap-1 p-3 sm:p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]"
                >
                  <div className="font-mono text-[10px] text-zinc-700 tracking-widest sm:mb-0.5 flex-shrink-0">{step}</div>
                  <div className="flex-1 sm:flex-none">
                    <div className="text-[#f8f8f8] text-xs font-semibold">{label}</div>
                    <div className="text-zinc-600 text-[11px] mt-0.5">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
