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
  const color =
    score <= 3 ? "text-red-500" :
    score <= 5 ? "text-orange-400" :
    score <= 7 ? "text-yellow-400" :
                 "text-green-400";

  const label =
    score <= 2 ? "Disaster" :
    score <= 4 ? "Pretty Bad" :
    score <= 6 ? "Needs Work" :
    score <= 8 ? "Not Terrible" :
                 "Actually Decent";

  return (
    <div className="text-center animate-score-pop py-8">
      <div className={`text-8xl font-black leading-none ${color}`}>
        {score}
        <span className="text-3xl text-zinc-700 font-bold">/10</span>
      </div>
      <div className={`mt-2 text-lg font-bold ${color}`}>{label}</div>
      <div className="mt-1 text-zinc-500 text-sm italic">"Your resume survived... barely."</div>
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
    setRoastData(null); // Reset if re-roasting
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
    <main className="min-h-screen bg-[#080808] text-white flex flex-col selection:bg-orange-500/30">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-orange-500/[0.04] rounded-full blur-3xl animate-glow-pulse" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 px-6 py-5 flex items-center justify-between border-b border-white/[0.06] bg-black/20 backdrop-blur-md">
        <button onClick={handleReset} className="font-black text-base tracking-tight hover:opacity-80 transition-opacity">
          Resume<span className="text-orange-500">Roaster</span>
        </button>
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800/80">
            Free · No signup
          </span>
          {roastData && (
             <Button variant="ghost" onClick={handleReset} className="text-[11px] text-zinc-400 hover:text-white px-2 h-7 underline underline-offset-4 decoration-zinc-700">
               Roast another
             </Button>
          )}
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-5 py-20 pb-40">
        <div className="w-full max-w-2xl space-y-16">

          {/* Hero - Hidden when roast results are shown to keep focus */}
          {!roastData && (
            <div className="text-center space-y-5 animate-fade-in">
              <div className="inline-flex items-center gap-2 text-[11px] font-medium text-orange-400/90 bg-orange-500/[0.08] border border-orange-500/20 px-3.5 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                AI-powered · Brutally honest · Free
              </div>
              <h1 className="text-[2.75rem] sm:text-6xl font-black tracking-tight leading-[1.08]">
                Your resume is<br />
                <span className="text-orange-500">probably terrible.</span>
              </h1>
              <p className="text-zinc-400 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                Get a brutal AI critique in seconds.
                Fix it with a professional rewrite for{" "}
                <span className="text-white font-semibold">₹499</span>.
              </p>
            </div>
          )}

          {/* Input Area */}
          <div className={`transition-all duration-500 ${roastData ? "opacity-40 hover:opacity-100 scale-95 origin-top grayscale-[0.5]" : ""}`}>
            <div className="space-y-3">
              <div
                className={`
                  relative rounded-2xl border bg-zinc-900/40 transition-all duration-300
                  ${isFocused
                    ? "border-zinc-600 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.4)]"
                    : "border-zinc-800/70 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
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
                    text-zinc-200 placeholder:text-zinc-600
                    p-6 text-sm leading-relaxed
                    focus:ring-0 focus-visible:ring-0
                  "
                />
                {charCount > 0 && (
                  <div className="absolute bottom-3.5 right-4 text-[11px] text-zinc-600 select-none">
                    {charCount.toLocaleString()} chars
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!isReady || isLoading}
                className="
                  w-full h-13 bg-white text-black font-bold text-[15px] tracking-wide
                  rounded-xl hover:bg-zinc-100 active:scale-[0.99]
                  transition-all duration-150
                  disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-white
                  shadow-[0_4px_16px_rgba(255,255,255,0.1)]
                "
              >
                {isLoading ? (
                  <span className="flex items-center gap-2.5">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Roasting your resume...
                  </span>
                ) : (
                  roastData ? "Roast it again 🔥" : "Roast My Resume →"
                )}
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {(isLoading || roastData) && (
            <div ref={resultsRef} className="space-y-12 animate-slide-up pt-4">
              {isLoading ? (
                <div className="space-y-8">
                  <div className="h-40 flex items-center justify-center">
                    <div className="text-4xl animate-bounce">🔥</div>
                  </div>
                  <RoastSkeleton />
                </div>
              ) : roastData ? (
                <>
                  <ScoreBadge score={roastData.overallScore} />
                  
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 mb-5">
                      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">The Roast</h2>
                      <span className="text-[10px] text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
                        FREE
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {roastData.roast.map((point, i) => (
                        <RoastCard key={i} point={point} index={i} />
                      ))}
                    </div>
                  </section>

                  {/* Rewrite paywall */}
                  <section className="space-y-6 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">The Fix</h2>
                      <span className="text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full font-medium">
                        ₹499
                      </span>
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

          {/* How it works - Hidden when results shown */}
          {!roastData && !isLoading && (
            <div className="animate-fade-in grid grid-cols-3 gap-3 pt-2" style={{ animationDelay: "0.2s" }}>
              {[
                { step: "01", label: "Paste resume", sub: "Plain text, any format" },
                { step: "02", label: "Get roasted",  sub: "6 brutal critiques + score" },
                { step: "03", label: "Fix it",        sub: "AI rewrite for ₹499" },
              ].map(({ step, label, sub }) => (
                <div key={step} className="text-center space-y-1 p-3 rounded-xl border border-zinc-800/60 bg-zinc-900/20">
                  <div className="text-[10px] text-orange-500/70 font-mono font-bold tracking-widest">{step}</div>
                  <div className="text-white text-xs font-semibold">{label}</div>
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
