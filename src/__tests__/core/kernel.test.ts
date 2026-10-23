/**
 * Tests for core/kernel.ts
 *
 * Covers: Kernel module registration/unregistration, applyTransition (Φ),
 *         subsystem update, verifyAll, observability methods, hashState.
 */

import { Kernel, hashState } from '../../core/kernel'
import { EventBus, createEvent } from '../../core/event-bus'
import { EventScheduler } from '../../core/scheduler'
import {
  KiyoshiModule,
  VerificationResult,
  ComplexityProfile,
  KiyoshiEvent,
  SubsystemState,
} from '../../core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Minimal KiyoshiModule implementation for testing
// ─────────────────────────────────────────────────────────────────────────────

function makeModule(
  id: string,
  handler?: (event: KiyoshiEvent) => unknown,
): KiyoshiModule<SubsystemState, KiyoshiEvent, unknown> {
  return {
    moduleId: id,
    moduleName: `Test Module ${id}`,
    version: '1.0.0',
    complexity: {
      timeBest: 'O(1)',
      timeAverage: 'O(1)',
      timeWorst: 'O(1)',
      memoryWorst: 'O(1)',
    } satisfies ComplexityProfile,
    getState: () => ({ initialized: true }),
    transition: handler ?? (() => undefined),
    verify: (): VerificationResult => ({
      status: 'PASS',
      moduleId: id,
      message: 'ok',
      timestamp: Date.now(),
    }),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// hashState
// ─────────────────────────────────────────────────────────────────────────────

describe('hashState', () => {
  it('returns a 16-character hex string', () => {
    const kernel = new Kernel(new EventBus(), new EventScheduler())
    const state = kernel.getState()
    const hash = hashState(state)
    expect(hash).toMatch(/^[0-9a-f]{16}$/)
  })

  it('produces the same hash for the same state (deterministic)', () => {
    const kernel = new Kernel(new EventBus(), new EventScheduler())
    const state = kernel.getState()
    expect(hashState(state)).toBe(hashState(state))
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Kernel — module registration
// ─────────────────────────────────────────────────────────────────────────────

describe('Kernel.registerModule', () => {
  it('registers a module and increments moduleCount', () => {
    const bus = new EventBus()
    const scheduler = new EventScheduler()
    const kernel = new Kernel(bus, scheduler)

    kernel.registerModule(makeModule('MOD-A'))
    expect(kernel.moduleCount).toBe(1)
    expect(kernel.getModuleIds()).toContain('MOD-A')
  })

  it('throws when the same moduleId is registered twice', () => {
    const kernel = new Kernel(new EventBus(), new EventScheduler())
    kernel.registerModule(makeModule('MOD-A'))
    expect(() => kernel.registerModule(makeModule('MOD-A'))).toThrow(/already registered/)
  })

  it('publishes a MODULE_REGISTERED event on the bus', () => {
    const bus = new EventBus()
    const scheduler = new EventScheduler()
    const kernel = new Kernel(bus, scheduler)

    kernel.registerModule(makeModule('MOD-A'))
    const log = bus.getDeliveryLog()
    const registered = log.find(e => e.type === 'MODULE_REGISTERED')
    expect(registered).toBeDefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Kernel — module unregistration
// ─────────────────────────────────────────────────────────────────────────────

describe('Kernel.unregisterModule', () => {
  it('removes a registered module', () => {
    const kernel = new Kernel(new EventBus(), new EventScheduler())
    kernel.registerModule(makeModule('MOD-A'))
    kernel.unregisterModule('MOD-A')
    expect(kernel.moduleCount).toBe(0)
    expect(kernel.getModuleIds()).not.toContain('MOD-A')
  })

  it('is a no-op when the module is not registered', () => {
    const kernel = new Kernel(new EventBus(), new EventScheduler())
    expect(() => kernel.unregisterModule('NONEXISTENT')).not.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Kernel — applyTransition (Φ)
// ─────────────────────────────────────────────────────────────────────────────

describe('Kernel.applyTransition', () => {
  it('advances the tick on each transition', () => {
    const bus = new EventBus()
    const scheduler = new EventScheduler()
    const kernel = new Kernel(bus, scheduler)

    const tickBefore = kernel.getState().tick
    kernel.applyTransition(createEvent('INPUT_EVENT', {}, 'SRC'))
    expect(kernel.getState().tick).toBe(tickBefore + 1)
  })

  it('invokes the module transition for subscribed event types', () => {
    const bus = new EventBus()
    const scheduler = new EventScheduler()
    const kernel = new Kernel(bus, scheduler)

    const handler = jest.fn().mockReturnValue(undefined)
    const mod = makeModule('MOD-A', handler)
    kernel.registerModule(mod)
    bus.subscribe('MOD-A', 'INPUT_EVENT', jest.fn()) // explicit subscription

    kernel.applyTransition(createEvent('INPUT_EVENT', {}, 'SRC'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not invoke module transition for unsubscribed event types', () => {
    const bus = new EventBus()
    const scheduler = new EventScheduler()
    const kernel = new Kernel(bus, scheduler)

    const handler = jest.fn().mockReturnValue(undefined)
    const mod = makeModule('MOD-A', handler)
    kernel.registerModule(mod)
    bus.subscribe('MOD-A', 'AI_REQUEST', jest.fn()) // subscribed to AI_REQUEST only

    kernel.applyTransition(createEvent('INPUT_EVENT', {}, 'SRC')) // different type
    expect(handler).not.toHaveBeenCalled()
  })

  it('isolates a failing module — returns a DIAGNOSTIC_WARNING event', () => {
    const bus = new EventBus()
    const scheduler = new EventScheduler()
    const kernel = new Kernel(bus, scheduler)

    const failingMod = makeModule('MOD-FAIL', () => {
      throw new Error('intentional failure')
    })
    kernel.registerModule(failingMod)
    bus.subscribe('MOD-FAIL', 'INPUT_EVENT', jest.fn())

    const emitted = kernel.applyTransition(createEvent('INPUT_EVENT', {}, 'SRC'))
    const warning = emitted.find(e => e.type === 'DIAGNOSTIC_WARNING')
    expect(warning).toBeDefined()
  })

  it('collects emitted events returned by modules', () => {
    const bus = new EventBus()
    const scheduler = new EventScheduler()
    const kernel = new Kernel(bus, scheduler)

    const response = createEvent('AI_RESPONSE', { answer: 42 }, 'MOD-A')
    const mod = makeModule('MOD-A', () => response)
    kernel.registerModule(mod)
    bus.subscribe('MOD-A', 'AI_REQUEST', jest.fn())

    const emitted = kernel.applyTransition(createEvent('AI_REQUEST', {}, 'SRC'))
    expect(emitted).toContain(response)
  })

  it('logs the global transition in the bus', () => {
    const bus = new EventBus()
    const scheduler = new EventScheduler()
    const kernel = new Kernel(bus, scheduler)

    kernel.applyTransition(createEvent('INPUT_EVENT', {}, 'SRC'))
    expect(bus.getTransitionLog().length).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Kernel — subsystem update
// ─────────────────────────────────────────────────────────────────────────────

describe('Kernel.updateSubsystem', () => {
  it('patches a subsystem state without mutating other subsystems', () => {
    const kernel = new Kernel(new EventBus(), new EventScheduler())
    kernel.updateSubsystem('AI', { model: 'gpt-4', loaded: true })

    const state = kernel.getState()
    expect(state.subsystems['AI']['model']).toBe('gpt-4')
    expect(state.subsystems['UI']).toEqual({ initialized: false })
  })

  it('produces a new immutable state object', () => {
    const kernel = new Kernel(new EventBus(), new EventScheduler())
    const before = kernel.getState()
    kernel.updateSubsystem('SYS', { ready: true })
    const after = kernel.getState()
    expect(after).not.toBe(before)
    expect(Object.isFrozen(after)).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Kernel — verifyAll
// ─────────────────────────────────────────────────────────────────────────────

describe('Kernel.verifyAll', () => {
  it('returns an empty array when no modules are registered', () => {
    const kernel = new Kernel(new EventBus(), new EventScheduler())
    expect(kernel.verifyAll()).toHaveLength(0)
  })

  it('calls verify() on every registered module', () => {
    const kernel = new Kernel(new EventBus(), new EventScheduler())
    kernel.registerModule(makeModule('MOD-A'))
    kernel.registerModule(makeModule('MOD-B'))
    const results = kernel.verifyAll()
    expect(results).toHaveLength(2)
    expect(results.every(r => r.status === 'PASS')).toBe(true)
  })
})
