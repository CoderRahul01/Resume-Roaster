import { RoastPoint } from "@/types";

interface RoastCardProps {
  point: RoastPoint;
  index: number;
}

export function RoastCard({ point, index }: RoastCardProps) {
  const displayIndex = String(index + 1).padStart(2, "0");

  return (
    <div
      className="
        group p-5 rounded-xl
        border border-white/[0.07] bg-white/[0.02]
        hover:bg-[#16161f] hover:border-white/[0.12]
        transition-all duration-200
        animate-fade-in flex flex-col
      "
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: "both" }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-zinc-700 tracking-widest select-none">
          {displayIndex}
        </span>
        <span className="text-xl leading-none">{point.emoji}</span>
      </div>
      <h3 className="mt-3 font-semibold text-[#f8f8f8] text-sm leading-snug">
        {point.title}
      </h3>
      <p className="mt-1.5 text-zinc-500 text-sm leading-relaxed flex-1">
        {point.critique}
      </p>
      {point.fix && (
        <p className="mt-3 pt-3 border-t border-white/[0.06] text-xs leading-relaxed">
          <span className="text-[#ff4444] font-semibold">→ Fix: </span>
          <span className="text-zinc-400">{point.fix}</span>
        </p>
      )}
    </div>
  );
}
