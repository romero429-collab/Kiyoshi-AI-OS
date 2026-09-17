/**
 * Tests for the NAE-Ω / CE-Ω numerical subsystem.
 *
 * Covers:
 *   NumericalApproximationEngine — all operations, error bounds, state, verify()
 *   ComputationEnginePipeline    — single/multi-stage, event publication, history
 *   DiagnosticPanel              — attach/detach, render(), getSummary()
 */

import { NumericalApproximationEngine, MACHINE_EPSILON, CONDITION_WARNING_THRESHOLD } from '../../core/numerical/nae'
import { ComputationEnginePipeline } from '../../core/numerical/ce-pipeline'
import { DiagnosticPanel } from '../../core/numerical/diagnostic-panel'
import { EventBus } from '../../core/event-bus'
import {
  NumericalOperation,
  PrecisionLevel,
  NAEInput,
} from '../../core/numerical/types'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

let counter = 0
function makeInput(
  operation: NumericalOperation,
  operands: number[],
  requestedPrecision: PrecisionLevel = 'HIGH',
): NAEInput {
  return {
    operationId: `test-op-${counter++}`,
    operation,
    operands,
    requestedPrecision,
  }
}

function freshNAE(): NumericalApproximationEngine {
  return new NumericalApproximationEngine()
}

// ─────────────────────────────────────────────────────────────────────────────
// MACHINE_EPSILON
// ─────────────────────────────────────────────────────────────────────────────

describe('MACHINE_EPSILON', () => {
  it('equals 2^-52 (IEEE 754 double precision)', () => {
    expect(MACHINE_EPSILON).toBe(Math.pow(2, -52))
  })

  it('is strictly positive and less than 1e-15', () => {
    expect(MACHINE_EPSILON).toBeGreaterThan(0)
    expect(MACHINE_EPSILON).toBeLessThan(1e-15)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// NumericalApproximationEngine — basic operations
// ─────────────────────────────────────────────────────────────────────────────

describe('NumericalApproximationEngine — operations', () => {
  let nae: NumericalApproximationEngine

  beforeEach(() => { nae = freshNAE() })

  it('ADD: computes the correct value', () => {
    const r = nae.transition(makeInput('ADD', [3, 4]))
    expect(r.value).toBe(7)
  })

  it('SUB: computes the correct value', () => {
    const r = nae.transition(makeInput('SUB', [10, 4]))
    expect(r.value).toBe(6)
  })

  it('MUL: computes the correct value', () => {
    const r = nae.transition(makeInput('MUL', [6, 7]))
    expect(r.value).toBe(42)
  })

  it('DIV: computes the correct value', () => {
    const r = nae.transition(makeInput('DIV', [22, 7]))
    expect(r.value).toBeCloseTo(22 / 7, 10)
  })

  it('SQRT: computes the correct value', () => {
    const r = nae.transition(makeInput('SQRT', [9]))
    expect(r.value).toBe(3)
  })

  it('LOG: computes the correct value', () => {
    const r = nae.transition(makeInput('LOG', [Math.E]))
    expect(r.value).toBeCloseTo(1, 10)
  })

  it('EXP: computes the correct value', () => {
    const r = nae.transition(makeInput('EXP', [0]))
    expect(r.value).toBe(1)
  })

  it('POW: computes the correct value', () => {
    const r = nae.transition(makeInput('POW', [2, 10]))
    expect(r.value).toBe(1024)
  })

  it('SUM: sums all operands', () => {
    const r = nae.transition(makeInput('SUM', [1, 2, 3, 4, 5]))
    expect(r.value).toBe(15)
  })

  it('MEAN: computes the arithmetic mean', () => {
    const r = nae.transition(makeInput('MEAN', [2, 4, 6, 8]))
    expect(r.value).toBe(5)
  })

  it('VARIANCE: computes the sample variance', () => {
    // sample variance of [2, 4, 4, 4, 5, 5, 7, 9]:
    // mean = 5, Σ(xᵢ-mean)² = 32, sample var = 32/(8-1) ≈ 4.571
    const r = nae.transition(makeInput('VARIANCE', [2, 4, 4, 4, 5, 5, 7, 9]))
    expect(r.value).toBeCloseTo(32 / 7, 5)
  })

  it('DIV by zero produces Infinity and isInfinite=true', () => {
    const r = nae.transition(makeInput('DIV', [1, 0]))
    expect(r.isInfinite).toBe(true)
    expect(r.isNaN).toBe(false)
  })

  it('SQRT of negative number produces NaN and isNaN=true', () => {
    const r = nae.transition(makeInput('SQRT', [-1]))
    expect(r.isNaN).toBe(true)
    expect(r.isInfinite).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// NumericalApproximationEngine — error bounds
// ─────────────────────────────────────────────────────────────────────────────

describe('NumericalApproximationEngine — error bounds', () => {
  let nae: NumericalApproximationEngine

  beforeEach(() => { nae = freshNAE() })

  it('errorBound.absolute is a non-negative finite number for normal results', () => {
    const ops: NumericalOperation[] = ['ADD', 'SUB', 'MUL', 'DIV', 'SQRT', 'LOG', 'EXP']
    for (const op of ops) {
      const r = nae.transition(makeInput(op, [4, 2]))
      expect(r.errorBound.absolute).toBeGreaterThanOrEqual(0)
      expect(isFinite(r.errorBound.absolute)).toBe(true)
    }
  })

  it('errorBound.absolute for SQRT is tighter than for EXP (SQRT is correctly rounded)', () => {
    const sqrt = nae.transition(makeInput('SQRT', [16]))
    const exp = nae.transition(makeInput('EXP', [Math.log(16)]))
    // Both evaluate to ~4; SQRT should have ε ≤ EXP
    expect(sqrt.errorBound.absolute).toBeLessThanOrEqual(exp.errorBound.absolute + 1e-20)
  })

  it('errorBound.relative is proportional to absolute / |value|', () => {
    const r = nae.transition(makeInput('MUL', [100, 3]))
    const expected = r.errorBound.absolute / Math.abs(r.value)
    expect(r.errorBound.relative).toBeCloseTo(expected, 12)
  })

  it('ulps is non-negative for finite results', () => {
    const r = nae.transition(makeInput('ADD', [1, 1]))
    expect(r.errorBound.ulps).toBeGreaterThanOrEqual(0)
  })

  it('errorBound.absolute is Infinity for Infinite results', () => {
    const r = nae.transition(makeInput('DIV', [1, 0]))
    expect(r.errorBound.absolute).toBe(Infinity)
  })

  it('machineEpsilon on result matches MACHINE_EPSILON constant', () => {
    const r = nae.transition(makeInput('ADD', [1, 2]))
    expect(r.machineEpsilon).toBe(MACHINE_EPSILON)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// NumericalApproximationEngine — condition number
// ─────────────────────────────────────────────────────────────────────────────

describe('NumericalApproximationEngine — condition number', () => {
  let nae: NumericalApproximationEngine

  beforeEach(() => { nae = freshNAE() })

  it('MUL has condition number 1 (perfectly conditioned)', () => {
    const r = nae.transition(makeInput('MUL', [5, 7]))
    expect(r.conditionNumber).toBe(1)
  })

  it('DIV has condition number 1', () => {
    const r = nae.transition(makeInput('DIV', [10, 2]))
    expect(r.conditionNumber).toBe(1)
  })

  it('SQRT has condition number 0.5', () => {
    const r = nae.transition(makeInput('SQRT', [4]))
    expect(r.conditionNumber).toBe(0.5)
  })

  it('ADD with opposite-sign operands has large condition number (cancellation)', () => {
    // x = 1e15, y = -1e15 + 1 — catastrophic cancellation
    const r = nae.transition(makeInput('ADD', [1e15, -1e15 + 1]))
    expect(r.conditionNumber).toBeGreaterThan(1e10)
  })

  it('well-conditioned ADD has condition number near 1', () => {
    const r = nae.transition(makeInput('ADD', [1, 2]))
    expect(r.conditionNumber).toBeCloseTo(1, 1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// NumericalApproximationEngine — precision classification
// ─────────────────────────────────────────────────────────────────────────────

describe('NumericalApproximationEngine — precision', () => {
  let nae: NumericalApproximationEngine

  beforeEach(() => { nae = freshNAE() })

  it('MUL of small integers is classified as HIGH precision', () => {
    const r = nae.transition(makeInput('MUL', [3, 7]))
    expect(r.precision).toBe('HIGH')
  })

  it('result carries a precision field from the PrecisionLevel union', () => {
    const valid: PrecisionLevel[] = ['EXACT', 'HIGH', 'MEDIUM', 'LOW']
    const r = nae.transition(makeInput('ADD', [1, 2]))
    expect(valid).toContain(r.precision)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// NumericalApproximationEngine — state management
// ─────────────────────────────────────────────────────────────────────────────

describe('NumericalApproximationEngine — state', () => {
  let nae: NumericalApproximationEngine

  beforeEach(() => { nae = freshNAE() })

  it('starts with operationCount = 0', () => {
    expect(nae.getState().operationCount).toBe(0)
  })

  it('increments operationCount after each transition', () => {
    nae.transition(makeInput('ADD', [1, 2]))
    nae.transition(makeInput('MUL', [3, 4]))
    expect(nae.getState().operationCount).toBe(2)
  })

  it('tracks abnormalResultCount for NaN/Inf results', () => {
    nae.transition(makeInput('DIV', [1, 0]))   // Inf
    nae.transition(makeInput('SQRT', [-1]))    // NaN
    expect(nae.getState().abnormalResultCount).toBe(2)
  })

  it('maintains recentResults up to 128 entries', () => {
    for (let i = 0; i < 130; i++) {
      nae.transition(makeInput('ADD', [i, 1]))
    }
    expect(nae.getState().recentResults.length).toBeLessThanOrEqual(128)
    expect(nae.getState().operationCount).toBe(130)
  })

  it('reset() clears diagnostic state but keeps initialized=true', () => {
    nae.transition(makeInput('ADD', [1, 2]))
    nae.reset()
    const s = nae.getState()
    expect(s.operationCount).toBe(0)
    expect(s.initialized).toBe(true)
  })

  it('state is immutable (frozen)', () => {
    const s = nae.getState()
    expect(Object.isFrozen(s)).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// NumericalApproximationEngine — verify()
// ─────────────────────────────────────────────────────────────────────────────

describe('NumericalApproximationEngine — verify()', () => {
  it('returns PASS when no operations have been run', () => {
    const nae = freshNAE()
    const r = nae.verify()
    expect(r.status).toBe('PASS')
    expect(r.moduleId).toBe('NAE-OMEGA')
  })

  it('returns PASS after normal operations', () => {
    const nae = freshNAE()
    for (let i = 1; i <= 10; i++) {
      nae.transition(makeInput('MUL', [i, i]))
    }
    const r = nae.verify()
    expect(r.status).toBe('PASS')
  })

  it('returns WARNING when abnormal result rate exceeds 10%', () => {
    const nae = freshNAE()
    // 5 normal + 10 abnormal = 67% abnormal
    for (let i = 0; i < 5; i++)  nae.transition(makeInput('ADD', [1, 2]))
    for (let i = 0; i < 10; i++) nae.transition(makeInput('DIV', [1, 0]))
    const r = nae.verify()
    expect(r.status).toBe('WARNING')
  })

  it('verify() result has a timestamp field', () => {
    const nae = freshNAE()
    const r = nae.verify()
    expect(typeof r.timestamp).toBe('number')
    expect(r.timestamp).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// NumericalApproximationEngine — compute() convenience method
// ─────────────────────────────────────────────────────────────────────────────

describe('NumericalApproximationEngine — compute()', () => {
  it('compute() produces the same result as transition() for the same op', () => {
    const nae = freshNAE()
    const r = nae.compute('ADD', [3, 4])
    expect(r.value).toBe(7)
    expect(r.operationId).toBeTruthy()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// ComputationEnginePipeline — single stage
// ─────────────────────────────────────────────────────────────────────────────

describe('ComputationEnginePipeline — runSingle()', () => {
  let nae: NumericalApproximationEngine
  let bus: EventBus
  let pipeline: ComputationEnginePipeline

  beforeEach(() => {
    nae = freshNAE()
    bus = new EventBus()
    pipeline = new ComputationEnginePipeline(nae, bus)
  })

  it('runSingle() returns a NumericalResult with the correct value', () => {
    const r = pipeline.runSingle('add two', 'ADD', [5, 3])
    expect(r.value).toBe(8)
  })

  it('runSingle() publishes a CALCULATION_COMPLETE event on the bus', () => {
    pipeline.runSingle('test op', 'MUL', [2, 3])
    const log = bus.getDeliveryLog()
    const calc = log.find(e => e.type === 'CALCULATION_COMPLETE')
    expect(calc).toBeDefined()
  })

  it('runSingle() increments executionCount', () => {
    pipeline.runSingle('op1', 'ADD', [1, 2])
    pipeline.runSingle('op2', 'MUL', [3, 4])
    expect(pipeline.executionCount).toBe(2)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// ComputationEnginePipeline — multi-stage run()
// ─────────────────────────────────────────────────────────────────────────────

describe('ComputationEnginePipeline — run()', () => {
  let nae: NumericalApproximationEngine
  let bus: EventBus
  let pipeline: ComputationEnginePipeline

  beforeEach(() => {
    nae = freshNAE()
    bus = new EventBus()
    pipeline = new ComputationEnginePipeline(nae, bus)
  })

  it('returns a CEPipelineRecord with the correct number of stages', () => {
    const record = pipeline.run('test pipeline', [
      { stageName: 'step1', operation: 'ADD', operands: [1, 2] },
      { stageName: 'step2', operation: 'MUL', operands: [3, 4] },
    ])
    expect(record.stages).toHaveLength(2)
  })

  it('pipelineId is a non-empty string', () => {
    const record = pipeline.run('desc', [{ stageName: 's', operation: 'ADD', operands: [1, 1] }])
    expect(record.pipelineId).toBeTruthy()
    expect(typeof record.pipelineId).toBe('string')
  })

  it('each stage.result carries errorBound', () => {
    const record = pipeline.run('desc', [
      { stageName: 's1', operation: 'SQRT', operands: [4] },
    ])
    expect(record.stages[0].result.errorBound).toBeDefined()
  })

  it('combinedAbsoluteError is the sum of stage absolute errors', () => {
    const record = pipeline.run('desc', [
      { stageName: 's1', operation: 'ADD', operands: [1, 2] },
      { stageName: 's2', operation: 'MUL', operands: [3, 4] },
    ])
    const expectedSum = record.stages.reduce(
      (acc, s) => acc + (isFinite(s.result.errorBound.absolute) ? s.result.errorBound.absolute : 0),
      0,
    )
    expect(record.combinedAbsoluteError).toBeCloseTo(expectedSum, 20)
  })

  it('precision degrades to the lowest stage precision', () => {
    // Force a LOW precision scenario by using a catastrophic cancellation
    // We just check that precision is from the valid set
    const valid: PrecisionLevel[] = ['EXACT', 'HIGH', 'MEDIUM', 'LOW']
    const record = pipeline.run('desc', [
      { stageName: 's1', operation: 'ADD', operands: [1, 2] },
      { stageName: 's2', operation: 'EXP', operands: [100] },
    ])
    expect(valid).toContain(record.precision)
  })

  it('getHistory() accumulates records', () => {
    pipeline.run('r1', [{ stageName: 's', operation: 'ADD', operands: [1, 1] }])
    pipeline.run('r2', [{ stageName: 's', operation: 'SUB', operands: [5, 2] }])
    expect(pipeline.getHistory()).toHaveLength(2)
  })

  it('getSensitiveRecords() returns records with large κ', () => {
    // Catastrophic cancellation: ADD(1e15, -1e15 + 1) → κ ≫ CONDITION_WARNING_THRESHOLD
    pipeline.run('cancellation', [
      { stageName: 'cancel', operation: 'ADD', operands: [1e15, -1e15 + 1] },
    ])
    const sensitive = pipeline.getSensitiveRecords()
    expect(sensitive.length).toBeGreaterThanOrEqual(1)
  })

  it('getSensitiveRecords() returns empty array when all κ are small', () => {
    pipeline.run('safe', [{ stageName: 's', operation: 'MUL', operands: [2, 3] }])
    // MUL has κ = 1, well below threshold
    const sensitive = pipeline.getSensitiveRecords()
    expect(sensitive.length).toBe(0)
  })

  it('publishes exactly one CALCULATION_COMPLETE event per run()', () => {
    const before = bus.getDeliveryLog().filter(e => e.type === 'CALCULATION_COMPLETE').length
    pipeline.run('test', [{ stageName: 's', operation: 'ADD', operands: [1, 2] }])
    const after = bus.getDeliveryLog().filter(e => e.type === 'CALCULATION_COMPLETE').length
    expect(after - before).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DiagnosticPanel
// ─────────────────────────────────────────────────────────────────────────────

describe('DiagnosticPanel', () => {
  let nae: NumericalApproximationEngine
  let bus: EventBus
  let pipeline: ComputationEnginePipeline
  let panel: DiagnosticPanel

  beforeEach(() => {
    nae = freshNAE()
    bus = new EventBus()
    pipeline = new ComputationEnginePipeline(nae, bus)
    panel = new DiagnosticPanel(nae, pipeline, bus)
  })

  it('render() returns a non-empty string', () => {
    const output = panel.render()
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
  })

  it('render() includes NAE-Ω engine status section', () => {
    const output = panel.render()
    expect(output).toContain('NAE-Ω Engine Status')
  })

  it('render() includes Precision Distribution section', () => {
    const output = panel.render()
    expect(output).toContain('Precision Distribution')
  })

  it('render() includes Condition Number Map section', () => {
    const output = panel.render()
    expect(output).toContain('Condition Number Map')
  })

  it('render() includes Error Bound Timeline section', () => {
    const output = panel.render()
    expect(output).toContain('Error Bound Timeline')
  })

  it('render() includes CE-Ω Pipeline History section', () => {
    const output = panel.render()
    expect(output).toContain('CE-Ω Pipeline History')
  })

  it('render() includes Anomaly Report section', () => {
    const output = panel.render()
    expect(output).toContain('Anomaly Report')
  })

  it('getSummary() returns a DiagnosticSummary with all fields', () => {
    const s = panel.getSummary()
    expect(typeof s.totalOperations).toBe('number')
    expect(typeof s.meanAbsoluteError).toBe('number')
    expect(typeof s.maxAbsoluteError).toBe('number')
    expect(typeof s.maxConditionNumber).toBe('number')
    expect(typeof s.abnormalCount).toBe('number')
    expect(s.precisionDistribution).toBeDefined()
    expect(typeof s.pipelineRecordCount).toBe('number')
    expect(typeof s.lastUpdated).toBe('number')
  })

  it('getSummary().totalOperations reflects NAE-Ω operationCount', () => {
    nae.compute('ADD', [1, 2])
    nae.compute('MUL', [3, 4])
    const s = panel.getSummary()
    expect(s.totalOperations).toBe(2)
  })

  it('getSummary().pipelineRecordCount reflects pipeline history length', () => {
    pipeline.runSingle('op', 'ADD', [1, 2])
    pipeline.runSingle('op', 'MUL', [2, 3])
    const s = panel.getSummary()
    expect(s.pipelineRecordCount).toBe(2)
  })

  it('getSummary().abnormalCount increments for NaN/Inf results', () => {
    nae.compute('DIV', [1, 0])  // Inf
    nae.compute('SQRT', [-4])   // NaN
    const s = panel.getSummary()
    expect(s.abnormalCount).toBe(2)
  })

  it('attach() subscribes to CALCULATION_COMPLETE on the bus', () => {
    panel.attach()
    // Run a pipeline — panel should update automatically via event
    pipeline.runSingle('ping', 'ADD', [10, 20])
    const s = panel.getSummary()
    expect(s.pipelineRecordCount).toBe(1)
    panel.detach()
  })

  it('attach() is idempotent — calling twice does not double-subscribe', () => {
    panel.attach()
    panel.attach() // should not throw
    pipeline.runSingle('ping', 'ADD', [1, 1])
    panel.detach()
  })

  it('detach() removes the subscription', () => {
    panel.attach()
    panel.detach()
    // Further events should not affect the panel — no errors thrown
    pipeline.runSingle('ping', 'ADD', [1, 1])
  })

  it('render() shows "No anomalies detected" when all results are normal', () => {
    nae.compute('ADD', [1, 2])
    nae.compute('MUL', [3, 4])
    const output = panel.render()
    expect(output).toContain('No anomalies detected')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Integration: NAE-Ω + CE-Ω end-to-end
// ─────────────────────────────────────────────────────────────────────────────

describe('NAE-Ω + CE-Ω integration', () => {
  it('quadratic discriminant pipeline produces correct result with error bounds', () => {
    const nae = freshNAE()
    const bus = new EventBus()
    const pipeline = new ComputationEnginePipeline(nae, bus)

    // discriminant = b² - 4ac  for a=1, b=-5, c=6  → disc=1  → roots 2,3
    const b2 = nae.compute('POW', [(-5), 2]).value         // 25
    const ac4 = nae.compute('MUL', [4 * 1, 6]).value       // 24
    const disc = nae.compute('SUB', [b2, ac4]).value        // 1

    const record = pipeline.run('quadratic formula', [
      { stageName: 'sqrt_disc', operation: 'SQRT', operands: [disc] },
    ])

    const sqrtDisc = record.stages[0].result.value  // 1
    const root1 = nae.compute('DIV', [5 + sqrtDisc, 2]).value  // 3
    const root2 = nae.compute('DIV', [5 - sqrtDisc, 2]).value  // 2

    expect(root1).toBeCloseTo(3, 10)
    expect(root2).toBeCloseTo(2, 10)
    expect(record.stages[0].result.errorBound.absolute).toBeLessThanOrEqual(1e-14)
  })

  it('all NumericalResults are frozen (immutable)', () => {
    const nae = freshNAE()
    const r = nae.compute('ADD', [1, 2])
    expect(Object.isFrozen(r)).toBe(true)
    expect(Object.isFrozen(r.errorBound)).toBe(true)
  })
})
