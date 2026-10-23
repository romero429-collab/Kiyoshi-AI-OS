/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 3.4: Event Queue  Q(t)
 *
 * The scheduler maintains Q(t), an ordered queue.
 *
 * Processing rule (Ch 3.4):
 *   while Q ≠ ∅ {
 *     remove first event
 *     verify integrity
 *     identify subscribers
 *     execute transition
 *     generate outputs
 *     append new events
 *     record diagnostics
 *   }
 *
 * Processing order is deterministic (Axiom 1: Determinism).
 * Time advances only through events (Ch 3.0).
 */

import { KiyoshiEvent, EventPriority } from './types'
import { verifyEventIntegrity } from './event-bus'

// ─────────────────────────────────────────────────────────────────────────────
// PRIORITY ORDER  (lower index = higher priority)
// ─────────────────────────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<EventPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSTIC RECORD
// ─────────────────────────────────────────────────────────────────────────────

export interface SchedulerDiagnostic {
  readonly tick: number
  readonly timestamp: number
  readonly eventId: string
  readonly eventType: string
  readonly durationMs: number
  readonly integrityPassed: boolean
  readonly error: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT SCHEDULER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deterministic event scheduler.
 *
 * Implements the Q(t) processing loop from Ch 3.4.
 * Priority ordering ensures CRITICAL events are handled before NORMAL ones.
 * Within equal priority, FIFO order is maintained (determinism, Axiom 1).
 *
 * Complexity — enqueue: O(log n) (sorted insert).
 * Complexity — drain: O(n) per tick where n = queue depth.
 */
export class EventScheduler {
  private readonly queue: KiyoshiEvent[] = []
  private readonly diagnostics: SchedulerDiagnostic[] = []
  private _tick: number = 0
  private running: boolean = false

  /** Processor function supplied by the Kernel. */
  private processor: ((event: KiyoshiEvent) => KiyoshiEvent[]) | null = null

  // ── Queue management ──────────────────────────────────────────────────────

  /**
   * Enqueue an event into Q(t).
   * Insertion maintains priority ordering with FIFO tie-breaking.
   *
   * Complexity: O(n) worst case (linear scan for insertion point).
   */
  enqueue(event: KiyoshiEvent): void {
    const priority = PRIORITY_ORDER[event.priority]
    // Find insertion point: after all events with equal or higher priority
    let insertAt = this.queue.length
    for (let i = 0; i < this.queue.length; i++) {
      if (PRIORITY_ORDER[this.queue[i].priority] > priority) {
        insertAt = i
        break
      }
    }
    this.queue.splice(insertAt, 0, event)
  }

  /**
   * Dequeue the highest-priority event from Q(t).
   * Returns undefined when Q = ∅.
   *
   * Complexity: O(1).
   */
  dequeue(): KiyoshiEvent | undefined {
    return this.queue.shift()
  }

  /** Q ≠ ∅ test (Ch 3.4 loop condition). */
  get isEmpty(): boolean {
    return this.queue.length === 0
  }

  /** Current depth of Q(t). */
  get depth(): number {
    return this.queue.length
  }

  // ── Processor registration ────────────────────────────────────────────────

  /**
   * Register the Kernel's event processor.
   * The processor receives one event and returns zero or more resulting events
   * which are immediately enqueued (Ch 3.4: "append new events").
   */
  setProcessor(fn: (event: KiyoshiEvent) => KiyoshiEvent[]): void {
    this.processor = fn
  }

  // ── Tick execution ────────────────────────────────────────────────────────

  /**
   * Execute one discrete time step t → t+1.
   *
   * Drains the entire current queue in priority order.
   * Events emitted during processing are queued for the NEXT tick,
   * preserving deterministic causal ordering (Axiom 4: Event Causality).
   *
   * Complexity: O(k · p) where k = queue depth, p = processor cost.
   */
  tick(): void {
    if (!this.processor) {
      throw new Error('EventScheduler: no processor registered before tick()')
    }

    this.running = true
    this._tick++

    // Snapshot current depth — events added during processing go to next tick
    const currentDepth = this.queue.length
    const deferred: KiyoshiEvent[] = []

    for (let i = 0; i < currentDepth; i++) {
      const event = this.dequeue()
      if (!event) break

      const t0 = Date.now()
      let integrityPassed = false
      let error: string | null = null
      let emitted: KiyoshiEvent[] = []

      // Step 1: verify integrity (Ch 3.4)
      integrityPassed = verifyEventIntegrity(event)

      if (!integrityPassed) {
        error = `Integrity verification failed for event ${event.id}`
      } else {
        try {
          // Step 2: execute transition (Ch 3.4 — "execute transition, generate outputs")
          emitted = this.processor(event)
        } catch (err) {
          error = err instanceof Error ? err.message : String(err)
        }
      }

      const durationMs = Date.now() - t0

      // Step 3: record diagnostics (Ch 3.4)
      this.diagnostics.push({
        tick: this._tick,
        timestamp: Date.now(),
        eventId: event.id,
        eventType: event.type,
        durationMs,
        integrityPassed,
        error,
      })

      // Step 4: append new events (deferred to next tick)
      deferred.push(...emitted)
    }

    // Enqueue deferred events for next tick
    for (const e of deferred) {
      this.enqueue(e)
    }

    this.running = false
  }

  /**
   * Run the scheduler until Q = ∅ or maxTicks is reached.
   *
   * This implements the full processing loop from Ch 3.4.
   * maxTicks guards against infinite feedback cycles (Ch 3.8).
   *
   * Complexity: O(maxTicks · k · p).
   */
  run(maxTicks: number = 1000): void {
    let ticks = 0
    while (!this.isEmpty && ticks < maxTicks) {
      this.tick()
      ticks++
    }
  }

  // ── Observability ─────────────────────────────────────────────────────────

  /** Current discrete time index t (Ch 3.1). */
  get currentTick(): number {
    return this._tick
  }

  /** Full diagnostic log (Axiom 5: Observability + Ch 3.4 "record diagnostics"). */
  getDiagnostics(): ReadonlyArray<SchedulerDiagnostic> {
    return this.diagnostics
  }

  /** Diagnostics filtered to failed events only. */
  getErrors(): ReadonlyArray<SchedulerDiagnostic> {
    return this.diagnostics.filter(d => d.error !== null)
  }

  /** Whether a processing cycle is currently active. */
  get isRunning(): boolean {
    return this.running
  }
}
