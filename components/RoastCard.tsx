import { RoastPoint } from "@/types";

interface RoastCardProps {
  point: RoastPoint;
  index: number;
}

const SEVERITY_COLORS = [
  "group-hover:border-l-[#ff4444]",
  "group-hover:border-l-orange-500",
  "group-hover:border-l-amber-400",
  "group-hover:border-l-[#ff4444]",
  "group-hover:border-l-orange-500",
  "group-hover:border-l-amber-400",
];

export function RoastCard({ point, index }: RoastCardProps) {
  const displayIndex = String(index + 1).padStart(2, "0");
  const accentColor = SEVERITY_COLORS[index % SEVERITY_COLORS.length];

  return (
    <div
      className={`
        group p-5 rounded-xl
        border-l-2 border-l-transparent border border-white/[0.07]
        bg-white/[0.02]
        hover:bg-[#13131a] hover:border-white/[0.12]
        ${accentColor}
        transition-all duration-200
        animate-fade-in flex flex-col cursor-default
      `}
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: "both" }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] text-zinc-700 tracking-widest select-none">
          {displayIndex}
        </span>
        <span className="text-xl leading-none group-hover:scale-110 transition-transform duration-200">
          {point.emoji}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-[#f8f8f8] text-sm leading-snug">
        {point.title}
      </h3>

      {/* Critique */}
      <p className="mt-1.5 text-zinc-500 text-sm leading-relaxed flex-1">
        {point.critique}
      </p>

      {/* Fix hint */}
      {point.fix && (
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          <p className="text-xs leading-relaxed">
            <span className="text-[#ff4444] font-bold">→ Fix: </span>
            <span className="text-zinc-400">{point.fix}</span>
          </p>
        </div>
      )}
    </div>
  );
}
