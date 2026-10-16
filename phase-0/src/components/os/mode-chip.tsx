import { MODE_META } from "@/lib/kiyoshi/catalog";
import type { CognitiveMode } from "@/lib/kiyoshi/types";
import { cn } from "@/lib/utils";

export function ModeChip({
  mode,
  active,
  onClick,
  dim,
}: {
  mode: CognitiveMode;
  active?: boolean;
  onClick?: () => void;
  dim?: boolean;
}) {
  const meta = MODE_META[mode];
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-[background-color,color,opacity] duration-150",
        active ? "bg-accent text-accent-fg" : "bg-bg-subtle text-muted",
        dim && !active && "opacity-50",
        onClick && "min-h-11 hover:text-fg",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          active ? "bg-accent-fg" : "bg-sage",
        )}
      />
      {meta.label}
    </Comp>
  );
}
