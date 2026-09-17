/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 4: Graph Theory of Computation — §4.7, §4.13
 *
 * GK = (VK, EK) — the Knowledge Graph.
 *
 * §4.7  Vertices represent: Concepts, Objects, Users, Commands,
 *        Functions, Files, Relationships.
 *        Edges represent semantic relationships.
 *
 * §4.13 AI Reasoning — every reasoning task is Search(GK).
 *        The AI never guesses; it traverses Knowledge, Evidence,
 *        Constraints, Confidence, and Explanation.
 *
 *        Every answer produces:
 *          Result
 *          Confidence
 *          Supporting Path
 *          Explanation
 *          Alternative Solutions
 *
 * Complexity:
 *   addVertex    O(1)
 *   addEdge      O(1)
 *   search       O(|V| + |E|) — BFS over confidence-weighted GK
 *   reason       O(|V| + |E|) — multi-source BFS + path reconstruction
 */

import {
  KnowledgeVertex,
  KnowledgeEdge,
  KnowledgeRelation,
  ReasoningResult,
} from './types'

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE GRAPH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GK = (VK, EK) — the AI knowledge graph.
 *
 * Every AI reasoning operation is a traversal of GK.
 */
export class KnowledgeGraph {
  private readonly vk: Map<string, KnowledgeVertex> = new Map()
  /** Adjacency: from → list of outgoing edges. */
  private readonly ek: Map<string, KnowledgeEdge[]> = new Map()

  // ── Mutation ──────────────────────────────────────────────────────────────

  /**
   * Add or replace a knowledge vertex.
   *
   * Complexity: O(1).
   */
  addVertex(v: KnowledgeVertex): void {
    this.vk.set(v.id, Object.freeze({ ...v }))
    if (!this.ek.has(v.id)) this.ek.set(v.id, [])
  }

  /**
   * Add a directed semantic edge.
   *
   * Both endpoints must already be in VK.
   * Returns false if either endpoint is missing.
   *
   * Complexity: O(1).
   */
  addEdge(edge: KnowledgeEdge): boolean {
    if (!this.vk.has(edge.from) || !this.vk.has(edge.to)) return false
    this.ek.get(edge.from)!.push(Object.freeze({ ...edge }))
    return true
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  /**
   * Return all edges from a given vertex filtered by relation type.
   *
   * Complexity: O(deg(from)).
   */
  getEdgesByRelation(fromId: string, relation: KnowledgeRelation): ReadonlyArray<KnowledgeEdge> {
    return (this.ek.get(fromId) ?? []).filter(e => e.relation === relation)
  }

  // ── AI Reasoning — Search(GK) (§4.13) ────────────────────────────────────

  /**
   * Find the highest-confidence path from startId to goalId.
   *
   * Algorithm: modified BFS that propagates cumulative confidence
   * (product of edge confidences along the path).  At each step the
   * frontier is sorted by confidence descending, selecting the most
   * trustworthy path first.
   *
   * Returns a ReasoningResult with:
   *   result          — the goal vertex id (or best reached vertex id)
   *   confidence      — cumulative confidence of the supporting path
   *   supportingPath  — ordered vertex ids from start to goal
   *   explanation     — narrative description of the traversal
   *   alternatives    — up to three other reachable vertices with their scores
   *
   * Complexity: O(|V| + |E|) — each vertex visited at most once.
   */
  reason(startId: string, goalId: string): ReasoningResult {
    if (!this.vk.has(startId) || !this.vk.has(goalId)) {
      return this.failedResult(startId, goalId, 'Start or goal vertex not in GK')
    }

    // BFS with confidence tracking
    type State = { id: string; confidence: number; path: string[] }

    const visited = new Set<string>()
    const queue: State[] = [{ id: startId, confidence: 1.0, path: [startId] }]
    const alternatives: Array<{ result: string; confidence: number }> = []
    let best: State | null = null

    while (queue.length > 0) {
      // Select highest-confidence frontier entry
      queue.sort((a, b) => b.confidence - a.confidence)
      const current = queue.shift()!

      if (visited.has(current.id)) continue
      visited.add(current.id)

      if (current.id === goalId) {
        best = current
        break
      }

      // Record as alternative candidate
      if (current.id !== startId) {
        alternatives.push({ result: current.id, confidence: current.confidence })
      }

      for (const edge of this.ek.get(current.id) ?? []) {
        if (!visited.has(edge.to)) {
          queue.push({
            id: edge.to,
            confidence: current.confidence * edge.confidence,
            path: [...current.path, edge.to],
          })
        }
      }
    }

    if (!best) {
      return this.failedResult(startId, goalId, `No path found from "${startId}" to "${goalId}"`)
    }

    const topAlternatives = alternatives
      .filter(a => a.result !== goalId)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)

    const explanation =
      `Traversed GK from "${startId}" to "${goalId}" via ${best.path.length} vertices. ` +
      `Supporting path: ${best.path.join(' → ')}. ` +
      `Cumulative confidence: ${(best.confidence * 100).toFixed(1)}%.`

    return Object.freeze({
      result: goalId,
      confidence: best.confidence,
      supportingPath: best.path,
      explanation,
      alternatives: topAlternatives,
    })
  }

  /**
   * Search GK for all vertices reachable from startId whose confidence
   * product along the path meets or exceeds the threshold.
   *
   * Complexity: O(|V| + |E|).
   */
  search(startId: string, minConfidence: number = 0.5): ReadonlyArray<KnowledgeVertex> {
    if (!this.vk.has(startId)) return []

    const visited = new Set<string>()
    const queue: Array<{ id: string; confidence: number }> = [{ id: startId, confidence: 1.0 }]
    const results: KnowledgeVertex[] = []

    while (queue.length > 0) {
      const { id, confidence } = queue.shift()!
      if (visited.has(id)) continue
      visited.add(id)

      const vertex = this.vk.get(id)
      if (vertex && id !== startId) results.push(vertex)

      for (const edge of this.ek.get(id) ?? []) {
        const next = confidence * edge.confidence
        if (!visited.has(edge.to) && next >= minConfidence) {
          queue.push({ id: edge.to, confidence: next })
        }
      }
    }

    return results
  }

  // ── Observability ─────────────────────────────────────────────────────────

  getVertex(id: string): Readonly<KnowledgeVertex> | undefined {
    return this.vk.get(id)
  }

  getAllVertices(): ReadonlyArray<KnowledgeVertex> {
    return Array.from(this.vk.values())
  }

  getAllEdges(): ReadonlyArray<KnowledgeEdge> {
    const all: KnowledgeEdge[] = []
    for (const edges of this.ek.values()) all.push(...edges)
    return all
  }

  get vertexCount(): number { return this.vk.size }
  get edgeCount(): number {
    let n = 0
    for (const edges of this.ek.values()) n += edges.length
    return n
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private failedResult(startId: string, goalId: string, reason: string): ReasoningResult {
    return Object.freeze({
      result: goalId,
      confidence: 0,
      supportingPath: [],
      explanation: `Reasoning failed: ${reason}. Start="${startId}", Goal="${goalId}".`,
      alternatives: [],
    })
  }
}
