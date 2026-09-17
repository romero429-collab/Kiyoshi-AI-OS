/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 4: Graph Theory of Computation — §4.1, §4.6, §4.9, §4.14
 *
 * SystemGraph G = (V, E)
 *
 * Every subsystem is a node.
 * Every dependency is an edge.
 * Every event is a traversal.
 * Every application is a subgraph.
 *
 * Module discovery (§4.9) enforces:
 *   - Identifier uniqueness
 *   - Dependency validation (all declared dependencies exist in V)
 *   - Cycle detection in GD (delegate to DependencyGraph)
 *   - Version compatibility (semver present)
 *   - Interface validation (vertex well-formed)
 *
 * Self-evolution (§4.14): vertices may be inserted, removed, or updated
 * while preserving correctness through pre-acceptance verification.
 *
 * Complexity:
 *   addVertex    O(|D|)  — D = dependency set of the new vertex
 *   removeVertex O(|E|)  — scan all edges for dangling references
 *   getNeighbors O(|E|)  — linear scan (adjacency list built on demand)
 */

import {
  Vertex,
  Edge,
  EdgeType,
  ApplicationGraph,
  DiscoveryReport,
} from './types'

const SEMVER_RE = /^\d+\.\d+\.\d+/

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM GRAPH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * G = (V, E) — the complete directed labeled system graph.
 *
 * All subsystems are vertices; all relationships are typed edges.
 */
export class SystemGraph {
  private readonly vertices: Map<string, Vertex> = new Map()
  private readonly edges: Edge[] = []

  // ── Vertex management (§4.9 Module Discovery) ─────────────────────────────

  /**
   * Attempt to register a new vertex.
   *
   * Verification steps (§4.9):
   *   1. Identifier uniqueness
   *   2. Semver version present
   *   3. All declared dependencies already present in V
   *
   * Returns a DiscoveryReport indicating ACCEPTED or REJECTED.
   *
   * Complexity: O(|D|) where D is the dependency set of the candidate.
   */
  addVertex(vertex: Vertex): DiscoveryReport {
    const ts = Date.now()

    if (this.vertices.has(vertex.id)) {
      return { vertexId: vertex.id, status: 'REJECTED', reason: `Vertex "${vertex.id}" already exists`, timestamp: ts }
    }

    if (!SEMVER_RE.test(vertex.version)) {
      return { vertexId: vertex.id, status: 'REJECTED', reason: `Version "${vertex.version}" is not valid semver`, timestamp: ts }
    }

    for (const dep of vertex.dependencies) {
      if (!this.vertices.has(dep)) {
        return { vertexId: vertex.id, status: 'REJECTED', reason: `Dependency "${dep}" not found in G`, timestamp: ts }
      }
    }

    this.vertices.set(vertex.id, Object.freeze({ ...vertex }))
    return { vertexId: vertex.id, status: 'ACCEPTED', timestamp: ts }
  }

  /**
   * Remove a vertex and all incident edges (§4.14 Self-Evolution).
   *
   * Complexity: O(|E|).
   */
  removeVertex(vertexId: string): boolean {
    if (!this.vertices.has(vertexId)) return false
    this.vertices.delete(vertexId)
    // Remove all incident edges
    let i = this.edges.length
    while (i--) {
      if (this.edges[i].from === vertexId || this.edges[i].to === vertexId) {
        this.edges.splice(i, 1)
      }
    }
    return true
  }

  /**
   * Replace a vertex definition while preserving all edges (§4.14).
   *
   * The replacement is accepted only if it passes the same verification
   * checks as addVertex.  Edges are preserved unchanged.
   *
   * Complexity: O(|D|).
   */
  updateVertex(vertex: Vertex): DiscoveryReport {
    const ts = Date.now()
    if (!this.vertices.has(vertex.id)) {
      return { vertexId: vertex.id, status: 'REJECTED', reason: `Vertex "${vertex.id}" does not exist`, timestamp: ts }
    }
    if (!SEMVER_RE.test(vertex.version)) {
      return { vertexId: vertex.id, status: 'REJECTED', reason: `Version "${vertex.version}" is not valid semver`, timestamp: ts }
    }
    for (const dep of vertex.dependencies) {
      if (!this.vertices.has(dep)) {
        return { vertexId: vertex.id, status: 'REJECTED', reason: `Dependency "${dep}" not found in G`, timestamp: ts }
      }
    }
    this.vertices.set(vertex.id, Object.freeze({ ...vertex }))
    return { vertexId: vertex.id, status: 'ACCEPTED', timestamp: ts }
  }

  // ── Edge management (§4.3) ────────────────────────────────────────────────

  /**
   * Add a typed directed edge e(u, v).
   *
   * Both endpoints must already be in V.
   *
   * Complexity: O(1).
   */
  addEdge(edge: Edge): boolean {
    if (!this.vertices.has(edge.from) || !this.vertices.has(edge.to)) {
      return false
    }
    this.edges.push(Object.freeze({ ...edge }))
    return true
  }

  /**
   * Return all edges of a given type.
   *
   * Complexity: O(|E|).
   */
  getEdgesByType(type: EdgeType): ReadonlyArray<Edge> {
    return this.edges.filter(e => e.type === type)
  }

  // ── Adjacency queries ─────────────────────────────────────────────────────

  /**
   * Return vertices reachable directly from the given vertex id.
   *
   * Complexity: O(|E|).
   */
  getOutNeighbors(vertexId: string): ReadonlyArray<string> {
    return this.edges
      .filter(e => e.from === vertexId)
      .map(e => e.to)
  }

  /**
   * Return vertices that point to the given vertex id.
   *
   * Complexity: O(|E|).
   */
  getInNeighbors(vertexId: string): ReadonlyArray<string> {
    return this.edges
      .filter(e => e.to === vertexId)
      .map(e => e.from)
  }

  // ── Application subgraph (§4.6) ───────────────────────────────────────────

  /**
   * Extract induced subgraph A = (VA, EA) for the given vertex ids.
   *
   * EA contains every edge in G whose both endpoints are in VA.
   *
   * Complexity: O(|E|).
   */
  inducedSubgraph(applicationId: string, vertexIds: ReadonlyArray<string>): ApplicationGraph {
    const idSet = new Set(vertexIds)
    const subEdges = this.edges.filter(e => idSet.has(e.from) && idSet.has(e.to))
    return Object.freeze({
      applicationId,
      vertexIds: [...vertexIds],
      edges: subEdges,
    })
  }

  // ── Observability ─────────────────────────────────────────────────────────

  hasVertex(id: string): boolean {
    return this.vertices.has(id)
  }

  getVertex(id: string): Readonly<Vertex> | undefined {
    return this.vertices.get(id)
  }

  getAllVertices(): ReadonlyArray<Vertex> {
    return Array.from(this.vertices.values())
  }

  getAllEdges(): ReadonlyArray<Edge> {
    return [...this.edges]
  }

  get vertexCount(): number {
    return this.vertices.size
  }

  get edgeCount(): number {
    return this.edges.length
  }
}
