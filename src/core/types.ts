/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 2: Mathematical Preliminaries & Chapter 3: Discrete Dynamical Systems
 *
 * Core type definitions. Every symbol has exactly one meaning.
 * Notation is never overloaded. Definitions are immutable once adopted.
 */

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION  (Ch 2.11)
// ─────────────────────────────────────────────────────────────────────────────

/** Every module Verify() returns exactly one of these values. */
export type VerificationStatus = 'PASS' | 'WARNING' | 'FAIL'

/** Full result returned by a module's Verify() function. */
export interface VerificationResult {
  readonly status: VerificationStatus
  readonly moduleId: string
  /** Human-readable explanation (supports Axiom 5: Observability). */
  readonly message: string
  readonly timestamp: number
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPUTATIONAL COMPLEXITY DECLARATION  (Ch 2.10)
// ─────────────────────────────────────────────────────────────────────────────

/** Big-O complexity declaration required for every exported algorithm. */
export interface ComplexityProfile {
  readonly timeBest: string
  readonly timeAverage: string
  readonly timeWorst: string
  readonly memoryWorst: string
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE DEFINITION  M = (S, I, O, T, V)  (Ch 2.3 / Def 2.2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every computational object in Kiyoshi is M = (S, I, O, T, V).
 *
 * S — Internal State Space
 * I — Input Space
 * O — Output Space
 * T — State Transition Function  s(t+1) = T(s(t), i(t))
 * V — Verification Function
 */
export interface KiyoshiModule<S, I, O> {
  /** Unique module identifier (supports Invariant 2: every event has one origin). */
  readonly moduleId: string
  /** Human-readable name. */
  readonly moduleName: string
  /** Semantic version (supports Invariant 5: every public interface is versioned). */
  readonly version: string

  /** S — current internal state. */
  getState(): S

  /**
   * T — State Transition Function.
   * s(t+1) = T(s(t), i(t))
   * Modules evolve state ONLY through this function (Axiom 1: Determinism).
   */
  transition(input: I): O

  /**
   * V — Verification Function (Ch 2.11).
   * Proves: state legality, dependency validity, configuration integrity,
   * version compatibility, and internal consistency.
   */
  verify(): VerificationResult

  /** Complexity profile for this module's primary algorithm. */
  readonly complexity: ComplexityProfile
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT DEFINITION  e = (τ, σ, p)  (Ch 2.7 / Def 2.6)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Complete universal event alphabet Σ (Ch 3.3).
 * Every event belongs to Σ. No event may be created outside this type.
 */
export type EventType =
  | 'INPUT_EVENT'
  | 'BUTTON_PRESS'
  | 'FILE_LOAD'
  | 'NETWORK_PACKET'
  | 'AI_REQUEST'
  | 'AI_RESPONSE'
  | 'CALCULATION_COMPLETE'
  | 'WINDOW_CREATED'
  | 'APPLICATION_START'
  | 'APPLICATION_CLOSE'
  | 'DIAGNOSTIC_WARNING'
  | 'SYSTEM_EXCEPTION'
  | 'STATE_TRANSITION'
  | 'MODULE_REGISTERED'
  | 'MODULE_UNREGISTERED'
  | 'VERIFICATION_REQUEST'
  | 'VERIFICATION_RESULT'
  | 'SCHEDULER_TICK'
  | 'SYSTEM_SHUTDOWN'

/** Priority ordering for event queue (Ch 3.4). */
export type EventPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW'

/**
 * Immutable event tuple e = (τ, σ, p).
 *
 * τ — Timestamp
 * σ — Event Type  (member of Σ)
 * p — Payload
 *
 * Events are immutable. No event may be modified after creation (Def 2.6, Inv 2.3).
 */
export interface KiyoshiEvent<P = unknown> {
  /** Unique identifier — satisfies Invariant 2 (every event has exactly one origin). */
  readonly id: string
  /** τ — monotonic creation timestamp (milliseconds). */
  readonly timestamp: number
  /** σ — event type, member of Σ. */
  readonly type: EventType
  /** p — arbitrary immutable payload. */
  readonly payload: P
  /** Source module ID (Invariant 2: every event has exactly one origin). */
  readonly sourceModuleId: string
  /** Destination module ID, or '*' for broadcast. */
  readonly destinationModuleId: string
  /** Scheduling priority (Ch 3.4). */
  readonly priority: EventPriority
  /** SHA-256 integrity hash of (id + timestamp + type + sourceModuleId) (Ch 3.3). */
  readonly verificationHash: string
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STATE  Ω  (Ch 3.1 / Def 2.5)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subsystem state identifiers corresponding to Ω decomposition.
 *
 * Ω = ΩUI × ΩAI × ΩAPP × ΩDATA × ΩMEM × ΩNET × ΩIO × ΩSYS
 */
export type SubsystemId =
  | 'UI'       // ΩUI  — User Interface State
  | 'AI'       // ΩAI  — Artificial Intelligence State
  | 'APP'      // ΩAPP — Application State
  | 'DATA'     // ΩDATA — Persistent Data State
  | 'MEM'      // ΩMEM — Runtime Memory State
  | 'NET'      // ΩNET — Network State
  | 'IO'       // ΩIO  — Input/Output State
  | 'SYS'      // ΩSYS — System Service State

/** Generic per-subsystem state record. */
export type SubsystemState = Record<string, unknown>

/**
 * Ω(t) — Complete operating system state at discrete time t.
 *
 * Definition 2.5: Ω = S₁ × S₂ × ... × Sn
 * Every observable condition of the operating system is an element of Ω.
 *
 * Axiom 3 (State Completeness): At every instant t, Ω(t) contains every subsystem state.
 */
export interface GlobalState {
  /** Discrete time index t ∈ ℕ (Ch 3.1). */
  readonly tick: number
  /** Monotonic wall-clock timestamp. */
  readonly timestamp: number
  /** Per-subsystem states indexed by SubsystemId. */
  readonly subsystems: Readonly<Record<SubsystemId, SubsystemState>>
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPUTATIONAL ENERGY  C  (Ch 3.9)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computational energy measure.
 * C = CPU + Memory + GPU + IO + Network
 */
export interface ComputationalEnergy {
  readonly cpu: number
  readonly memory: number
  readonly gpu: number
  readonly io: number
  readonly network: number
  /** Aggregate scalar C. */
  readonly total: number
}

// ─────────────────────────────────────────────────────────────────────────────
// FEEDBACK LOOP DECLARATION  (Ch 3.8)
// ─────────────────────────────────────────────────────────────────────────────

export type FeedbackType = 'POSITIVE' | 'NEGATIVE'

export interface FeedbackDeclaration {
  readonly type: FeedbackType
  readonly sourceModuleId: string
  readonly targetModuleId: string
  readonly maximumAmplification: number
  readonly recoveryCondition: string
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSITION LOG RECORD  (Invariant 3: every state transition is logged)
// ─────────────────────────────────────────────────────────────────────────────

export interface TransitionRecord {
  readonly tick: number
  readonly timestamp: number
  readonly moduleId: string
  readonly eventId: string
  readonly eventType: EventType
  readonly previousStateHash: string
  readonly nextStateHash: string
}
