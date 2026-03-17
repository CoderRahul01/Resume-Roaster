"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { RoastResponse } from "@/types";
import { UploadCloud } from "lucide-react";

const MAX_CHARS = 8000;

export default function HomePage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  async function handleSubmit() {
    if (resumeText.trim().length < 100) {
      toast.error("Please paste a longer resume (at least 100 characters).");
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
    <main className="min-h-screen bg-[#070709] text-white relative overflow-hidden flex flex-col pt-12">
      {/* Subtle Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#10103a] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#0d0d26] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex-col items-center justify-center flex-1 flex w-full max-w-4xl mx-auto px-6 pt-10 pb-20">
        
        {/* Typography Hero */}
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h1 className="text-6xl sm:text-7xl font-black tracking-widest leading-tight text-white/90 drop-shadow-lg">
            RESUME ROASTER
          </h1>
          <p className="text-zinc-500 text-lg tracking-wide uppercase font-medium">
            Get roasted by AI.
          </p>
        </div>

        {/* Massive Glowing Circular Dropzone */}
        <div className="relative group perspective-1000 mb-12 flex justify-center w-full">
          <div
            className={`
              absolute inset-0 rounded-full blur-3xl transition-all duration-700
              ${
                isFocused
                  ? "bg-white/20 scale-110 opacity-100"
                  : "bg-blue-500/10 scale-100 opacity-60"
              }
              ${isLoading ? "animate-pulse bg-white/30" : ""}
            `}
          />
          
          <div
            className={`
              relative z-20 flex flex-col items-center justify-center
              w-[340px] h-[340px] rounded-full overflow-hidden
              border border-white/10 bg-[#0c0c14]/80 backdrop-blur-3xl
              transition-all duration-500
              ${isFocused ? "shadow-[0_0_80px_rgba(255,255,255,0.1)] border-white/30 scale-[1.02]" : "shadow-lg"}
            `}
          >
            <Textarea
              value={resumeText}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setResumeText(e.target.value.slice(0, MAX_CHARS))}
              placeholder=""
              className="absolute inset-0 w-full h-full p-12 text-center resize-none bg-transparent border-none text-white/80 placeholder:text-transparent focus:ring-0 text-sm font-mono overflow-y-auto z-30"
              disabled={isLoading}
            />
            
            {!resumeText && !isFocused && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none text-zinc-500">
                <UploadCloud className="w-12 h-12 mb-4 opacity-50 stroke-[1.5]" />
                <span className="text-sm font-medium tracking-wide uppercase">Paste Resume Here</span>
              </div>
            )}
            
            {resumeText && (
              <span className="absolute bottom-6 text-[10px] text-zinc-600 tracking-widest uppercase z-10 pointer-events-none">
                {resumeText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Roast Action Button */}
        <div className="h-20 w-full flex justify-center animate-fade-in transition-all duration-500 delay-100">
          {(resumeText.trim().length >= 100 || isLoading) && (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              size="lg"
              className={`
                rounded-full px-12 py-7 font-bold text-lg tracking-widest uppercase
                bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95
                transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)]
                disabled:opacity-80 disabled:cursor-not-allowed
              `}
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> 
                  Roasting...
                </span>
              ) : (
                "ROAST ME"
              )}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
