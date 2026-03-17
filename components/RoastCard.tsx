import { RoastPoint } from "@/types";

interface RoastCardProps {
  point: RoastPoint;
  index: number;
}

export function RoastCard({ point, index }: RoastCardProps) {
  return (
    <div
      className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/60 border-l-4 border-l-red-500 animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "both" }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{point.emoji}</span>
        <div>
          <h3 className="font-semibold text-white mb-1">{point.title}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{point.critique}</p>
        </div>
      </div>
    </div>
  );
}
