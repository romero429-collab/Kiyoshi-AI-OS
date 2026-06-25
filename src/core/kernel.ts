/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 3.2: State Evolution — Universal Transition Operator Φ
 *
 * Φ : Ω × E → Ω
 *
 * The operating system evolves according to:
 *   Ω(t+1) = Φ(Ω(t), E(t))
 *
 * This equation governs every subsystem. No exceptions exist.
 *
 * Axiom 1 (Determinism): For identical Ω and identical E, Φ always
 * produces identical Ω(t+1).
 *
 * Axiom 2 (Modularity): Modules communicate only through the EventBus.
 * Axiom 4 (Event Causality): Every transition has a corresponding event.
 */

import { createHash } from 'crypto'
import {
  GlobalState,
  SubsystemId,
  SubsystemState,
  KiyoshiModule,
  KiyoshiEvent,
  VerificationResult,
  TransitionRecord,
} from './types'
import { EventBus, createEvent } from './event-bus'
import { EventScheduler } from './scheduler'

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL GLOBAL STATE  Ω(0)
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_SUBSYSTEM_STATE: SubsystemState = Object.freeze({ initialized: false })

/**
 * Construct the initial global state Ω(0).
 * All subsystems start in a defined, non-undefined state (Invariant 1).
 */
function buildInitialState(): GlobalState {
  return Object.freeze({
    tick: 0,
    timestamp: Date.now(),
    subsystems: Object.freeze({
      UI:   { ...INITIAL_SUBSYSTEM_STATE },
      AI:   { ...INITIAL_SUBSYSTEM_STATE },
      APP:  { ...INITIAL_SUBSYSTEM_STATE },
      DATA: { ...INITIAL_SUBSYSTEM_STATE },
      MEM:  { ...INITIAL_SUBSYSTEM_STATE },
      NET:  { ...INITIAL_SUBSYSTEM_STATE },
      IO:   { ...INITIAL_SUBSYSTEM_STATE },
      SYS:  { ...INITIAL_SUBSYSTEM_STATE },
    } as Record<SubsystemId, SubsystemState>),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE HASHING  (supports transition log and reproducibility invariants)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute a deterministic hash of a GlobalState.
 * Used to populate TransitionRecord (Invariant 3: every transition is logged).
 *
 * Complexity: O(|Ω|) where |Ω| is the serialised state size.
 */
export function hashState(state: GlobalState): string {
  return createHash('sha256')
    .update(JSON.stringify(state))
    .digest('hex')
    .slice(0, 16)
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModule = KiyoshiModule<any, any, any>

// ─────────────────────────────────────────────────────────────────────────────
// KERNEL  —  Universal Transition Operator Φ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The Kernel embodies Φ: Ω × E → Ω.
 *
 * Responsibilities:
 *   1. Maintain Ω(t) — current global state.
 *   2. Register / unregister modules (Axiom 2: Modularity).
 *   3. Apply Φ to produce Ω(t+1) for each event (Axiom 4: Event Causality).
 *   4. Log every transition (Invariant 3).
 *   5. Isolate module failures (Invariant 7: failure of one module shall not
 *      terminate unrelated modules).
 *   6. Emit resulting events back to the scheduler (Ch 3.4).
 *
 * Complexity — applyTransition: O(m) where m = number of registered modules
 * that subscribe to the event type.
 */
export class Kernel {
  private state: GlobalState
  private readonly modules: Map<string, AnyModule> = new Map()
  private readonly bus: EventBus
  private readonly scheduler: EventScheduler

  constructor(bus: EventBus, scheduler: EventScheduler) {
    this.bus = bus
    this.scheduler = scheduler
    this.state = buildInitialState()

    // Register the Kernel's processor with the scheduler
    scheduler.setProcessor((event: KiyoshiEvent) => this.applyTransition(event))
  }

  // ── Module registration ───────────────────────────────────────────────────

  /**
   * Register a module with the Kernel.
   * Emits MODULE_REGISTERED event (Invariant 3).
   * Modules must not be registered twice (Axiom 2: no hidden knowledge).
   */
  registerModule(module: AnyModule): void {
    if (this.modules.has(module.moduleId)) {
      throw new Error(
        `Kernel: module "${module.moduleId}" is already registered`,
      )
    }
    this.modules.set(module.moduleId, module)

    const event = createEvent(
      'MODULE_REGISTERED',
      { moduleId: module.moduleId, version: module.version },
      'KERNEL',
      '*',
      'NORMAL',
    )
    this.bus.publish(event)
  }

  /**
   * Unregister a module (Invariant 6: every application is replaceable).
   * Removes all EventBus subscriptions for the module.
   */
  unregisterModule(moduleId: string): void {
    if (!this.modules.has(moduleId)) {
      return
    }
    this.modules.delete(moduleId)
    this.bus.unsubscribeAll(moduleId)

    const event = createEvent(
      'MODULE_UNREGISTERED',
      { moduleId },
      'KERNEL',
      '*',
      'NORMAL',
    )
    this.bus.publish(event)
  }

  // ── Universal Transition Operator Φ ──────────────────────────────────────

  /**
   * Apply Φ: Ω(t) × e → Ω(t+1).
   *
   * For each registered module subscribed to the event type:
   *   1. Record the module's pre-transition state hash.
   *   2. Invoke module.transition(event).
   *   3. Record the post-transition state hash.
   *   4. Log the transition record.
   *   5. Catch and isolate any module failure (Invariant 7).
   *
   * Returns resulting events to be enqueued (Ch 3.4: "append new events").
   *
   * Complexity: O(m) where m = number of subscribed modules.
   */
  applyTransition(event: KiyoshiEvent): KiyoshiEvent[] {
    const previousHash = hashState(this.state)
    const emitted: KiyoshiEvent[] = []

    // Advance tick — Ω(t) → Ω(t+1)
    this.state = Object.freeze({
      ...this.state,
      tick: this.state.tick + 1,
      timestamp: Date.now(),
    })

    for (const [moduleId, module] of this.modules.entries()) {
      const subscribedTypes = this.bus.getSubscriptions(moduleId)
      if (!subscribedTypes.includes(event.type)) continue

      const preHash = hashState(this.state)

      try {
        const output = module.transition(event)

        // If the module returns a KiyoshiEvent, enqueue it
        if (this.isKiyoshiEvent(output)) {
          emitted.push(output)
        } else if (Array.isArray(output)) {
          for (const item of output) {
            if (this.isKiyoshiEvent(item)) emitted.push(item)
          }
        }
      } catch (err) {
        // Invariant 7: isolate failure — emit DIAGNOSTIC_WARNING, continue
        const warning = createEvent(
          'DIAGNOSTIC_WARNING',
          {
            failedModuleId: moduleId,
            triggerEventId: event.id,
            error: err instanceof Error ? err.message : String(err),
          },
          'KERNEL',
          '*',
          'HIGH',
        )
        emitted.push(warning)
      }

      const postHash = hashState(this.state)

      // Invariant 3: log every state transition
      const record: TransitionRecord = {
        tick: this.state.tick,
        timestamp: Date.now(),
        moduleId,
        eventId: event.id,
        eventType: event.type,
        previousStateHash: preHash,
        nextStateHash: postHash,
      }
      this.bus.recordTransition(record)
    }

    // Log the global Ω transition
    const nextHash = hashState(this.state)
    const globalRecord: TransitionRecord = {
      tick: this.state.tick,
      timestamp: Date.now(),
      moduleId: 'KERNEL',
      eventId: event.id,
      eventType: event.type,
      previousStateHash: previousHash,
      nextStateHash: nextHash,
    }
    this.bus.recordTransition(globalRecord)

    return emitted
  }

  // ── Subsystem state management ────────────────────────────────────────────

  /**
   * Update a specific subsystem's state within Ω.
   * Produces a new immutable Ω — state is never mutated in place (Axiom 1).
   */
  updateSubsystem(subsystemId: SubsystemId, patch: SubsystemState): void {
    const updated: Record<SubsystemId, SubsystemState> = {
      ...this.state.subsystems,
      [subsystemId]: Object.freeze({
        ...this.state.subsystems[subsystemId],
        ...patch,
      }),
    }
    this.state = Object.freeze({
      ...this.state,
      timestamp: Date.now(),
      subsystems: Object.freeze(updated),
    })
  }

  // ── Verification ──────────────────────────────────────────────────────────

  /**
   * Run V() on every registered module and return results.
   * Supports Axiom 5 (Observability) and Ch 2.11 (Verification).
   *
   * Complexity: O(m) where m = number of registered modules.
   */
  verifyAll(): VerificationResult[] {
    const results: VerificationResult[] = []
    for (const module of this.modules.values()) {
      results.push(module.verify())
    }
    return results
  }

  // ── Observability ─────────────────────────────────────────────────────────

  /** Current Ω(t). */
  getState(): Readonly<GlobalState> {
    return this.state
  }

  /** Number of registered modules. */
  get moduleCount(): number {
    return this.modules.size
  }

  /** IDs of all registered modules. */
  getModuleIds(): string[] {
    return Array.from(this.modules.keys())
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private isKiyoshiEvent(value: unknown): value is KiyoshiEvent {
    return (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      'type' in value &&
      'verificationHash' in value
    )
  }
}
