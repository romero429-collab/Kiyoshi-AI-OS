import { cn } from "@/lib/utils";

export function LotusMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("text-accent", className)}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M16 5.5c2.4 3.8 3.2 6.8 3.2 9.6-2.4-1.3-4.1-3-3.2-9.6Z"
        opacity="0.95"
      />
      <path
        fill="currentColor"
        d="M8.6 11.2c4.4 1.9 6.8 4 8.4 7-3.6-1.2-6.6-2.4-8.4-7Z"
        opacity="0.75"
      />
      <path
        fill="currentColor"
        d="M23.4 11.2c-4.4 1.9-6.8 4-8.4 7 3.6-1.2 6.6-2.4 8.4-7Z"
        opacity="0.75"
      />
      <circle cx="16" cy="21.2" r="2.15" fill="currentColor" />
    </svg>
  );
}
