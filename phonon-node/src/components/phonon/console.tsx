import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, ComposedChart, Line, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  DT_CHECK,
  F_M,
  HERALD_F,
  M_EFF,
  T1,
  T1_EFF,
  T_BATH,
  T_QUBIT,
  ledgerAt,
  sci,
} from "@/lib/phonon/physics";
import { usePhonon, type Jump } from "@/lib/phonon/store";

function Engine() {
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      usePhonon.getState().advance(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const arm = window.setTimeout(() => {
      if (!usePhonon.getState().armed) usePhonon.getState().arm();
    }, 400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(arm);
    };
  }, []);
  return null;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <div className="text-xs text-faint">{label}</div>
      <div className="mt-1 font-mono text-lg tabular-nums text-foreground">{value}</div>
    </div>
  );
}

export function Header() {
  const n = usePhonon((s) => s.n);
  const t = usePhonon((s) => s.t);
  const p = usePhonon((s) => s.p);
  const mode = usePhonon((s) => s.mode);
  const armed = usePhonon((s) => s.armed);

  return (
    <header>
      <Engine />
      <p className="text-xs font-medium tracking-wide text-faint">KIYOSHI</p>
      <h1 className="mt-2 text-3xl font-medium tracking-tight text-balance text-foreground">
        Phonon × harness
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-pretty text-muted">
        The bar is counted one phonon at a time. The watch that counts it is a harness. That harness changes the decay rate, so it is not written into the weights when the coach is deleted.
      </p>
      <div className="mt-6 grid grid-cols-3 gap-2">
        <Stat label="n" value={armed ? String(n) : "—"} />
        <Stat label="lab time" value={armed ? `${Math.round(t * 1e6)} μs` : "—"} />
        <Stat
          label={mode === "watched" ? "P(n=1)" : "survival"}
          value={armed ? p.toFixed(2) : "—"}
        />
      </div>
    </header>
  );
}

export function Controls() {
  const mode = usePhonon((s) => s.mode);
  const running = usePhonon((s) => s.running);
  const repeat = usePhonon((s) => s.repeat);
  const dilation = usePhonon((s) => s.dilation);
  const setMode = usePhonon((s) => s.setMode);
  const toggleRun = usePhonon((s) => s.toggleRun);
  const toggleRepeat = usePhonon((s) => s.toggleRepeat);
  const setDilation = usePhonon((s) => s.setDilation);
  const arm = usePhonon((s) => s.arm);

  return (
    <section className="mt-4 rounded-3xl border border-border bg-card p-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={arm}
          className="h-11 rounded-lg bg-foreground px-3 text-sm font-medium text-background"
        >
          Arm |1⟩
        </button>
        <button
          type="button"
          onClick={toggleRun}
          className="h-11 rounded-lg border border-border px-3 text-sm font-medium text-foreground"
        >
          {running ? "Pause" : "Run"}
        </button>
        <button
          type="button"
          onClick={() => setMode("watched")}
          className={
            "h-11 rounded-lg border px-3 text-sm font-medium " +
            (mode === "watched"
              ? "border-foreground bg-foreground text-background"
              : "border-border text-foreground")
          }
        >
          Watched
        </button>
        <button
          type="button"
          onClick={() => setMode("free")}
          className={
            "h-11 rounded-lg border px-3 text-sm font-medium " +
            (mode === "free"
              ? "border-foreground bg-foreground text-background"
              : "border-border text-foreground")
          }
        >
          Free ring
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <label className="text-sm text-muted" htmlFor="dilation">
          Slowdown ×{Math.round(dilation).toLocaleString("en-US")}
        </label>
        <button type="button" onClick={toggleRepeat} className="text-sm text-foreground">
          {repeat ? "Repeat on" : "Repeat off"}
        </button>
      </div>
      <input
        id="dilation"
        className="mt-2 h-11 w-full accent-accent"
        type="range"
        min={1500}
        max={20000}
        step={100}
        value={dilation}
        onChange={(e) => setDilation(Number(e.target.value))}
      />
      <p className="mt-2 text-xs text-faint">
        Watched lifetime {Math.round(T1_EFF * 1e6)} μs. Free lifetime {(T1 * 1e3).toFixed(1)} ms. Checks every {Math.round(DT_CHECK * 1e6)} μs.
      </p>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-b-0">
      <dt className="text-sm text-muted">{k}</dt>
      <dd className="text-right font-mono text-sm tabular-nums text-foreground">{v}</dd>
    </div>
  );
}

export function Ledger() {
  const lab = ledgerAt(T_BATH);
  return (
    <section className="rounded-3xl border border-border bg-card p-4">
      <h2 className="text-sm font-medium text-foreground">Ledger at 36 mK</h2>
      <p className="mt-1 font-mono text-xs text-pretty text-faint">
        H = ωₘ b†b + ½(ω_ge + 2χ b†b) σ_z
      </p>
      <dl className="mt-3">
        <Row k="ωₘ / 2π" v={`${lab.fGHz.toFixed(3)} GHz`} />
        <Row k="χ / 2π" v={`${lab.chiKHz.toFixed(0)} kHz`} />
        <Row k="2χ / 2π" v={`${lab.twoChiKHz.toFixed(0)} kHz / phonon`} />
        <Row k="m_eff" v={`${lab.mPg} pg`} />
        <Row k="ℏω" v={`${sci(lab.eUeV, 4)} μeV`} />
        <Row k="ℏω / k_B" v={`${sci(lab.eKelvin, 4)} K`} />
        <Row k="x_zpf" v={`${sci(lab.xFm, 3)} fm`} />
        <Row k="Q = ω T₁" v={sci(lab.q, 3)} />
        <Row k="440 Hz fork, same Q" v={`${sci(lab.forkHours, 3)} h`} />
        <Row k="n_th (36 mK)" v={sci(lab.nTh, 3)} />
        <Row k="β = T₁ / T₁eff" v={sci(lab.beta, 4)} />
        <Row k="back-action / check" v={`${(lab.pBa * 100).toFixed(2)}%`} />
        <Row k="total removal / check" v={`${(lab.pCheck * 100).toFixed(2)}%`} />
        <Row k="six-shot flat prior" v={`${(lab.sixFlat * 100).toFixed(1)}%`} />
        <Row k="herald stored" v={`${Math.round(HERALD_F * 100)}%`} />
      </dl>
    </section>
  );
}

export function Belief() {
  const bits = usePhonon((s) => s.bits);
  const streak = usePhonon((s) => s.streak);
  const checks = usePhonon((s) => s.checks);
  const p = usePhonon((s) => s.p);
  const heraldOk = usePhonon((s) => s.heraldOk);
  const heraldMiss = usePhonon((s) => s.heraldMiss);
  const six = ledgerAt(T_BATH).sixFlat;

  return (
    <section className="rounded-3xl border border-border bg-card p-4">
      <h2 className="text-sm font-medium text-foreground">Readout</h2>
      <p className="mt-1 text-sm text-pretty text-muted">
        One check is right about two times in three. From a flat prior, six agreeing shots give {six.toFixed(3)}, which is 64/65, not 85%. The 85% figure is the paper’s herald fidelity. That is the prior Kiyoshi stores.
      </p>
      <div className="mt-4 font-mono text-2xl tabular-nums text-foreground">{p.toFixed(3)}</div>
      <p className="text-xs text-faint">live posterior · streak {streak} · checks {checks}</p>
      <div className="mt-4 flex flex-wrap gap-1" aria-hidden="true">
        {bits.length === 0 && <span className="text-xs text-faint">Parity bits appear while watched.</span>}
        {bits.map((bit, i) => (
          <span
            key={`${bit.t}-${i}`}
            className={
              "inline-flex h-6 w-6 items-center justify-center rounded-lg font-mono text-xs " +
              (bit.match ? "bg-foreground text-background" : "border border-border text-faint")
            }
          >
            {bit.q}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs text-faint">
        Heralds {heraldOk} held · {heraldMiss} missed. Qubit bath {T_QUBIT * 1e3} mK, mechanics {T_BATH * 1e3} mK.
      </p>
    </section>
  );
}

const PRESETS = [
  { label: "36 mK", k: 0.036 },
  { label: "1 K", k: 1 },
  { label: "4.2 K", k: 4.2 },
  { label: "310 K", k: 310 },
];

export function Claims() {
  const [temp, setTemp] = useState(0.036);
  const row = ledgerAt(temp);
  const tempLabel = temp < 1 ? `${sci(temp * 1e3, 3)} mK` : `${sci(temp, 3)} K`;

  return (
    <section className="mt-4 rounded-3xl border border-border bg-card p-4">
      <h2 className="text-sm font-medium text-foreground">What enters Kiyoshi</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <article>
          <h3 className="text-sm font-medium text-foreground">Measured</h3>
          <p className="mt-2 text-sm text-pretty text-muted">
            Safavi-Naeini, Makihara, and Szakiel watched a {row.mPg} pg lithium-niobate phononic crystal at {F_M / 1e9} GHz lose one phonon in one step. Alone it rings for {T1 * 1e3} ms. Under parity checks every {DT_CHECK * 1e6} μs the lifetime is {T1_EFF * 1e6} μs. Gap to the tantalum transmon: 75 nm.
          </p>
        </article>
        <article>
          <h3 className="text-sm font-medium text-foreground">Claimed in the clip</h3>
          <p className="mt-2 text-sm text-pretty text-muted">
            Dr. Rick Pescatore treats that result as a path to brain magnetometry, a touchless heartbeat, and temperature inside a cell. Those couplings are not in this Hamiltonian. There is no magnetic term. A 0.1 m/s² chest acceleration on this mass is {sci(ledgerAt(T_BATH).heartOverZpf, 2)} of the force that moves the bar by one zero-point. The mass is too small. Temperature does not fix it.
          </p>
        </article>
        <article>
          <h3 className="text-sm font-medium text-foreground">Stored</h3>
          <p className="mt-2 text-sm text-pretty text-muted">
            The node is a Fock meter. Back-action factor β = {sci(ledgerAt(T_BATH).beta, 4)}. A 50 kDa mass at an antinode shifts the resonance by {sci(ledgerAt(T_BATH).proteinDf, 3)} Hz, about {sci(ledgerAt(T_BATH).proteinLines, 2)} cold linewidths. That mass channel is cryogenic and vacuum. It is not a cell.
          </p>
        </article>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-medium text-foreground">Same mode, other temperature</h3>
          <span className="font-mono text-sm tabular-nums text-foreground">{tempLabel}</span>
        </div>
        <input
          className="mt-3 h-11 w-full accent-accent"
          type="range"
          min={0}
          max={1000}
          value={Math.round(((Math.log(temp) - Math.log(0.036)) / (Math.log(310) - Math.log(0.036))) * 1000)}
          onChange={(e) => {
            const u = Number(e.target.value) / 1000;
            const logT = Math.log(0.036) + u * (Math.log(310) - Math.log(0.036));
            setTemp(Math.exp(logT));
          }}
          aria-label="Temperature"
        />
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setTemp(preset.k)}
              className="h-11 rounded-lg border border-border text-sm text-foreground"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <dl className="mt-4">
          <Row k="n_th" v={sci(row.nTh, 4)} />
          <Row k="ℏω / kT" v={sci(row.xOverK, 3)} />
          <Row k="√S_FF" v={`${sci(row.forceNoise, 3)} N/√Hz`} />
          <Row k="f for n_th = 0.01" v={`${sci(row.fForGround / 1e12, 3)} THz`} />
          <Row k="single-phonon jump" v={row.resolvable ? "visible" : "washed out"} />
        </dl>
        <p className="mt-3 text-sm text-pretty text-muted">
          {row.resolvable
            ? "Thermal occupation is well below one. A jump from 1 to 0 is an event you can point at."
            : `Thermal occupation is ${sci(row.nTh, 3)}. The mode is a hot cloud, not a two-level jump. Counting one phonon at this temperature wants a mode near ${sci(row.fForGround / 1e12, 3)} THz, not ${F_M / 1e9} GHz.`}
        </p>
      </div>
    </section>
  );
}

function binsFor(jumps: Jump[], mode: "free" | "watched") {
  const tauUs = (mode === "watched" ? T1_EFF : T1) * 1e6;
  const xs = jumps.filter((j) => j.mode === mode).map((j) => j.tUs);
  const span = 4 * tauUs;
  const nBins = 24;
  const width = span / nBins;
  const counts = new Array<number>(nBins).fill(0);
  for (const t of xs) {
    if (t < 0 || t >= span) continue;
    counts[Math.min(nBins - 1, Math.floor(t / width))] += 1;
  }
  const n = xs.length;
  return counts.map((count, i) => {
    const lo = i * width;
    const hi = lo + width;
    const expected = n * (Math.exp(-lo / tauUs) - Math.exp(-hi / tauUs));
    return {
      us: Math.round(lo + width / 2),
      count,
      expected,
    };
  });
}

export function Ensemble() {
  const jumps = usePhonon((s) => s.jumps);
  const mode = usePhonon((s) => s.mode);
  const sample = usePhonon((s) => s.sampleEnsemble);
  const clear = usePhonon((s) => s.clearJumps);
  const data = useMemo(() => binsFor(jumps, mode), [jumps, mode]);
  const xs = jumps.filter((j) => j.mode === mode);
  const mean = xs.length ? xs.reduce((a, j) => a + j.tUs, 0) / xs.length : null;
  const tauUs = (mode === "watched" ? T1_EFF : T1) * 1e6;

  return (
    <section className="mt-4 rounded-3xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-foreground">Jump times</h2>
          <p className="mt-1 text-sm text-muted">
            {xs.length} draws · mean {mean === null ? "—" : `${Math.round(mean)} μs`} · τ = {Math.round(tauUs)} μs
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => sample(2000)}
            className="h-11 rounded-lg bg-foreground px-3 text-sm font-medium text-background"
          >
            Sample 2,000
          </button>
          <button
            type="button"
            onClick={clear}
            className="h-11 rounded-lg border border-border px-3 text-sm font-medium text-foreground"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="mt-4 h-56">
        {xs.length === 0 ? (
          <p className="text-sm text-muted">No jumps in this mode yet. Arm a phonon, or sample the exponential.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="us"
                stroke="var(--color-faint)"
                tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-faint)"
                tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: "var(--color-border)", opacity: 0.4 }}
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  color: "var(--color-foreground)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              <Line dataKey="expected" stroke="var(--color-foreground)" dot={false} strokeWidth={1.5} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
      <p className="mt-2 text-xs text-faint">
        Bars are counts. The line is N(e^(−t/τ) − e^(−(t+Δ)/τ)) with τ = T₁ or T₁eff. Mass used in the force ledger: {sci(M_EFF, 4)} kg.
      </p>
    </section>
  );
}

export function Cite() {
  return (
    <footer className="mt-8 max-w-2xl text-xs text-pretty text-faint">
      Node parameters from arXiv:2610.10714, 17 September 2026. Harness-Zero is arXiv:2609.24974, 21 September 2026. Parity cadence and the two-in-three single shot are the published account of the phonon experiment. The first clip is Dr. Rick Pescatore. The second is the Harness-Zero result as told by @parthknowsai. Back-action per check is 1 − exp(−Γ_ba Δt) = {(ledgerAt(T_BATH).pBa * 100).toFixed(2)}%, against the reported ≈ 1.3%.
    </footer>
  );
}
