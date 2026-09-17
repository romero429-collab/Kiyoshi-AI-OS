/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 5: Category Theory — §5.8 Product, §5.9 Coproduct
 *
 * §5.8 Product A × B — independent systems combined via Cartesian Product.
 *      Objects remain independent; composition creates functionality.
 *
 * §5.9 Coproduct A + B — alternative implementations form a sum type.
 *      Selection occurs dynamically; interfaces remain unchanged.
 *
 * Complexity: O(1) for all operations.
 */

import { KiyoshiObject, ProductObject, CoproductObject, ObjectLifecycle } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT  A × B  (§5.8)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Construct the Cartesian product object A × B.
 *
 * The product comes equipped with two projection morphisms:
 *   π₁ : A × B → A   (projLeft)
 *   π₂ : A × B → B   (projRight)
 *
 * Objects A and B remain independent — the product only creates a new
 * object that simultaneously satisfies both interfaces (§5.8).
 *
 * Complexity: O(1).
 */
export function product(
  leftObj: Readonly<KiyoshiObject>,
  rightObj: Readonly<KiyoshiObject>,
): ProductObject {
  const id = `(${leftObj.id} × ${rightObj.id})`

  return Object.freeze({
    id,
    leftId: leftObj.id,
    rightId: rightObj.id,
    projLeft:  <A, B>(pair: [A, B]): A => pair[0],
    projRight: <A, B>(pair: [A, B]): B => pair[1],
  })
}

/**
 * Construct a KiyoshiObject representation of the product A × B
 * so that it can be registered in a KiyoshiCategory.
 *
 * The product object's interface is the union of the two component interfaces.
 *
 * Complexity: O(|IA| + |IB|).
 */
export function productObject(
  leftObj: Readonly<KiyoshiObject>,
  rightObj: Readonly<KiyoshiObject>,
  categoryId: string,
): KiyoshiObject {
  return Object.freeze({
    id: `(${leftObj.id} × ${rightObj.id})`,
    label: `${leftObj.label} × ${rightObj.label}`,
    version: leftObj.version,
    categoryId,
    lifecycle: 'ACTIVE' as ObjectLifecycle,
    interface: [...leftObj.interface, ...rightObj.interface],
    metadata: {
      kind: 'PRODUCT',
      leftId: leftObj.id,
      rightId: rightObj.id,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// COPRODUCT  A + B  (§5.9)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Construct the coproduct of a set of alternative implementations.
 *
 * The coproduct A₁ + A₂ + … + Aₙ comes with injection morphisms:
 *   ι_i : Aᵢ → A₁ + … + Aₙ
 *
 * Selection among alternatives occurs dynamically while the external
 * interface remains unchanged (§5.9).
 *
 * Complexity: O(n) where n = number of alternatives.
 */
export function coproduct(
  alternatives: ReadonlyArray<Readonly<KiyoshiObject>>,
): CoproductObject {
  if (alternatives.length === 0) {
    throw new Error('Coproduct requires at least one alternative object')
  }

  const ids = alternatives.map(a => a.id)
  const id = ids.join(' + ')

  return Object.freeze({
    id,
    alternativeIds: ids,
    inject: <T>(value: T, fromId: string): { tag: string; value: T } => {
      if (!ids.includes(fromId)) {
        throw new Error(`Injection source "${fromId}" is not a member of coproduct [${id}]`)
      }
      return { tag: fromId, value }
    },
  })
}

/**
 * Construct a KiyoshiObject representation of the coproduct
 * so that it can be registered in a KiyoshiCategory.
 *
 * Uses the interface of the first alternative as the common interface
 * (all alternatives must satisfy the same interface — §5.9).
 *
 * Complexity: O(n).
 */
export function coproductObject(
  alternatives: ReadonlyArray<Readonly<KiyoshiObject>>,
  categoryId: string,
): KiyoshiObject {
  if (alternatives.length === 0) {
    throw new Error('Coproduct requires at least one alternative object')
  }

  const ids = alternatives.map(a => a.id)
  const labels = alternatives.map(a => a.label)

  return Object.freeze({
    id: ids.join(' + '),
    label: labels.join(' | '),
    version: alternatives[0].version,
    categoryId,
    lifecycle: 'ACTIVE' as ObjectLifecycle,
    interface: alternatives[0].interface,  // common interface
    metadata: {
      kind: 'COPRODUCT',
      alternativeIds: ids,
    },
  })
}

/**
 * Select one alternative from a coproduct by id at runtime (§5.9).
 *
 * Returns the selected alternative object, or undefined if not found.
 *
 * Complexity: O(n).
 */
export function selectAlternative(
  coprod: CoproductObject,
  alternatives: ReadonlyArray<Readonly<KiyoshiObject>>,
  selectedId: string,
): Readonly<KiyoshiObject> | undefined {
  if (!coprod.alternativeIds.includes(selectedId)) return undefined
  return alternatives.find(a => a.id === selectedId)
}
