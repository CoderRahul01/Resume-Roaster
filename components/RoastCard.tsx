import { RoastPoint } from "@/types";

interface RoastCardProps {
  point: RoastPoint;
  index: number;
}

export function RoastCard({ point, index }: RoastCardProps) {
  return (
    <div
      className="
        group flex items-start gap-4 p-4
        rounded-xl border border-zinc-800/60 bg-zinc-900/30
        border-l-[3px] border-l-red-500/70
        hover:border-zinc-700/60 hover:bg-zinc-900/50
        transition-colors duration-200
        animate-fade-in
      "
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: "both" }}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">{point.emoji}</span>
      <div className="space-y-1 min-w-0">
        <h3 className="font-semibold text-white text-sm leading-snug">{point.title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">{point.critique}</p>
      </div>
    </div>
  );
}
