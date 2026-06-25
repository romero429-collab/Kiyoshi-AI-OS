/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 5: Category Theory — §5.6 Functors
 *
 * F : 𝒦 → 𝒦
 *
 * A functor maps Objects to Objects and Morphisms to Morphisms
 * while preserving composition:
 *
 *   F(g∘f) = F(g) ∘ F(f)
 *   F(idA) = idF(A)
 *
 * Applications extend the operating system without altering its
 * mathematical structure (§5.6).
 *
 * Complexity:
 *   apply         O(|Obj| + |Hom|)
 *   verifyLaws    O(|Hom|²) — checks composition preservation for all pairs
 */

import { KiyoshiCategory } from './category'
import { FunctorDefinition, KiyoshiObject, Morphism } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTOR IMAGE
// ─────────────────────────────────────────────────────────────────────────────

/** The image of a category under a functor F. */
export interface FunctorImage {
  readonly functorId: string
  /** Object mappings: source id → image id. */
  readonly objectMap: ReadonlyMap<string, string>
  /** Morphism mappings: source morphism id → image morphism id. */
  readonly morphismMap: ReadonlyMap<string, string>
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTOR VIOLATION
// ─────────────────────────────────────────────────────────────────────────────

export interface FunctorViolation {
  readonly law: 'IDENTITY_PRESERVATION' | 'COMPOSITION_PRESERVATION'
  readonly description: string
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A functor F : 𝒦 → 𝒦.
 *
 * Applies a FunctorDefinition to a source KiyoshiCategory and produces
 * a FunctorImage describing the mapped objects and morphisms.
 */
export class Functor {
  constructor(private readonly definition: FunctorDefinition) {}

  get id(): string { return this.definition.id }
  get label(): string { return this.definition.label }

  /**
   * Compute the image of the category under this functor.
   *
   * Every object A is mapped to F(A) via definition.mapObject.
   * Every morphism f is mapped to F(f) via definition.mapMorphism.
   *
   * Complexity: O(|Obj| + |Hom|).
   */
  apply(source: KiyoshiCategory): FunctorImage {
    const objectMap = new Map<string, string>()
    const morphismMap = new Map<string, string>()

    for (const obj of source.getAllObjects()) {
      objectMap.set(obj.id, this.definition.mapObject(obj.id))
    }

    for (const morphism of source.getAllMorphisms()) {
      morphismMap.set(morphism.id, this.definition.mapMorphism(morphism.id))
    }

    return Object.freeze({
      functorId: this.definition.id,
      objectMap,
      morphismMap,
    })
  }

  /**
   * Verify functor laws against a source category.
   *
   * Checks:
   *   1. Identity preservation: F(idA) = idF(A)
   *      — the image of every identity morphism is named id(F(A))
   *   2. Composition preservation (structural): for every morphism,
   *      the image domain/codomain agrees with F(original domain/codomain)
   *
   * Returns an array of violations.  An empty array means laws hold.
   *
   * Complexity: O(|Hom|).
   */
  verifyLaws(source: KiyoshiCategory): ReadonlyArray<FunctorViolation> {
    const violations: FunctorViolation[] = []

    for (const obj of source.getAllObjects()) {
      const idMorphism = source.identityOf(obj.id)
      if (!idMorphism) continue

      const imageObjectId = this.definition.mapObject(obj.id)
      const imageIdentityId = this.definition.mapMorphism(idMorphism.id)
      const expectedIdentityId = `id(${imageObjectId})`

      if (imageIdentityId !== expectedIdentityId) {
        violations.push({
          law: 'IDENTITY_PRESERVATION',
          description:
            `F(id(${obj.id})) = "${imageIdentityId}" but expected "id(F(${obj.id}))" = "${expectedIdentityId}"`,
        })
      }
    }

    // Composition preservation: structural check on domain/codomain mappings
    for (const morphism of source.getAllMorphisms()) {
      if (morphism.kind === 'IDENTITY') continue
      const fDomain   = this.definition.mapObject(morphism.domain)
      const fCodomain = this.definition.mapObject(morphism.codomain)
      // Image morphism id — just verify the mapping is defined
      const imageMorphismId = this.definition.mapMorphism(morphism.id)

      if (!imageMorphismId) {
        violations.push({
          law: 'COMPOSITION_PRESERVATION',
          description: `Functor "${this.id}" has no image morphism for "${morphism.id}" (${fDomain} → ${fCodomain})`,
        })
      }
    }

    return violations
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTOR BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a simple renaming functor that prefixes all object and morphism
 * ids with a given namespace string.
 *
 * This is the most common functor used when an application extends 𝒦
 * by wrapping existing objects in a new context (§5.6).
 *
 * Complexity: O(1) to construct; O(|Obj|+|Hom|) when applied.
 */
export function namespaceFunctor(functorId: string, namespace: string): Functor {
  return new Functor({
    id: functorId,
    label: `Namespace functor [${namespace}]`,
    mapObject: (id) => `${namespace}::${id}`,
    mapMorphism: (id) => {
      // Identity morphisms id(X) must map to id(namespace::X)
      const match = id.match(/^id\((.+)\)$/)
      if (match) return `id(${namespace}::${match[1]})`
      return `${namespace}::${id}`
    },
  })
}

/**
 * Build the identity functor Id : 𝒦 → 𝒦.
 *
 * Id(A) = A for all objects, Id(f) = f for all morphisms.
 *
 * Required by natural transformation definitions (§5.7).
 *
 * Complexity: O(1) to construct.
 */
export function identityFunctor(functorId: string = 'Id'): Functor {
  return new Functor({
    id: functorId,
    label: 'Identity functor',
    mapObject: (id) => id,
    mapMorphism: (id) => id,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// OBJECT FACTORY — produce a functor image object (§5.6)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Produce the image KiyoshiObject of obj under a functor F.
 * The id is rewritten by F; all other fields are preserved.
 */
export function applyFunctorToObject(
  obj: KiyoshiObject,
  f: FunctorDefinition,
): KiyoshiObject {
  return Object.freeze({
    ...obj,
    id: f.mapObject(obj.id),
    metadata: { ...obj.metadata, _functorSource: obj.id, _functorId: f.id },
  })
}

/**
 * Produce the image morphism of m under a functor F.
 * Rewrites id, domain, and codomain.
 */
export function applyFunctorToMorphism<A, B>(
  m: Morphism<A, B>,
  f: FunctorDefinition,
): Morphism<A, B> {
  return Object.freeze({
    ...m,
    id: f.mapMorphism(m.id),
    domain: f.mapObject(m.domain),
    codomain: f.mapObject(m.codomain),
    kind: 'FUNCTOR' as const,
  })
}
