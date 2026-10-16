import { MODE_META } from "@/lib/kiyoshi/catalog";
import { useKiyoshi } from "@/lib/kiyoshi/store";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { KermMeters } from "./kerm-meters";
import { LoopStepper } from "./loop-stepper";
import { ModeChip } from "./mode-chip";

export function GovernorView() {
  const storeMode = useKiyoshi((s) => s.mode);
  const last = useKiyoshi((s) => s.lastTrace);
  const transfers = useKiyoshi((s) => s.transfers);
  const loopStep = useKiyoshi((s) => s.loopStep);
  const forcedMode = useKiyoshi((s) => s.forcedMode);
  const mode = last?.transferred ? last.governor.recommendedMode : storeMode;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="rise">
        <p className="font-mono text-2xs uppercase tracking-wider text-muted">Inner mind</p>
        <h2 className="mt-1 text-2xl text-fg">Cognitive Governor</h2>
        <p className="mt-2 max-w-prose text-sm text-muted">
          Audits the mode choice itself — not whether the sentence was useful. Hold, transfer, or veto.
        </p>
      </header>

      <section className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
        <LoopStepper current={loopStep} />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ModeChip mode={mode} active />
          {forcedMode && (
            <Badge tone="warn">Pinned {MODE_META[forcedMode].label}</Badge>
          )}
          {last && (
            <Badge tone={last.transferred ? "warn" : "live"}>
              {last.governor.verdict}
            </Badge>
          )}
        </div>
        {last && (
          <>
            <Separator className="my-4" />
            <dl className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div>
                <dt className="uppercase tracking-wider text-subtle">Confidence</dt>
                <dd className="mt-1 tabular-nums text-fg">
                  {Math.round(last.confidence * 100)}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider text-subtle">Ambiguity</dt>
                <dd className="mt-1 tabular-nums text-fg">
                  {Math.round(last.ambiguity * 100)}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider text-subtle">Risk</dt>
                <dd className="mt-1 tabular-nums text-fg">{Math.round(last.risk * 100)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-fg">{last.governor.audit}</p>
            <p className="mt-2 text-sm text-muted">{last.rationale}</p>
            <KermMeters kerm={last.kerm} className="mt-4" />
          </>
        )}
        {!last && (
          <p className="mt-4 text-sm text-muted">
            No turn yet. Send something ambiguous, or pin Execute on a vague prompt and watch a transfer.
          </p>
        )}
      </section>

      <section>
        <h3 className="text-lg text-fg">Transfer ledger</h3>
        {transfers.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Empty. A transfer is the Governor admitting the wrong epistemology was running.
          </p>
        ) : (
          <ol className="mt-3 space-y-2">
            {transfers.map((t) => (
              <li
                key={t.id}
                className="rounded-lg bg-bg-elevated px-4 py-3 shadow-[var(--shadow-border)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ModeChip mode={t.from} />
                  <span className="text-subtle">→</span>
                  <ModeChip mode={t.to} active />
                  <Badge tone="quiet">{t.discrepancy.replaceAll("_", " ")}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted">{t.reason}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
