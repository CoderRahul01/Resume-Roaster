"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RoastCard } from "@/components/RoastCard";
import { RoastSkeleton } from "@/components/RoastSkeleton";
import { RewriteBlur } from "@/components/RewriteBlur";
import { PaywallBanner } from "@/components/PaywallBanner";
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
    <div className="text-center animate-score-pop">
      <div className={`text-8xl font-black leading-none ${color}`}>
        {score}
        <span className="text-3xl text-zinc-700 font-bold">/10</span>
      </div>
      <div className={`mt-2 text-lg font-bold ${color}`}>{label}</div>
      <div className="mt-1 text-zinc-500 text-sm">Here&apos;s exactly what&apos;s wrong:</div>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [roastData, setRoastData] = useState<RoastResponse | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRoast  = sessionStorage.getItem("roastData");
    const storedResume = sessionStorage.getItem("resumeText");
    if (!storedRoast || !storedResume) { router.replace("/"); return; }
    setRoastData(JSON.parse(storedRoast));
    setResumeText(storedResume);
    setIsLoading(false);
  }, [router]);

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-500/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-black text-base tracking-tight">
          Resume<span className="text-orange-500">Roaster</span>
        </Link>
        <Link href="/" className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Roast another
        </Link>
      </header>

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-14 space-y-12">

        {/* Score */}
        {!isLoading && roastData && (
          <ScoreBadge score={roastData.overallScore} />
        )}

        {/* Roast cards */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">The Roast</h2>
            <span className="text-[10px] text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
              FREE
            </span>
          </div>
          {isLoading ? (
            <RoastSkeleton />
          ) : (
            <div className="space-y-2.5">
              {roastData?.roast.map((point, i) => (
                <RoastCard key={i} point={point} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Rewrite paywall */}
        {!isLoading && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">The Fix</h2>
              <span className="text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full font-medium">
                ₹499
              </span>
            </div>
            <RewriteBlur />
            <PaywallBanner resumeText={resumeText} />
          </section>
        )}

        {/* Share */}
        {!isLoading && roastData && (
          <div className="text-center pt-4 border-t border-white/[0.06]">
            <a
              href={`https://twitter.com/intent/tweet?text=My resume scored ${roastData.overallScore}/10 on Resume Roaster 🔥 Get yours roasted free at ${typeof window !== "undefined" ? window.location.origin : "resumeroaster.in"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <span>Share your score on X</span>
              <span>→</span>
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
