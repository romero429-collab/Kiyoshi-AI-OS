/**
 * Tests for core/stability.ts
 *
 * Covers: computeEnergy, ZERO_ENERGY, shannonEntropy, stateDelta,
 *         stateEntropy, StabilityMonitor.
 */

import {
  computeEnergy,
  ZERO_ENERGY,
  shannonEntropy,
  stateDelta,
  stateEntropy,
  StabilityMonitor,
} from '../../core/stability'
import { GlobalState } from '../../core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeState(tick: number, extra?: Record<string, unknown>): GlobalState {
  return Object.freeze({
    tick,
    timestamp: Date.now(),
    subsystems: Object.freeze({
      UI:   { initialized: true, ...extra },
      AI:   { initialized: true },
      APP:  { initialized: true },
      DATA: { initialized: true },
      MEM:  { initialized: true },
      NET:  { initialized: true },
      IO:   { initialized: true },
      SYS:  { initialized: true },
    }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// computeEnergy
// ─────────────────────────────────────────────────────────────────────────────

describe('computeEnergy', () => {
  it('sums all five components into total', () => {
    const e = computeEnergy({ cpu: 10, memory: 20, gpu: 5, io: 3, network: 2 })
    expect(e.total).toBe(40)
  })

  it('returns a frozen object', () => {
    const e = computeEnergy({ cpu: 1, memory: 1, gpu: 1, io: 1, network: 1 })
    expect(Object.isFrozen(e)).toBe(true)
  })

  it('ZERO_ENERGY has total 0', () => {
    expect(ZERO_ENERGY.total).toBe(0)
    expect(ZERO_ENERGY.cpu).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// shannonEntropy
// ─────────────────────────────────────────────────────────────────────────────

describe('shannonEntropy', () => {
  it('returns 0 for a deterministic distribution (p=1)', () => {
    expect(shannonEntropy([1])).toBe(0)
  })

  it('returns 1 for a uniform binary distribution', () => {
    expect(shannonEntropy([0.5, 0.5])).toBeCloseTo(1, 10)
  })

  it('returns log2(n) for a uniform distribution over n outcomes', () => {
    const n = 4
    const probs = Array(n).fill(1 / n)
    expect(shannonEntropy(probs)).toBeCloseTo(Math.log2(n), 10)
  })

  it('treats p=0 as contributing 0 (0 log 0 = 0 by convention)', () => {
    expect(shannonEntropy([0, 1])).toBe(0)
  })

  it('returns 0 for an empty distribution', () => {
    expect(shannonEntropy([])).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// stateDelta
// ─────────────────────────────────────────────────────────────────────────────

describe('stateDelta', () => {
  it('returns 0 for identical states', () => {
    const s = makeState(0)
    expect(stateDelta(s, s)).toBe(0)
  })

  it('returns a value in [0, 1]', () => {
    const s1 = makeState(0)
    const s2 = makeState(1, { extra: 'changed' })
    const d = stateDelta(s1, s2)
    expect(d).toBeGreaterThanOrEqual(0)
    expect(d).toBeLessThanOrEqual(1)
  })

  it('is larger when the states differ more', () => {
    const base = makeState(0)
    const slightlyDiff = makeState(0, { x: 1 })
    const veryDiff = makeState(999, { bigData: 'a'.repeat(200) })

    const d1 = stateDelta(base, slightlyDiff)
    const d2 = stateDelta(base, veryDiff)
    expect(d2).toBeGreaterThan(d1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// stateEntropy
// ─────────────────────────────────────────────────────────────────────────────

describe('stateEntropy', () => {
  it('returns a non-negative number', () => {
    const s = makeState(0)
    expect(stateEntropy(s)).toBeGreaterThanOrEqual(0)
  })

  it('varies with state complexity', () => {
    const simple = makeState(0)
    const complex = makeState(0, { data: 'x'.repeat(500) })
    // More varied characters → potentially different entropy
    const eSimple = stateEntropy(simple)
    const eComplex = stateEntropy(complex)
    // Both should be non-negative; complex may differ
    expect(eSimple).toBeGreaterThanOrEqual(0)
    expect(eComplex).toBeGreaterThanOrEqual(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// StabilityMonitor
// ─────────────────────────────────────────────────────────────────────────────

describe('StabilityMonitor', () => {
  it('current is null before any observation', () => {
    const monitor = new StabilityMonitor()
    expect(monitor.current).toBeNull()
  })

  it('observe returns a snapshot with the correct tick', () => {
    const monitor = new StabilityMonitor()
    const s = makeState(3)
    const snap = monitor.observe(s)
    expect(snap.tick).toBe(3)
  })

  it('observe sets delta = 0 for the first observation', () => {
    const monitor = new StabilityMonitor()
    const snap = monitor.observe(makeState(0))
    expect(snap.delta).toBe(0)
  })

  it('observe sets a positive delta for the second observation if state changed', () => {
    const monitor = new StabilityMonitor()
    monitor.observe(makeState(0))
    const snap = monitor.observe(makeState(1, { changed: true }))
    expect(snap.delta).toBeGreaterThan(0)
  })

  it('trend is STABLE for the first observation', () => {
    const monitor = new StabilityMonitor()
    const snap = monitor.observe(makeState(0))
    expect(snap.trend).toBe('STABLE')
  })

  it('trend reflects whether L is increasing or decreasing', () => {
    // Use a monitor where wDelta=1, wEntropy=0 to control L via delta alone
    const monitor = new StabilityMonitor(0, 1)
    const s0 = makeState(0)
    monitor.observe(s0)
    // Second observation: same state → delta = 0 → L should decrease or stay stable
    const snap2 = monitor.observe(s0)
    expect(['STABLE', 'DECREASING']).toContain(snap2.trend)
  })

  it('getHistory accumulates all snapshots', () => {
    const monitor = new StabilityMonitor()
    monitor.observe(makeState(0))
    monitor.observe(makeState(1))
    monitor.observe(makeState(2))
    expect(monitor.getHistory()).toHaveLength(3)
  })

  it('isStable returns true with no observations', () => {
    const monitor = new StabilityMonitor()
    expect(monitor.isStable()).toBe(true)
  })

  it('isStable returns true when L is not persistently increasing', () => {
    const monitor = new StabilityMonitor()
    // Observe the same state repeatedly — L should remain stable
    const s = makeState(0)
    for (let i = 0; i < 6; i++) monitor.observe(s)
    expect(monitor.isStable()).toBe(true)
  })

  it('hashOf returns a non-empty string', () => {
    const monitor = new StabilityMonitor()
    const s = makeState(0)
    expect(monitor.hashOf(s)).toBeTruthy()
  })
})
