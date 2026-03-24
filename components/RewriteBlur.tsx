const SAMPLE_LINES = [
  "ALEX SHARMA  |  Senior Software Engineer",
  "alex.sharma@email.com  ·  linkedin.com/in/alexsharma  ·  +91 98765 43210",
  "",
  "PROFESSIONAL SUMMARY",
  "Spearheaded delivery of 4 production services serving 2M+ users, cutting",
  "infrastructure costs by 40% through strategic refactoring and caching.",
  "Expert in TypeScript, React, Node.js, AWS — 6 years in fast-paced startups.",
  "",
  "WORK EXPERIENCE",
  "Senior Software Engineer  ·  Acme Corp  ·  Feb 2021 – Present",
  "• Architected real-time event pipeline — 500K events/sec, 65% latency drop",
  "• Led migration from monolith → microservices; deploys went monthly → daily",
  "• Reduced production incidents 73% via automated testing (94% coverage)",
  "",
  "Software Engineer  ·  StartupXYZ  ·  Jun 2019 – Jan 2021",
  "• Built core payment system handling ₹12M+ annual transaction volume",
  "• Cut API response time 58% through query optimization & Redis caching",
];

export function RewriteBlur() {
  return (
    <div className="relative rounded-xl overflow-hidden border border-white/[0.07]">
      {/* Blurred sample resume */}
      <div className="p-5 font-mono text-xs text-zinc-300 leading-relaxed select-none blur-[6px] pointer-events-none bg-[#0d0d12]">
        {SAMPLE_LINES.map((line, i) => (
          <div key={i} className={line === "" ? "h-3" : "truncate"}>
            {line}
          </div>
        ))}
      </div>

      {/* Gradient overlay — darker at bottom to merge with paywall */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/10 via-[#050508]/55 to-[#050508]/95" />

      {/* Lock icon + copy */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
        {/* Animated lock */}
        <div className="animate-float">
          <div className="w-11 h-11 rounded-2xl border border-[#ff4444]/20 bg-[#ff4444]/[0.06] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff4444"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-80"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-[#f8f8f8] font-bold text-sm">
            Your rewritten resume is ready
          </p>
          <p className="text-zinc-500 text-xs max-w-[220px] leading-relaxed">
            Unlock it below. Instant delivery — no waiting.
          </p>
        </div>
      </div>
    </div>
  );
}
