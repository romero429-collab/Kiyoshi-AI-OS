/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 5: Category Theory of Software Architecture
 *
 * Core type definitions for the Kiyoshi Category 𝒦 = (Obj, Hom).
 *
 * §5.1  Category        𝒦 = (Obj, Hom)
 * §5.2  Object          state + interface + identity + lifecycle
 * §5.3  Morphism        f : A → B
 * §5.4  Composition     g∘f : A → C
 * §5.5  Identity        idA : A → A
 * §5.6  Functor         F : 𝒦 → 𝒦
 * §5.7  Natural Trans.  η : F ⇒ G
 * §5.8  Product         A × B
 * §5.9  Coproduct       A + B
 * §5.10 Limit           synchronization
 * §5.11 Colimit         assembly
 * §5.12 Monoid          (E, +, Ø)
 * §5.13 Monad           T, η, μ
 * §5.14 Architectural Law
 * §5.15 AI Code Generation constraints
 * §5.16 Correctness
 */

// ─────────────────────────────────────────────────────────────────────────────
// OBJECT  (§5.2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every object A in Obj possesses State, Interface, Verification,
 * Identity, Lifecycle, and Behavior.
 *
 * Objects never expose implementation — only morphisms (§5.2).
 */
export interface KiyoshiObject {
  /** Unique object identifier — every object is distinct. */
  readonly id: string
  /** Human-readable label. */
  readonly label: string
  /** Semantic version (Invariant 5). */
  readonly version: string
  /** Category this object belongs to (default 'KIYOSHI'). */
  readonly categoryId: string
  /** Lifecycle phase of this object. */
  readonly lifecycle: ObjectLifecycle
  /** Declared interface keys this object exposes as morphism endpoints. */
  readonly interface: ReadonlyArray<string>
  /** Arbitrary metadata. Implementation is never exposed. */
  readonly metadata: Readonly<Record<string, unknown>>
}

export type ObjectLifecycle =
  | 'INITIALIZING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DEPRECATED'
  | 'DESTROYED'

// ─────────────────────────────────────────────────────────────────────────────
// MORPHISM  (§5.3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A morphism f : A → B defines a legal transformation between objects.
 *
 * Objects communicate exclusively through morphisms (§5.3).
 */
export interface Morphism<A = unknown, B = unknown> {
  /** Unique morphism identifier. */
  readonly id: string
  /** Source object id (domain A). */
  readonly domain: string
  /** Target object id (codomain B). */
  readonly codomain: string
  /** Declared morphism kind. */
  readonly kind: MorphismKind
  /** Pure transformation function — no side effects permitted for identity morphisms. */
  readonly apply: (input: A) => B
  /** Human-readable description for observability (§5.2, Axiom 5). */
  readonly description: string
  /** Version of the interface contract. */
  readonly version: string
}

export type MorphismKind =
  | 'INPUT'
  | 'RENDER'
  | 'STORE'
  | 'LOAD'
  | 'EVALUATE'
  | 'VALIDATE'
  | 'NOTIFY'
  | 'SCHEDULE'
  | 'INFER'
  | 'IDENTITY'
  | 'COMPOSED'
  | 'FUNCTOR'
  | 'NATURAL_TRANSFORMATION'

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSITION RESULT  (§5.4)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * g∘f : A → C  — the composed morphism.
 *
 * Associativity: h∘(g∘f) = (h∘g)∘f must hold.
 * This is guaranteed by the composition algebra, not tested at runtime.
 */
export interface CompositionResult<A = unknown, C = unknown> {
  readonly composed: Morphism<A, C>
  /** Ordered chain of morphism ids that were composed: [f.id, g.id, …]. */
  readonly chain: ReadonlyArray<string>
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTOR  (§5.6)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * F : 𝒦 → 𝒦  — maps objects to objects and morphisms to morphisms
 * while preserving composition.
 *
 * F(g∘f) = F(g)∘F(f) must hold (§5.6).
 */
export interface FunctorDefinition {
  readonly id: string
  readonly label: string
  /** Map an object id to its image object id under F. */
  readonly mapObject: (objectId: string) => string
  /** Map a morphism id to its image morphism id under F. */
  readonly mapMorphism: (morphismId: string) => string
}

// ─────────────────────────────────────────────────────────────────────────────
// NATURAL TRANSFORMATION  (§5.7)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * η : F ⇒ G  — architecture-preserving replacement of functor F by G.
 *
 * For every object A the component ηA : F(A) → G(A) must satisfy
 * the naturality square:  G(f) ∘ ηA = ηB ∘ F(f).
 *
 * Enables refactoring, optimization, and platform adaptation without
 * changing observable behavior (§5.7).
 */
export interface NaturalTransformation {
  readonly id: string
  readonly sourceFunctorId: string
  readonly targetFunctorId: string
  /**
   * Component morphism for object A:  ηA : F(A) → G(A).
   * Returns the morphism id of the component at A.
   */
  readonly componentAt: (objectId: string) => string
  readonly description: string
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT  (§5.8)
// ─────────────────────────────────────────────────────────────────────────────

/** A × B — Cartesian product of two independent objects. */
export interface ProductObject {
  readonly id: string
  readonly leftId: string
  readonly rightId: string
  /** Projection: (a, b) → a */
  readonly projLeft: <A, B>(pair: [A, B]) => A
  /** Projection: (a, b) → b */
  readonly projRight: <A, B>(pair: [A, B]) => B
}

// ─────────────────────────────────────────────────────────────────────────────
// COPRODUCT  (§5.9)
// ─────────────────────────────────────────────────────────────────────────────

/** A + B — coproduct / sum of alternative implementations. */
export interface CoproductObject {
  readonly id: string
  /** All participating alternative object ids. */
  readonly alternativeIds: ReadonlyArray<string>
  /** Injection: embed value from component i into the coproduct. */
  readonly inject: <T>(value: T, fromId: string) => { tag: string; value: T }
}

// ─────────────────────────────────────────────────────────────────────────────
// LIMIT / COLIMIT  (§5.10 / §5.11)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A Limit records the unique compatible configuration of a set of objects
 * that must agree before a combined operation proceeds (§5.10).
 */
export interface LimitResult {
  readonly id: string
  readonly participantIds: ReadonlyArray<string>
  /** True when all participants have reached a compatible state. */
  readonly converged: boolean
  readonly timestamp: number
}

/**
 * A Colimit records the assembly of independent modules into a larger
 * structure without violating modularity (§5.11).
 */
export interface ColimitResult {
  readonly id: string
  readonly componentIds: ReadonlyArray<string>
  /** The assembled object id. */
  readonly assembledId: string
  readonly timestamp: number
}

// ─────────────────────────────────────────────────────────────────────────────
// MONOID  (§5.12)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * (E, +, Ø) — events form a monoid.
 *
 *   Identity:     e + Ø = e = Ø + e
 *   Associativity: a + (b + c) = (a + b) + c
 *
 * This guarantees safe concatenation of event sequences (§5.12).
 */
export interface Monoid<T> {
  /** Identity element Ø — left and right identity for combine. */
  readonly empty: T
  /** Associative binary operation +. */
  readonly combine: (a: T, b: T) => T
}

// ─────────────────────────────────────────────────────────────────────────────
// MONAD  (§5.13)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A monad T = (T, η, μ) for asynchronous computation (§5.13).
 *
 *   return / unit: A → T(A)           lifts a pure value into the monad
 *   bind / flatMap: T(A) → (A→T(B)) → T(B)   chains monadic computations
 *
 * Guarantees: predictable sequencing, explicit failure, composable pipelines.
 */
export interface KiyoshiMonad<T> {
  /** η — unit / return: lift a pure value. */
  readonly of: <A>(value: A) => T
  /** μ — bind / flatMap: chain computations. */
  readonly chain: <A, B>(ma: T, f: (a: A) => T) => T
  /** Map (derived): apply a pure function inside the monad. */
  readonly map: <A, B>(ma: T, f: (a: A) => B) => T
}

// ─────────────────────────────────────────────────────────────────────────────
// CORRECTNESS CERTIFICATE  (§5.16)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Proof obligation for a module's categorical correctness (§5.16).
 *
 * A module is correct iff:
 *   - Identity exists
 *   - Composition exists
 *   - Verification succeeds
 *   - No forbidden side effects exist
 *   - Complexity constraints are satisfied
 *   - Dependencies remain acyclic
 */
export interface CorrectnessCertificate {
  readonly objectId: string
  readonly identityExists: boolean
  readonly compositionClosed: boolean
  readonly verificationPassed: boolean
  readonly sideEffectFree: boolean
  readonly complexityDeclared: boolean
  readonly dependenciesAcyclic: boolean
  /** True iff all six conditions hold. */
  readonly isCorrect: boolean
  readonly timestamp: number
  /** Narrative proof summary. */
  readonly proof: string
}

// ─────────────────────────────────────────────────────────────────────────────
// AI CODE GENERATION OBLIGATION  (§5.15)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AI-generated modules must satisfy these proof obligations (§5.15).
 */
export interface CodeGenerationObligation {
  readonly generatedObjectId: string
  /** Object definition provided. */
  readonly objectDefined: boolean
  /** Interface rules satisfied. */
  readonly interfaceCompliant: boolean
  /** Composition rules preserved. */
  readonly compositionPreserved: boolean
  /** Verification rules encoded. */
  readonly verificationEncoded: boolean
  /** Complexity constraints declared. */
  readonly complexityDeclared: boolean
  /** All obligations satisfied. */
  readonly satisfied: boolean
}
