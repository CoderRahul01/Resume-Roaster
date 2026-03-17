export function RewriteBlur() {
  const fakeLines = [
    "JOHN DOE | Senior Software Engineer",
    "john.doe@email.com | linkedin.com/in/johndoe | github.com/johndoe",
    "",
    "PROFESSIONAL SUMMARY",
    "Results-driven software engineer with 7+ years of experience delivering",
    "high-impact solutions at scale. Led cross-functional teams to ship products",
    "serving 2M+ users, reducing infrastructure costs by 40% through strategic",
    "refactoring. Passionate about clean architecture and developer experience.",
    "",
    "EXPERIENCE",
    "Senior Software Engineer | Acme Corp | 2020–Present",
    "• Architected and delivered a real-time data pipeline processing 500K",
    "  events/sec, reducing latency by 65% and saving $180K annually",
    "• Led a team of 5 engineers to migrate legacy monolith to microservices,",
    "  improving deployment frequency from monthly to daily releases",
    "• Implemented automated testing suite achieving 94% code coverage,",
    "  reducing production incidents by 73%",
    "",
    "Software Engineer | StartupXYZ | 2017–2020",
    "• Built core payment processing system handling $12M in annual transactions",
    "• Reduced API response times by 58% through query optimization and caching",
  ];

  return (
    <div className="relative rounded-lg overflow-hidden border border-zinc-800">
      <div className="p-6 font-mono text-sm text-zinc-300 leading-relaxed select-none blur-sm pointer-events-none">
        {fakeLines.map((line, i) => (
          <div key={i} className={line === "" ? "h-3" : ""}>
            {line}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
        <div className="text-4xl">🔒</div>
        <p className="text-white font-semibold text-lg text-center px-4">
          Your rewritten resume is ready
        </p>
        <p className="text-zinc-400 text-sm text-center px-6">
          Unlock the AI-rewritten version — optimized, achievement-focused, and
          ATS-ready
        </p>
      </div>
    </div>
  );
}
