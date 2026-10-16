import type { Kerm } from "@/lib/kiyoshi/types";
import { cn } from "@/lib/utils";

function Meter({ label, value }: { label: string; value: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between font-mono text-2xs uppercase tracking-wider text-muted">
        <span>{label}</span>
        <span className="tabular-nums text-fg">{pct}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-bg-subtle">
        <div
          className="h-full rounded-full bg-sage transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function KermMeters({ kerm, className }: { kerm: Kerm; className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      <Meter label="Attention" value={kerm.attention} />
      <Meter label="Compute" value={kerm.compute} />
      <Meter label="Risk" value={kerm.risk} />
    </div>
  );
}
