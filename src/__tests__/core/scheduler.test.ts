/**
 * Tests for core/scheduler.ts
 *
 * Covers: EventScheduler enqueue/dequeue priority ordering, tick, run,
 *         integrity verification, diagnostics.
 */

import { EventScheduler } from '../../core/scheduler'
import { createEvent } from '../../core/event-bus'
import { KiyoshiEvent } from '../../core/types'

// ─────────────────────────────────────────────────────────────────────────────
// EventScheduler
// ─────────────────────────────────────────────────────────────────────────────

describe('EventScheduler', () => {
  let scheduler: EventScheduler

  beforeEach(() => {
    scheduler = new EventScheduler()
  })

  // ── Queue basics ──────────────────────────────────────────────────────────

  it('starts empty', () => {
    expect(scheduler.isEmpty).toBe(true)
    expect(scheduler.depth).toBe(0)
  })

  it('enqueue increases depth', () => {
    scheduler.enqueue(createEvent('INPUT_EVENT', {}, 'SRC'))
    expect(scheduler.depth).toBe(1)
    expect(scheduler.isEmpty).toBe(false)
  })

  it('dequeue returns undefined when queue is empty', () => {
    expect(scheduler.dequeue()).toBeUndefined()
  })

  it('dequeue removes and returns the front event', () => {
    const ev = createEvent('INPUT_EVENT', {}, 'SRC')
    scheduler.enqueue(ev)
    expect(scheduler.dequeue()).toBe(ev)
    expect(scheduler.isEmpty).toBe(true)
  })

  // ── Priority ordering ─────────────────────────────────────────────────────

  it('CRITICAL events are dequeued before HIGH, NORMAL, LOW', () => {
    scheduler.enqueue(createEvent('INPUT_EVENT', {}, 'SRC', '*', 'LOW'))
    scheduler.enqueue(createEvent('INPUT_EVENT', {}, 'SRC', '*', 'NORMAL'))
    scheduler.enqueue(createEvent('INPUT_EVENT', {}, 'SRC', '*', 'CRITICAL'))
    scheduler.enqueue(createEvent('INPUT_EVENT', {}, 'SRC', '*', 'HIGH'))

    expect(scheduler.dequeue()!.priority).toBe('CRITICAL')
    expect(scheduler.dequeue()!.priority).toBe('HIGH')
    expect(scheduler.dequeue()!.priority).toBe('NORMAL')
    expect(scheduler.dequeue()!.priority).toBe('LOW')
  })

  it('FIFO order is preserved within the same priority', () => {
    const e1 = createEvent('INPUT_EVENT', { n: 1 }, 'SRC', '*', 'NORMAL')
    const e2 = createEvent('INPUT_EVENT', { n: 2 }, 'SRC', '*', 'NORMAL')
    const e3 = createEvent('INPUT_EVENT', { n: 3 }, 'SRC', '*', 'NORMAL')
    scheduler.enqueue(e1)
    scheduler.enqueue(e2)
    scheduler.enqueue(e3)
    expect(scheduler.dequeue()).toBe(e1)
    expect(scheduler.dequeue()).toBe(e2)
    expect(scheduler.dequeue()).toBe(e3)
  })

  // ── tick ──────────────────────────────────────────────────────────────────

  it('tick throws when no processor is registered', () => {
    scheduler.enqueue(createEvent('INPUT_EVENT', {}, 'SRC'))
    expect(() => scheduler.tick()).toThrow(/no processor registered/)
  })

  it('tick increments currentTick', () => {
    scheduler.setProcessor(() => [])
    scheduler.enqueue(createEvent('INPUT_EVENT', {}, 'SRC'))
    scheduler.tick()
    expect(scheduler.currentTick).toBe(1)
  })

  it('tick drains the queue and records diagnostics', () => {
    scheduler.setProcessor(() => [])
    scheduler.enqueue(createEvent('INPUT_EVENT', {}, 'SRC'))
    scheduler.enqueue(createEvent('AI_REQUEST', {}, 'SRC'))
    scheduler.tick()

    expect(scheduler.isEmpty).toBe(true)
    expect(scheduler.getDiagnostics()).toHaveLength(2)
  })

  it('tick records integrityPassed=true for a valid event', () => {
    scheduler.setProcessor(() => [])
    scheduler.enqueue(createEvent('INPUT_EVENT', {}, 'SRC'))
    scheduler.tick()

    const diag = scheduler.getDiagnostics()[0]
    expect(diag.integrityPassed).toBe(true)
    expect(diag.error).toBeNull()
  })

  it('tick records integrityPassed=false for a tampered event', () => {
    scheduler.setProcessor(() => [])
    const ev = createEvent('INPUT_EVENT', {}, 'SRC')
    const tampered: KiyoshiEvent = { ...ev, verificationHash: 'bad' }
    scheduler.enqueue(tampered)
    scheduler.tick()

    const diag = scheduler.getDiagnostics()[0]
    expect(diag.integrityPassed).toBe(false)
    expect(diag.error).toBeTruthy()
  })

  it('events emitted by the processor are queued for the next tick', () => {
    const emitted = createEvent('AI_RESPONSE', {}, 'MOD-A')
    // Emit AI_RESPONSE only when processing AI_REQUEST; return nothing otherwise
    scheduler.setProcessor((event) =>
      event.type === 'AI_REQUEST' ? [emitted] : [],
    )
    scheduler.enqueue(createEvent('AI_REQUEST', {}, 'SRC'))

    scheduler.tick() // processes AI_REQUEST, defers AI_RESPONSE
    expect(scheduler.depth).toBe(1)

    scheduler.tick() // processes AI_RESPONSE → no new events
    expect(scheduler.isEmpty).toBe(true)
  })

  // ── run ───────────────────────────────────────────────────────────────────

  it('run processes all enqueued events until empty', () => {
    scheduler.setProcessor(() => [])
    for (let i = 0; i < 5; i++) {
      scheduler.enqueue(createEvent('INPUT_EVENT', { i }, 'SRC'))
    }
    scheduler.run()
    expect(scheduler.isEmpty).toBe(true)
    expect(scheduler.getDiagnostics()).toHaveLength(5)
  })

  it('run stops at maxTicks to guard against infinite cycles', () => {
    // Processor always produces a new event → infinite loop without maxTicks
    scheduler.setProcessor(() => [createEvent('INPUT_EVENT', {}, 'SRC')])
    scheduler.enqueue(createEvent('INPUT_EVENT', {}, 'SRC'))
    scheduler.run(3) // must stop at 3 ticks
    expect(scheduler.currentTick).toBe(3)
  })

  // ── Observability ─────────────────────────────────────────────────────────

  it('getErrors returns only diagnostics that have an error', () => {
    scheduler.setProcessor(() => [])
    const valid = createEvent('INPUT_EVENT', {}, 'SRC')
    const tampered: KiyoshiEvent = { ...valid, verificationHash: 'bad' }
    scheduler.enqueue(valid)
    scheduler.enqueue(tampered)
    scheduler.tick()

    expect(scheduler.getErrors()).toHaveLength(1)
    expect(scheduler.getErrors()[0].error).toBeTruthy()
  })
})
