import { useEffect, useRef, useState } from "react";
import { GAP_M, zeroPointM } from "@/lib/phonon/physics";
import { usePhonon } from "@/lib/phonon/store";

const VIS_AMP = 12;
const GAP_UNITS = 64;
const MOTION_GAIN = ((VIS_AMP / GAP_UNITS) * GAP_M) / zeroPointM();

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function Resonator() {
  const n = usePhonon((s) => s.n);
  const armed = usePhonon((s) => s.armed);
  const reduced = useReducedMotion();
  const on = armed && n === 1;

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card p-4">
      <h2 className="text-sm font-medium text-foreground">Resonator</h2>
      <p className="mt-1 text-sm text-muted">
        One phonon is a state, not a fade. The bar stops in a single step.
      </p>
      <svg viewBox="0 0 720 300" className="mt-4 h-56 w-full sm:h-72" role="img" aria-label="Lithium niobate bar suspended over a tantalum transmon">
        <g fill="none" stroke="var(--color-border)" strokeWidth="1.5">
          {[0, 1, 2, 3].map((i) => (
            <rect key={`l${i}`} x={78 + i * 32} y={108} width="20" height="20" />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <rect key={`r${i}`} x={542 + i * 32} y={108} width="20" height="20" />
          ))}
        </g>

        <g transform={on && reduced ? "translate(0 -8)" : undefined}>
          {on && !reduced ? (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 -12; 0 12; 0 -12"
              dur="0.28s"
              repeatCount="indefinite"
            />
          ) : null}
          <rect
            x="230"
            y="96"
            width="260"
            height="44"
            fill={on ? "var(--color-accent)" : "var(--color-foreground)"}
          />
        </g>

        <line x1="250" y1="140" x2="250" y2="204" stroke="var(--color-faint)" strokeDasharray="3 4" />
        <text x="258" y="178" fill="var(--color-faint)" fontSize="13" fontFamily="IBM Plex Mono, ui-monospace">
          75 nm
        </text>

        <g fill="none" stroke="var(--color-foreground)" strokeWidth="1.5">
          <rect x="230" y="204" width="100" height="32" />
          <rect x="390" y="204" width="100" height="32" />
          <line x1="330" y1="220" x2="390" y2="220" />
        </g>
        <text x="360" y="258" textAnchor="middle" fill="var(--color-muted)" fontSize="13" fontFamily="IBM Plex Mono, ui-monospace">
          Ta transmon
        </text>
        <text x="360" y="78" textAnchor="middle" fill="var(--color-muted)" fontSize="13" fontFamily="IBM Plex Mono, ui-monospace">
          LiNbO₃ phononic crystal
        </text>
        <text x="24" y="284" fill="var(--color-faint)" fontSize="13" fontFamily="IBM Plex Mono, ui-monospace">
          {on ? `motion ×${MOTION_GAIN.toExponential(1)} versus x_zpf` : "vacuum · n = 0"}
        </text>
      </svg>
    </section>
  );
}

export function Scope() {
  const beliefRef = useRef<SVGPathElement>(null);
  const stepRef = useRef<SVGPathElement>(null);
  const noteRef = useRef<SVGTextElement>(null);
  const endRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const { points, bits, mode, armed } = usePhonon.getState();
      const windowSec = mode === "watched" ? 2e-3 : 6.3e-3;
      const padL = 36;
      const padR = 16;
      const padT = 16;
      const padB = 28;
      const plotW = 640 - padL - padR;
      const plotH = 240 - padT - padB;
      const xOf = (t: number) => padL + (t / windowSec) * plotW;
      const yOf = (v: number) => padT + (1 - v) * plotH;

      let belief = "";
      let step = "";
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const x = xOf(pt.t).toFixed(1);
        belief += i === 0 ? `M ${x} ${yOf(pt.p).toFixed(1)}` : ` L ${x} ${yOf(pt.p).toFixed(1)}`;
        if (i === 0) step = `M ${x} ${yOf(pt.n).toFixed(1)}`;
        else {
          const prev = points[i - 1];
          step += ` L ${x} ${yOf(prev.n).toFixed(1)} L ${x} ${yOf(pt.n).toFixed(1)}`;
        }
      }
      beliefRef.current?.setAttribute("d", belief);
      stepRef.current?.setAttribute("d", step);
      if (noteRef.current) {
        noteRef.current.textContent = !armed || points.length === 0 ? "Arm a phonon to open a trajectory" : "";
      }
      if (endRef.current) endRef.current.textContent = `${Math.round(windowSec * 1e6)} μs`;

      const mark = document.getElementById("parity-marks");
      if (mark) {
        const lines = bits
          .filter((bit) => !bit.match)
          .map((bit) => {
            const x = xOf(bit.t);
            if (x < padL || x > padL + plotW) return "";
            return `<line x1="${x.toFixed(1)}" y1="${padT}" x2="${x.toFixed(1)}" y2="${padT + plotH}" stroke="var(--color-border)" />`;
          })
          .join("");
        if (mark.innerHTML !== lines) mark.innerHTML = lines;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card p-4">
      <h2 className="text-sm font-medium text-foreground">Occupation</h2>
      <p className="mt-1 text-sm text-muted">
        White step is the true phonon number. Teal is the belief: a noisy parity posterior while watched, an open-loop survival while free.
      </p>
      <svg viewBox="0 0 640 240" className="mt-4 h-48 w-full sm:h-64" role="img" aria-label="Phonon occupation and belief">
        <g fill="none" stroke="var(--color-border)" strokeWidth="1">
          <line x1="36" y1="16" x2="36" y2="212" />
          <line x1="36" y1="212" x2="624" y2="212" />
          <line x1="36" y1="16" x2="624" y2="16" />
          <line x1="36" y1="114" x2="624" y2="114" />
        </g>
        <g fill="var(--color-faint)" fontSize="11" fontFamily="IBM Plex Mono, ui-monospace" textAnchor="end">
          <text x="30" y="20">1</text>
          <text x="30" y="118">0.5</text>
          <text x="30" y="216">0</text>
        </g>
        <g id="parity-marks" />
        <path ref={beliefRef} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
        <path ref={stepRef} fill="none" stroke="var(--color-foreground)" strokeWidth="1.75" />
        <text ref={noteRef} x="320" y="120" textAnchor="middle" fill="var(--color-muted)" fontSize="13" fontFamily="IBM Plex Sans, sans-serif" />
        <text x="36" y="232" fill="var(--color-faint)" fontSize="11" fontFamily="IBM Plex Mono, ui-monospace">
          0
        </text>
        <text ref={endRef} x="624" y="232" textAnchor="end" fill="var(--color-faint)" fontSize="11" fontFamily="IBM Plex Mono, ui-monospace">
          2000 μs
        </text>
      </svg>
    </section>
  );
}
