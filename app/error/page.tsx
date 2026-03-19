"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  return (
    <main className="min-h-screen bg-[#050508] text-white flex flex-col">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-500/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] px-6 py-4">
        <Link href="/" className="font-black text-base tracking-tight text-[#f8f8f8] hover:opacity-70 transition-opacity">
          ResumeRoaster
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-5">
        <div className="text-center space-y-5 animate-fade-in max-w-sm">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-2xl font-bold text-[#f8f8f8]">Something went wrong on our end.</h1>
          <p className="text-zinc-500 text-sm">
            Your payment (if any) is safe. This is a temporary server issue — try again in a moment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/">
              <Button className="bg-white text-[#050508] font-semibold hover:bg-zinc-100">
                Go back to home →
              </Button>
            </Link>
            <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-white/[0.10] text-zinc-400 hover:bg-white/[0.05] hover:text-[#f8f8f8]">
                Check payment status
              </Button>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
