import { RoastPoint } from "@/types";

interface RoastCardProps {
  point: RoastPoint;
  index: number;
}

const ACCENT_COLORS = [
  { border: "group-hover:border-l-[#ff4444]", fix: "border-l-[#ff4444]/40 bg-[#ff4444]/[0.04]", dot: "bg-[#ff4444]/50" },
  { border: "group-hover:border-l-orange-500", fix: "border-l-orange-500/40 bg-orange-500/[0.04]", dot: "bg-orange-500/50" },
  { border: "group-hover:border-l-amber-400",  fix: "border-l-amber-400/40  bg-amber-400/[0.04]",  dot: "bg-amber-400/50"  },
  { border: "group-hover:border-l-[#ff4444]", fix: "border-l-[#ff4444]/40 bg-[#ff4444]/[0.04]", dot: "bg-[#ff4444]/50" },
  { border: "group-hover:border-l-orange-500", fix: "border-l-orange-500/40 bg-orange-500/[0.04]", dot: "bg-orange-500/50" },
  { border: "group-hover:border-l-amber-400",  fix: "border-l-amber-400/40  bg-amber-400/[0.04]",  dot: "bg-amber-400/50"  },
];

export function RoastCard({ point, index }: RoastCardProps) {
  const displayIndex = String(index + 1).padStart(2, "0");
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <div
      className={`
        group p-5 rounded-xl
        border-l-2 border-l-transparent border border-white/[0.07]
        bg-white/[0.018]
        hover:bg-[#12121a] hover:border-white/[0.12]
        ${accent.border}
        transition-all duration-200
        animate-fade-in flex flex-col cursor-default
      `}
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: "both" }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3.5">
        {/* Circular badge */}
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/[0.05] border border-white/[0.10] font-mono text-[9px] text-zinc-500 font-semibold select-none">
          {displayIndex}
        </span>
        <span className="text-xl leading-none group-hover:scale-110 transition-transform duration-200">
          {point.emoji}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-[#f0f0f4] text-sm leading-snug font-display">
        {point.title}
      </h3>

      {/* Critique */}
      <p className="mt-1.5 text-zinc-500 text-sm leading-relaxed flex-1">
        {point.critique}
      </p>

      {/* Fix hint */}
      {point.fix && (
        <div className={`mt-3.5 rounded-lg border-l-2 px-3 py-2.5 -mx-1 ${accent.fix}`}>
          <p className="text-xs leading-relaxed">
            <span className="text-[#f0f0f4] font-semibold">Fix: </span>
            <span className="text-zinc-400">{point.fix}</span>
          </p>
        </div>
      )}
    </div>
  );
}
