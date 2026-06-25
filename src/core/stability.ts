/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 3.5–3.10: Stability, Energy, and Entropy
 *
 * Implements:
 *   L(Ω)  — Lyapunov-style stability function (Ch 3.7)
 *   ΔΩ    — State delta / perturbation measure (Ch 3.6)
 *   C     — Computational energy  C = CPU + Memory + GPU + IO + Network (Ch 3.9)
 *   H     — Information entropy  H = -Σ p(x) log₂ p(x) (Ch 3.10)
 */

import { GlobalState, ComputationalEnergy } from './types'
import { hashState } from './kernel'

// ─────────────────────────────────────────────────────────────────────────────
// COMPUTATIONAL ENERGY  C  (Ch 3.9)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sum all energy components into the aggregate scalar C.
 *
 * C = CPU + Memory + GPU + IO + Network
 *
 * Every subsystem minimises C subject to correctness.
 * Optimisation shall never reduce correctness (Ch 3.9).
 *
 * Complexity: O(1) time, O(1) memory.
 */
export function computeEnergy(components: Omit<ComputationalEnergy, 'total'>): ComputationalEnergy {
  const total = components.cpu + components.memory + components.gpu +
                components.io  + components.network
  return Object.freeze({ ...components, total })
}

/**
 * Zero-cost energy baseline (stable attractor Ω* produces minimal C).
 */
export const ZERO_ENERGY: ComputationalEnergy = computeEnergy({
  cpu: 0,
  memory: 0,
  gpu: 0,
  io: 0,
  network: 0,
})

// ─────────────────────────────────────────────────────────────────────────────
// INFORMATION ENTROPY  H  (Ch 3.10)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute Shannon entropy over a discrete probability distribution.
 *
 * H = -Σ p(x) log₂ p(x)
 *
 * High H indicates ambiguous state, poor predictability,
 * weak diagnostics, and reduced AI confidence (Ch 3.10).
 *
 * @param probabilities  Array of probabilities p(x) summing to 1.
 * @returns              H in bits.
 *
 * Complexity: O(n) time, O(1) memory.
 */
export function shannonEntropy(probabilities: number[]): number {
  let h = 0
  for (const p of probabilities) {
    if (p > 0) {
      h -= p * Math.log2(p)
    }
  }
  return h
}

/**
 * Estimate the entropy of a GlobalState by treating each serialised
 * character as an independent symbol.
 *
 * This is an upper-bound approximation; subsystems should supply
 * domain-specific distributions where precision matters.
 *
 * Complexity: O(|Ω|) where |Ω| is the serialised state length.
 */
export function stateEntropy(state: GlobalState): number {
  const serialised = JSON.stringify(state)
  const freq: Record<string, number> = {}
  for (const ch of serialised) {
    freq[ch] = (freq[ch] ?? 0) + 1
  }
  const total = serialised.length
  const probs = Object.values(freq).map(count => count / total)
  return shannonEntropy(probs)
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE DELTA  ΔΩ  (Ch 3.6)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Measure the magnitude of change between two consecutive global states.
 *
 * ΔΩ = ||Ω(t+1) - Ω(t)||
 *
 * Computed as the normalised Hamming distance between the two serialised
 * state strings (character-level).  A value of 0 means no change; 1 means
 * every character differs.
 *
 * Large ΔΩ values indicate instability (Ch 3.6).
 *
 * Complexity: O(max(|s₁|, |s₂|)) time, O(max(|s₁|, |s₂|)) memory.
 */
export function stateDelta(prev: GlobalState, next: GlobalState): number {
  const s1 = JSON.stringify(prev)
  const s2 = JSON.stringify(next)
  const maxLen = Math.max(s1.length, s2.length)
  if (maxLen === 0) return 0

  let differences = 0
  for (let i = 0; i < maxLen; i++) {
    if (s1[i] !== s2[i]) differences++
  }
  return differences / maxLen
}

// ─────────────────────────────────────────────────────────────────────────────
// LYAPUNOV STABILITY FUNCTION  L(Ω)  (Ch 3.7)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Stability snapshot capturing L and its components.
 */
export interface StabilitySnapshot {
  /** Discrete time index when snapshot was taken. */
  readonly tick: number
  /** L(Ω) — scalar stability measure. */
  readonly lyapunov: number
  /** H — state entropy in bits. */
  readonly entropy: number
  /** Normalised ΔΩ from the previous tick (0 on first call). */
  readonly delta: number
  /** Trend: is L decreasing (healthy) or increasing (degrading)? */
  readonly trend: 'DECREASING' | 'STABLE' | 'INCREASING'
}

/**
 * Lyapunov-style stability monitor.
 *
 * L(Ω) is defined as a weighted combination of entropy and state delta.
 * A healthy system satisfies L(Ω(t+1)) ≤ L(Ω(t)) (Ch 3.7).
 *
 * Persistent increases indicate architectural degradation.
 * Optimisation should minimise L rather than simply increasing speed.
 *
 * Complexity — observe: O(|Ω|) dominated by state serialisation.
 */
export class StabilityMonitor {
  private readonly history: StabilitySnapshot[] = []
  private previousState: GlobalState | null = null

  /** Weight assigned to entropy component in L. */
  private readonly wEntropy: number
  /** Weight assigned to delta component in L. */
  private readonly wDelta: number

  /**
   * @param wEntropy  Weight of entropy in L (default 0.5).
   * @param wDelta    Weight of ΔΩ in L (default 0.5).
   */
  constructor(wEntropy = 0.5, wDelta = 0.5) {
    this.wEntropy = wEntropy
    this.wDelta = wDelta
  }

  /**
   * Observe a new global state and compute a stability snapshot.
   *
   * L(Ω) = wEntropy·H(Ω) + wDelta·ΔΩ
   *
   * Returns the snapshot and appends it to the history.
   */
  observe(state: GlobalState): StabilitySnapshot {
    const entropy = stateEntropy(state)
    const delta = this.previousState ? stateDelta(this.previousState, state) : 0
    const lyapunov = this.wEntropy * entropy + this.wDelta * delta

    const prev = this.history[this.history.length - 1]
    let trend: StabilitySnapshot['trend'] = 'STABLE'
    if (prev) {
      if (lyapunov < prev.lyapunov) trend = 'DECREASING'
      else if (lyapunov > prev.lyapunov) trend = 'INCREASING'
    }

    const snapshot: StabilitySnapshot = Object.freeze({
      tick: state.tick,
      lyapunov,
      entropy,
      delta,
      trend,
    })

    this.history.push(snapshot)
    this.previousState = state

    return snapshot
  }

  /**
   * Current stability snapshot (last observed).
   * Returns null if no observations have been made.
   */
  get current(): StabilitySnapshot | null {
    return this.history[this.history.length - 1] ?? null
  }

  /**
   * Determine whether the system is currently stable.
   *
   * Stable ⟺ L is not persistently increasing over the last `window` ticks.
   *
   * Complexity: O(window).
   */
  isStable(window = 5): boolean {
    if (this.history.length < 2) return true
    const recent = this.history.slice(-window)
    let increases = 0
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].lyapunov > recent[i - 1].lyapunov) increases++
    }
    // Unstable if more than half of the recent ticks show L increasing
    return increases <= Math.floor(recent.length / 2)
  }

  /**
   * Compute the hash of a state for use in TransitionRecord.
   * Delegates to the shared hashState utility from the Kernel.
   */
  hashOf(state: GlobalState): string {
    return hashState(state)
  }

  /** Full observation history (Axiom 5: Observability). */
  getHistory(): ReadonlyArray<StabilitySnapshot> {
    return this.history
  }
}
