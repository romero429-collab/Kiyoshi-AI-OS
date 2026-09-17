/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 5: Category Theory — §5.12 Monoid, §5.13 Monad
 *
 * §5.12 Monoid — events form a monoid (E, +, Ø).
 *       Operation:    +   (concatenation / sequencing)
 *       Identity:     Ø   (empty event sequence)
 *       Associativity guaranteed by construction.
 *
 * §5.13 Monad — asynchronous computation modeled as a monad.
 *       unit / of:   A → T(A)        lift a pure value
 *       bind / chain: T(A) → (A→T(B)) → T(B)  chain computations
 *
 *       Guarantees: predictable sequencing, explicit failure,
 *       composable pipelines (§5.13).
 *
 * Implemented monads:
 *   - ResultMonad<T>  — explicit success/failure (§5.13 "Result")
 *   - OptionMonad<T>  — optional value (§5.13 "Option")
 *   - StateMonad<S,A> — stateful computation (§5.13 "State")
 */

import { Monoid, KiyoshiMonad } from './types'
import { KiyoshiEvent } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// EVENT MONOID  (§5.12)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The event monoid (E, +, Ø).
 *
 * Events may be safely concatenated because:
 *   Identity:      seq + [] = seq = [] + seq
 *   Associativity: (a + b) + c = a + (b + c)
 *
 * Complexity: O(n) for combine where n = total event count.
 */
export const EventMonoid: Monoid<ReadonlyArray<KiyoshiEvent>> = Object.freeze({
  empty: [] as ReadonlyArray<KiyoshiEvent>,
  combine: (
    a: ReadonlyArray<KiyoshiEvent>,
    b: ReadonlyArray<KiyoshiEvent>,
  ): ReadonlyArray<KiyoshiEvent> => [...a, ...b],
})

/**
 * Fold a list of event sequences into a single sequence using the monoid.
 *
 * mconcat [e₁, e₂, …, eₙ] = e₁ + e₂ + … + eₙ
 *
 * Complexity: O(Σ|eᵢ|).
 */
export function concatEvents(
  sequences: ReadonlyArray<ReadonlyArray<KiyoshiEvent>>,
): ReadonlyArray<KiyoshiEvent> {
  return sequences.reduce(
    (acc, seq) => EventMonoid.combine(acc, seq),
    EventMonoid.empty,
  )
}

/**
 * Generic monoid fold over an array.
 *
 * Complexity: O(n).
 */
export function mconcat<T>(monoid: Monoid<T>, values: ReadonlyArray<T>): T {
  return values.reduce((acc, v) => monoid.combine(acc, v), monoid.empty)
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULT MONAD  (§5.13 "Result / Error")
// ─────────────────────────────────────────────────────────────────────────────

/** A Result is either Ok<T> or Err<E>. */
export type Result<T, E = string> =
  | { readonly ok: true;  readonly value: T }
  | { readonly ok: false; readonly error: E }

export function Ok<T>(value: T): Result<T, never>         { return Object.freeze({ ok: true  as const, value }) }
export function Err<E>(error: E): Result<never, E>         { return Object.freeze({ ok: false as const, error }) }

/**
 * Result monad (§5.13).
 *
 * Guarantees explicit failure propagation — no silent exceptions.
 *
 * Monad laws:
 *   Left identity:  chain(of(a), f) = f(a)
 *   Right identity: chain(m, of)    = m
 *   Associativity:  chain(chain(m, f), g) = chain(m, x => chain(f(x), g))
 */
export const ResultMonad: KiyoshiMonad<Result<unknown>> = Object.freeze({
  /** η — unit: lift a pure value into Ok. */
  of: <A>(value: A): Result<A> => Ok(value),

  /** μ — bind: chain a computation, propagating Err. */
  chain: <A, B>(
    ma: Result<unknown>,
    f: (a: A) => Result<unknown>,
  ): Result<unknown> => {
    if (!ma.ok) return ma
    return f((ma as { ok: true; value: A }).value)
  },

  /** map: apply a pure function inside the Result. */
  map: <A, B>(
    ma: Result<unknown>,
    f: (a: A) => B,
  ): Result<unknown> => {
    if (!ma.ok) return ma
    return Ok(f((ma as { ok: true; value: A }).value))
  },
})

// Typed convenience wrappers
export function resultOf<T>(value: T): Result<T>         { return Ok(value) }
export function resultChain<A, B, E>(
  ma: Result<A, E>,
  f: (a: A) => Result<B, E>,
): Result<B, E> {
  if (!ma.ok) return ma as unknown as Result<B, E>
  return f(ma.value)
}
export function resultMap<A, B, E>(ma: Result<A, E>, f: (a: A) => B): Result<B, E> {
  if (!ma.ok) return ma as unknown as Result<B, E>
  return Ok(f(ma.value))
}

// ─────────────────────────────────────────────────────────────────────────────
// OPTION MONAD  (§5.13 "Option")
// ─────────────────────────────────────────────────────────────────────────────

/** An Option is either Some<T> or None. */
export type Option<T> =
  | { readonly some: true;  readonly value: T }
  | { readonly some: false }

export function Some<T>(value: T): Option<T> { return Object.freeze({ some: true  as const, value }) }
export const None: Option<never>             = Object.freeze({ some: false as const })

export function optionOf<T>(value: T): Option<T>  { return Some(value) }
export function optionChain<A, B>(
  ma: Option<A>,
  f: (a: A) => Option<B>,
): Option<B> {
  if (!ma.some) return None
  return f(ma.value)
}
export function optionMap<A, B>(ma: Option<A>, f: (a: A) => B): Option<B> {
  if (!ma.some) return None
  return Some(f(ma.value))
}
export function optionGetOrElse<T>(ma: Option<T>, fallback: T): T {
  return ma.some ? ma.value : fallback
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE MONAD  (§5.13 "State")
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A stateful computation: S → (A, S).
 *
 * The State monad models computations that read and update state
 * in a purely functional, composable way (§5.13).
 */
export type StateComputation<S, A> = (state: S) => readonly [A, S]

export function stateOf<S, A>(value: A): StateComputation<S, A> {
  return (s: S) => [value, s] as const
}

export function stateChain<S, A, B>(
  ma: StateComputation<S, A>,
  f: (a: A) => StateComputation<S, B>,
): StateComputation<S, B> {
  return (s: S) => {
    const [a, s2] = ma(s)
    return f(a)(s2)
  }
}

export function stateMap<S, A, B>(
  ma: StateComputation<S, A>,
  f: (a: A) => B,
): StateComputation<S, B> {
  return (s: S) => {
    const [a, s2] = ma(s)
    return [f(a), s2] as const
  }
}

export function stateGet<S>(): StateComputation<S, S> {
  return (s: S) => [s, s] as const
}

export function statePut<S>(newState: S): StateComputation<S, void> {
  return (_: S) => [undefined, newState] as const
}

export function stateRun<S, A>(ma: StateComputation<S, A>, initial: S): readonly [A, S] {
  return ma(initial)
}
