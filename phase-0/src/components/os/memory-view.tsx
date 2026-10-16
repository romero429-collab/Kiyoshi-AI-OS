import { MEMORY_TIERS } from "@/lib/kiyoshi/ground";
import { useKiyoshi } from "@/lib/kiyoshi/store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TONE = {
  fact: "quiet",
  preference: "live",
  task: "warn",
  rule: "paper",
  insight: "live",
} as const;

function itemBand(key: string) {
  const k = key.toLowerCase();
  if (k.includes("casey") || k.includes("working")) return "working";
  if (k.includes("clover") || k.includes("retrieval") || k.includes("red clover")) {
    return "retrieval";
  }
  if (k.includes("article") || k.includes("charter") || k.includes("constitution")) {
    return "history";
  }
  if (
    k.includes("organization") ||
    k.includes("wholeity") ||
    k.includes("correspondence") ||
    k.includes("map is not")
  ) {
    return "persistent";
  }
  return "specialist";
}

export function MemoryView() {
  const memory = useKiyoshi((s) => s.memory);
  const setView = useKiyoshi((s) => s.setView);
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <header className="rise mb-6">
        <p className="font-mono text-2xs uppercase tracking-wider text-muted">Continuity</p>
        <h2 className="mt-1 text-2xl text-fg">Operational memory</h2>
        <p className="mt-2 text-sm text-muted">
          Not a chat log. Not one context window. Working, persistent, specialist, retrieval,
          history. Casey holds what is relevant now. Overflow is a yield.
        </p>
      </header>
      <ol className="mb-6 grid gap-2 sm:grid-cols-2">
        {MEMORY_TIERS.map((tier) => (
          <li
            key={tier.id}
            className="rounded-xl bg-bg-elevated px-4 py-3 shadow-[var(--shadow-border)]"
          >
            <p className="font-mono text-2xs uppercase tracking-wider text-sage">{tier.label}</p>
            <p className="mt-1 text-sm text-muted">{tier.who}</p>
          </li>
        ))}
      </ol>
      <ul className="space-y-2">
        {memory.map((item) => {
          const band = itemBand(item.key);
          return (
            <li
              key={item.id}
              className="rounded-xl bg-bg-elevated px-4 py-3 shadow-[var(--shadow-border)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={TONE[item.kind]}>{item.kind}</Badge>
                <span className="font-mono text-2xs uppercase tracking-wider text-subtle">
                  {MEMORY_TIERS.find((t) => t.id === band)?.label}
                </span>
                <h3 className="text-sm font-medium text-fg">{item.key}</h3>
              </div>
              <p className="mt-2 text-sm text-muted">{item.value}</p>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className={cn("mt-6 min-h-11 text-sm text-accent hover:underline")}
        onClick={() => setView("ground")}
      >
        Ground writes these from the loop
      </button>
    </div>
  );
}
