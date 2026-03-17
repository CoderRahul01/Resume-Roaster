"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [rewrittenResume, setRewrittenResume] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setError("No session found. Did you complete the payment?");
      setIsLoading(false);
      return;
    }

    async function fetchRewrite() {
      try {
        const res = await fetch("/api/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to generate rewrite");
        setRewrittenResume(data.rewrittenResume);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRewrite();
  }, [sessionId]);

  function handleCopy() {
    navigator.clipboard.writeText(rewrittenResume);
    toast.success("Copied to clipboard!");
  }

  function handleDownload() {
    const blob = new Blob([rewrittenResume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rewritten-resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
      {isLoading ? (
        <>
          <div className="text-center space-y-3">
            <div className="text-5xl animate-pulse">✨</div>
            <h1 className="text-2xl font-bold text-white">
              Rewriting your resume...
            </h1>
            <p className="text-zinc-500 text-sm">
              Claude AI is polishing every line. This takes ~15 seconds.
            </p>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className={`h-4 bg-zinc-800 ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
            ))}
          </div>
        </>
      ) : error ? (
        <div className="text-center space-y-4">
          <div className="text-5xl">😕</div>
          <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
          <p className="text-zinc-400">{error}</p>
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Go back home
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="text-center space-y-2">
            <div className="text-5xl">🎉</div>
            <h1 className="text-2xl font-bold text-white">
              Your Rewritten Resume is Ready
            </h1>
            <p className="text-zinc-500 text-sm">
              ATS-optimized · Achievement-focused · Ready to send
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCopy}
              className="flex-1 bg-orange-500 hover:bg-orange-600 font-semibold"
            >
              Copy to Clipboard
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Download .txt
            </Button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-mono leading-relaxed">
              {rewrittenResume}
            </pre>
          </div>

          <div className="text-center pt-4 border-t border-zinc-800 space-y-3">
            <p className="text-zinc-500 text-sm">Want to improve a different resume?</p>
            <Link href="/">
              <Button variant="ghost" className="text-orange-500 hover:text-orange-400">
                Roast Another Resume →
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-zinc-800 px-6 py-4">
        <Link href="/" className="text-orange-500 font-bold text-lg">
          🔥 ResumeRoast
        </Link>
      </header>
      <Suspense
        fallback={
          <div className="max-w-2xl mx-auto px-6 py-12 text-center text-zinc-500">
            Loading...
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </main>
  );
}
