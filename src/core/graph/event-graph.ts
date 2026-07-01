/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 4: Graph Theory of Computation — §4.5 Event Graph
 *
 * GE — runtime event communication graph.
 *
 * Unlike the dependency graph GD, GE may contain cycles provided that
 * every cycle converges.  Infinite event loops are prohibited (§4.5).
 *
 * GE records which modules communicated via which event types at runtime,
 * producing an observable graph of all event-driven interactions.
 *
 * Convergence check: a cycle in GE is considered convergent when every
 * strongly connected component (SCC) has at least one vertex with a
 * declared exit condition.  The conservative default marks any back-edge
 * SCC as requiring review when no exit condition is registered.
 *
 * Complexity:
 *   recordEvent         O(1) amortised
 *   detectSCCs          O(|V| + |E|) — Tarjan's SCC algorithm
 *   findDivergentCycles O(|SCC|)
 */

import { EventType } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// EVENT EDGE
// ─────────────────────────────────────────────────────────────────────────────

/** A single event-communication edge recorded at runtime. */
export interface EventEdge {
  readonly from: string
  readonly to: string
  readonly eventType: EventType
  readonly timestamp: number
}

// ─────────────────────────────────────────────────────────────────────────────
// SCC RESULT
// ─────────────────────────────────────────────────────────────────────────────

/** One strongly connected component. */
export interface SCC {
  /** Member vertex ids of this component. */
  readonly members: ReadonlyArray<string>
  /** True when the component contains more than one vertex (non-trivial cycle). */
  readonly isCycle: boolean
  /** True when the cycle has at least one registered exit condition. */
  readonly isConvergent: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT GRAPH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GE = (VE, EE) — runtime event graph.
 *
 * Vertices are module ids that have sent or received at least one event.
 * Edges represent observed runtime event flows between modules.
 */
export class EventGraph {
  /** Adjacency list: sender → set of receivers. */
  private readonly adj: Map<string, Set<string>> = new Map()
  /** All recorded event edges. */
  private readonly eventEdges: EventEdge[] = []
  /**
   * Exit conditions registered by modules.
   * A module may declare that it will eventually stop emitting a cycle edge.
   */
  private readonly exitConditions: Map<string, string> = new Map()

  // ── Edge recording ────────────────────────────────────────────────────────

  /**
   * Record an observed event flow from → to.
   *
   * Creates vertices on demand (§4.9 dynamic discovery).
   *
   * Complexity: O(1) amortised.
   */
  recordEvent(edge: EventEdge): void {
    this.ensureVertex(edge.from)
    this.ensureVertex(edge.to)
    this.adj.get(edge.from)!.add(edge.to)
    this.eventEdges.push(Object.freeze({ ...edge }))
  }

  /**
   * Register an exit condition for a module.
   *
   * When a cycle is detected that passes through this module, it is
   * considered convergent (§4.5: cycles must converge).
   */
  registerExitCondition(moduleId: string, condition: string): void {
    this.exitConditions.set(moduleId, condition)
  }

  // ── Strongly Connected Components — Tarjan's algorithm ───────────────────

  /**
   * Compute all SCCs in GE using Tarjan's algorithm.
   *
   * An SCC with more than one member represents a cycle in GE.
   * A cycle is convergent iff at least one member has a registered exit condition.
   *
   * Complexity: O(|V| + |E|).
   */
  detectSCCs(): ReadonlyArray<SCC> {
    const index  = new Map<string, number>()
    const lowlink = new Map<string, number>()
    const onStack = new Map<string, boolean>()
    const stack: string[] = []
    const sccs: SCC[] = []
    let idx = 0

    const strongConnect = (v: string): void => {
      index.set(v, idx)
      lowlink.set(v, idx)
      idx++
      stack.push(v)
      onStack.set(v, true)

      for (const w of this.adj.get(v) ?? []) {
        if (!index.has(w)) {
          strongConnect(w)
          lowlink.set(v, Math.min(lowlink.get(v)!, lowlink.get(w)!))
        } else if (onStack.get(w)) {
          lowlink.set(v, Math.min(lowlink.get(v)!, index.get(w)!))
        }
      }

      if (lowlink.get(v) === index.get(v)) {
        const members: string[] = []
        let w: string
        do {
          w = stack.pop()!
          onStack.set(w, false)
          members.push(w)
        } while (w !== v)

        const isCycle = members.length > 1
        const isConvergent = isCycle
          ? members.some(m => this.exitConditions.has(m))
          : true

        sccs.push({ members, isCycle, isConvergent })
      }
    }

    for (const v of this.adj.keys()) {
      if (!index.has(v)) strongConnect(v)
    }

    return sccs
  }

  /**
   * Return SCCs that are cycles without a registered convergence condition.
   *
   * These represent potential infinite event loops and must be reviewed (§4.5).
   *
   * Complexity: O(|V| + |E|).
   */
  findDivergentCycles(): ReadonlyArray<SCC> {
    return this.detectSCCs().filter(s => s.isCycle && !s.isConvergent)
  }

  // ── Observability ─────────────────────────────────────────────────────────

  getEdges(): ReadonlyArray<EventEdge> { return [...this.eventEdges] }

  getEdgesFor(fromId: string): ReadonlyArray<EventEdge> {
    return this.eventEdges.filter(e => e.from === fromId)
  }

  get vertexCount(): number { return this.adj.size }
  get edgeCount(): number   { return this.eventEdges.length }

  private ensureVertex(id: string): void {
    if (!this.adj.has(id)) this.adj.set(id, new Set())
  }
}
