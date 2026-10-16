import { LOOP_STEPS } from "@/lib/kiyoshi/catalog";
import type { LoopStep } from "@/lib/kiyoshi/types";
import { cn } from "@/lib/utils";

export function LoopStepper({ current }: { current: LoopStep }) {
  const idx = LOOP_STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {LOOP_STEPS.map((step, i) => {
        const on = idx >= 0 && i <= idx;
        const now = step.id === current;
        return (
          <li key={step.id} className="flex items-center gap-1">
            {i > 0 && (
              <span
                className={cn(
                  "mx-0.5 hidden h-px w-4 sm:block",
                  on ? "bg-sage/70" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-2xs uppercase tracking-wider",
                now && "bg-sage/20 text-sage",
                on && !now && "text-fg",
                !on && "text-subtle",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
