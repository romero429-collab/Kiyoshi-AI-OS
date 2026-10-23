/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 5: Category Theory — §5.14 Architectural Law, §5.15 AI Code Generation, §5.16 Correctness
 *
 * Correctness verifier: a module is correct iff (§5.16):
 *   1. Identity morphism exists
 *   2. Composition is closed within the category
 *   3. Verification succeeds
 *   4. No forbidden side effects exist
 *   5. Complexity constraints are declared
 *   6. Dependencies remain acyclic
 *
 * §5.14 Architectural Law — every extension must preserve:
 *   Identity, Composition, Associativity, Determinism, Verification.
 *   Failure to preserve any property invalidates the architecture.
 *
 * §5.15 AI Code Generation — AI constructs Objects, Morphisms,
 *   Transformations, Proof Obligations, and Verification Conditions.
 *   Every generated module must satisfy the five generation obligations.
 *
 * Complexity:
 *   verifyObject    O(|Hom|) — scans morphisms for composition closure
 *   verifyAll       O(|Obj| × |Hom|)
 */

import { KiyoshiCategory } from './category'
import { DependencyGraph } from '../graph/dependency-graph'
import { CorrectnessCertificate, CodeGenerationObligation, KiyoshiObject, Morphism } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// CORRECTNESS VERIFIER  (§5.16)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify categorical correctness of a single object in 𝒦.
 *
 * Six conditions are checked (§5.16):
 *   1. identityExists          — idA present in Hom
 *   2. compositionClosed       — every morphism from A composes with at
 *                                least one morphism to its codomain
 *   3. verificationPassed      — object lifecycle is not DEPRECATED/DESTROYED
 *   4. sideEffectFree          — identity morphism apply is purely substituted
 *   5. complexityDeclared      — object metadata contains 'complexity' key
 *   6. dependenciesAcyclic     — DependencyGraph reports no cycle
 *
 * A module is correct iff all six conditions hold.
 *
 * Complexity: O(|Hom|).
 */
export function verifyObject(
  obj: Readonly<KiyoshiObject>,
  category: KiyoshiCategory,
  depGraph: DependencyGraph,
): CorrectnessCertificate {
  // 1. Identity existence
  const identityExists = category.identityOf(obj.id) !== undefined

  // 2. Composition closure — every outgoing morphism can compose with
  //    at least one morphism that originates at its codomain
  const outgoing = category.getMorphismsFrom(obj.id).filter(m => m.kind !== 'IDENTITY')
  const compositionClosed = outgoing.length === 0 || outgoing.every(f => {
    const codomainMorphisms = category.getMorphismsFrom(f.codomain)
    return codomainMorphisms.length > 0 || f.codomain === obj.id
  })

  // 3. Verification — active lifecycle
  const verificationPassed =
    obj.lifecycle !== 'DEPRECATED' && obj.lifecycle !== 'DESTROYED'

  // 4. Side-effect freedom — identity morphism must return its input unchanged
  const idMorphism = category.identityOf<unknown>(obj.id)
  const sideEffectFree = idMorphism !== undefined
    ? (() => { const sentinel = {}; return idMorphism.apply(sentinel) === sentinel })()
    : false

  // 5. Complexity declared
  const complexityDeclared = obj.metadata['complexity'] !== undefined

  // 6. Dependencies acyclic
  const { hasCycle } = depGraph.detectCycle()
  const dependenciesAcyclic = !hasCycle

  const isCorrect =
    identityExists &&
    compositionClosed &&
    verificationPassed &&
    sideEffectFree &&
    complexityDeclared &&
    dependenciesAcyclic

  const proof = buildProofNarrative(obj.id, {
    identityExists,
    compositionClosed,
    verificationPassed,
    sideEffectFree,
    complexityDeclared,
    dependenciesAcyclic,
    isCorrect,
  })

  return Object.freeze({
    objectId: obj.id,
    identityExists,
    compositionClosed,
    verificationPassed,
    sideEffectFree,
    complexityDeclared,
    dependenciesAcyclic,
    isCorrect,
    timestamp: Date.now(),
    proof,
  })
}

/**
 * Run correctness verification for every object in the category.
 *
 * Returns a map from object id → CorrectnessCertificate.
 *
 * Complexity: O(|Obj| × |Hom|).
 */
export function verifyAll(
  category: KiyoshiCategory,
  depGraph: DependencyGraph,
): ReadonlyMap<string, CorrectnessCertificate> {
  const results = new Map<string, CorrectnessCertificate>()
  for (const obj of category.getAllObjects()) {
    results.set(obj.id, verifyObject(obj, category, depGraph))
  }
  return results
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURAL LAW ENFORCEMENT  (§5.14)
// ─────────────────────────────────────────────────────────────────────────────

export interface ArchitecturalLawReport {
  readonly timestamp: number
  /** All objects that violate at least one law. */
  readonly violations: ReadonlyArray<{ objectId: string; failedLaws: string[] }>
  /** True when the entire category satisfies all laws. */
  readonly lawsHold: boolean
}

/**
 * Enforce the architectural laws from §5.14 over the entire category.
 *
 * Laws:
 *   Identity      — every object has idA
 *   Composition   — morphism composition is closed
 *   Associativity — structural (guaranteed by compose() implementation)
 *   Determinism   — side-effect-free identity
 *   Verification  — lifecycle is not DEPRECATED or DESTROYED
 *
 * Complexity: O(|Obj| × |Hom|).
 */
export function enforceArchitecturalLaws(
  category: KiyoshiCategory,
  depGraph: DependencyGraph,
): ArchitecturalLawReport {
  const violations: Array<{ objectId: string; failedLaws: string[] }> = []

  for (const obj of category.getAllObjects()) {
    const cert = verifyObject(obj, category, depGraph)
    const failedLaws: string[] = []

    if (!cert.identityExists)       failedLaws.push('Identity')
    if (!cert.compositionClosed)    failedLaws.push('Composition')
    if (!cert.verificationPassed)   failedLaws.push('Verification')
    if (!cert.sideEffectFree)       failedLaws.push('Determinism')
    if (!cert.dependenciesAcyclic)  failedLaws.push('Acyclicity')

    if (failedLaws.length > 0) {
      violations.push({ objectId: obj.id, failedLaws })
    }
  }

  return Object.freeze({
    timestamp: Date.now(),
    violations,
    lawsHold: violations.length === 0,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// AI CODE GENERATION OBLIGATIONS  (§5.15)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify that an AI-generated object satisfies all five §5.15 obligations:
 *   1. Object definition provided
 *   2. Interface rules satisfied (at least one interface key declared)
 *   3. Composition rules preserved (morphisms available in category)
 *   4. Verification rules encoded (lifecycle is ACTIVE)
 *   5. Complexity constraints declared
 *
 * Complexity: O(|Hom|).
 */
export function checkCodeGenerationObligation(
  obj: Readonly<KiyoshiObject>,
  category: KiyoshiCategory,
): CodeGenerationObligation {
  const objectDefined       = obj.id.length > 0 && obj.label.length > 0
  const interfaceCompliant  = obj.interface.length > 0
  const compositionPreserved = category.getMorphismsFrom(obj.id).length > 0 ||
                               category.getMorphismsTo(obj.id).length > 0 ||
                               category.identityOf(obj.id) !== undefined
  const verificationEncoded = obj.lifecycle === 'ACTIVE' || obj.lifecycle === 'INITIALIZING'
  const complexityDeclared  = obj.metadata['complexity'] !== undefined

  const satisfied =
    objectDefined &&
    interfaceCompliant &&
    compositionPreserved &&
    verificationEncoded &&
    complexityDeclared

  return Object.freeze({
    generatedObjectId: obj.id,
    objectDefined,
    interfaceCompliant,
    compositionPreserved,
    verificationEncoded,
    complexityDeclared,
    satisfied,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function buildProofNarrative(
  objectId: string,
  cert: Omit<CorrectnessCertificate, 'objectId' | 'timestamp' | 'proof'>,
): string {
  const lines: string[] = [`Correctness proof for object "${objectId}":`]
  lines.push(`  [${cert.identityExists      ? '✓' : '✗'}] Identity morphism id(${objectId}) exists`)
  lines.push(`  [${cert.compositionClosed   ? '✓' : '✗'}] Composition is closed`)
  lines.push(`  [${cert.verificationPassed  ? '✓' : '✗'}] Lifecycle verification passed`)
  lines.push(`  [${cert.sideEffectFree      ? '✓' : '✗'}] Identity is side-effect free`)
  lines.push(`  [${cert.complexityDeclared  ? '✓' : '✗'}] Complexity constraints declared`)
  lines.push(`  [${cert.dependenciesAcyclic ? '✓' : '✗'}] Dependency graph is acyclic`)
  lines.push(`  Verdict: ${cert.isCorrect ? 'CORRECT ✓' : 'INCORRECT ✗'}`)
  return lines.join('\n')
}
