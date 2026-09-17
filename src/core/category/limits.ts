/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 5: Category Theory — §5.10 Limits, §5.11 Colimits
 *
 * §5.10 Limit  — subsystem synchronization.
 *       A set of objects must agree on a compatible configuration
 *       before a combined operation proceeds.
 *       The limit is the unique compatible configuration (§5.10).
 *
 * §5.11 Colimit — application assembly.
 *       Independent modules combine into Applications, Workspaces,
 *       and Projects without violating modularity (§5.11).
 *
 * Complexity: O(n) where n = number of participating objects.
 */

import { LimitResult, ColimitResult } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// LIMIT  (§5.10)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A readiness check — each participant reports whether it is ready
 * to converge.  The limit is only reached when all report true.
 */
export type ReadinessProbe = (objectId: string) => boolean

/**
 * Compute the limit of a set of objects under a given readiness probe.
 *
 * The limit converges iff every participant is ready.
 * This models the synchronization constraint described in §5.10:
 * all participating subsystems must agree before the combined
 * operation (e.g. application startup) proceeds.
 *
 * Complexity: O(n).
 */
export function computeLimit(
  limitId: string,
  participantIds: ReadonlyArray<string>,
  probe: ReadinessProbe,
): LimitResult {
  const converged = participantIds.every(id => probe(id))

  return Object.freeze({
    id: limitId,
    participantIds: [...participantIds],
    converged,
    timestamp: Date.now(),
  })
}

/**
 * Await limit convergence by polling up to maxAttempts times with the
 * given readiness probe.
 *
 * Returns the first LimitResult where converged = true, or the final
 * result after maxAttempts exhausted.
 *
 * This is a synchronous simulation — asynchronous variants should use
 * the KiyoshiMonad (§5.13).
 *
 * Complexity: O(n × maxAttempts).
 */
export function awaitLimit(
  limitId: string,
  participantIds: ReadonlyArray<string>,
  probe: ReadinessProbe,
  maxAttempts: number = 1,
): LimitResult {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = computeLimit(limitId, participantIds, probe)
    if (result.converged) return result
  }
  return computeLimit(limitId, participantIds, probe)
}

// ─────────────────────────────────────────────────────────────────────────────
// COLIMIT  (§5.11)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute the colimit of a set of independent component objects.
 *
 * The colimit assembles the components into a new composed object id
 * without violating the modularity of any individual component (§5.11).
 *
 * In categorical terms this is the pushout / coproduct with gluing
 * constraints.  Here it is represented concretely as the assembly of
 * module ids into a named application id.
 *
 * Complexity: O(n).
 */
export function computeColimit(
  colimitId: string,
  componentIds: ReadonlyArray<string>,
  assembledId: string,
): ColimitResult {
  return Object.freeze({
    id: colimitId,
    componentIds: [...componentIds],
    assembledId,
    timestamp: Date.now(),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATION ASSEMBLY  (§5.11 concrete application)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Assemble a named application from a list of module object ids.
 *
 * This is the canonical colimit operation in Kiyoshi:
 * independent modules compose into an application subgraph
 * without altering the modules themselves (§5.11, §4.6).
 *
 * Complexity: O(n).
 */
export function assembleApplication(
  applicationName: string,
  moduleIds: ReadonlyArray<string>,
): ColimitResult {
  return computeColimit(
    `colimit(${applicationName})`,
    moduleIds,
    applicationName,
  )
}

/**
 * Decompose a colimit (assembled application) back into its components.
 *
 * Decomposition is always possible because colimit construction never
 * modifies the component objects (§5.11: without violating modularity).
 *
 * Complexity: O(1).
 */
export function decomposeColimit(colimit: ColimitResult): ReadonlyArray<string> {
  return colimit.componentIds
}
