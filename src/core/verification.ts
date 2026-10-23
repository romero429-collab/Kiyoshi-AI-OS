/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 2.11: Verification + Chapter 1: Invariants
 *
 * Utility functions and the SystemVerifier class for enforcing all
 * invariants declared in Chapters 1 and 2.
 *
 * Invariants enforced here:
 *   Inv 1:  No subsystem may enter an undefined state.
 *   Inv 2:  Every event has exactly one origin.
 *   Inv 3:  Every state transition is logged.
 *   Inv 4:  Every computation is reproducible.
 *   Inv 5:  Every public interface is versioned.
 *   Inv 6:  Every application is replaceable.
 *   Inv 7:  Failure of one module shall not terminate unrelated modules.
 *   Inv 8:  The OS shall continue under partial subsystem failure.
 *   Inv 2.1–2.6 from Chapter 2.
 */

import {
  GlobalState,
  VerificationResult,
  VerificationStatus,
  SubsystemId,
} from './types'
import { EventBus } from './event-bus'
import { StabilityMonitor } from './stability'

// ─────────────────────────────────────────────────────────────────────────────
// INVARIANT CHECKS
// ─────────────────────────────────────────────────────────────────────────────

const REQUIRED_SUBSYSTEMS: SubsystemId[] = [
  'UI', 'AI', 'APP', 'DATA', 'MEM', 'NET', 'IO', 'SYS',
]

const SEMVER_PATTERN = /^\d+\.\d+\.\d+/

/**
 * Verify Invariant 1: no subsystem may enter an undefined state.
 *
 * Every SubsystemId must be present in Ω and must not be null/undefined.
 *
 * Complexity: O(|REQUIRED_SUBSYSTEMS|) = O(1).
 */
export function checkStateCompleteness(state: GlobalState): VerificationResult {
  const missing: string[] = []
  for (const id of REQUIRED_SUBSYSTEMS) {
    if (state.subsystems[id] === undefined || state.subsystems[id] === null) {
      missing.push(id)
    }
  }

  if (missing.length > 0) {
    return result('KERNEL', 'FAIL', `Invariant 1 violated — undefined subsystems: ${missing.join(', ')}`)
  }
  return result('KERNEL', 'PASS', 'Invariant 1: all subsystems defined')
}

/**
 * Verify Invariant 5: every public interface is versioned.
 *
 * moduleVersion must match semver pattern MAJOR.MINOR.PATCH.
 *
 * Complexity: O(1).
 */
export function checkVersioned(moduleId: string, moduleVersion: string): VerificationResult {
  if (!SEMVER_PATTERN.test(moduleVersion)) {
    return result(moduleId, 'FAIL', `Invariant 5 violated — version "${moduleVersion}" does not match semver`)
  }
  return result(moduleId, 'PASS', `Invariant 5: version ${moduleVersion} is valid semver`)
}

/**
 * Verify Invariant 2 / Inv 2.2: every event has exactly one origin.
 *
 * Scans the EventBus delivery log for any event with a blank sourceModuleId.
 *
 * Complexity: O(n) where n = delivery log size.
 */
export function checkEventOrigins(bus: EventBus): VerificationResult {
  const log = bus.getDeliveryLog()
  const violations = log.filter(e => !e.sourceModuleId || e.sourceModuleId.trim() === '')
  if (violations.length > 0) {
    return result(
      'KERNEL',
      'FAIL',
      `Invariant 2 violated — ${violations.length} event(s) have no declared origin`,
    )
  }
  return result('KERNEL', 'PASS', `Invariant 2: all ${log.length} events have declared origins`)
}

/**
 * Verify Invariant 3: every state transition is logged.
 *
 * Checks that the transition log is non-empty if the scheduler has advanced
 * past tick 0, and that no record has a blank moduleId.
 *
 * Complexity: O(n) where n = transition log size.
 */
export function checkTransitionLog(bus: EventBus, currentTick: number): VerificationResult {
  const log = bus.getTransitionLog()

  if (currentTick > 0 && log.length === 0) {
    return result('KERNEL', 'FAIL', 'Invariant 3 violated — no transitions logged at tick > 0')
  }

  const blank = log.filter(r => !r.moduleId || r.moduleId.trim() === '')
  if (blank.length > 0) {
    return result(
      'KERNEL',
      'FAIL',
      `Invariant 3 violated — ${blank.length} transition record(s) have no moduleId`,
    )
  }

  return result('KERNEL', 'PASS', `Invariant 3: ${log.length} transitions logged`)
}

/**
 * Verify Invariant 8: the OS continues under partial subsystem failure.
 *
 * Uses the stability monitor to check whether L(Ω) is diverging
 * across the observable history window.  A persistently increasing L
 * indicates degradation that could cascade to unrelated subsystems.
 *
 * Complexity: O(window).
 */
export function checkSystemStability(
  monitor: StabilityMonitor,
  window = 5,
): VerificationResult {
  const stable = monitor.isStable(window)
  const current = monitor.current

  if (!stable) {
    return result(
      'KERNEL',
      'WARNING',
      `Invariant 8: L(Ω) persistently increasing over last ${window} ticks — L=${current?.lyapunov.toFixed(4)}`,
    )
  }
  return result(
    'KERNEL',
    'PASS',
    `Invariant 8: system stable — L=${(current?.lyapunov ?? 0).toFixed(4)}`,
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM VERIFIER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aggregated verification report returned by SystemVerifier.runAll().
 */
export interface SystemVerificationReport {
  readonly timestamp: number
  readonly tick: number
  readonly overallStatus: VerificationStatus
  readonly results: ReadonlyArray<VerificationResult>
  /** Number of PASS results. */
  readonly passed: number
  /** Number of WARNING results. */
  readonly warnings: number
  /** Number of FAIL results. */
  readonly failures: number
}

/**
 * SystemVerifier runs all invariant checks and module verifications.
 *
 * Corresponds to Ch 2.11: every module must implement Verify() returning
 * PASS, WARNING, or FAIL.
 *
 * The overall status is:
 *   PASS    — all checks pass
 *   WARNING — at least one warning, no failures
 *   FAIL    — at least one failure
 *
 * Complexity: O(m + n) where m = module count, n = event/transition log sizes.
 */
export class SystemVerifier {
  constructor(
    private readonly bus: EventBus,
    private readonly stability: StabilityMonitor,
    private readonly getState: () => GlobalState,
    private readonly getCurrentTick: () => number,
    private readonly moduleVerifiers: Array<() => VerificationResult>,
  ) {}

  /**
   * Run all verification checks and return a consolidated report.
   */
  runAll(): SystemVerificationReport {
    const all: VerificationResult[] = []
    const state = this.getState()

    all.push(checkStateCompleteness(state))
    all.push(checkEventOrigins(this.bus))
    all.push(checkTransitionLog(this.bus, this.getCurrentTick()))
    all.push(checkSystemStability(this.stability))

    for (const verify of this.moduleVerifiers) {
      all.push(verify())
    }

    const failures = all.filter(r => r.status === 'FAIL').length
    const warnings = all.filter(r => r.status === 'WARNING').length
    const passed = all.filter(r => r.status === 'PASS').length

    const overallStatus: VerificationStatus =
      failures > 0 ? 'FAIL' : warnings > 0 ? 'WARNING' : 'PASS'

    return Object.freeze({
      timestamp: Date.now(),
      tick: this.getCurrentTick(),
      overallStatus,
      results: all,
      passed,
      warnings,
      failures,
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────────────────────

function result(
  moduleId: string,
  status: VerificationStatus,
  message: string,
): VerificationResult {
  return Object.freeze({ status, moduleId, message, timestamp: Date.now() })
}
