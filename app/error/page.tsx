"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  return (
    <main className="min-h-screen bg-[#080808] text-white flex flex-col">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-500/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] px-6 py-4">
        <Link href="/" className="font-black text-base tracking-tight">
          Resume<span className="text-orange-500">Roaster</span>
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-5">
        <div className="text-center space-y-5 animate-fade-in max-w-sm">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-2xl font-bold">Something went wrong on our end.</h1>
          <p className="text-zinc-400 text-sm">
            Your payment (if any) is safe. This is a temporary server issue — try again in a moment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/">
              <Button className="bg-orange-500 hover:bg-orange-600 font-semibold">
                Go back to home →
              </Button>
            </Link>
            <a
              href="https://dashboard.razorpay.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                Check payment status
              </Button>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
