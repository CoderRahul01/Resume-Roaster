"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon, Loader2 } from "lucide-react";

interface CouponInputProps {
  onApply: (code: string) => Promise<{ valid: boolean; discountPercent?: number; message?: string }>;
  onClear: () => void;
  applied: { code: string; discountPercent: number } | null;
}

export function CouponInput({ onApply, onClear, applied }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");

  async function handleApply() {
    if (!code.trim()) return;
    setIsChecking(true);
    setError("");
    try {
      const result = await onApply(code.trim().toUpperCase());
      if (!result.valid) {
        setError(result.message ?? "Invalid coupon code");
      }
    } catch {
      setError("Failed to validate coupon");
    } finally {
      setIsChecking(false);
    }
  }

  if (applied) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
        <CheckIcon className="w-3.5 h-3.5 text-green-400" />
        <span className="text-xs text-green-400 font-medium">
          {applied.code} — {applied.discountPercent}% off
        </span>
        <button onClick={onClear} className="ml-auto text-zinc-500 hover:text-white">
          <XIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          className="flex-1 h-9 px-3 rounded-lg bg-zinc-900/60 border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleApply}
          disabled={!code.trim() || isChecking}
          className="h-9 px-4 text-xs border-white/[0.08]"
        >
          {isChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
        </Button>
      </div>
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
