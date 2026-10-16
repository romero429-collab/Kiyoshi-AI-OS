import { useMemo, useState } from "react";
import {
  COSTUMES,
  IRIS_MODES,
  PHYSICAL_CHAIR,
  PROVENANCE,
  type CostumeId,
  type IrisModeId,
} from "@/lib/kiyoshi/field-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function seenLabel(costume: CostumeId, mode: IrisModeId): string {
  if (mode === "neither") return "—";
  if (mode === "reality") return PHYSICAL_CHAIR.object;
  return COSTUMES.find((c) => c.id === costume)?.label ?? "Chair";
}

function walkLine(costume: CostumeId, mode: IrisModeId): string {
  if (mode === "neither") {
    return "Perception is off. Continuity continues. No walk is issued.";
  }
  if (mode === "reality" || costume === "chair") {
    return "Walk toward the chair. Hands meet the chair. Bands agree.";
  }
  if (costume === "empty") {
    return "Iris shows nothing. Hands still meet a chair at 1.2 m. Omission is not deletion.";
  }
  if (costume === "door") {
    return "Iris shows a doorway. Occupancy is occupied. Walking through is a veto — the chair is still there.";
  }
  const name = COSTUMES.find((c) => c.id === costume)?.label ?? "costume";
  return `Walk toward the ${name.toLowerCase()}. Hands still collide with the chair. The costume did not move the object.`;
}

export function IrisStage({ onPlay }: { onPlay: () => void }) {
  const [mode, setMode] = useState<IrisModeId>("overlay");
  const [costume, setCostume] = useState<CostumeId>("ship");
  const modeNote = IRIS_MODES.find((m) => m.id === mode)!;
  const seen = seenLabel(costume, mode);
  const diverges = mode !== "reality" && mode !== "neither" && costume !== "chair";
  const showPhysical = mode !== "neither";
  const showCostume =
    mode === "simulation" || mode === "overlay" || mode === "swap";
  const provenance = useMemo(() => {
    if (mode === "neither") return PROVENANCE.find((p) => p.id === "unknown")!;
    if (mode === "reality" || costume === "chair") {
      return PROVENANCE.find((p) => p.id === "observed")!;
    }
    return PROVENANCE.find((p) => p.id === "simulated")!;
  }, [mode, costume]);

  return (
    <section className="mb-8">
      <p className="font-mono text-2xs uppercase tracking-wider text-sage">
        Selectable perception
      </p>
      <h3 className="mt-1 text-lg text-fg">Iris stage</h3>
      <p className="mt-1 text-sm text-muted">
        The iris of an eye controls what gets through. Iris is Kiyoshi’s perceptual
        relationship to the world — not a headset, not a game engine. The object can stay a
        chair while the eye sees a ship. Physics does not follow the costume.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {IRIS_MODES.map((item) => (
          <Button
            key={item.id}
            variant={mode === item.id ? "primary" : "secondary"}
            className="min-h-11"
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted">{modeNote.line}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {COSTUMES.map((item) => (
          <Button
            key={item.id}
            variant={costume === item.id ? "primary" : "ghost"}
            className="min-h-11"
            onClick={() => setCostume(item.id)}
            disabled={mode === "neither"}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
          <p className="font-mono text-2xs uppercase tracking-wider text-subtle">
            Physical · never lies
          </p>
          <div
            className={cn(
              "relative mt-3 h-36 overflow-hidden rounded-lg bg-bg-subtle",
              !showPhysical && "opacity-30",
            )}
          >
            <div className="absolute inset-x-0 bottom-0 h-2 bg-sage/30" />
            <div className="absolute bottom-5 left-1/2 w-16 -translate-x-1/2">
              <div className="h-14 rounded-sm bg-sage/40 shadow-[var(--shadow-border)]" />
              <p className="mt-1 text-center font-mono text-2xs uppercase tracking-wider text-sage">
                {PHYSICAL_CHAIR.object}
              </p>
            </div>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">
                Occupancy
              </dt>
              <dd className="text-fg">{PHYSICAL_CHAIR.occupancy}</dd>
            </div>
            <div>
              <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">
                Location
              </dt>
              <dd className="text-fg">{PHYSICAL_CHAIR.location}</dd>
            </div>
            <div>
              <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">
                Confidence
              </dt>
              <dd className="text-fg">{PHYSICAL_CHAIR.confidence}</dd>
            </div>
            <div>
              <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">
                Provenance
              </dt>
              <dd className="text-fg">{PHYSICAL_CHAIR.provenance}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
          <p className="font-mono text-2xs uppercase tracking-wider text-subtle">
            Iris sees
          </p>
          <div
            className={cn(
              "relative mt-3 h-36 overflow-hidden rounded-lg bg-bg-subtle",
              mode === "neither" && "opacity-30",
            )}
          >
            <div className="absolute inset-x-0 bottom-0 h-2 bg-border" />
            {showCostume && costume !== "empty" && (
              <div
                className={cn(
                  "absolute bottom-5 w-16",
                  mode === "overlay" || mode === "swap"
                    ? "left-[58%] -translate-x-1/2"
                    : "left-1/2 -translate-x-1/2",
                )}
              >
                <div
                  className={cn(
                    "h-14 rounded-sm shadow-[var(--shadow-border)]",
                    diverges ? "bg-warn/35" : "bg-sage/40",
                  )}
                />
                <p
                  className={cn(
                    "mt-1 text-center font-mono text-2xs uppercase tracking-wider",
                    diverges ? "text-warn" : "text-sage",
                  )}
                >
                  {seen}
                </p>
              </div>
            )}
            {showCostume && costume === "empty" && (
              <p className="absolute inset-0 flex items-center justify-center font-mono text-2xs uppercase tracking-wider text-subtle">
                Omitted
              </p>
            )}
            {mode === "reality" && (
              <div className="absolute bottom-5 left-1/2 w-16 -translate-x-1/2">
                <div className="h-14 rounded-sm bg-sage/40 shadow-[var(--shadow-border)]" />
                <p className="mt-1 text-center font-mono text-2xs uppercase tracking-wider text-sage">
                  {PHYSICAL_CHAIR.object}
                </p>
              </div>
            )}
            {mode === "neither" && (
              <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-muted">
                Perception suspended
              </p>
            )}
            {mode === "overlay" && diverges && (
              <div className="absolute bottom-5 left-[38%] w-12 -translate-x-1/2 opacity-50">
                <div className="h-10 rounded-sm bg-sage/30" />
              </div>
            )}
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">
                Seen
              </dt>
              <dd className="text-fg">{seen}</dd>
            </div>
            <div>
              <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">
                Provenance
              </dt>
              <dd className="text-fg">{provenance.label}</dd>
            </div>
            <div className="col-span-2">
              <dt className="font-mono text-2xs uppercase tracking-wider text-subtle">
                Identity
              </dt>
              <dd className="text-fg">
                {diverges
                  ? "Costume ≠ object. Occupancy stays with the chair."
                  : mode === "neither"
                    ? "Object unchanged. Eyes closed."
                    : "Bands agree. Chair is chair."}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={diverges ? "warn" : mode === "neither" ? "quiet" : "live"}>
            {diverges ? "Substitution" : mode === "neither" ? "Suspended" : "Aligned"}
          </Badge>
          <Badge tone="quiet">{provenance.label}</Badge>
        </div>
        <p className="mt-2 text-sm text-fg">{walkLine(costume, mode)}</p>
        <p className="mt-2 text-sm text-muted">{provenance.line}</p>
      </div>

      <Button variant="secondary" className="mt-4 min-h-11" onClick={onPlay}>
        Play the chair on Ground
      </Button>
    </section>
  );
}
