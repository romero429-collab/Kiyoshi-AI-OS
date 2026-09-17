/**
 * Tests for core/verification.ts
 *
 * Covers: checkStateCompleteness, checkVersioned, checkEventOrigins,
 *         checkTransitionLog, checkSystemStability, SystemVerifier.
 */

import {
  checkStateCompleteness,
  checkVersioned,
  checkEventOrigins,
  checkTransitionLog,
  checkSystemStability,
  SystemVerifier,
} from '../../core/verification'
import { EventBus, createEvent } from '../../core/event-bus'
import { StabilityMonitor } from '../../core/stability'
import { GlobalState, EventType } from '../../core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fullState(tick = 0): GlobalState {
  return Object.freeze({
    tick,
    timestamp: Date.now(),
    subsystems: Object.freeze({
      UI:   { initialized: true },
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
// checkStateCompleteness
// ─────────────────────────────────────────────────────────────────────────────

describe('checkStateCompleteness', () => {
  it('returns PASS when all 8 subsystems are present', () => {
    const r = checkStateCompleteness(fullState())
    expect(r.status).toBe('PASS')
  })

  it('returns FAIL when a subsystem is undefined', () => {
    const badState = {
      tick: 0,
      timestamp: Date.now(),
      subsystems: {
        UI:   { initialized: true },
        AI:   { initialized: true },
        APP:  { initialized: true },
        DATA: { initialized: true },
        MEM:  { initialized: true },
        NET:  { initialized: true },
        IO:   { initialized: true },
        // SYS is missing
      },
    } as unknown as GlobalState
    const r = checkStateCompleteness(badState)
    expect(r.status).toBe('FAIL')
    expect(r.message).toContain('SYS')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// checkVersioned
// ─────────────────────────────────────────────────────────────────────────────

describe('checkVersioned', () => {
  it('returns PASS for valid semver strings', () => {
    expect(checkVersioned('MOD', '1.0.0').status).toBe('PASS')
    expect(checkVersioned('MOD', '12.3.456').status).toBe('PASS')
    expect(checkVersioned('MOD', '0.0.1-alpha').status).toBe('PASS')
  })

  it('returns FAIL for invalid version strings', () => {
    expect(checkVersioned('MOD', 'v1').status).toBe('FAIL')
    expect(checkVersioned('MOD', '').status).toBe('FAIL')
    expect(checkVersioned('MOD', 'latest').status).toBe('FAIL')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// checkEventOrigins
// ─────────────────────────────────────────────────────────────────────────────

describe('checkEventOrigins', () => {
  it('returns PASS when the delivery log is empty', () => {
    const bus = new EventBus()
    expect(checkEventOrigins(bus).status).toBe('PASS')
  })

  it('returns PASS when all events have a declared origin', () => {
    const bus = new EventBus()
    bus.publish(createEvent('INPUT_EVENT', {}, 'MOD-A'))
    expect(checkEventOrigins(bus).status).toBe('PASS')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// checkTransitionLog
// ─────────────────────────────────────────────────────────────────────────────

describe('checkTransitionLog', () => {
  it('returns PASS at tick 0 with an empty log', () => {
    const bus = new EventBus()
    expect(checkTransitionLog(bus, 0).status).toBe('PASS')
  })

  it('returns FAIL at tick > 0 with an empty log', () => {
    const bus = new EventBus()
    expect(checkTransitionLog(bus, 1).status).toBe('FAIL')
  })

  it('returns PASS at tick > 0 when the log has entries with valid moduleIds', () => {
    const bus = new EventBus()
    bus.recordTransition({
      tick: 1,
      timestamp: Date.now(),
      moduleId: 'KERNEL',
      eventId: 'evt-1',
      eventType: 'INPUT_EVENT' as EventType,
      previousStateHash: 'aaa',
      nextStateHash: 'bbb',
    })
    expect(checkTransitionLog(bus, 1).status).toBe('PASS')
  })

  it('returns FAIL when a transition record has a blank moduleId', () => {
    const bus = new EventBus()
    bus.recordTransition({
      tick: 1,
      timestamp: Date.now(),
      moduleId: '',
      eventId: 'evt-1',
      eventType: 'INPUT_EVENT' as EventType,
      previousStateHash: 'aaa',
      nextStateHash: 'bbb',
    })
    expect(checkTransitionLog(bus, 1).status).toBe('FAIL')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// checkSystemStability
// ─────────────────────────────────────────────────────────────────────────────

describe('checkSystemStability', () => {
  it('returns PASS when the monitor is stable (no observations)', () => {
    const monitor = new StabilityMonitor()
    expect(checkSystemStability(monitor).status).toBe('PASS')
  })

  it('returns PASS when L is not persistently increasing', () => {
    const monitor = new StabilityMonitor()
    const s: GlobalState = fullState(0)
    for (let i = 0; i < 6; i++) monitor.observe(s)
    expect(checkSystemStability(monitor).status).toBe('PASS')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SystemVerifier
// ─────────────────────────────────────────────────────────────────────────────

describe('SystemVerifier', () => {
  it('runAll returns PASS when all invariants hold with no modules', () => {
    const bus = new EventBus()
    const stability = new StabilityMonitor()
    const state = fullState(0)
    const verifier = new SystemVerifier(bus, stability, () => state, () => 0, [])
    const report = verifier.runAll()
    expect(report.overallStatus).toBe('PASS')
    expect(report.failures).toBe(0)
  })

  it('runAll includes results from custom module verifiers', () => {
    const bus = new EventBus()
    const stability = new StabilityMonitor()
    const state = fullState(0)
    const customVerifier = jest.fn().mockReturnValue({
      status: 'PASS' as const,
      moduleId: 'CUSTOM',
      message: 'ok',
      timestamp: Date.now(),
    })
    const verifier = new SystemVerifier(bus, stability, () => state, () => 0, [customVerifier])
    const report = verifier.runAll()
    expect(customVerifier).toHaveBeenCalled()
    expect(report.passed).toBeGreaterThanOrEqual(1)
  })

  it('runAll sets overallStatus to FAIL when a custom verifier returns FAIL', () => {
    const bus = new EventBus()
    const stability = new StabilityMonitor()
    const state = fullState(0)
    const failVerifier = jest.fn().mockReturnValue({
      status: 'FAIL' as const,
      moduleId: 'BAD',
      message: 'broken',
      timestamp: Date.now(),
    })
    const verifier = new SystemVerifier(bus, stability, () => state, () => 0, [failVerifier])
    const report = verifier.runAll()
    expect(report.overallStatus).toBe('FAIL')
    expect(report.failures).toBeGreaterThanOrEqual(1)
  })

  it('runAll sets overallStatus to WARNING when only warnings are present', () => {
    const bus = new EventBus()
    const stability = new StabilityMonitor()
    const state = fullState(0)
    const warnVerifier = jest.fn().mockReturnValue({
      status: 'WARNING' as const,
      moduleId: 'WARN',
      message: 'degraded',
      timestamp: Date.now(),
    })
    const verifier = new SystemVerifier(bus, stability, () => state, () => 0, [warnVerifier])
    const report = verifier.runAll()
    expect(report.overallStatus).toBe('WARNING')
    expect(report.warnings).toBeGreaterThanOrEqual(1)
  })
})
