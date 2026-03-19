"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { RoastResponse } from "@/types";
import { RESUME } from "@/lib/config";

export default function HomePage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const charCount = resumeText.length;
  const isReady = resumeText.trim().length >= RESUME.minChars;

  async function handleSubmit() {
    if (!isReady) {
      toast.error("Paste at least a few lines of your resume.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data: RoastResponse = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed to roast");

      sessionStorage.setItem("resumeText", resumeText);
      sessionStorage.setItem("roastData", JSON.stringify(data));
      router.push("/results");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white flex flex-col">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-orange-500/[0.04] rounded-full blur-3xl animate-glow-pulse" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 px-6 py-5 flex items-center justify-between border-b border-white/[0.06]">
        <span className="font-black text-base tracking-tight">
          Resume<span className="text-orange-500">Roaster</span>
        </span>
        <span className="text-[11px] text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800/80">
          Free · No signup
        </span>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-14">
        <div className="w-full max-w-2xl space-y-10">

          {/* Hero */}
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

          {/* Input card */}
          <div className="animate-slide-up space-y-3" style={{ animationDelay: "0.1s" }}>
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
                  min-h-[260px] w-full bg-transparent border-none resize-none
                  text-zinc-200 placeholder:text-zinc-600
                  p-5 text-sm leading-relaxed
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
                "Roast My Resume →"
              )}
            </Button>

            <p className="text-center text-zinc-600 text-[11px] pt-0.5">
              Free critique · No account needed · Takes ~10 seconds
            </p>
          </div>

          {/* How it works */}
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
        </div>
      </div>
    </main>
  );
}
