/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 4: Graph Theory of Computation — §4.4 Dependency Graph
 *
 * GD — Directed Acyclic Graph of implementation dependencies.
 *
 * Invariant: Cycle(GD) = FALSE.
 * If Cycle(GD) = TRUE the architecture is invalid (§4.4).
 *
 * Implemented using depth-first search Tarjan-style cycle detection.
 *
 * Complexity:
 *   addDependency    O(|V| + |E|) — cycle check after insertion
 *   hasCycle         O(|V| + |E|) — DFS over adjacency list
 *   topologicalOrder O(|V| + |E|) — Kahn's algorithm
 */

// ─────────────────────────────────────────────────────────────────────────────
// DEPENDENCY GRAPH
// ─────────────────────────────────────────────────────────────────────────────

export interface DependencyEdge {
  readonly from: string
  readonly to: string
  readonly version: string
}

/** Result of a cycle-detection run. */
export interface CycleCheckResult {
  readonly hasCycle: boolean
  /** The first cycle detected, as an ordered list of vertex ids. Empty if no cycle. */
  readonly cycle: ReadonlyArray<string>
}

/**
 * GD — the dependency graph.
 *
 * Contains only DEPENDENCY-type edges.  Cycles are prohibited.
 * Every attempted insertion that would create a cycle is rejected.
 */
export class DependencyGraph {
  /** Adjacency list: id → set of ids it depends on. */
  private readonly adj: Map<string, Set<string>> = new Map()
  /** Raw dependency edges. */
  private readonly depEdges: DependencyEdge[] = []

  // ── Vertex registration ───────────────────────────────────────────────────

  /** Ensure a vertex id is present in the adjacency list. */
  addVertex(id: string): void {
    if (!this.adj.has(id)) {
      this.adj.set(id, new Set())
    }
  }

  // ── Edge insertion ────────────────────────────────────────────────────────

  /**
   * Attempt to add a directed dependency edge from → to.
   *
   * The edge is rejected if it would introduce a cycle.
   *
   * Returns true on success, false when the edge was rejected.
   *
   * Complexity: O(|V| + |E|).
   */
  addDependency(edge: DependencyEdge): boolean {
    this.addVertex(edge.from)
    this.addVertex(edge.to)

    // Tentatively insert, then check for cycles, remove if found.
    this.adj.get(edge.from)!.add(edge.to)
    const { hasCycle } = this.detectCycle()

    if (hasCycle) {
      this.adj.get(edge.from)!.delete(edge.to)
      return false
    }

    this.depEdges.push(Object.freeze({ ...edge }))
    return true
  }

  // ── Cycle Detection — DFS with colour marking ─────────────────────────────

  /**
   * Detect whether GD contains a cycle using DFS with tri-colour marking.
   *
   * Colours:
   *   WHITE (0) — not yet visited
   *   GREY  (1) — in current DFS stack (back-edge = cycle)
   *   BLACK (2) — fully processed
   *
   * Complexity: O(|V| + |E|).
   */
  detectCycle(): CycleCheckResult {
    const WHITE = 0, GREY = 1, BLACK = 2
    const colour = new Map<string, number>()
    const parent = new Map<string, string | null>()

    for (const id of this.adj.keys()) {
      colour.set(id, WHITE)
      parent.set(id, null)
    }

    let cycleEnd = ''
    let cycleStart = ''

    const dfs = (u: string): boolean => {
      colour.set(u, GREY)
      for (const v of this.adj.get(u) ?? []) {
        if (colour.get(v) === GREY) {
          cycleEnd = u
          cycleStart = v
          return true
        }
        if (colour.get(v) === WHITE) {
          parent.set(v, u)
          if (dfs(v)) return true
        }
      }
      colour.set(u, BLACK)
      return false
    }

    for (const id of this.adj.keys()) {
      if (colour.get(id) === WHITE) {
        if (dfs(id)) {
          // Reconstruct the cycle path
          const cycle: string[] = [cycleStart]
          let cur = cycleEnd
          while (cur !== cycleStart) {
            cycle.push(cur)
            cur = parent.get(cur) ?? cycleStart
          }
          cycle.push(cycleStart)
          return { hasCycle: true, cycle: cycle.reverse() }
        }
      }
    }

    return { hasCycle: false, cycle: [] }
  }

  // ── Topological ordering — Kahn's algorithm (§4.8) ───────────────────────

  /**
   * Return a topological ordering of all vertices.
   *
   * Requires hasCycle === false.
   * Returns an empty array if a cycle is detected.
   *
   * Complexity: O(|V| + |E|).
   */
  topologicalOrder(): ReadonlyArray<string> {
    const inDegree = new Map<string, number>()
    for (const id of this.adj.keys()) inDegree.set(id, 0)

    for (const [, deps] of this.adj.entries()) {
      for (const dep of deps) {
        inDegree.set(dep, (inDegree.get(dep) ?? 0) + 1)
      }
    }

    const queue: string[] = []
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(id)
    }

    const order: string[] = []
    while (queue.length > 0) {
      const u = queue.shift()!
      order.push(u)
      for (const v of this.adj.get(u) ?? []) {
        const d = (inDegree.get(v) ?? 0) - 1
        inDegree.set(v, d)
        if (d === 0) queue.push(v)
      }
    }

    // If not all vertices were processed, a cycle exists
    if (order.length !== this.adj.size) return []
    return order
  }

  // ── Observability ─────────────────────────────────────────────────────────

  getVertexIds(): ReadonlyArray<string> {
    return Array.from(this.adj.keys())
  }

  getDependencies(id: string): ReadonlyArray<string> {
    return Array.from(this.adj.get(id) ?? [])
  }

  getEdges(): ReadonlyArray<DependencyEdge> {
    return [...this.depEdges]
  }

  get vertexCount(): number { return this.adj.size }
  get edgeCount(): number   { return this.depEdges.length }
}
