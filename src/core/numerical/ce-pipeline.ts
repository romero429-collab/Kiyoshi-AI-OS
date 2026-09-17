/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume II — Numerical Analysis Layer
 * CE-Ω: Computation Engine Pipeline
 *
 * CE-Ω provides a composable, multi-stage computation pipeline that:
 *   1. Accepts a sequence of named computation stages.
 *   2. Routes each stage through NAE-Ω for precision tracking.
 *   3. Returns a CEPipelineRecord annotating every result with error bounds.
 *   4. Emits CALCULATION_COMPLETE events on the Kiyoshi EventBus.
 *
 * Integration contract with NAE-Ω:
 *   - Every value produced by CE-Ω is wrapped in NumericalResult<number>.
 *   - Aggregate error and precision are reported per pipeline run.
 *   - If any stage's condition number exceeds CONDITION_WARNING_THRESHOLD,
 *     the pipeline marks itself as numerically sensitive.
 *
 * Axiom 1 (Determinism): given identical stage definitions and inputs, the
 * pipeline always produces identical results and error bounds.
 *
 * Complexity — run: O(Σ nᵢ) where nᵢ is the operand count of stage i.
 */

import { EventBus, createEvent } from '../event-bus'
import { NumericalApproximationEngine, CONDITION_WARNING_THRESHOLD } from './nae'
import {
  NAEInput,
  NumericalResult,
  CEPipelineStage,
  CEPipelineRecord,
  PrecisionLevel,
  NumericalOperation,
} from './types'
import { createHash } from 'crypto'

// ─────────────────────────────────────────────────────────────────────────────
// STAGE DEFINITION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A stage definition provided by the caller to ComputationEnginePipeline.
 *
 * Stages are independent; each describes one primitive operation.
 * To chain outputs, callers resolve operand values before building stages.
 */
export interface PipelineStageDefinition {
  /** Human-readable label for this stage (used in diagnostics). */
  readonly stageName: string
  /** The operation to perform. */
  readonly operation: NumericalOperation
  /**
   * Operand values.
   * For chained pipelines, callers should resolve prior stage results
   * before constructing this array.
   */
  readonly operands: ReadonlyArray<number>
  /** Minimum acceptable precision. */
  readonly requestedPrecision?: PrecisionLevel
}

// ─────────────────────────────────────────────────────────────────────────────
// PRECISION ORDERING
// ─────────────────────────────────────────────────────────────────────────────

const PRECISION_RANK: Record<PrecisionLevel, number> = {
  EXACT:  4,
  HIGH:   3,
  MEDIUM: 2,
  LOW:    1,
}

/**
 * Return the lower of two precision levels.
 * The overall pipeline precision degrades to its weakest stage.
 */
function lowerPrecision(a: PrecisionLevel, b: PrecisionLevel): PrecisionLevel {
  return PRECISION_RANK[a] <= PRECISION_RANK[b] ? a : b
}

// ─────────────────────────────────────────────────────────────────────────────
// CE-Ω PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CE-Ω — Computation Engine Pipeline.
 *
 * Composes a sequence of numerical stages, each processed by NAE-Ω.
 * After execution, every stage result carries rigorous error bounds and
 * the pipeline record summarises the aggregate precision.
 *
 * Usage example:
 *
 *   const pipeline = new ComputationEnginePipeline(nae, bus)
 *   const record = pipeline.run('Quadratic root', [
 *     { stageName: 'discriminant', operation: 'SUB', operands: [b*b, 4*a*c] },
 *     { stageName: 'sqrt_disc',   operation: 'SQRT', operands: [disc] },
 *     { stageName: 'root_plus',   operation: 'DIV',  operands: [(-b + sqrtDisc), 2*a] },
 *   ])
 *
 * Complexity — run: O(Σ nᵢ) where nᵢ = operand count for stage i.
 */
export class ComputationEnginePipeline {
  private readonly history: CEPipelineRecord[] = []
  private pipelineCounter = 0

  constructor(
    private readonly nae: NumericalApproximationEngine,
    private readonly bus: EventBus,
  ) {}

  // ── Pipeline execution ─────────────────────────────────────────────────────

  /**
   * Execute a named pipeline composed of ordered stage definitions.
   *
   * Steps:
   *   1. For each stage, build an NAEInput and call nae.transition().
   *   2. Accumulate stage timing and error statistics.
   *   3. Compute combined error, overall precision, and maximum κ.
   *   4. Publish a CALCULATION_COMPLETE event carrying the record.
   *   5. Store the record in history.
   *
   * Returns the complete CEPipelineRecord with all annotated results.
   *
   * Complexity: O(Σ nᵢ).
   */
  run(description: string, stages: ReadonlyArray<PipelineStageDefinition>): CEPipelineRecord {
    const pipelineStart = Date.now()
    const pipelineId = this.generatePipelineId()

    const completedStages: CEPipelineStage[] = []
    let combinedAbsoluteError = 0
    let maxConditionNumber = 0
    let overallPrecision: PrecisionLevel = 'HIGH'

    for (const def of stages) {
      const stageStart = Date.now()

      const input: NAEInput = {
        operationId: `${pipelineId}-${def.stageName}`,
        operation: def.operation,
        operands: def.operands,
        requestedPrecision: def.requestedPrecision ?? 'HIGH',
      }

      const result: NumericalResult<number> = this.nae.transition(input)
      const durationMs = Date.now() - stageStart

      const stage: CEPipelineStage = Object.freeze({
        stageName: def.stageName,
        input,
        result,
        durationMs,
      })

      completedStages.push(stage)

      if (isFinite(result.errorBound.absolute)) {
        combinedAbsoluteError += result.errorBound.absolute
      }

      if (isFinite(result.conditionNumber)) {
        maxConditionNumber = Math.max(maxConditionNumber, result.conditionNumber)
      }

      overallPrecision = lowerPrecision(overallPrecision, result.precision)
    }

    const record: CEPipelineRecord = Object.freeze({
      pipelineId,
      description,
      stages: Object.freeze(completedStages),
      totalDurationMs: Date.now() - pipelineStart,
      combinedAbsoluteError,
      maxConditionNumber,
      precision: overallPrecision,
      timestamp: pipelineStart,
    })

    this.history.push(record)
    this.publishEvent(record)

    return record
  }

  /**
   * Convenience: run a single operation through the pipeline.
   *
   * Equivalent to run(description, [{ stageName: description, ... }]).
   *
   * Complexity: O(n).
   */
  runSingle(
    description: string,
    operation: NumericalOperation,
    operands: ReadonlyArray<number>,
    requestedPrecision: PrecisionLevel = 'HIGH',
  ): NumericalResult<number> {
    const record = this.run(description, [{
      stageName: description,
      operation,
      operands,
      requestedPrecision,
    }])
    return record.stages[0].result
  }

  // ── Observability ──────────────────────────────────────────────────────────

  /** Full history of pipeline executions (Axiom 5: Observability). */
  getHistory(): ReadonlyArray<CEPipelineRecord> {
    return this.history
  }

  /** Number of pipelines executed. */
  get executionCount(): number {
    return this.history.length
  }

  /**
   * Return the subset of records where maxConditionNumber exceeds the
   * CONDITION_WARNING_THRESHOLD — numerically sensitive computations.
   *
   * Complexity: O(history.length).
   */
  getSensitiveRecords(): ReadonlyArray<CEPipelineRecord> {
    return this.history.filter(r => r.maxConditionNumber > CONDITION_WARNING_THRESHOLD)
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private publishEvent(record: CEPipelineRecord): void {
    const event = createEvent(
      'CALCULATION_COMPLETE',
      {
        pipelineId: record.pipelineId,
        description: record.description,
        stages: record.stages.length,
        precision: record.precision,
        combinedAbsoluteError: record.combinedAbsoluteError,
        maxConditionNumber: record.maxConditionNumber,
        durationMs: record.totalDurationMs,
      },
      'CE-OMEGA',
      '*',
      'NORMAL',
    )
    this.bus.publish(event)
  }

  private generatePipelineId(): string {
    return createHash('sha256')
      .update(`pipeline-${Date.now()}-${this.pipelineCounter++}`)
      .digest('hex')
      .slice(0, 12)
  }
}
