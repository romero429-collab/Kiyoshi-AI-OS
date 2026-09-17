import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-2xs font-medium tracking-wide uppercase",
  {
    variants: {
      tone: {
        quiet: "bg-bg-subtle text-muted",
        live: "bg-sage/15 text-sage",
        warn: "bg-warn/15 text-warn",
        danger: "bg-danger/15 text-danger",
        paper: "bg-accent text-accent-fg",
      },
    },
    defaultVariants: { tone: "quiet" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone, className }))} {...props} />;
}
