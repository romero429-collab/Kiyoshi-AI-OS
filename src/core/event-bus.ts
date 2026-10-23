/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 2.8: Event Bus  (Definition 2.7)
 *
 * EventBus B: E → M
 *
 * Every module subscribes only to event types it explicitly declares.
 * Hidden subscriptions are prohibited.
 * Modules cannot directly alter another module's state (Invariant 2.4).
 * Direct communication is prohibited unless explicitly authorized (Ch 2).
 */

import { createHash } from 'crypto'
import {
  EventType,
  EventPriority,
  KiyoshiEvent,
  TransitionRecord,
} from './types'

// ─────────────────────────────────────────────────────────────────────────────
// EVENT FACTORY
// ─────────────────────────────────────────────────────────────────────────────

let eventCounter = 0

/**
 * Construct an immutable event e = (τ, σ, p).
 *
 * Every field is sealed after construction (Invariant 2.3: events are immutable).
 * The verificationHash covers id + timestamp + type + sourceModuleId.
 *
 * Complexity: O(1) time, O(1) memory.
 */
export function createEvent<P = unknown>(
  type: EventType,
  payload: P,
  sourceModuleId: string,
  destinationModuleId: string = '*',
  priority: EventPriority = 'NORMAL',
): KiyoshiEvent<P> {
  const id = `evt-${Date.now()}-${++eventCounter}`
  const timestamp = Date.now()

  const verificationHash = createHash('sha256')
    .update(`${id}${timestamp}${type}${sourceModuleId}`)
    .digest('hex')

  const event: KiyoshiEvent<P> = Object.freeze({
    id,
    timestamp,
    type,
    payload,
    sourceModuleId,
    destinationModuleId,
    priority,
    verificationHash,
  })

  return event
}

/**
 * Verify that a received event has not been tampered with.
 * Recomputes the hash and compares against the stored verificationHash.
 *
 * Complexity: O(1) time, O(1) memory.
 */
export function verifyEventIntegrity(event: KiyoshiEvent): boolean {
  const expected = createHash('sha256')
    .update(`${event.id}${event.timestamp}${event.type}${event.sourceModuleId}`)
    .digest('hex')
  return expected === event.verificationHash
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTION RECORD
// ─────────────────────────────────────────────────────────────────────────────

/** Handler function invoked when a subscribed event is delivered. */
export type EventHandler<P = unknown> = (event: KiyoshiEvent<P>) => void

interface SubscriptionRecord {
  readonly moduleId: string
  readonly eventType: EventType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly handler: EventHandler<any>
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT BUS  B: E → M
// ─────────────────────────────────────────────────────────────────────────────

/**
 * EventBus implements B: E → M (Definition 2.7).
 *
 * Routing rules:
 *   - Broadcast events (destinationModuleId = '*') are delivered to all
 *     subscribers of that event type.
 *   - Addressed events are delivered only to the named destination module,
 *     provided it has declared a subscription.
 *
 * Every delivery is logged to support Axiom 5 (Observability) and
 * Invariant 3 (every state transition is logged).
 *
 * Complexity — publish: O(k) where k = number of matching subscribers.
 * Complexity — subscribe/unsubscribe: O(1) amortised.
 */
export class EventBus {
  private readonly subscriptions: Map<EventType, SubscriptionRecord[]> = new Map()
  private readonly deliveryLog: KiyoshiEvent[] = []
  private readonly transitionLog: TransitionRecord[] = []

  // ── Subscription management ──────────────────────────────────────────────

  /**
   * Register a module's explicit subscription for an event type.
   * Hidden subscriptions are prohibited: every call must supply a moduleId.
   */
  subscribe<P = unknown>(
    moduleId: string,
    eventType: EventType,
    handler: EventHandler<P>,
  ): void {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, [])
    }
    const existing = this.subscriptions.get(eventType)!
    const duplicate = existing.some(s => s.moduleId === moduleId)
    if (!duplicate) {
      existing.push({ moduleId, eventType, handler })
    }
  }

  /**
   * Remove all subscriptions for a module across all event types.
   * Called on module unregistration (Invariant 6: every application is replaceable).
   */
  unsubscribeAll(moduleId: string): void {
    for (const [type, subs] of this.subscriptions.entries()) {
      this.subscriptions.set(
        type,
        subs.filter(s => s.moduleId !== moduleId),
      )
    }
  }

  /**
   * Return the declared subscriptions for a module.
   * Supports Axiom 5 (Observability): the system can explain which modules
   * receive which events.
   */
  getSubscriptions(moduleId: string): EventType[] {
    const result: EventType[] = []
    for (const [type, subs] of this.subscriptions.entries()) {
      if (subs.some(s => s.moduleId === moduleId)) {
        result.push(type)
      }
    }
    return result
  }

  // ── Event publication ─────────────────────────────────────────────────────

  /**
   * Publish an event into the bus.
   *
   * Processing:
   *   1. Verify event integrity (Invariant 4: every computation is reproducible).
   *   2. Route to subscribers.
   *   3. Log delivery (Invariant 3: every state transition is logged).
   *
   * Throws if integrity check fails (Invariant 1: no subsystem enters undefined state).
   */
  publish(event: KiyoshiEvent): void {
    if (!verifyEventIntegrity(event)) {
      throw new Error(
        `EventBus: integrity check failed for event ${event.id} (type=${event.type})`,
      )
    }

    this.deliveryLog.push(event)

    const subscribers = this.subscriptions.get(event.type) ?? []
    for (const sub of subscribers) {
      const addressed = event.destinationModuleId !== '*'
      if (addressed && sub.moduleId !== event.destinationModuleId) {
        continue
      }
      sub.handler(event)
    }
  }

  // ── Transition log ────────────────────────────────────────────────────────

  /**
   * Record a state transition.
   * Called by the Kernel after each Φ application (Invariant 3).
   */
  recordTransition(record: TransitionRecord): void {
    this.transitionLog.push(record)
  }

  // ── Observability ─────────────────────────────────────────────────────────

  /** Full immutable delivery log (Axiom 5: Observability). */
  getDeliveryLog(): ReadonlyArray<KiyoshiEvent> {
    return this.deliveryLog
  }

  /** Full immutable transition log (Invariant 3). */
  getTransitionLog(): ReadonlyArray<TransitionRecord> {
    return this.transitionLog
  }

  /** Number of events delivered since boot. */
  get deliveryCount(): number {
    return this.deliveryLog.length
  }
}
