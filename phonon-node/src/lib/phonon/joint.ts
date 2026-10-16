import { HERALD_F, T1, T1_EFF } from "@/lib/phonon/physics";

/** Harness-Zero, arXiv:2609.24974 (Ye, Lu, Dong, Su, Song; 21 Sep 2026).
 *  Per-domain task success in percent. Macros are the unweighted means.
 */
export const PAPER = {
  arxiv: "2609.24974",
  student: "Qwen3.5-9B",
  coach: "GPT-5.6 Sol",
  epochs: 2,
  costFactor: 2.4,
  patterns: 28,
  recovery: 0.823,
  domains: [
    { name: "SpreadsheetBench", baseH: 31.0, baseHStar: 39.0, distilledH: 44.0 },
    { name: "AppWorld", baseH: 26.8, baseHStar: 48.2, distilledH: 58.9 },
    { name: "USPTO", baseH: 12.0, baseHStar: 38.0, distilledH: 30.0 },
  ],
} as const;

export function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function round1(x: number): number {
  return Math.round(x * 10) / 10;
}

export function paperMacros() {
  const baseH = mean(PAPER.domains.map((d) => d.baseH));
  const baseHStar = mean(PAPER.domains.map((d) => d.baseHStar));
  const distilledH = mean(PAPER.domains.map((d) => d.distilledH));
  return {
    baseH,
    baseHStar,
    distilledH,
    reportedBaseH: round1(baseH),
    reportedBaseHStar: round1(baseHStar),
    reportedDistilledH: round1(distilledH),
  };
}

/** |τ_watched − τ_free| / τ_free. Relative error if the watched lifetime is stored as the plant. */
export function backActionLeakage(): number {
  return Math.abs(T1_EFF - T1) / T1;
}

export function beta(): number {
  return T1 / T1_EFF;
}

/** Coach replaces a proposed lifetime when it misses the realized jump by more than eps. */
export function coachDecision(proposal: number, realized: number, eps = 0.2): "PASS" | "REPLACE" {
  if (realized <= 0) return "REPLACE";
  return Math.abs(proposal - realized) / realized > eps ? "REPLACE" : "PASS";
}

/**
 * Distill a lifetime into the student only when the harness does not change Γ.
 * The phonon watch changes Γ, so the deployed lifetime stays the free-ring T1.
 */
export function compose(gammaFree: number, gammaWatched: number): {
  leak: boolean;
  tauDeploy: number;
  gammaBa: number;
} {
  const gammaBa = gammaWatched - gammaFree;
  const leak = Math.abs(gammaBa) > 1e-9;
  return {
    leak,
    gammaBa,
    tauDeploy: leak ? 1 / gammaFree : 1 / gammaWatched,
  };
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fraction of probes where the hard call 1{exp(-t/τ_s) ≥ 1/2} matches a sample from the plant. */
export function occupationAccuracy(
  tauStudent: number,
  tauPlant: number,
  n = 4000,
  seed = 20261016,
  window = 2e-3,
): number {
  const rng = mulberry32(seed);
  let hit = 0;
  for (let i = 0; i < n; i++) {
    const t = rng() * window;
    const alive = rng() < Math.exp(-t / tauPlant);
    const call = Math.exp(-t / tauStudent) >= 0.5;
    if (call === alive) hit += 1;
  }
  return hit / n;
}

export type JointReport = {
  paper: ReturnType<typeof paperMacros>;
  leakage: number;
  beta: number;
  gammaBa: number;
  legalTau: number;
  illegalTau: number;
  coachOnWatchedMean: "PASS" | "REPLACE";
  scores: {
    baseFree: number;
    baseWatched: number;
    illegalFree: number;
    legalFree: number;
  };
  herald: number;
};

export function jointReport(seed = 20261016): JointReport {
  const law = compose(1 / T1, 1 / T1_EFF);
  const scores = {
    baseFree: occupationAccuracy(T1, T1, 4000, seed),
    baseWatched: occupationAccuracy(T1, T1_EFF, 4000, seed),
    illegalFree: occupationAccuracy(T1_EFF, T1, 4000, seed),
    legalFree: occupationAccuracy(law.tauDeploy, T1, 4000, seed),
  };
  return {
    paper: paperMacros(),
    leakage: backActionLeakage(),
    beta: beta(),
    gammaBa: law.gammaBa,
    legalTau: law.tauDeploy,
    illegalTau: T1_EFF,
    coachOnWatchedMean: coachDecision(T1, T1_EFF),
    scores,
    herald: HERALD_F,
  };
}
