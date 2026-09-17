import { Check, Play, RotateCcw } from "lucide-react";
import { MODE_META } from "@/lib/kiyoshi/catalog";
import { applyRule } from "@/lib/kiyoshi/agency";
import { RSI_CASES, RSI_PROPOSAL } from "@/lib/kiyoshi/field-data";
import { useKiyoshi } from "@/lib/kiyoshi/store";
import type { RsiPhase, RsiTrial } from "@/lib/kiyoshi/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModeChip } from "./mode-chip";

const PHASES: { id: RsiPhase; label: string }[] = [
  { id: "observe", label: "Observe" },
  { id: "identify", label: "Identify" },
  { id: "modify", label: "Modify" },
  { id: "test", label: "Test" },
  { id: "evaluate", label: "Evaluate" },
  { id: "retain", label: "Retain" },
];

function runTrials(): RsiTrial[] {
  return RSI_CASES.map((c) => {
    const after = applyRule(c.prompt, c.naive);
    return {
      id: c.id,
      prompt: c.prompt,
      expected: c.expected,
      before: c.naive,
      after,
      improved: after === c.expected && c.naive !== c.expected,
    };
  });
}

export function ImproveView() {
  const artifacts = useKiyoshi((s) => s.artifacts);
  const phase = useKiyoshi((s) => s.rsiPhase);
  const trials = useKiyoshi((s) => s.rsiTrials);
  const retained = useKiyoshi((s) => s.rsiRetained);
  const setPhase = useKiyoshi((s) => s.setRsiPhase);
  const setTrials = useKiyoshi((s) => s.setRsiTrials);
  const markRetained = useKiyoshi((s) => s.markRsiRetained);
  const retainArtifact = useKiyoshi((s) => s.retainArtifact);

  const naiveFail = RSI_CASES.filter((c) => c.naive !== c.expected).length;
  const afterPass = trials.filter((t) => t.after === t.expected).length;
  const beforePass = trials.filter((t) => t.before === t.expected).length;
  const improved = trials.filter((t) => t.improved).length;

  function begin() {
    setTrials([]);
    setPhase("observe");
  }

  function next() {
    if (phase === "idle") {
      begin();
      return;
    }
    if (phase === "observe") setPhase("identify");
    else if (phase === "identify") setPhase("modify");
    else if (phase === "modify") {
      setTrials(runTrials());
      setPhase("test");
    } else if (phase === "test") setPhase("evaluate");
    else if (phase === "evaluate") setPhase("retain");
  }

  function keep() {
    if (retained) return;
    retainArtifact(RSI_PROPOSAL);
    markRetained();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <header className="rise mb-6">
        <p className="font-mono text-2xs uppercase tracking-wider text-muted">
          Observe → identify → modify → test → evaluate → retain
        </p>
        <h2 className="mt-1 text-2xl text-fg">Recursive improvement</h2>
        <p className="mt-2 text-sm text-muted">
          The model does not get smarter. An operational artifact does. Weights stay frozen.
          A routing rule is proposed, run against held-out cases, and kept only if the miss
          rate falls. Article V forbids calling that global correctness.
        </p>
      </header>

      <section className="mb-6 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
        <ol className="flex flex-wrap gap-1">
          {PHASES.map((p) => (
            <li
              key={p.id}
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-2xs uppercase tracking-wider",
                phase === p.id ? "bg-sage/20 text-sage" : "text-subtle",
              )}
            >
              {p.label}
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={next} disabled={phase === "retain"}>
            <Play className="size-3.5" />
            {phase === "idle" ? "Run a cycle" : phase === "retain" ? "Cycle complete" : "Next step"}
          </Button>
          <Button variant="ghost" onClick={() => setPhase("idle")}>
            <RotateCcw className="size-3.5" />
            Reset cycle
          </Button>
        </div>

        {phase === "observe" && (
          <p className="mt-4 text-sm text-muted">
            {naiveFail} of {RSI_CASES.length} held-out prompts fail under the naive keyword
            rule. Failures cluster on underspecified physical work and on meta-audit requests.
          </p>
        )}
        {phase === "identify" && (
          <p className="mt-4 text-sm text-fg">
            Deficiency: the system treats surface verbs as settled intent. That is a routing
            bug, not a missing tool, and not a reason to train the model.
          </p>
        )}
        {phase === "modify" && (
          <div className="mt-4 space-y-2 text-sm">
            <p className="font-mono text-2xs uppercase tracking-wider text-subtle">Before</p>
            <p className="text-muted">{RSI_PROPOSAL.before}</p>
            <p className="font-mono text-2xs uppercase tracking-wider text-subtle">After</p>
            <p className="text-fg">{RSI_PROPOSAL.after}</p>
          </div>
        )}
        {(phase === "test" || phase === "evaluate" || phase === "retain") && trials.length > 0 && (
          <div className="mt-4">
            <p className="font-mono text-2xs uppercase tracking-wider text-muted">
              Pass {beforePass}/{trials.length} → {afterPass}/{trials.length}
              {improved > 0 ? ` · ${improved} improved` : ""}
            </p>
            <ul className="mt-3 space-y-2">
              {trials.map((t) => (
                <li key={t.id} className="rounded-lg bg-bg-subtle px-3 py-3 text-sm">
                  <p className="text-fg">{t.prompt}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <ModeChip mode={t.before} dim />
                    <span className="text-subtle">→</span>
                    <ModeChip mode={t.after} active={t.after === t.expected} />
                    {t.after === t.expected ? (
                      <Badge tone="live">pass</Badge>
                    ) : (
                      <Badge tone="warn">miss</Badge>
                    )}
                    {t.improved && <Badge tone="paper">improved</Badge>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {phase === "evaluate" && (
          <p className="mt-4 text-sm text-muted">
            Improvement is local and evidenced. Article V forbids inferring that the whole
            Governor is now correct. Keep the rule only because held-out cases moved.
          </p>
        )}
        {phase === "retain" && (
          <div className="mt-4">
            <Button onClick={keep} disabled={retained}>
              <Check className="size-3.5" />
              {retained ? "Retained" : "Retain rule"}
            </Button>
            <p className="mt-2 text-sm text-muted">{RSI_PROPOSAL.reason}</p>
          </div>
        )}
      </section>

      <h3 className="text-lg text-fg">Retained artifacts</h3>
      <ol className="mt-3 space-y-3">
        {artifacts.map((a) => (
          <li
            key={a.id}
            className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="paper">{a.kind.replace("_", " ")}</Badge>
              {a.retained && <Badge tone="live">Retained</Badge>}
            </div>
            <h3 className="mt-2 text-lg text-fg">{a.title}</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">Before</dt>
                <dd className="text-muted">{a.before}</dd>
              </div>
              <div>
                <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">After</dt>
                <dd className="text-fg">{a.after}</dd>
              </div>
              <div>
                <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">Why</dt>
                <dd className="text-muted">{a.reason}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted">
        Naive miss labels:{" "}
        {RSI_CASES.filter((c) => c.naive !== c.expected)
          .map((c) => `${MODE_META[c.naive].label} on “${c.id}”`)
          .join(" · ")}
      </p>
    </div>
  );
}
