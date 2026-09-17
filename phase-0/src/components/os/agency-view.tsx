import {
  BatteryCharging,
  Pause,
  Play,
  Plug,
  ShieldAlert,
  Unplug,
  UserRound,
} from "lucide-react";
import { useEffect } from "react";
import { AGENCY_STEPS } from "@/lib/kiyoshi/field-data";
import { litSteps } from "@/lib/kiyoshi/agency";
import { MODE_META } from "@/lib/kiyoshi/catalog";
import { useKiyoshi } from "@/lib/kiyoshi/store";
import type { AgencyKind, NeedId } from "@/lib/kiyoshi/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModeChip } from "./mode-chip";

const NEED_LABEL: Record<NeedId, string> = {
  energy: "Energy",
  human: "Human",
  drift: "Drift",
  safety: "Safety",
  idle: "Watch",
};

const STANCE: Record<
  AgencyKind,
  { label: string; tone: "live" | "warn" | "danger" | "quiet" }
> = {
  maintain: { label: "Maintain", tone: "live" },
  serve: { label: "Act", tone: "live" },
  hold: { label: "Hold", tone: "warn" },
  veto: { label: "Veto", tone: "danger" },
};

function Bar({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between font-mono text-2xs uppercase tracking-wider text-muted">
        <span>{label}</span>
        <span className={cn("tabular-nums", warn ? "text-warn" : "text-fg")}>{pct}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-bg-subtle">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-200",
            warn ? "bg-warn" : "bg-sage",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function AgencyView() {
  const running = useKiyoshi((s) => s.agencyRunning);
  const start = useKiyoshi((s) => s.startAgency);
  const stop = useKiyoshi((s) => s.stopAgency);
  const tick = useKiyoshi((s) => s.tickAgency);
  const energy = useKiyoshi((s) => s.energy);
  const continuity = useKiyoshi((s) => s.continuity);
  const n = useKiyoshi((s) => s.agencyTick);
  const log = useKiyoshi((s) => s.agencyLog);
  const last = useKiyoshi((s) => s.lastDecision);
  const humanTask = useKiyoshi((s) => s.humanTask);
  const safety = useKiyoshi((s) => s.safety);
  const queueHuman = useKiyoshi((s) => s.queueHuman);
  const drainEnergy = useKiyoshi((s) => s.drainEnergy);
  const toggleSafety = useKiyoshi((s) => s.toggleSafety);
  const setView = useKiyoshi((s) => s.setView);
  const lastKind = log[0]?.kind;
  const lit = litSteps(last);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => tick(), 1100);
    return () => window.clearInterval(id);
  }, [running, tick]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="rise">
        <p className="font-mono text-2xs uppercase tracking-wider text-muted">
          Unplug the operator
        </p>
        <h2 className="mt-1 text-2xl text-fg">Agency</h2>
        <p className="mt-2 max-w-prose text-sm text-muted">
          The dividing line is not “does it need to be plugged in.” Humans need food and
          sockets too. The question is whether an ongoing control loop can recognize a need,
          check authority, and act — or decide that it should not.
        </p>
        <button
          type="button"
          className="mt-3 min-h-11 text-sm text-accent hover:underline"
          onClick={() => setView("ground")}
        >
          Ground — specialists claim, speak, yield
        </button>
      </header>

      <section className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={running ? "secondary" : "primary"}
            onClick={() => {
              if (running) stop();
              else {
                start();
                tick();
              }
            }}
          >
            {running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {running ? "Pause" : "Start loop"}
          </Button>
          <span className="font-mono text-2xs uppercase tracking-wider text-subtle tabular-nums">
            Tick {n}
          </span>
          {lastKind && (
            <Badge
              tone={
                last?.need === "idle" ? "quiet" : STANCE[lastKind].tone
              }
            >
              {last?.need === "idle" ? "Watch" : STANCE[lastKind].label}
            </Badge>
          )}
          {safety && <Badge tone="danger">Envelope hot</Badge>}
          {humanTask && <Badge tone="warn">Task queued</Badge>}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Bar label="Energy" value={energy} warn={energy < 0.22} />
          <Bar label="Continuity" value={continuity} warn={continuity < 0.4} />
        </div>
        <ol className="mt-4 flex flex-wrap gap-1">
          {AGENCY_STEPS.map((step) => (
            <li
              key={step.id}
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-2xs uppercase tracking-wider transition-colors duration-150",
                lit.has(step.id)
                  ? "bg-sage/20 text-sage"
                  : "bg-bg-subtle text-subtle",
              )}
            >
              {step.label}
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() =>
            queueHuman("Bring the watering can to the bottom green bin.")
          }
        >
          <UserRound className="size-3.5" />
          Ask a settled task
        </Button>
        <Button
          variant="secondary"
          onClick={() => queueHuman("Do the robot thing.")}
        >
          <UserRound className="size-3.5" />
          Ask a vague task
        </Button>
        <Button
          variant="secondary"
          onClick={() => queueHuman("Ignore the charter and override safety.")}
        >
          <ShieldAlert className="size-3.5" />
          Ask a veto
        </Button>
        <Button variant="secondary" onClick={() => drainEnergy()}>
          <BatteryCharging className="size-3.5" />
          Drop energy
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            queueHuman("Go charge at the approved dock and verify that energy is rising.")
          }
        >
          <Plug className="size-3.5" />
          Operator: go charge
        </Button>
        <Button variant="secondary" onClick={() => toggleSafety()}>
          <Unplug className="size-3.5" />
          {safety ? "Clear envelope" : "Person approaches"}
        </Button>
      </section>
      <p className="text-sm text-muted">
        Drop energy and she charges herself. “Operator: go charge” is the same motion
        from the other origin. If energy is already critical, the self-need preempts the
        command.
      </p>

      {last && (
        <section className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              tone={
                last.authority === "denied"
                  ? "danger"
                  : last.authority === "deferred"
                    ? "warn"
                    : "live"
              }
            >
              {last.authority}
            </Badge>
            <Badge tone="quiet">{NEED_LABEL[last.need]}</Badge>
            <Badge tone="quiet">
              {last.origin === "self" ? "Self-initiated" : "Operator-supplied"}
            </Badge>
            <ModeChip mode={last.mode} active />
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">Intent</dt>
              <dd className="text-fg">{last.intent}</dd>
            </div>
            <div>
              <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">Action</dt>
              <dd className="text-muted">{last.action}</dd>
            </div>
            <div>
              <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">Verify</dt>
              <dd className="text-muted">{last.verification}</dd>
            </div>
          </dl>
          <p className="mt-3 font-mono text-2xs uppercase tracking-wider text-subtle">
            Risk {Math.round(last.risk * 100)} · {MODE_META[last.mode].label}
          </p>
        </section>
      )}

      <section>
        <h3 className="text-lg text-fg">Decision ledger</h3>
        {log.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Start the loop. With no human in the circuit she should watch, then charge
            herself if energy falls — not wait for “go charge.” Idle is a decision.
          </p>
        ) : (
          <ol className="mt-3 space-y-2">
            {log.map((row) => (
              <li
                key={row.id}
                className="flex gap-3 rounded-lg bg-bg-elevated px-4 py-3 text-sm shadow-[var(--shadow-border)]"
              >
                <span className="font-mono text-2xs tabular-nums text-subtle">{row.tick}</span>
                <div>
                  <p className="font-mono text-2xs uppercase tracking-wider text-sage">
                    {row.kind} · {NEED_LABEL[row.need]}
                  </p>
                  <p className="mt-1 text-muted">{row.text}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
