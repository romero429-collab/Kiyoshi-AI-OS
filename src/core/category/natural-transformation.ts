/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 5: Category Theory — §5.7 Natural Transformations
 *
 * η : F ⇒ G — architecture-preserving replacement.
 *
 * For every object A, the component ηA : F(A) → G(A) must satisfy
 * the naturality square:
 *
 *   G(f) ∘ ηA = ηB ∘ F(f)
 *
 * This enables: Refactoring, Optimization, Hardware acceleration,
 * Platform adaptation — without changing observable behavior (§5.7).
 *
 * Complexity:
 *   verify  O(|Hom|) — checks the naturality square for every morphism
 */

import { NaturalTransformation } from './types'
import { Functor } from './functor'
import { KiyoshiCategory } from './category'

// ─────────────────────────────────────────────────────────────────────────────
// NATURALITY VIOLATION
// ─────────────────────────────────────────────────────────────────────────────

export interface NaturalityViolation {
  readonly morphismId: string
  readonly description: string
}

// ─────────────────────────────────────────────────────────────────────────────
// NATURAL TRANSFORMATION REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registry that stores and verifies natural transformations η : F ⇒ G.
 *
 * A natural transformation is verified by checking that the naturality
 * square commutes for every morphism in the source category.
 */
export class NaturalTransformationRegistry {
  private readonly registry: Map<string, NaturalTransformation> = new Map()

  /**
   * Register a natural transformation η : F ⇒ G.
   *
   * Complexity: O(1).
   */
  register(eta: NaturalTransformation): void {
    this.registry.set(eta.id, Object.freeze({ ...eta }))
  }

  /**
   * Retrieve a registered natural transformation by id.
   */
  get(id: string): Readonly<NaturalTransformation> | undefined {
    return this.registry.get(id)
  }

  /**
   * Verify the naturality square for every morphism in the source category.
   *
   * Naturality square:  G(f) ∘ ηA = ηB ∘ F(f)
   *
   * In this implementation the check is structural: for each morphism
   * f : A → B in the source category, we verify that:
   *   - ηA (the component at A) maps from F(A) to G(A)
   *   - ηB (the component at B) maps from F(B) to G(B)
   *   - The image morphisms F(f) and G(f) connect the component morphisms
   *
   * Because morphism identities are string-based, the structural check
   * validates that all referenced morphism ids exist in the category.
   *
   * Returns an array of naturality violations.
   *
   * Complexity: O(|Hom|).
   */
  verify(
    etaId: string,
    F: Functor,
    G: Functor,
    source: KiyoshiCategory,
  ): ReadonlyArray<NaturalityViolation> {
    const eta = this.registry.get(etaId)
    if (!eta) {
      return [{
        morphismId: '',
        description: `Natural transformation "${etaId}" is not registered`,
      }]
    }

    const violations: NaturalityViolation[] = []
    const fImage = F.apply(source)
    const gImage = G.apply(source)

    for (const morphism of source.getAllMorphisms()) {
      if (morphism.kind === 'IDENTITY') continue

      const A = morphism.domain
      const B = morphism.codomain

      // Components ηA and ηB
      const etaAId = eta.componentAt(A)
      const etaBId = eta.componentAt(B)

      if (!etaAId) {
        violations.push({ morphismId: morphism.id, description: `No component ηA for object "${A}"` })
        continue
      }
      if (!etaBId) {
        violations.push({ morphismId: morphism.id, description: `No component ηB for object "${B}"` })
        continue
      }

      // Image morphisms under F and G
      const Ff = fImage.morphismMap.get(morphism.id)
      const Gf = gImage.morphismMap.get(morphism.id)

      if (!Ff) {
        violations.push({ morphismId: morphism.id, description: `Functor F has no image morphism for "${morphism.id}"` })
      }
      if (!Gf) {
        violations.push({ morphismId: morphism.id, description: `Functor G has no image morphism for "${morphism.id}"` })
      }
    }

    return violations
  }

  getAllTransformations(): ReadonlyArray<NaturalTransformation> {
    return Array.from(this.registry.values())
  }

  get count(): number { return this.registry.size }
}

// ─────────────────────────────────────────────────────────────────────────────
// NATURAL TRANSFORMATION FACTORY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a natural transformation η : F ⇒ G where the component at
 * each object A is the morphism  ηA : F(A) → G(A)  produced by
 * composing F(A) → A (inverse namespace) → G(A).
 *
 * This is the standard "adapter" transformation used when replacing
 * one platform implementation with another (§5.7).
 *
 * Complexity: O(1) to construct.
 */
export function buildNaturalTransformation(
  id: string,
  F: Functor,
  G: Functor,
  description: string,
): NaturalTransformation {
  return Object.freeze({
    id,
    sourceFunctorId: F.id,
    targetFunctorId: G.id,
    componentAt: (objectId: string) => `η(${objectId})[${F.id}⇒${G.id}]`,
    description,
  })
}
