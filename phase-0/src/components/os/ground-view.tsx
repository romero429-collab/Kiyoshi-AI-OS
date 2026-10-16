import { Play, RotateCcw, StepForward } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  GROUND_STEPS,
  MEMORY_TIERS,
  PIPELINE,
  SCALE,
  SCALE_NOTES,
  SCENARIOS,
  SPECIALISTS,
  STEP_SCALE,
  bandOf,
  rivalsOf,
  seesOf,
  specialist,
} from "@/lib/kiyoshi/ground";
import { useKiyoshi } from "@/lib/kiyoshi/store";
import type { SharedKey } from "@/lib/kiyoshi/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModeChip } from "./mode-chip";

const PHASES = ["Claim", "Speak", "Yield"] as const;

const SHARED_LABEL: Record<SharedKey, string> = {
  intent: "Intent",
  authority: "Authority",
  capability: "Capability",
  evidence: "Evidence",
  result: "Result",
};

const SHARED_KEYS = Object.keys(SHARED_LABEL) as SharedKey[];

export function GroundView() {
  const scenarioId = useKiyoshi((s) => s.groundScenario);
  const index = useKiyoshi((s) => s.groundIndex);
  const log = useKiyoshi((s) => s.groundLog);
  const shared = useKiyoshi((s) => s.groundShared);
  const select = useKiyoshi((s) => s.selectGround);
  const step = useKiyoshi((s) => s.stepGround);
  const reset = useKiyoshi((s) => s.resetGround);
  const setView = useKiyoshi((s) => s.setView);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const last = log[0] ?? null;
  const done = index >= scenario.turns.length;
  const currentStep = last?.step ?? null;
  const actor = last ? specialist(last.actor) : null;
  const yielded = last ? rivalsOf(last).map((id) => specialist(id)) : [];
  const scaleLevel = last ? STEP_SCALE[last.step] : null;
  const band = last ? bandOf(last.actor) : null;
  const sees = last ? seesOf(last.actor) : "all";
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    cardRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [log.length]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="rise">
        <p className="font-mono text-2xs uppercase tracking-wider text-muted">
          Distinct systems · consistent rules
        </p>
        <h2 className="mt-1 text-2xl text-fg">Ground loop</h2>
        <p className="mt-2 max-w-prose text-sm text-muted">
          Kiyoshi does not invent every capability. It is the adaptation layer: existing
          specialists keep their specialties. Red Clover decides who works. Claim, speak,
          yield. The milestone is not “finished.” It is this small organism actually looping.
        </p>
        <button
          type="button"
          className="mt-3 min-h-11 text-sm text-accent hover:underline"
          onClick={() => setView("field")}
        >
          Field notes — Iris, chair, seven domains
        </button>
      </header>

      <ol className="flex flex-wrap gap-1">
        {PIPELINE.map((node) => (
          <li
            key={node}
            className="rounded-full bg-bg-subtle px-2 py-0.5 font-mono text-2xs uppercase tracking-wider text-muted"
          >
            {node}
          </li>
        ))}
      </ol>

      <section className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
        <p className="font-mono text-2xs uppercase tracking-wider text-subtle">Scenario</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <Button
              key={s.id}
              variant={s.id === scenario.id ? "primary" : "secondary"}
              className="min-h-11"
              onClick={() => select(s.id)}
            >
              {s.title}
            </Button>
          ))}
        </div>
        <p className="mt-4 text-sm text-fg">“{scenario.prompt}”</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button className="min-h-11" onClick={() => step()} disabled={done}>
            {index === 0 && !last ? (
              <Play className="size-3.5" />
            ) : (
              <StepForward className="size-3.5" />
            )}
            {done ? "Loop complete" : index === 0 && !last ? "Start organism" : "Next turn"}
          </Button>
          <Button variant="ghost" className="min-h-11" onClick={() => reset()}>
            <RotateCcw className="size-3.5" />
            Reset loop
          </Button>
        </div>
      </section>

      <section>
        <p className="font-mono text-2xs uppercase tracking-wider text-subtle">
          Emergence · this step
        </p>
        <ol className="mt-2 flex flex-wrap gap-1">
          {SCALE.map((level) => {
            const on = scaleLevel === level;
            return (
              <li
                key={level}
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-2xs uppercase tracking-wider",
                  on ? "bg-sage/20 text-sage" : "text-subtle",
                )}
              >
                {level}
              </li>
            );
          })}
        </ol>
        {scaleLevel && (
          <p className="mt-2 text-sm text-muted">{SCALE_NOTES[scaleLevel]}</p>
        )}
      </section>

      <ol className="flex flex-wrap gap-1">
        {GROUND_STEPS.map((s) => (
          <li
            key={s.id}
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-2xs uppercase tracking-wider",
              currentStep === s.id ? "bg-sage/20 text-sage" : "text-subtle",
            )}
          >
            {s.label}
          </li>
        ))}
      </ol>

      <section>
        <p className="font-mono text-2xs uppercase tracking-wider text-subtle">Memory bands</p>
        <ol className="mt-2 flex flex-wrap gap-1">
          {MEMORY_TIERS.map((tier) => {
            const on = band === tier.id;
            return (
              <li
                key={tier.id}
                title={tier.who}
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-2xs uppercase tracking-wider",
                  on ? "bg-sage/20 text-sage" : "bg-bg-subtle text-muted",
                )}
              >
                {tier.label}
              </li>
            );
          })}
        </ol>
        {band && (
          <p className="mt-2 text-sm text-muted">
            {MEMORY_TIERS.find((t) => t.id === band)?.who}
          </p>
        )}
      </section>

      <section>
        <p className="font-mono text-2xs uppercase tracking-wider text-subtle">Specialists</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {SPECIALISTS.map((s) => {
            const on = last?.actor === s.id;
            const yieldedNow = yielded.some((r) => r.id === s.id);
            return (
              <li
                key={s.id}
                className={cn(
                  "rounded-full px-2.5 py-1 font-mono text-2xs uppercase tracking-wider",
                  on && "bg-sage/20 text-sage",
                  yieldedNow && "bg-warn/15 text-warn",
                  !on && !yieldedNow && "bg-bg-subtle text-muted",
                )}
              >
                {s.name}
                {yieldedNow ? " · yielded" : ""}
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-sm text-muted">
          Grok does not have to become Gemini. Casey does not have to hold the universe.
          Gravity is not magnetism. They interoperate under the same rules.
        </p>
      </section>

      {last && actor && (
        <section
          ref={cardRef}
          className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="live">{actor.name}</Badge>
            <Badge tone="quiet">{actor.role}</Badge>
            {yielded.map((r) => (
              <Badge key={r.id} tone="warn">
                {r.name} yielded
              </Badge>
            ))}
            {last.mode && <ModeChip mode={last.mode} active />}
          </div>
          <p className="mt-2 text-sm text-muted">{actor.specialty}</p>
          <ol className="mt-4 flex flex-wrap gap-1">
            {PHASES.map((p) => (
              <li
                key={p}
                className="rounded-full bg-sage/20 px-2 py-0.5 font-mono text-2xs uppercase tracking-wider text-sage"
              >
                {p}
              </li>
            ))}
          </ol>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">Claim</dt>
              <dd className="text-fg">{last.claim}</dd>
            </div>
            <div>
              <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">Speak</dt>
              <dd className="text-fg">{last.speak}</dd>
            </div>
            <div>
              <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">Yield</dt>
              <dd className="text-muted">{last.yield}</dd>
            </div>
          </dl>
        </section>
      )}

      <section className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
        <p className="font-mono text-2xs uppercase tracking-wider text-subtle">Shared state</p>
        <p className="mt-1 text-sm text-muted">
          {last
            ? sees === "all"
              ? `${actor?.name ?? "Orchestrator"} sees the whole board.`
              : `${actor?.name ?? "This node"} sees a local slice. Dimmed keys stay outside this context.`
            : "Local nodes do not all see the same board."}
        </p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {SHARED_KEYS.map((key) => {
            const visible = sees === "all" || sees.includes(key);
            return (
              <div key={key} className={cn(!visible && "opacity-40")}>
                <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">
                  {SHARED_LABEL[key]}
                  {!visible ? " · outside slice" : ""}
                </dt>
                <dd className="text-sm text-fg">{visible ? shared[key] : "—"}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      {done && (
        <section className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
          <p className="font-mono text-2xs uppercase tracking-wider text-sage">Lesson</p>
          <p className="mt-2 text-sm text-fg">{scenario.lesson}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {scenario.id === "drop" && (
              <Button variant="secondary" className="min-h-11" onClick={() => setView("improve")}>
                Test the rule in Improve
              </Button>
            )}
            {(scenario.id === "whole" || scenario.id === "iris" || scenario.id === "chair") && (
              <Button variant="secondary" className="min-h-11" onClick={() => setView("memory")}>
                Open memory bands
              </Button>
            )}
            {scenario.id === "chair" && (
              <Button
                variant="secondary"
                className="min-h-11"
                onClick={() => setView("field")}
              >
                Open Iris stage
              </Button>
            )}
            <Button variant="secondary" className="min-h-11" onClick={() => setView("field")}>
              Field notes
            </Button>
            <Button variant="ghost" className="min-h-11 px-0" onClick={() => setView("agency")}>
              Agency — unplugged operator
            </Button>
          </div>
        </section>
      )}

      {log.length > 1 && (
        <section>
          <h3 className="text-lg text-fg">Turn ledger</h3>
          <ol className="mt-3 space-y-2">
            {log.map((turn, i) => {
              const who = specialist(turn.actor);
              return (
                <li
                  key={`${turn.actor}-${turn.step}-${i}`}
                  className="rounded-lg bg-bg-elevated px-4 py-3 text-sm shadow-[var(--shadow-border)]"
                >
                  <p className="font-mono text-2xs uppercase tracking-wider text-sage">
                    {who.name} · {turn.step}
                  </p>
                  <p className="mt-1 text-muted">{turn.yield}</p>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}
