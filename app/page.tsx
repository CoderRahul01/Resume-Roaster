"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RoastCard } from "@/components/RoastCard";
import { RoastSkeleton } from "@/components/RoastSkeleton";
import { RewriteBlur } from "@/components/RewriteBlur";
import { PaywallBanner } from "@/components/PaywallBanner";
import { RESUME } from "@/lib/config";
import { RoastResponse } from "@/types";

function ScoreBadge({ score }: { score: number }) {
  const colorClass =
    score <= 3 ? "text-red-500" :
    score <= 5 ? "text-red-400" :
    score <= 7 ? "text-zinc-300" :
                 "text-green-500";

  const label =
    score <= 2 ? "Disaster" :
    score <= 4 ? "Pretty Bad" :
    score <= 6 ? "Needs Work" :
    score <= 8 ? "Not Terrible" :
                 "Actually Decent";

  return (
    <div className="animate-score-pop pb-6 border-b border-white/[0.06]">
      <div className="flex items-end gap-5">
        <div className={`text-7xl font-black leading-none tracking-tighter ${colorClass}`}>
          {score}
          <span className="text-2xl text-zinc-700 font-bold ml-1">/10</span>
        </div>
        <div className="pb-1.5 space-y-1">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-600">
            Overall Score
          </div>
          <div className={`text-sm font-semibold ${colorClass}`}>{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [resumeText, setResumeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [roastData, setRoastData] = useState<RoastResponse | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const charCount = resumeText.length;
  const isReady = resumeText.trim().length >= RESUME.minChars;

  useEffect(() => {
    if (roastData && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [roastData]);

  async function handleSubmit() {
    if (!isReady) {
      toast.error("Paste at least a few lines of your resume.");
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
    <main className="min-h-screen bg-[#050508] text-white flex flex-col">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/[0.025] rounded-full blur-[120px]" />
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-white/[0.012] rounded-full blur-[80px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 px-6 py-5 flex items-center justify-between border-b border-white/[0.06] bg-[#050508]/80 backdrop-blur-md">
        <button
          onClick={handleReset}
          className="font-black text-base tracking-tight text-[#f8f8f8] hover:opacity-70 transition-opacity"
        >
          ResumeRoaster
        </button>
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-zinc-600 font-mono">
            Free to roast
          </span>
          {roastData && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="text-[11px] text-zinc-400 hover:text-[#f8f8f8] px-2 h-7 underline underline-offset-4 decoration-zinc-700"
            >
              Roast another
            </Button>
          )}
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-5 py-20 pb-40">
        <div className="w-full max-w-2xl space-y-16">

          {/* Hero */}
          {!roastData && (
            <div className="text-center space-y-5 animate-fade-in">
              <div className="inline-flex">
                <span className="border border-white/[0.10] text-zinc-500 font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full">
                  AI Resume Critic
                </span>
              </div>
              <h1 className="text-[2.75rem] sm:text-6xl font-black tracking-tight leading-[1.05]">
                Your resume is<br />
                <span className="text-[#f8f8f8]">probably terrible.</span>
              </h1>
              <p className="text-zinc-500 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                Get a brutal AI critique in seconds.
                Fix it with a professional rewrite for{" "}
                <span className="text-[#f8f8f8] font-semibold">₹499</span>.
              </p>
            </div>
          )}

          {/* Input Area */}
          <div className={`transition-all duration-500 ${roastData ? "opacity-40 hover:opacity-100 scale-95 origin-top grayscale-[0.5]" : ""}`}>
            <div className="space-y-3">
              <div
                className={`
                  relative rounded-2xl border bg-[#0e0e14] transition-all duration-300
                  ${isFocused
                    ? "border-white/[0.20] shadow-[0_0_0_1px_rgba(99,102,241,0.30)]"
                    : "border-white/[0.08]"
                  }
                `}
              >
                <Textarea
                  value={resumeText}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={(e) => setResumeText(e.target.value.slice(0, RESUME.maxChars))}
                  placeholder="Paste your entire resume here — work experience, skills, education, the whole thing..."
                  disabled={isLoading}
                  className="
                    min-h-[220px] w-full bg-transparent border-none resize-none
                    text-zinc-200 placeholder:text-zinc-700
                    p-6 text-sm leading-relaxed
                    focus:ring-0 focus-visible:ring-0
                  "
                />
                {charCount > 0 && (
                  <div className="absolute bottom-3.5 right-4 text-[11px] text-zinc-700 font-mono select-none">
                    {charCount.toLocaleString()}
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!isReady || isLoading}
                className="
                  w-full h-13 bg-white text-[#050508] font-bold text-[15px] tracking-wide
                  rounded-xl hover:bg-zinc-100 active:scale-[0.99]
                  transition-all duration-150
                  disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-white
                  shadow-none
                "
              >
                {isLoading ? (
                  <span className="flex items-center gap-2.5">
                    <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
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
            <div ref={resultsRef} className="space-y-12 animate-slide-up pt-4">
              {isLoading ? (
                <div className="space-y-8">
                  <div className="h-32 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-white/[0.10] border-t-white/60 rounded-full animate-spin" />
                    <p className="text-zinc-600 text-sm font-mono">Roasting your resume...</p>
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
                    <div className="grid grid-cols-1 gap-3">
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
            <div className="animate-fade-in grid grid-cols-3 gap-3 pt-2" style={{ animationDelay: "0.2s" }}>
              {[
                { step: "01", label: "Paste resume", sub: "Plain text, any format" },
                { step: "02", label: "Get roasted",  sub: "6 brutal critiques + score" },
                { step: "03", label: "Fix it",        sub: "AI rewrite for ₹499" },
              ].map(({ step, label, sub }) => (
                <div key={step} className="text-center space-y-1 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <div className="font-mono text-[10px] text-zinc-700 tracking-widest">{step}</div>
                  <div className="text-[#f8f8f8] text-xs font-semibold">{label}</div>
                  <div className="text-zinc-600 text-[11px]">{sub}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
