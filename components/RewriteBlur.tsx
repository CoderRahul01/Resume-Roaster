const SAMPLE_LINES = [
  "ALEX SHARMA  |  Senior Software Engineer",
  "alex.sharma@email.com  ·  linkedin.com/in/alexsharma  ·  github.com/alexsharma",
  "",
  "PROFESSIONAL SUMMARY",
  "Results-driven software engineer with 6+ years delivering scalable systems.",
  "Led cross-functional teams to ship products serving 2M+ users, cutting infra",
  "costs 40% through strategic refactoring. Expert in clean architecture.",
  "",
  "EXPERIENCE",
  "Senior Engineer  ·  Acme Corp  ·  2021–Present",
  "• Architected real-time data pipeline — 500K events/sec, 65% latency reduction",
  "• Migrated monolith to microservices; daily deploys vs monthly. Team of 5.",
  "• 94% test coverage. Production incidents down 73%.",
  "",
  "Software Engineer  ·  StartupXYZ  ·  2019–2021",
  "• Core payment system — $12M annual transaction volume",
  "• API response time cut 58% via query optimization + caching",
];

export function RewriteBlur() {
  return (
    <div className="relative rounded-xl overflow-hidden border border-white/[0.07]">
      {/* Blurred content */}
      <div className="p-5 font-mono text-xs text-zinc-300 leading-relaxed select-none blur-[5px] pointer-events-none bg-[#0e0e14]">
        {SAMPLE_LINES.map((line, i) => (
          <div key={i} className={line === "" ? "h-3" : "truncate"}>
            {line}
          </div>
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/20 via-[#050508]/60 to-[#050508]/92 flex flex-col items-center justify-center gap-2 px-6">
        <div className="w-8 h-8 rounded-lg border border-white/[0.10] bg-white/[0.04] flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-400"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p className="text-[#f8f8f8] font-medium text-sm text-center">
          Your rewrite is locked
        </p>
        <p className="text-zinc-500 text-xs text-center max-w-xs">
          Complete payment to unlock your rewritten resume
        </p>
      </div>
    </div>
  );
}
