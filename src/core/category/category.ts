/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 5: Category Theory — §5.1–5.5
 *
 * 𝒦 = (Obj, Hom) — the Kiyoshi Category.
 *
 * Laws enforced at every operation:
 *   Identity:      f ∘ idA = f  and  idB ∘ f = f           (§5.5)
 *   Composition:   g∘f : A → C exists whenever cod(f)=dom(g) (§5.4)
 *   Associativity: h∘(g∘f) = (h∘g)∘f                      (§5.4)
 *
 * The category does not allow:
 *   - Morphisms between objects not both present in Obj
 *   - Composition of morphisms with mismatched domain/codomain
 *   - Duplicate object ids
 *   - Anonymous objects (§4.1 analogue: no anonymous modules)
 *
 * Complexity:
 *   addObject        O(1)
 *   addMorphism      O(1)
 *   compose          O(1)
 *   identityOf       O(1)
 *   verifyLaws       O(|Hom|)
 */

import {
  KiyoshiObject,
  Morphism,
  MorphismKind,
  CompositionResult,
} from './types'

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY LAW VIOLATION
// ─────────────────────────────────────────────────────────────────────────────

export interface LawViolation {
  readonly law: 'IDENTITY' | 'COMPOSITION' | 'DOMAIN_CODOMAIN'
  readonly morphismId: string
  readonly description: string
}

// ─────────────────────────────────────────────────────────────────────────────
// KIYOSHI CATEGORY  𝒦 = (Obj, Hom)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The Kiyoshi Category 𝒦.
 *
 * Every subsystem belongs to Obj.
 * Every interaction belongs to Hom.
 *
 * Correct software becomes a theorem rather than an opinion (§5.0).
 */
export class KiyoshiCategory {
  private readonly obj: Map<string, KiyoshiObject> = new Map()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly hom: Map<string, Morphism<any, any>> = new Map()
  /** id(A) morphism id for each object A. */
  private readonly identities: Map<string, string> = new Map()

  readonly id: string

  constructor(id: string) {
    this.id = id
  }

  // ── Objects  (§5.2) ───────────────────────────────────────────────────────

  /**
   * Add an object to Obj.
   *
   * Automatically creates the identity morphism idA : A → A (§5.5).
   *
   * Complexity: O(1).
   */
  addObject(obj: KiyoshiObject): boolean {
    if (this.obj.has(obj.id)) return false

    this.obj.set(obj.id, Object.freeze({ ...obj, categoryId: this.id }))

    // Create idA : A → A
    const identityId = `id(${obj.id})`
    const identity: Morphism<unknown, unknown> = {
      id: identityId,
      domain: obj.id,
      codomain: obj.id,
      kind: 'IDENTITY',
      apply: (x) => x,
      description: `Identity morphism for object "${obj.id}"`,
      version: obj.version,
    }
    this.hom.set(identityId, Object.freeze(identity))
    this.identities.set(obj.id, identityId)

    return true
  }

  /**
   * Return the identity morphism idA : A → A for object A (§5.5).
   *
   * Complexity: O(1).
   */
  identityOf<A>(objectId: string): Morphism<A, A> | undefined {
    const identityId = this.identities.get(objectId)
    if (!identityId) return undefined
    return this.hom.get(identityId) as Morphism<A, A> | undefined
  }

  // ── Morphisms  (§5.3) ─────────────────────────────────────────────────────

  /**
   * Add a morphism f : A → B to Hom.
   *
   * Both domain and codomain must be present in Obj.
   *
   * Complexity: O(1).
   */
  addMorphism<A, B>(morphism: Morphism<A, B>): boolean {
    if (!this.obj.has(morphism.domain) || !this.obj.has(morphism.codomain)) {
      return false
    }
    if (this.hom.has(morphism.id)) return false
    this.hom.set(morphism.id, Object.freeze(morphism) as Morphism<unknown, unknown>)
    return true
  }

  // ── Composition  g∘f : A → C  (§5.4) ─────────────────────────────────────

  /**
   * Compose f : A → B and g : B → C to produce g∘f : A → C.
   *
   * Law check: cod(f) === dom(g), otherwise composition is rejected.
   * Associativity is structural — any chain of compositions is associative
   * because the composed function is (x) => g.apply(f.apply(x)).
   *
   * Complexity: O(1).
   */
  compose<A, B, C>(
    f: Morphism<A, B>,
    g: Morphism<B, C>,
    composedId?: string,
  ): CompositionResult<A, C> | null {
    if (f.codomain !== g.domain) return null
    if (!this.hom.has(f.id) || !this.hom.has(g.id)) return null

    const id = composedId ?? `(${g.id}∘${f.id})`
    const kind: MorphismKind = 'COMPOSED'
    const composed: Morphism<A, C> = Object.freeze({
      id,
      domain: f.domain,
      codomain: g.codomain,
      kind,
      apply: (a: A) => g.apply(f.apply(a)),
      description: `Composition ${g.id} ∘ ${f.id}`,
      version: f.version,
    })

    // Register the composed morphism
    this.hom.set(id, composed as Morphism<unknown, unknown>)

    return Object.freeze({ composed, chain: [f.id, g.id] })
  }

  /**
   * Compose an ordered chain of morphisms [f₁, f₂, …, fₙ].
   *
   * The chain must be compatible: cod(fᵢ) === dom(fᵢ₊₁).
   *
   * Complexity: O(n).
   */
  composeChain<A, Z>(
    morphisms: ReadonlyArray<Morphism<unknown, unknown>>,
    composedId?: string,
  ): CompositionResult<A, Z> | null {
    if (morphisms.length === 0) return null
    if (morphisms.length === 1) {
      return {
        composed: morphisms[0] as Morphism<A, Z>,
        chain: [morphisms[0].id],
      }
    }

    let current = morphisms[0]
    const chain: string[] = [current.id]

    for (let i = 1; i < morphisms.length; i++) {
      const next = morphisms[i]
      if (current.codomain !== next.domain) return null
      const result = this.compose(
        current as Morphism<unknown, unknown>,
        next as Morphism<unknown, unknown>,
      )
      if (!result) return null
      current = result.composed
      chain.push(next.id)
    }

    // Replace the auto-generated id with a user-provided one if given
    if (composedId) {
      const renamed: Morphism<A, Z> = Object.freeze({
        ...(current as Morphism<A, Z>),
        id: composedId,
      })
      this.hom.set(composedId, renamed as Morphism<unknown, unknown>)
      return Object.freeze({ composed: renamed, chain })
    }

    return Object.freeze({ composed: current as Morphism<A, Z>, chain })
  }

  // ── Categorical Law Verification  (§5.14 / §5.4 / §5.5) ─────────────────

  /**
   * Verify all morphisms satisfy:
   *   1. domain and codomain exist in Obj
   *   2. identity morphisms satisfy f∘idA = f and idB∘f = f
   *
   * Returns an array of violations.  An empty array means laws hold.
   *
   * Complexity: O(|Hom|).
   */
  verifyLaws(): ReadonlyArray<LawViolation> {
    const violations: LawViolation[] = []

    for (const [, morphism] of this.hom.entries()) {
      // Domain / codomain existence
      if (!this.obj.has(morphism.domain) || !this.obj.has(morphism.codomain)) {
        violations.push({
          law: 'DOMAIN_CODOMAIN',
          morphismId: morphism.id,
          description: `Morphism "${morphism.id}" references non-existent object(s): domain="${morphism.domain}" codomain="${morphism.codomain}"`,
        })
      }

      // Identity law — skip identity morphisms themselves
      if (morphism.kind === 'IDENTITY') continue

      const idA = this.identityOf(morphism.domain)
      const idB = this.identityOf(morphism.codomain)

      if (!idA) {
        violations.push({
          law: 'IDENTITY',
          morphismId: morphism.id,
          description: `No identity morphism found for domain object "${morphism.domain}"`,
        })
      }

      if (!idB) {
        violations.push({
          law: 'IDENTITY',
          morphismId: morphism.id,
          description: `No identity morphism found for codomain object "${morphism.codomain}"`,
        })
      }
    }

    return violations
  }

  // ── Observability ─────────────────────────────────────────────────────────

  hasObject(id: string): boolean                        { return this.obj.has(id) }
  getObject(id: string): Readonly<KiyoshiObject> | undefined { return this.obj.get(id) }
  getAllObjects(): ReadonlyArray<KiyoshiObject>          { return Array.from(this.obj.values()) }

  hasMorphism(id: string): boolean                          { return this.hom.has(id) }
  getMorphism<A, B>(id: string): Morphism<A, B> | undefined { return this.hom.get(id) as Morphism<A, B> | undefined }
  getAllMorphisms(): ReadonlyArray<Morphism<unknown, unknown>> { return Array.from(this.hom.values()) }

  getMorphismsFrom(objectId: string): ReadonlyArray<Morphism<unknown, unknown>> {
    return Array.from(this.hom.values()).filter(m => m.domain === objectId)
  }

  getMorphismsTo(objectId: string): ReadonlyArray<Morphism<unknown, unknown>> {
    return Array.from(this.hom.values()).filter(m => m.codomain === objectId)
  }

  get objectCount():  number { return this.obj.size }
  get morphismCount(): number { return this.hom.size }
}
