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
    <div className="relative rounded-xl overflow-hidden border border-zinc-800/60">
      {/* Blurred content */}
      <div className="p-5 font-mono text-xs text-zinc-300 leading-relaxed select-none blur-[5px] pointer-events-none bg-zinc-900/30">
        {SAMPLE_LINES.map((line, i) => (
          <div key={i} className={line === "" ? "h-3" : "truncate"}>
            {line}
          </div>
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/30 via-zinc-950/50 to-zinc-950/80 flex flex-col items-center justify-center gap-2.5 px-6">
        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <span className="text-base">🔒</span>
        </div>
        <p className="text-white font-bold text-base text-center">
          Your rewrite is ready to unlock
        </p>
        <p className="text-zinc-400 text-xs text-center max-w-xs">
          ATS-optimized · Stronger bullets · Professional summary
        </p>
      </div>
    </div>
  );
}
