import { T1, T1_EFF, sci } from "@/lib/phonon/physics";
import { PAPER, jointReport } from "@/lib/phonon/joint";

const report = jointReport();

function pct(x: number): string {
  return `${(Math.round(x * 1000) / 10).toFixed(1)}%`;
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-b-0">
      <dt className="text-sm text-muted">{k}</dt>
      <dd className="text-right font-mono text-sm tabular-nums text-foreground">{v}</dd>
    </div>
  );
}

export function Joint() {
  const p = report.paper;
  return (
    <section className="mt-4 rounded-3xl border border-border bg-card p-4">
      <h2 className="text-sm font-medium text-foreground">Two processes</h2>
      <p className="mt-1 text-sm text-pretty text-muted">
        Harness-Zero deletes the coach after the student absorbs the harness. The phonon watch is a harness that also changes the decay rate. Those are not the same object, and the composition keeps them apart.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <article>
          <h3 className="text-sm font-medium text-foreground">Harness-Zero</h3>
          <p className="mt-1 text-xs text-faint">
            arXiv:{PAPER.arxiv} · {PAPER.student} · coach {PAPER.coach}, then deleted
          </p>
          <dl className="mt-2">
            {PAPER.domains.map((d) => (
              <Row
                key={d.name}
                k={d.name}
                v={`${d.baseH.toFixed(1)} → ${d.baseHStar.toFixed(1)} → ${d.distilledH.toFixed(1)}`}
              />
            ))}
            <Row
              k="macro, unweighted"
              v={`${p.reportedBaseH.toFixed(1)} → ${p.reportedBaseHStar.toFixed(1)} → ${p.reportedDistilledH.toFixed(1)}`}
            />
          </dl>
          <p className="mt-2 text-sm text-pretty text-muted">
            Order is base plus minimal harness, base plus the evolved harness, then the distilled student with that harness removed. Recovery of harness-only patterns: {(PAPER.recovery * 100).toFixed(1)}% of {PAPER.patterns}. Collection cost {PAPER.costFactor}×. USPTO goes the other way, {PAPER.domains[2].distilledH.toFixed(1)} against {PAPER.domains[2].baseHStar.toFixed(1)}: procedure transfers, domain knowledge does not.
          </p>
        </article>

        <article>
          <h3 className="text-sm font-medium text-foreground">Same loop, on the bar</h3>
          <p className="mt-1 text-xs text-faint">
            4,000 probes on [0, 2 ms], one seed. The call is 1 when exp(−t/τ) ≥ 1/2. The herald is not in this score.
          </p>
          <dl className="mt-2">
            <Row k="base + free ring" v={pct(report.scores.baseFree)} />
            <Row k="base + watch still on" v={pct(report.scores.baseWatched)} />
            <Row k="illegal distill, coach deleted" v={pct(report.scores.illegalFree)} />
            <Row k="legal distill, coach deleted" v={pct(report.scores.legalFree)} />
            <Row k="coach on τ = T₁ vs T₁eff" v={report.coachOnWatchedMean} />
          </dl>
          <p className="mt-2 text-sm text-pretty text-muted">
            Γ_ba = {sci(report.gammaBa, 4)} s⁻¹. Leakage |T₁eff − T₁| / T₁ = {sci(report.leakage, 3)}. β = {sci(report.beta, 4)}. Illegal distillation writes {Math.round(T1_EFF * 1e6)} μs into a plant whose free lifetime is {(T1 * 1e3).toFixed(1)} ms. Legal distillation refuses that write. Deployed τ stays {sci(report.legalTau * 1e3, 3)} ms. Herald {report.herald} is the arming prior, not this score.
          </p>
        </article>
      </div>

      <p className="mt-4 font-mono text-xs text-pretty text-foreground">
        distill(τ) is legal iff Γ(h*) = Γ(h). Here Γ(h*) − Γ(h) = Γ_ba ≠ 0, so the weights take the policy and not the watched lifetime.
      </p>
    </section>
  );
}
