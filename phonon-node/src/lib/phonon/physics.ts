/** Parameters from arXiv:2610.10714 (Safavi-Naeini, Makihara, Szakiel; 17 Sep 2026)
 *  and the reported parity cadence of that experiment. Derived quantities are
 *  computed here — nothing in the ledger is a hand-typed result.
 */

export const HBAR = 1.054571817e-34; // J·s
export const K_B = 1.380649e-23; // J/K
export const H_PLANCK = 6.62607015e-34; // J·s
export const EV = 1.602176634e-19; // J
export const DALTON = 1.6605390666e-27; // kg

/** ω_m / 2π */
export const F_M = 3.277e9; // Hz
export const OMEGA = 2 * Math.PI * F_M; // rad/s

/** 0.1995 pg */
export const M_EFF = 0.1995e-15; // kg

/** χ / 2π ; the qubit moves by 2χ per phonon */
export const CHI_HZ = 164e3; // Hz
export const TWO_CHI_HZ = 2 * CHI_HZ; // 328 kHz

export const T1 = 2.1e-3; // s, unmeasured energy lifetime
export const T1_EFF = 649e-6; // s, lifetime under repeated parity checks
export const DT_CHECK = 12e-6; // s, reported parity interval

/** Heralded single-phonon fidelity, from the paper. */
export const HERALD_F = 0.85;
/** Single parity check agrees with n about two times in three. */
export const P_READ = 2 / 3;

/** Mechanical bath used for the live trajectory (experiment, not the slider). */
export const T_BATH = 0.036; // K
export const T_QUBIT = 0.053; // K

export const GAP_M = 75e-9; // m

export type Mode = "free" | "watched";

export function coth(x: number): number {
  if (x > 20) return 1;
  if (x < 1e-8) return 1 / Math.max(x, 1e-8);
  const e = Math.exp(Math.min(2 * x, 40));
  return (e + 1) / (e - 1);
}

export function thermalOccupation(tempK: number): number {
  const x = (HBAR * OMEGA) / (K_B * tempK);
  if (x > 40) return Math.exp(-x);
  return 1 / (Math.exp(x) - 1);
}

/** Frequency at which n_th equals `n` at temperature `tempK`. */
export function frequencyForOccupation(tempK: number, n: number): number {
  const x = Math.log(1 + 1 / n);
  return (x * K_B * tempK) / H_PLANCK;
}

export function phononEnergyJ(): number {
  return HBAR * OMEGA;
}

export function zeroPointM(): number {
  return Math.sqrt(HBAR / (2 * M_EFF * OMEGA));
}

export function qualityFactor(): number {
  return OMEGA * T1;
}

/** A 440 Hz fork with this Q. Energy lifetime, seconds. */
export function forkRingSeconds(forkHz = 440): number {
  return qualityFactor() / (2 * Math.PI * forkHz);
}

export function decayRate(mode: Mode): { gDown: number; gUp: number; tau: number } {
  const tau = mode === "watched" ? T1_EFF : T1;
  const nTh = thermalOccupation(T_BATH);
  const gDown = 1 / tau;
  const gUp = (nTh / (nTh + 1)) * gDown;
  return { gDown, gUp, tau };
}

export function predictBelief(p: number, gDown: number, gUp: number, dt: number): number {
  const g = gDown + gUp;
  const e = Math.exp(-g * dt);
  const p11 = (gUp + gDown * e) / g;
  const p01 = (gUp * (1 - e)) / g;
  return p11 * p + p01 * (1 - p);
}

export function stepOccupation(
  n: 0 | 1,
  gDown: number,
  gUp: number,
  dt: number,
  rand: number,
): 0 | 1 {
  const g = gDown + gUp;
  const e = Math.exp(-g * dt);
  const p11 = (gUp + gDown * e) / g;
  const p00 = (gDown + gUp * e) / g;
  if (n === 1) return rand < p11 ? 1 : 0;
  return rand < p00 ? 0 : 1;
}

export function updateBelief(p: number, q: 0 | 1, pRead = P_READ): number {
  const lik1 = q === 1 ? pRead : 1 - pRead;
  const lik0 = q === 1 ? 1 - pRead : pRead;
  const a = p * lik1;
  const b = (1 - p) * lik0;
  const d = a + b;
  return d === 0 ? p : a / d;
}

/** Flat prior, each agreeing "odd" shot multiplies odds by p/(1-p). */
export function flatPriorPosterior(k: number, pRead = P_READ): number {
  const r = pRead / (1 - pRead);
  const odds = r ** k;
  return odds / (1 + odds);
}

/** One-sided force noise √S_FF. High-T limit is √(4 m kT Γ), Γ = 1/T₁. */
export function forceNoise(tempK: number): number {
  const gamma = 1 / T1;
  const x = (HBAR * OMEGA) / (2 * K_B * tempK);
  const s = 2 * M_EFF * gamma * HBAR * OMEGA * coth(x);
  return Math.sqrt(s);
}

/** Static force that displaces the mode by one zero-point amplitude. */
export function forceZpf(): number {
  return M_EFF * OMEGA * OMEGA * zeroPointM();
}

export function linewidthHz(): number {
  return 1 / (2 * Math.PI * T1);
}

/** Point-mass loading at an antinode: δf/f = −δm / (2m). Returns |δf| in Hz. */
export function massShiftHz(deltaKg: number): number {
  return (F_M * deltaKg) / (2 * M_EFF);
}

export function proteinKg(kilodalton: number): number {
  return kilodalton * 1000 * DALTON;
}

/** Measurement-added decay, s⁻¹. */
export function backActionRate(): number {
  return 1 / T1_EFF - 1 / T1;
}

/** Probability a check removes the phonon via back-action alone. */
export function backActionProb(): number {
  return 1 - Math.exp(-backActionRate() * DT_CHECK);
}

export function totalCheckProb(mode: Mode): number {
  const tau = mode === "watched" ? T1_EFF : T1;
  return 1 - Math.exp(-DT_CHECK / tau);
}

export function sci(n: number, sig = 4): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  const exp = Math.floor(Math.log10(Math.abs(n)));
  if (exp >= -2 && exp <= 3) {
    return n.toLocaleString("en-US", { maximumSignificantDigits: sig });
  }
  return n.toExponential(sig - 1);
}

export function ledgerAt(tempK: number) {
  const e = phononEnergyJ();
  const x = zeroPointM();
  const nTh = thermalOccupation(tempK);
  const protein = proteinKg(50);
  const df = massShiftHz(protein);
  const line = linewidthHz();
  const aRef = 0.1; // m/s², reference scale — not a measurement
  const fHeart = M_EFF * aRef;
  const fz = forceZpf();
  return {
    fGHz: F_M / 1e9,
    chiKHz: CHI_HZ / 1e3,
    twoChiKHz: TWO_CHI_HZ / 1e3,
    mPg: M_EFF / 1e-15,
    eJ: e,
    eUeV: (e / EV) * 1e6,
    eKelvin: e / K_B,
    zpeKelvin: e / (2 * K_B),
    xM: x,
    xFm: x * 1e15,
    q: qualityFactor(),
    forkHours: forkRingSeconds() / 3600,
    nTh,
    xOverK: (HBAR * OMEGA) / (K_B * tempK),
    forceNoise: forceNoise(tempK),
    forceZpf: fz,
    heartForce: fHeart,
    heartOverZpf: fHeart / fz,
    proteinDf: df,
    linewidth: line,
    proteinLines: df / line,
    beta: T1 / T1_EFF,
    gBa: backActionRate(),
    pBa: backActionProb(),
    pCheck: totalCheckProb("watched"),
    pIntrinsic: totalCheckProb("free"),
    sixFlat: flatPriorPosterior(6),
    fForGround: frequencyForOccupation(tempK, 0.01),
    fForOne: frequencyForOccupation(tempK, 1),
    resolvable: nTh < 0.1,
  };
}
