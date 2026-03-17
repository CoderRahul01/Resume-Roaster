"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RoastCard } from "@/components/RoastCard";
import { RoastSkeleton } from "@/components/RoastSkeleton";
import { RewriteBlur } from "@/components/RewriteBlur";
import { PaywallBanner } from "@/components/PaywallBanner";
import { RoastResponse } from "@/types";

export default function ResultsPage() {
  const router = useRouter();
  const [roastData, setRoastData] = useState<RoastResponse | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRoast = sessionStorage.getItem("roastData");
    const storedResume = sessionStorage.getItem("resumeText");

    if (!storedRoast || !storedResume) {
      router.replace("/");
      return;
    }

    setRoastData(JSON.parse(storedRoast));
    setResumeText(storedResume);
    setIsLoading(false);
  }, [router]);

  const scoreLabel = (score: number) => {
    if (score <= 2) return "A Complete Disaster";
    if (score <= 4) return "Pretty Bad";
    if (score <= 6) return "Needs Work";
    if (score <= 8) return "Not Terrible";
    return "Actually Decent";
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-orange-500 font-bold text-lg">
          🔥 ResumeRoast
        </Link>
        <Link
          href="/"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← Roast another
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        {/* Score headline */}
        {!isLoading && roastData && (
          <div className="text-center space-y-2">
            <div className="text-7xl font-black text-red-500">
              {roastData.overallScore}
              <span className="text-3xl text-zinc-600">/10</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Your Resume Is{" "}
              <span className="text-red-400">{scoreLabel(roastData.overallScore)}</span>
            </h1>
            <p className="text-zinc-500 text-sm">
              Here&apos;s exactly what&apos;s wrong with it:
            </p>
          </div>
        )}

        {/* Roast cards */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            🔥 The Roast{" "}
            <span className="text-xs font-normal text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
              FREE
            </span>
          </h2>
          {isLoading ? (
            <RoastSkeleton />
          ) : (
            <div className="space-y-3">
              {roastData?.roast.map((point, i) => (
                <RoastCard key={i} point={point} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Rewrite section */}
        {!isLoading && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-300 flex items-center gap-2">
              ✨ The Rewrite{" "}
              <span className="text-xs font-normal text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                $4.99
              </span>
            </h2>
            <RewriteBlur />
            <PaywallBanner resumeText={resumeText} />
          </section>
        )}

        {/* Share */}
        {!isLoading && roastData && (
          <div className="text-center pt-4 border-t border-zinc-800">
            <a
              href={`https://twitter.com/intent/tweet?text=My resume scored ${roastData.overallScore}/10 on Resume Roast 🔥 Try yours for free at ${typeof window !== "undefined" ? window.location.origin : ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Share your score on X →
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
