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
        animate-fade-in
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
      <p className="mt-1.5 text-zinc-500 text-sm leading-relaxed">
        {point.critique}
      </p>
    </div>
  );
}
