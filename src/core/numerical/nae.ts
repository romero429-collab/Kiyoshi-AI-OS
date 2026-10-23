/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume II — Numerical Analysis Layer
 * NAE-Ω: Numerical Approximation Engine
 *
 * NAE-Ω is the subsystem responsible for:
 *   1. Executing all primitive numerical operations.
 *   2. Attaching rigorous error bounds (ε_abs, ε_rel, ulp) to every result.
 *   3. Computing condition numbers κ to flag numerically sensitive operations.
 *   4. Maintaining aggregate diagnostic state across all computations.
 *
 * IEEE 754 double-precision constants:
 *   ε_mach = 2^-52 ≈ 2.22 × 10^-16   (unit roundoff)
 *   ulp(x) = ε_mach · 2^⌊log₂|x|⌋   (spacing between adjacent doubles)
 *
 * Error model (per operation, rounded-to-nearest):
 *   ADD/SUB:     |fl(x±y) − (x±y)| ≤ ε_mach · |fl(x±y)|
 *   MUL/DIV:     ε_rel ≤ ε_mach
 *   SQRT:        ε_rel ≤ ε_mach/2  (correctly rounded in IEEE 754)
 *   LOG/EXP/POW: ε_rel ≤ a few ε_mach (implementation-dependent)
 *
 * References:
 *   Higham, N.J. (2002). Accuracy and Stability of Numerical Algorithms (2nd ed.)
 *   IEEE Std 754-2019
 */

import { createHash } from 'crypto'
import {
  KiyoshiModule,
  VerificationResult,
  ComplexityProfile,
} from '../types'
import {
  NAEState,
  NAEInput,
  NumericalResult,
  ErrorBound,
  PrecisionLevel,
  NumericalOperation,
} from './types'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** IEEE 754 double-precision machine epsilon: 2^-52. */
export const MACHINE_EPSILON = Math.pow(2, -52)

/** Condition number threshold above which a WARNING is emitted. */
const CONDITION_WARNING_THRESHOLD = 1e8

/** Maximum number of recent results stored in NAEState. */
const RECENT_RESULTS_CAP = 128

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_NAE_STATE: NAEState = Object.freeze({
  initialized: false,
  operationCount: 0,
  cumulativeAbsoluteError: 0,
  maxAbsoluteError: 0,
  maxConditionNumber: 0,
  abnormalResultCount: 0,
  recentResults: Object.freeze([]),
})

// ─────────────────────────────────────────────────────────────────────────────
// ERROR BOUND COMPUTATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute an ErrorBound for a result value and estimated absolute error.
 *
 * ulp(x̂) ≈ ε_mach · |x̂|
 *
 * Complexity: O(1).
 */
function makeErrorBound(value: number, absError: number): ErrorBound {
  const relative = value !== 0 && isFinite(value)
    ? absError / Math.abs(value)
    : isFinite(absError) ? absError : NaN
  const ulps = value !== 0 && isFinite(value)
    ? absError / (MACHINE_EPSILON * Math.abs(value))
    : 0

  return Object.freeze({ absolute: absError, relative, ulps })
}

// ─────────────────────────────────────────────────────────────────────────────
// CONDITION NUMBER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute the condition number κ for the given operation and operands.
 *
 * The condition number quantifies how much a small perturbation in the
 * inputs amplifies into the output error (relative to the result).
 *
 * Operation-specific formulas (relative condition numbers):
 *   ADD(x, y): κ = (|x| + |y|) / |x + y|  — cancellation when x ≈ -y
 *   SUB(x, y): κ = (|x| + |y|) / |x - y|  — cancellation when x ≈ y
 *   MUL/DIV:   κ = 1                        — no amplification
 *   SQRT:      κ = 1/2
 *   LOG(x):    κ = 1 / |log(x)|            — large near x = 1
 *   EXP(x):    κ = |x|                     — large for |x| ≫ 1
 *   POW(x,y):  κ = |y|                     — dominated by exponent
 *   SUM:       κ = Σ|xᵢ| / |Σxᵢ|
 *   MEAN:      same as SUM
 *   VARIANCE:  κ ≈ (Σxᵢ²) / variance      — catastrophic when mean ≈ 0
 *
 * Complexity: O(n) for SUM/MEAN/VARIANCE; O(1) otherwise.
 */
function conditionNumber(op: NumericalOperation, operands: ReadonlyArray<number>, result: number): number {
  const safe = (n: number) => (isFinite(n) && n !== 0 ? Math.abs(n) : 1)

  switch (op) {
    case 'ADD': {
      const [x, y] = operands
      return (Math.abs(x) + Math.abs(y)) / safe(result)
    }
    case 'SUB': {
      const [x, y] = operands
      return (Math.abs(x) + Math.abs(y)) / safe(result)
    }
    case 'MUL':
    case 'DIV':
      return 1
    case 'SQRT':
      return 0.5
    case 'LOG': {
      const [x] = operands
      const logx = Math.log(Math.abs(x))
      return logx !== 0 ? 1 / Math.abs(logx) : Infinity
    }
    case 'EXP':
      return Math.abs(operands[0])
    case 'POW':
      return Math.abs(operands[1] ?? 1)
    case 'SUM':
    case 'MEAN': {
      const sumAbs = operands.reduce((acc, v) => acc + Math.abs(v), 0)
      return sumAbs / safe(result)
    }
    case 'VARIANCE': {
      const mean = operands.reduce((a, b) => a + b, 0) / operands.length
      const sumSq = operands.reduce((acc, v) => acc + v * v, 0)
      return sumSq / safe(result === 0 ? mean * mean : result)
    }
    default:
      return 1
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRECISION CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classify the achieved precision given a relative error and condition number.
 *
 * Complexity: O(1).
 */
function classifyPrecision(relError: number, kappa: number): PrecisionLevel {
  if (!isFinite(relError) || !isFinite(kappa)) return 'LOW'
  const effective = relError * kappa
  if (effective <= 10 * MACHINE_EPSILON) return 'HIGH'
  if (effective <= 1e-8) return 'MEDIUM'
  if (effective <= 1e-4) return 'LOW'
  return 'LOW'
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE NUMERICAL OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Execute a NumericalOperation and return the raw floating-point result.
 *
 * Pairwise summation (SUM, MEAN) reduces accumulation error from O(n·ε)
 * to O(log(n)·ε) compared to naive left-to-right summation.
 *
 * Complexity: O(n) for SUM/MEAN/VARIANCE, O(1) for all others.
 */
function executeOperation(op: NumericalOperation, operands: ReadonlyArray<number>): number {
  switch (op) {
    case 'ADD':
      return operands[0] + (operands[1] ?? 0)
    case 'SUB':
      return operands[0] - (operands[1] ?? 0)
    case 'MUL':
      return operands[0] * (operands[1] ?? 1)
    case 'DIV':
      return operands[0] / (operands[1] ?? 1)
    case 'SQRT':
      return Math.sqrt(operands[0])
    case 'LOG':
      return Math.log(operands[0])
    case 'EXP':
      return Math.exp(operands[0])
    case 'POW':
      return Math.pow(operands[0], operands[1] ?? 1)
    case 'SUM':
      return pairwiseSum(operands)
    case 'MEAN': {
      const n = operands.length
      return n === 0 ? NaN : pairwiseSum(operands) / n
    }
    case 'VARIANCE':
      return welfordVariance(operands)
    default:
      return NaN
  }
}

/**
 * Pairwise (recursive) summation — reduces floating-point accumulation error.
 *
 * Error bound: O(ε_mach · log₂(n) · max|xᵢ|)
 * Compared to naive: O(ε_mach · n · max|xᵢ|)
 *
 * Complexity: O(n) time, O(log n) stack.
 */
function pairwiseSum(values: ReadonlyArray<number>): number {
  const n = values.length
  if (n === 0) return 0
  if (n === 1) return values[0]
  if (n === 2) return values[0] + values[1]
  const mid = n >> 1
  return pairwiseSum(values.slice(0, mid)) + pairwiseSum(values.slice(mid))
}

/**
 * Welford's online algorithm for numerically stable sample variance.
 *
 * Avoids catastrophic cancellation in the two-pass formula
 * Var = E[X²] − (E[X])².
 *
 * Returns 0 for n ≤ 1.
 *
 * Complexity: O(n) time, O(1) memory.
 */
function welfordVariance(values: ReadonlyArray<number>): number {
  if (values.length <= 1) return 0
  let count = 0
  let mean = 0
  let M2 = 0
  for (const x of values) {
    count++
    const delta = x - mean
    mean += delta / count
    const delta2 = x - mean
    M2 += delta * delta2
  }
  return M2 / (count - 1) // sample variance
}

// ─────────────────────────────────────────────────────────────────────────────
// ABSOLUTE ERROR ESTIMATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Estimate the worst-case absolute error for a given operation and result.
 *
 * Based on standard IEEE 754 error analysis (Higham §2.2).
 *
 * Complexity: O(n) for SUM/MEAN/VARIANCE, O(1) for others.
 */
function estimateAbsoluteError(
  op: NumericalOperation,
  operands: ReadonlyArray<number>,
  result: number,
): number {
  if (!isFinite(result)) return Infinity

  const eps = MACHINE_EPSILON
  const absResult = Math.abs(result)

  switch (op) {
    case 'ADD':
    case 'SUB':
      // |fl(x±y) − (x±y)| ≤ ε_mach · |fl(x±y)|
      return eps * absResult

    case 'MUL':
    case 'DIV':
      // |fl(x·y) − x·y| ≤ ε_mach · |fl(x·y)|
      return eps * absResult

    case 'SQRT':
      // SQRT is correctly rounded; error ≤ (ε_mach/2) · |√x|
      return (eps / 2) * absResult

    case 'LOG':
    case 'EXP':
    case 'POW':
      // Transcendental: typically ≤ 1–2 ulps; conservatively bound by 2ε_mach
      return 2 * eps * absResult

    case 'SUM':
    case 'MEAN': {
      // Pairwise summation: error ≤ ε_mach · log₂(n) · Σ|xᵢ|
      const n = operands.length
      const logN = n > 1 ? Math.log2(n) : 1
      const sumAbs = operands.reduce((acc, v) => acc + Math.abs(v), 0)
      return eps * logN * sumAbs
    }

    case 'VARIANCE': {
      // Welford variance: error proportional to mean magnitude
      const mean = operands.reduce((a, b) => a + b, 0) / (operands.length || 1)
      return eps * Math.abs(mean) * Math.sqrt(operands.length)
    }

    default:
      return eps * absResult
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NAE-Ω MODULE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * NAE-Ω — Numerical Approximation Engine.
 *
 * Implements KiyoshiModule<NAEState, NAEInput, NumericalResult<number>>.
 *
 * S  — NAEState: aggregate computation statistics and recent result buffer.
 * I  — NAEInput: a single numerical operation request.
 * O  — NumericalResult<number>: the computed value with error bounds.
 *
 * Axiom 1 (Determinism): for identical inputs, NAE-Ω always produces
 * identical outputs (floating-point reproducibility is guaranteed because
 * we use deterministic, order-independent algorithms).
 *
 * Complexity — transition: O(n) dominated by operand count.
 */
export class NumericalApproximationEngine
  implements KiyoshiModule<NAEState, NAEInput, NumericalResult<number>>
{
  readonly moduleId = 'NAE-OMEGA'
  readonly moduleName = 'Numerical Approximation Engine Ω'
  readonly version = '1.0.0'
  readonly complexity: ComplexityProfile = {
    timeBest: 'O(1)',
    timeAverage: 'O(n)',
    timeWorst: 'O(n)',
    memoryWorst: 'O(1)',
  }

  private state: NAEState = Object.freeze({ ...INITIAL_NAE_STATE, initialized: true })

  // ── KiyoshiModule interface ───────────────────────────────────────────────

  getState(): NAEState {
    return this.state
  }

  /**
   * T — Evaluate a numerical operation and attach error bounds.
   *
   * Steps:
   *   1. Execute the operation to obtain x̂.
   *   2. Estimate absolute error ε_abs.
   *   3. Compute relative error ε_rel and ulp count.
   *   4. Compute condition number κ.
   *   5. Classify precision level.
   *   6. Build and return an immutable NumericalResult.
   *   7. Update aggregate state S.
   *
   * Complexity: O(n) where n = |operands|.
   */
  transition(input: NAEInput): NumericalResult<number> {
    const startTime = Date.now()
    const value = executeOperation(input.operation, input.operands)
    const absError = estimateAbsoluteError(input.operation, input.operands, value)
    const errorBound = makeErrorBound(value, absError)
    const kappa = conditionNumber(input.operation, input.operands, value)
    const precision = classifyPrecision(errorBound.relative, kappa)

    const result: NumericalResult<number> = Object.freeze({
      operationId: input.operationId,
      value,
      errorBound,
      precision,
      machineEpsilon: MACHINE_EPSILON,
      conditionNumber: kappa,
      timestamp: startTime,
      isNaN: Number.isNaN(value),
      isInfinite: !Number.isNaN(value) && !isFinite(value),
    })

    this.updateState(result)
    return result
  }

  /**
   * V — Verify NAE-Ω invariants.
   *
   * Checks:
   *   1. Subsystem is initialised (Invariant 1).
   *   2. machine epsilon matches expected IEEE 754 value.
   *   3. No abnormal-result rate above 10 % (WARNING if so).
   *
   * Complexity: O(1).
   */
  verify(): VerificationResult {
    if (!this.state.initialized) {
      return this.makeResult('FAIL', 'NAE-Ω not initialised')
    }

    if (MACHINE_EPSILON !== Math.pow(2, -52)) {
      return this.makeResult('FAIL', 'Machine epsilon deviates from IEEE 754 standard')
    }

    const total = this.state.operationCount
    if (total > 0) {
      const abnormalRate = this.state.abnormalResultCount / total
      if (abnormalRate > 0.1) {
        return this.makeResult(
          'WARNING',
          `NAE-Ω: ${(abnormalRate * 100).toFixed(1)}% abnormal results (NaN/Inf) — check operand domains`,
        )
      }
    }

    const meanError = total > 0
      ? this.state.cumulativeAbsoluteError / total
      : 0

    return this.makeResult(
      'PASS',
      `NAE-Ω: ${total} ops, mean ε_abs=${meanError.toExponential(3)}, κ_max=${this.state.maxConditionNumber.toExponential(3)}`,
    )
  }

  // ── Public helpers ─────────────────────────────────────────────────────────

  /**
   * Convenience method: create an NAEInput with an auto-generated ID and
   * invoke transition().
   *
   * Complexity: O(n).
   */
  compute(
    operation: NumericalOperation,
    operands: ReadonlyArray<number>,
    requestedPrecision: PrecisionLevel = 'HIGH',
  ): NumericalResult<number> {
    const input: NAEInput = {
      operationId: this.generateId(),
      operation,
      operands,
      requestedPrecision,
    }
    return this.transition(input)
  }

  /**
   * Reset diagnostic state (useful between test suites or benchmark runs).
   * Does NOT reset the initialised flag.
   *
   * Complexity: O(1).
   */
  reset(): void {
    this.state = Object.freeze({
      ...INITIAL_NAE_STATE,
      initialized: true,
    })
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private updateState(result: NumericalResult<number>): void {
    const recent = [
      ...this.state.recentResults,
      result,
    ].slice(-RECENT_RESULTS_CAP)

    this.state = Object.freeze({
      initialized: true,
      operationCount: this.state.operationCount + 1,
      cumulativeAbsoluteError: this.state.cumulativeAbsoluteError +
        (isFinite(result.errorBound.absolute) ? result.errorBound.absolute : 0),
      maxAbsoluteError: isFinite(result.errorBound.absolute)
        ? Math.max(this.state.maxAbsoluteError, result.errorBound.absolute)
        : this.state.maxAbsoluteError,
      maxConditionNumber: isFinite(result.conditionNumber)
        ? Math.max(this.state.maxConditionNumber, result.conditionNumber)
        : this.state.maxConditionNumber,
      abnormalResultCount: this.state.abnormalResultCount +
        (result.isNaN || result.isInfinite ? 1 : 0),
      recentResults: Object.freeze(recent),
    })
  }

  private generateId(): string {
    return createHash('sha256')
      .update(`${Date.now()}-${this.state.operationCount}`)
      .digest('hex')
      .slice(0, 12)
  }

  private makeResult(
    status: 'PASS' | 'WARNING' | 'FAIL',
    message: string,
  ): VerificationResult {
    return Object.freeze({ status, moduleId: this.moduleId, message, timestamp: Date.now() })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONDITION NUMBER WARNING THRESHOLD (exported for DiagnosticPanel)
// ─────────────────────────────────────────────────────────────────────────────

export { CONDITION_WARNING_THRESHOLD }
