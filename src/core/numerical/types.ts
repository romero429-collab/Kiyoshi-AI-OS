/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume II — Numerical Analysis Layer
 * NAE-Ω: Numerical Approximation Engine
 *
 * Type definitions for:
 *   NAE-Ω — Numerical Approximation Engine subsystem
 *   CE-Ω  — Computation Engine pipeline
 *
 * Every computation result produced by CE-Ω is annotated with error bounds
 * and precision metadata from NAE-Ω.  No computation result may leave CE-Ω
 * without an attached NumericalResult wrapper.
 *
 * Notation:
 *   x̂     — computed (floating-point) approximation of exact value x
 *   ε_abs — absolute error bound: |x - x̂| ≤ ε_abs
 *   ε_rel — relative error bound: |x - x̂| / |x| ≤ ε_rel  (when x ≠ 0)
 *   ulp   — unit in the last place (1 ulp ≈ ε_mach · |x̂|)
 *   κ     — condition number: sensitivity of output to input perturbation
 */

// ─────────────────────────────────────────────────────────────────────────────
// PRECISION LEVELS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Precision level requested by the caller and achieved by NAE-Ω.
 *
 *  EXACT  — result is provably exact (integers, symbolic)
 *  HIGH   — ε_rel ≤ 10 · ε_mach  (close to machine precision)
 *  MEDIUM — ε_rel ≤ 10^-8
 *  LOW    — ε_rel ≤ 10^-4  (fast approximation; acceptable for heuristics)
 */
export type PrecisionLevel = 'EXACT' | 'HIGH' | 'MEDIUM' | 'LOW'

// ─────────────────────────────────────────────────────────────────────────────
// ERROR BOUND
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rigorous error bound attached to every NAE-Ω output.
 *
 * Invariant: the true result x satisfies
 *   |x - x̂| ≤ absolute
 *   |x - x̂| / |x| ≤ relative   (when x ≠ 0)
 */
export interface ErrorBound {
  /** ε_abs — maximum absolute deviation from the true value. */
  readonly absolute: number
  /** ε_rel — maximum relative deviation from the true value (NaN if x = 0). */
  readonly relative: number
  /** Number of ulps of error (informational). */
  readonly ulps: number
}

// ─────────────────────────────────────────────────────────────────────────────
// NUMERICAL RESULT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A computation result annotated with precision metadata.
 *
 * Every value produced by CE-Ω is wrapped in NumericalResult<T>.
 * Consumers can inspect errorBound before trusting the value in a
 * safety-critical context.
 */
export interface NumericalResult<T = number> {
  /** Unique identifier matching the originating NAEInput.operationId. */
  readonly operationId: string
  /** The computed approximation x̂. */
  readonly value: T
  /** Rigorous error bound. */
  readonly errorBound: ErrorBound
  /** Achieved (or worst-case) precision level. */
  readonly precision: PrecisionLevel
  /** Machine epsilon at the time of computation (2^-52 for IEEE 754 double). */
  readonly machineEpsilon: number
  /**
   * Condition number κ.
   * κ ≫ 1 signals potential loss of significant digits.
   * κ = 1 means the operation is perfectly conditioned.
   */
  readonly conditionNumber: number
  /** Wall-clock timestamp of computation (ms). */
  readonly timestamp: number
  /** True if the result is a floating-point NaN. */
  readonly isNaN: boolean
  /** True if the result is ±Infinity. */
  readonly isInfinite: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// NUMERICAL OPERATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Set of primitive numerical operations supported by NAE-Ω.
 *
 * Every operation has a known worst-case relative error in IEEE 754
 * double precision (Table 3.1, NAE-Ω specification).
 */
export type NumericalOperation =
  | 'ADD'      // x + y
  | 'SUB'      // x - y   (catastrophic cancellation risk when x ≈ y)
  | 'MUL'      // x * y
  | 'DIV'      // x / y
  | 'SQRT'     // √x
  | 'LOG'      // ln(x)
  | 'EXP'      // e^x
  | 'POW'      // x^y
  | 'SUM'      // Σ operands   (pairwise summation)
  | 'MEAN'     // arithmetic mean
  | 'VARIANCE' // sample variance (Welford online algorithm)

// ─────────────────────────────────────────────────────────────────────────────
// NAE INPUT / STATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input to NAE-Ω — a single numerical computation request.
 */
export interface NAEInput {
  /** Unique identifier (e.g. UUID or monotonic counter). */
  readonly operationId: string
  /** The operation to perform. */
  readonly operation: NumericalOperation
  /** Operand values (ordered: first is x, second is y for binary ops). */
  readonly operands: ReadonlyArray<number>
  /** Minimum acceptable precision level. */
  readonly requestedPrecision: PrecisionLevel
}

/**
 * Internal state of NAE-Ω (S component of KiyoshiModule).
 *
 * Maintained across calls for aggregate diagnostics.
 */
export interface NAEState {
  /** Whether NAE-Ω has been initialised. */
  readonly initialized: boolean
  /** Total number of operations processed since boot. */
  readonly operationCount: number
  /** Running sum of all absolute errors seen (for mean error calculation). */
  readonly cumulativeAbsoluteError: number
  /** Maximum absolute error observed across all operations. */
  readonly maxAbsoluteError: number
  /** Maximum condition number observed (> threshold is a warning). */
  readonly maxConditionNumber: number
  /** Count of results flagged as NaN or Infinite. */
  readonly abnormalResultCount: number
  /** Circular buffer of the most recent results (capped at 128). */
  readonly recentResults: ReadonlyArray<NumericalResult<number>>
}

// ─────────────────────────────────────────────────────────────────────────────
// CE-Ω PIPELINE TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single stage in the CE-Ω pipeline.
 *
 * The pipeline decomposes a composite computation into named stages,
 * each producing an annotated NumericalResult.
 */
export interface CEPipelineStage {
  /** Human-readable name for this pipeline stage. */
  readonly stageName: string
  /** The NAE-Ω input used at this stage. */
  readonly input: NAEInput
  /** The annotated result from NAE-Ω. */
  readonly result: NumericalResult<number>
  /** Wall-clock duration of this stage in milliseconds. */
  readonly durationMs: number
}

/**
 * A complete CE-Ω pipeline execution record.
 *
 * Produced by ComputationEnginePipeline.run() for every computation.
 */
export interface CEPipelineRecord {
  /** Unique pipeline execution identifier. */
  readonly pipelineId: string
  /** Human-readable description of the computation performed. */
  readonly description: string
  /** Ordered list of stages executed. */
  readonly stages: ReadonlyArray<CEPipelineStage>
  /** Total wall-clock duration in milliseconds. */
  readonly totalDurationMs: number
  /** Combined worst-case absolute error across all stages. */
  readonly combinedAbsoluteError: number
  /** Maximum condition number across all stages. */
  readonly maxConditionNumber: number
  /** Overall precision level (degraded to the lowest stage level). */
  readonly precision: PrecisionLevel
  /** Timestamp of pipeline execution start. */
  readonly timestamp: number
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSTIC PANEL TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Aggregate statistics rendered by DiagnosticPanel. */
export interface DiagnosticSummary {
  /** Total operations observed. */
  readonly totalOperations: number
  /** Mean absolute error across all operations. */
  readonly meanAbsoluteError: number
  /** Maximum absolute error observed. */
  readonly maxAbsoluteError: number
  /** Maximum condition number observed (κ_max). */
  readonly maxConditionNumber: number
  /** Number of NaN or Infinite results. */
  readonly abnormalCount: number
  /** Breakdown of results by precision level. */
  readonly precisionDistribution: Readonly<Record<PrecisionLevel, number>>
  /** Number of CE-Ω pipeline records in history. */
  readonly pipelineRecordCount: number
  /** Timestamp of the most recent computation. */
  readonly lastUpdated: number
}
