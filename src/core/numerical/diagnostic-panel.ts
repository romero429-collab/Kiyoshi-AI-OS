/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume II — Numerical Analysis Layer
 * NAE-Ω Diagnostic Panel — Visualization Center
 *
 * The DiagnosticPanel is the visualization interface for NAE-Ω and CE-Ω.
 * It subscribes to CALCULATION_COMPLETE events on the EventBus and maintains
 * a live view of numerical computation health across the system.
 *
 * Panels rendered:
 *   ① NAE-Ω Engine Status    — initialisation, operation count, error statistics
 *   ② Precision Distribution — histogram of EXACT/HIGH/MEDIUM/LOW results
 *   ③ Condition Number Map   — worst κ values per pipeline, instability alerts
 *   ④ Error Bound Timeline   — most recent absolute errors (spark-line)
 *   ⑤ CE-Ω Pipeline History  — last N pipeline records with timing and precision
 *   ⑥ Anomaly Report         — NaN/Inf occurrences and sensitive pipelines
 *
 * Axiom 5 (Observability): all internal state is exposed through read-only
 * accessors and the render() method.
 *
 * Complexity — render: O(r + h) where r = recent results, h = pipeline history.
 */

import { EventBus } from '../event-bus'
import { NumericalApproximationEngine } from './nae'
import { ComputationEnginePipeline } from './ce-pipeline'
import {
  DiagnosticSummary,
  PrecisionLevel,
  CEPipelineRecord,
  NumericalResult,
} from './types'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const PANEL_WIDTH = 72
const SPARK_WIDTH = 20
const MAX_TIMELINE_ENTRIES = SPARK_WIDTH

// Condition number threshold above which a record is flagged as sensitive
const KAPPA_WARN = 1e8

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSTIC PANEL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DiagnosticPanel — NAE-Ω / CE-Ω visualization center.
 *
 * Attach to the EventBus via attach() to begin receiving live updates.
 * Call render() at any time to obtain a fully formatted diagnostic report.
 * Call getSummary() for a structured, machine-readable snapshot.
 */
export class DiagnosticPanel {
  private readonly nae: NumericalApproximationEngine
  private readonly pipeline: ComputationEnginePipeline
  private readonly bus: EventBus

  /** Subscription ID registered on the EventBus. */
  private subscriptionId: string | null = null

  /** Running precision distribution counters. */
  private precisionCounts: Record<PrecisionLevel, number> = {
    EXACT: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  }

  /** Circular buffer of recent absolute errors for spark-line rendering. */
  private readonly errorTimeline: number[] = []

  /** Total number of results observed by the panel. */
  private observedCount = 0

  /** Timestamp of last update. */
  private lastUpdated = 0

  constructor(
    nae: NumericalApproximationEngine,
    pipeline: ComputationEnginePipeline,
    bus: EventBus,
  ) {
    this.nae = nae
    this.pipeline = pipeline
    this.bus = bus
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /**
   * Subscribe to CALCULATION_COMPLETE events on the EventBus.
   * Must be called once before the panel begins tracking live updates.
   *
   * Idempotent: calling attach() more than once is a no-op.
   *
   * Complexity: O(1).
   */
  attach(): void {
    if (this.subscriptionId !== null) return
    this.subscriptionId = 'DIAGNOSTIC-PANEL'
    this.bus.subscribe(
      'DIAGNOSTIC-PANEL',
      'CALCULATION_COMPLETE',
      (_event) => {
        this.syncFromNAE()
      },
    )
  }

  /**
   * Unsubscribe from the EventBus.
   *
   * Complexity: O(1).
   */
  detach(): void {
    if (this.subscriptionId === null) return
    this.bus.unsubscribeAll('DIAGNOSTIC-PANEL')
    this.subscriptionId = null
  }

  /**
   * Manually synchronise panel state from NAE-Ω.
   * Called automatically on each CALCULATION_COMPLETE event.
   * May also be called directly after batch computations.
   *
   * Complexity: O(r) where r = recentResults.length.
   */
  syncFromNAE(): void {
    const state = this.nae.getState()
    const allResults = state.recentResults

    // Re-count from scratch based on latest NAE state
    const counts: Record<PrecisionLevel, number> = { EXACT: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
    for (const r of allResults) {
      counts[r.precision]++
    }
    this.precisionCounts = counts
    this.observedCount = state.operationCount
    this.lastUpdated = Date.now()

    // Rebuild error timeline from recent results (newest last)
    const recent = allResults.slice(-MAX_TIMELINE_ENTRIES)
    this.errorTimeline.length = 0
    for (const r of recent) {
      this.errorTimeline.push(
        isFinite(r.errorBound.absolute) ? r.errorBound.absolute : 0,
      )
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  /**
   * Render a full diagnostic report as a formatted string.
   *
   * The report includes six panels:
   *   ① Engine status, ② Precision distribution, ③ Condition number map,
   *   ④ Error timeline, ⑤ Pipeline history, ⑥ Anomaly report.
   *
   * Complexity: O(r + h).
   */
  render(): string {
    this.syncFromNAE()
    const lines: string[] = []

    const hr = '═'.repeat(PANEL_WIDTH)
    const div = '─'.repeat(PANEL_WIDTH)

    lines.push(hr)
    lines.push(this.centre('NAE-Ω / CE-Ω  DIAGNOSTIC PANEL'))
    lines.push(hr)
    lines.push('')

    lines.push(...this.renderEngineStatus())
    lines.push(div)
    lines.push(...this.renderPrecisionDistribution())
    lines.push(div)
    lines.push(...this.renderConditionMap())
    lines.push(div)
    lines.push(...this.renderErrorTimeline())
    lines.push(div)
    lines.push(...this.renderPipelineHistory())
    lines.push(div)
    lines.push(...this.renderAnomalyReport())

    lines.push(hr)
    return lines.join('\n')
  }

  // ── Structured summary ─────────────────────────────────────────────────────

  /**
   * Return a machine-readable DiagnosticSummary.
   *
   * Complexity: O(1) after syncFromNAE().
   */
  getSummary(): DiagnosticSummary {
    this.syncFromNAE()
    const state = this.nae.getState()

    const meanAbsoluteError = state.operationCount > 0
      ? state.cumulativeAbsoluteError / state.operationCount
      : 0

    return Object.freeze({
      totalOperations: state.operationCount,
      meanAbsoluteError,
      maxAbsoluteError: state.maxAbsoluteError,
      maxConditionNumber: state.maxConditionNumber,
      abnormalCount: state.abnormalResultCount,
      precisionDistribution: Object.freeze({ ...this.precisionCounts }),
      pipelineRecordCount: this.pipeline.getHistory().length,
      lastUpdated: this.lastUpdated,
    })
  }

  // ── Panel renderers ────────────────────────────────────────────────────────

  /** ① NAE-Ω Engine Status */
  private renderEngineStatus(): string[] {
    const state = this.nae.getState()
    const vr = this.nae.verify()
    const icon = vr.status === 'PASS' ? '✅' : vr.status === 'WARNING' ? '⚠️ ' : '❌'
    const mean = state.operationCount > 0
      ? (state.cumulativeAbsoluteError / state.operationCount).toExponential(3)
      : 'N/A'

    return [
      `  ① NAE-Ω Engine Status`,
      `     Module:        ${this.nae.moduleId} v${this.nae.version}`,
      `     Status:        ${icon} ${vr.status}  — ${vr.message}`,
      `     Operations:    ${state.operationCount}`,
      `     ε_mach:        2^-52 = ${(2 ** -52).toExponential(3)}`,
      `     Mean ε_abs:    ${mean}`,
      `     Max ε_abs:     ${state.maxAbsoluteError.toExponential(3)}`,
      `     Max κ:         ${state.maxConditionNumber.toExponential(3)}`,
      `     Abnormal:      ${state.abnormalResultCount} (NaN + Inf)`,
      '',
    ]
  }

  /** ② Precision Distribution */
  private renderPrecisionDistribution(): string[] {
    const total = this.observedCount || 1
    const levels: PrecisionLevel[] = ['EXACT', 'HIGH', 'MEDIUM', 'LOW']
    const lines = ['  ② Precision Distribution']

    for (const level of levels) {
      const count = this.precisionCounts[level]
      const pct = (count / total * 100).toFixed(1)
      const barLen = Math.round(count / total * 30)
      const bar = '█'.repeat(barLen) + '░'.repeat(30 - barLen)
      lines.push(`     ${level.padEnd(7)} ${bar}  ${count.toString().padStart(5)} (${pct}%)`)
    }
    lines.push('')
    return lines
  }

  /** ③ Condition Number Map (worst κ per pipeline) */
  private renderConditionMap(): string[] {
    const history = this.pipeline.getHistory()
    const lines = ['  ③ Condition Number Map  (last 5 pipelines)']

    const recent = history.slice(-5)
    if (recent.length === 0) {
      lines.push('     No pipeline records yet.')
    } else {
      for (const rec of recent) {
        const flag = rec.maxConditionNumber > KAPPA_WARN ? ' ⚠️  SENSITIVE' : ''
        lines.push(
          `     [${rec.pipelineId}] κ=${rec.maxConditionNumber.toExponential(3)}` +
          `  prec=${rec.precision}  ${rec.description.slice(0, 22)}${flag}`,
        )
      }
    }
    lines.push('')
    return lines
  }

  /** ④ Error Timeline (spark-line of recent absolute errors) */
  private renderErrorTimeline(): string[] {
    const lines = ['  ④ Error Bound Timeline  (recent ε_abs, log₁₀ scale)']

    if (this.errorTimeline.length === 0) {
      lines.push('     No data yet.')
    } else {
      const chars = this.errorTimeline.map(e => logScaleChar(e))
      lines.push(`     ${chars.join('')}`)
      lines.push(`     ▲ log₁₀(ε_abs): ░=0  ▁=−4  ▃=−8  ▅=−12  █=−16`)
    }
    lines.push('')
    return lines
  }

  /** ⑤ CE-Ω Pipeline History */
  private renderPipelineHistory(): string[] {
    const history = this.pipeline.getHistory()
    const lines = ['  ⑤ CE-Ω Pipeline History  (last 5 records)']

    const recent = history.slice(-5)
    if (recent.length === 0) {
      lines.push('     No pipeline runs yet.')
    } else {
      for (const rec of recent) {
        lines.push(
          `     [${rec.pipelineId}] ${rec.stages.length} stage(s)` +
          `  ${rec.totalDurationMs}ms  ε_sum=${rec.combinedAbsoluteError.toExponential(3)}` +
          `  prec=${rec.precision}`,
        )
        lines.push(`       ↳ "${rec.description.slice(0, 55)}"`)
      }
    }
    lines.push('')
    return lines
  }

  /** ⑥ Anomaly Report */
  private renderAnomalyReport(): string[] {
    const state = this.nae.getState()
    const sensitive = this.pipeline.getSensitiveRecords()
    const lines = ['  ⑥ Anomaly Report']

    if (state.abnormalResultCount === 0 && sensitive.length === 0) {
      lines.push('     ✅ No anomalies detected.')
    }

    if (state.abnormalResultCount > 0) {
      const recentAbnormal = state.recentResults
        .filter((r: NumericalResult<number>) => r.isNaN || r.isInfinite)
        .slice(-3)
      lines.push(`     ⚠️  ${state.abnormalResultCount} abnormal result(s) (NaN/Inf):`)
      for (const r of recentAbnormal) {
        const kind = r.isNaN ? 'NaN' : 'Inf'
        lines.push(`        op=${r.operationId.slice(0, 12)}  value=${kind}`)
      }
    }

    if (sensitive.length > 0) {
      lines.push(`     ⚠️  ${sensitive.length} numerically sensitive pipeline(s) (κ > ${KAPPA_WARN.toExponential(0)}):`)
      for (const rec of sensitive.slice(-3)) {
        lines.push(`        [${rec.pipelineId}] "${rec.description.slice(0, 40)}"  κ=${rec.maxConditionNumber.toExponential(3)}`)
      }
    }

    lines.push('')
    return lines
  }

  // ── Formatting helpers ─────────────────────────────────────────────────────

  private centre(text: string): string {
    const pad = Math.max(0, Math.floor((PANEL_WIDTH - text.length) / 2))
    return ' '.repeat(pad) + text
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SPARK-LINE CHARACTER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map an absolute error value to a block character using log₁₀ scale.
 *
 *  0  → ░  (zero error)
 *  >0, >-4  → ▁
 *  >-8      → ▃
 *  >-12     → ▅
 *  >-16     → █  (near machine epsilon)
 *
 * Complexity: O(1).
 */
function logScaleChar(absError: number): string {
  if (absError === 0) return '░'
  if (!isFinite(absError) || absError < 0) return '?'
  const log = Math.log10(absError)
  if (log > -4)  return '▁'
  if (log > -8)  return '▃'
  if (log > -12) return '▅'
  return '█'
}
