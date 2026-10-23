/**
 * Tests for core/event-bus.ts
 *
 * Covers: createEvent, verifyEventIntegrity, EventBus subscribe/publish/unsubscribe.
 * Maps to Axioms 1 (Determinism), 2 (Modularity), 5 (Observability) and
 * Invariants 2 (event origin), 3 (transition log), 4 (reproducibility).
 */

import { createEvent, verifyEventIntegrity, EventBus } from '../../core/event-bus'
import { EventType, KiyoshiEvent } from '../../core/types'

// ─────────────────────────────────────────────────────────────────────────────
// createEvent
// ─────────────────────────────────────────────────────────────────────────────

describe('createEvent', () => {
  it('creates an event with the correct type and source module', () => {
    const event = createEvent('AI_REQUEST', { query: 'hello' }, 'MOD-A')
    expect(event.type).toBe('AI_REQUEST')
    expect(event.sourceModuleId).toBe('MOD-A')
  })

  it('defaults destination to broadcast (*)', () => {
    const event = createEvent('INPUT_EVENT', null, 'MOD-A')
    expect(event.destinationModuleId).toBe('*')
  })

  it('defaults priority to NORMAL', () => {
    const event = createEvent('INPUT_EVENT', null, 'MOD-A')
    expect(event.priority).toBe('NORMAL')
  })

  it('accepts an explicit destination and priority', () => {
    const event = createEvent('AI_REQUEST', null, 'MOD-A', 'MOD-B', 'HIGH')
    expect(event.destinationModuleId).toBe('MOD-B')
    expect(event.priority).toBe('HIGH')
  })

  it('assigns a non-empty unique id', () => {
    const a = createEvent('INPUT_EVENT', null, 'MOD-A')
    const b = createEvent('INPUT_EVENT', null, 'MOD-A')
    expect(a.id).toBeTruthy()
    expect(b.id).toBeTruthy()
    expect(a.id).not.toBe(b.id)
  })

  it('produces a non-empty verificationHash (SHA-256 hex)', () => {
    const event = createEvent('INPUT_EVENT', null, 'MOD-A')
    expect(event.verificationHash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('freezes the event object so it is immutable', () => {
    const event = createEvent('INPUT_EVENT', null, 'MOD-A')
    expect(Object.isFrozen(event)).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// verifyEventIntegrity
// ─────────────────────────────────────────────────────────────────────────────

describe('verifyEventIntegrity', () => {
  it('returns true for an unmodified event', () => {
    const event = createEvent('AI_REQUEST', {}, 'MOD-A')
    expect(verifyEventIntegrity(event)).toBe(true)
  })

  it('returns false when the verificationHash is tampered with', () => {
    const event = createEvent('AI_REQUEST', {}, 'MOD-A')
    // Produce a tampered copy with an incorrect hash
    const tampered: KiyoshiEvent = { ...event, verificationHash: 'deadbeef' }
    expect(verifyEventIntegrity(tampered)).toBe(false)
  })

  it('returns false when the sourceModuleId is changed after creation', () => {
    const event = createEvent('AI_REQUEST', {}, 'MOD-A')
    const tampered: KiyoshiEvent = { ...event, sourceModuleId: 'ATTACKER' }
    expect(verifyEventIntegrity(tampered)).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// EventBus
// ─────────────────────────────────────────────────────────────────────────────

describe('EventBus', () => {
  let bus: EventBus

  beforeEach(() => {
    bus = new EventBus()
  })

  // ── Subscription management ──────────────────────────────────────────────

  it('subscribe registers a handler for an event type', () => {
    const handler = jest.fn()
    bus.subscribe('MOD-A', 'AI_REQUEST', handler)
    expect(bus.getSubscriptions('MOD-A')).toContain('AI_REQUEST')
  })

  it('does not register duplicate subscriptions for the same module + type', () => {
    const handler = jest.fn()
    bus.subscribe('MOD-A', 'AI_REQUEST', handler)
    bus.subscribe('MOD-A', 'AI_REQUEST', handler)
    expect(bus.getSubscriptions('MOD-A').filter(t => t === 'AI_REQUEST').length).toBe(1)
  })

  it('unsubscribeAll removes all subscriptions for a module', () => {
    bus.subscribe('MOD-A', 'AI_REQUEST', jest.fn())
    bus.subscribe('MOD-A', 'INPUT_EVENT', jest.fn())
    bus.unsubscribeAll('MOD-A')
    expect(bus.getSubscriptions('MOD-A')).toHaveLength(0)
  })

  it('unsubscribeAll does not affect other modules', () => {
    bus.subscribe('MOD-A', 'AI_REQUEST', jest.fn())
    bus.subscribe('MOD-B', 'AI_REQUEST', jest.fn())
    bus.unsubscribeAll('MOD-A')
    expect(bus.getSubscriptions('MOD-B')).toContain('AI_REQUEST')
  })

  // ── Event publication ────────────────────────────────────────────────────

  it('publish delivers a broadcast event to all subscribers of that type', () => {
    const handlerA = jest.fn()
    const handlerB = jest.fn()
    bus.subscribe('MOD-A', 'INPUT_EVENT', handlerA)
    bus.subscribe('MOD-B', 'INPUT_EVENT', handlerB)

    const event = createEvent('INPUT_EVENT', {}, 'SRC')
    bus.publish(event)

    expect(handlerA).toHaveBeenCalledWith(event)
    expect(handlerB).toHaveBeenCalledWith(event)
  })

  it('publish delivers an addressed event only to the named destination', () => {
    const handlerA = jest.fn()
    const handlerB = jest.fn()
    bus.subscribe('MOD-A', 'AI_REQUEST', handlerA)
    bus.subscribe('MOD-B', 'AI_REQUEST', handlerB)

    const event = createEvent('AI_REQUEST', {}, 'SRC', 'MOD-A', 'NORMAL')
    bus.publish(event)

    expect(handlerA).toHaveBeenCalledWith(event)
    expect(handlerB).not.toHaveBeenCalled()
  })

  it('publish does not invoke handlers for unsubscribed event types', () => {
    const handler = jest.fn()
    bus.subscribe('MOD-A', 'AI_REQUEST', handler)

    const event = createEvent('INPUT_EVENT', {}, 'SRC')
    bus.publish(event)

    expect(handler).not.toHaveBeenCalled()
  })

  it('publish throws when event integrity check fails', () => {
    const event = createEvent('AI_REQUEST', {}, 'SRC')
    const tampered: KiyoshiEvent = { ...event, verificationHash: 'bad' }
    expect(() => bus.publish(tampered)).toThrow(/integrity check failed/)
  })

  it('publish appends the event to the delivery log', () => {
    const event = createEvent('INPUT_EVENT', {}, 'SRC')
    bus.publish(event)
    expect(bus.getDeliveryLog()).toContain(event)
    expect(bus.deliveryCount).toBe(1)
  })

  // ── Transition log ───────────────────────────────────────────────────────

  it('recordTransition appends to the transition log', () => {
    const record = {
      tick: 1,
      timestamp: Date.now(),
      moduleId: 'MOD-A',
      eventId: 'evt-1',
      eventType: 'AI_REQUEST' as EventType,
      previousStateHash: 'aaa',
      nextStateHash: 'bbb',
    }
    bus.recordTransition(record)
    expect(bus.getTransitionLog()).toContain(record)
  })
})
