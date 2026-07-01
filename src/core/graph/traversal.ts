/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 4: Graph Theory of Computation — §4.8 Graph Traversal
 *
 * Implements all traversal algorithms required by §4.8:
 *
 *   BFS           — Breadth-First Search
 *   DFS           — Depth-First Search
 *   TOPOLOGICAL   — Topological ordering (via Kahn's algorithm)
 *   DIJKSTRA      — Shortest-path with non-negative edge weights
 *   ASTAR         — Minimum-cost search with admissible heuristic
 *
 * Traversal selection depends on Goal, Cost, Confidence, and Time
 * Constraints (§4.8).
 *
 * Complexity annotations are per-algorithm.
 */

import { TraversalResult } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// WEIGHTED ADJACENCY LIST
// ─────────────────────────────────────────────────────────────────────────────

/** A single adjacent edge used by the traversal algorithms. */
export interface WeightedEdge {
  readonly to: string
  readonly weight: number
}

/** A simple weighted directed graph for traversal purposes. */
export type AdjList = ReadonlyMap<string, ReadonlyArray<WeightedEdge>>

// ─────────────────────────────────────────────────────────────────────────────
// BFS — Breadth-First Search  O(|V| + |E|)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Breadth-First Search from startId, optionally stopping at goalId.
 *
 * Visits vertices in FIFO order — guarantees shortest hop count.
 *
 * Complexity: O(|V| + |E|).
 */
export function bfs(
  graph: AdjList,
  startId: string,
  goalId?: string,
): TraversalResult {
  const visited = new Set<string>()
  const queue: Array<{ id: string; path: string[] }> = [{ id: startId, path: [startId] }]
  const visitOrder: string[] = []
  let totalCost = 0
  let reached = false
  let finalPath: string[] = [startId]

  while (queue.length > 0) {
    const { id, path } = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)
    visitOrder.push(id)

    if (id === goalId) {
      reached = true
      finalPath = path
      break
    }

    for (const edge of graph.get(id) ?? []) {
      if (!visited.has(edge.to)) {
        queue.push({ id: edge.to, path: [...path, edge.to] })
        totalCost += edge.weight
      }
    }
  }

  return Object.freeze({ algorithm: 'BFS', visitOrder: finalPath, totalCost, reached })
}

// ─────────────────────────────────────────────────────────────────────────────
// DFS — Depth-First Search  O(|V| + |E|)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Depth-First Search from startId, optionally stopping at goalId.
 *
 * Visits vertices in LIFO stack order — explores deep paths first.
 *
 * Complexity: O(|V| + |E|).
 */
export function dfs(
  graph: AdjList,
  startId: string,
  goalId?: string,
): TraversalResult {
  const visited = new Set<string>()
  const visitOrder: string[] = []
  let totalCost = 0
  let reached = false
  let finalPath: string[] = []

  const recurse = (id: string, path: string[]): boolean => {
    if (visited.has(id)) return false
    visited.add(id)
    visitOrder.push(id)
    const currentPath = [...path, id]

    if (id === goalId) {
      reached = true
      finalPath = currentPath
      return true
    }

    for (const edge of graph.get(id) ?? []) {
      totalCost += edge.weight
      if (recurse(edge.to, currentPath)) return true
    }

    return false
  }

  recurse(startId, [])
  if (!reached) finalPath = visitOrder

  return Object.freeze({ algorithm: 'DFS', visitOrder: finalPath, totalCost, reached })
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPOLOGICAL ORDERING — Kahn's algorithm  O(|V| + |E|)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute a topological ordering of the DAG.
 *
 * Returns an empty visitOrder if a cycle is detected.
 * Requires the graph to be a DAG (same constraint as GD, §4.4).
 *
 * Complexity: O(|V| + |E|).
 */
export function topologicalSort(graph: AdjList): TraversalResult {
  const inDegree = new Map<string, number>()

  for (const id of graph.keys()) inDegree.set(id, 0)
  for (const [, edges] of graph.entries()) {
    for (const e of edges) {
      inDegree.set(e.to, (inDegree.get(e.to) ?? 0) + 1)
    }
  }

  const queue: string[] = []
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id)
  }

  const order: string[] = []
  let totalCost = 0

  while (queue.length > 0) {
    const u = queue.shift()!
    order.push(u)
    for (const e of graph.get(u) ?? []) {
      totalCost += e.weight
      const d = (inDegree.get(e.to) ?? 0) - 1
      inDegree.set(e.to, d)
      if (d === 0) queue.push(e.to)
    }
  }

  const validDAG = order.length === graph.size
  return Object.freeze({
    algorithm: 'TOPOLOGICAL',
    visitOrder: validDAG ? order : [],
    totalCost: validDAG ? totalCost : 0,
    reached: validDAG,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// DIJKSTRA — Shortest-Path  O((|V| + |E|) log |V|)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dijkstra's shortest-path algorithm from startId to goalId.
 *
 * Requires all edge weights ≥ 0.
 * Uses a simple sorted-array priority queue (sufficient for moderate |V|).
 *
 * Complexity: O((|V| + |E|) log |V|).
 */
export function dijkstra(
  graph: AdjList,
  startId: string,
  goalId: string,
): TraversalResult {
  const dist = new Map<string, number>()
  const prev = new Map<string, string | null>()
  const pq: Array<{ id: string; cost: number }> = []

  for (const id of graph.keys()) {
    dist.set(id, Infinity)
    prev.set(id, null)
  }

  dist.set(startId, 0)
  pq.push({ id: startId, cost: 0 })

  const visitOrder: string[] = []

  while (pq.length > 0) {
    pq.sort((a, b) => a.cost - b.cost)
    const { id, cost } = pq.shift()!

    if (cost > (dist.get(id) ?? Infinity)) continue
    visitOrder.push(id)

    if (id === goalId) break

    for (const edge of graph.get(id) ?? []) {
      const next = cost + edge.weight
      if (next < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, next)
        prev.set(edge.to, id)
        pq.push({ id: edge.to, cost: next })
      }
    }
  }

  const reached = dist.get(goalId) !== Infinity
  const path: string[] = []
  if (reached) {
    let cur: string | null = goalId
    while (cur !== null) {
      path.unshift(cur)
      cur = prev.get(cur) ?? null
    }
  }

  return Object.freeze({
    algorithm: 'DIJKSTRA',
    visitOrder: path.length > 0 ? path : visitOrder,
    totalCost: dist.get(goalId) ?? Infinity,
    reached,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// A* — Minimum-Cost Heuristic Search  O((|V| + |E|) log |V|)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A* search from startId to goalId using an admissible heuristic.
 *
 * f(n) = g(n) + h(n)
 *   g(n) — actual cost from start to n
 *   h(n) — admissible heuristic estimate to goal (must never overestimate)
 *
 * When h always returns 0 this degenerates to Dijkstra.
 *
 * Complexity: O((|V| + |E|) log |V|).
 */
export function aStar(
  graph: AdjList,
  startId: string,
  goalId: string,
  heuristic: (id: string, goal: string) => number = () => 0,
): TraversalResult {
  const gScore = new Map<string, number>()
  const prev = new Map<string, string | null>()
  const open: Array<{ id: string; f: number }> = []

  for (const id of graph.keys()) {
    gScore.set(id, Infinity)
    prev.set(id, null)
  }

  gScore.set(startId, 0)
  open.push({ id: startId, f: heuristic(startId, goalId) })

  const visitOrder: string[] = []
  const closed = new Set<string>()

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f)
    const { id } = open.shift()!

    if (closed.has(id)) continue
    closed.add(id)
    visitOrder.push(id)

    if (id === goalId) break

    for (const edge of graph.get(id) ?? []) {
      const tentative = (gScore.get(id) ?? Infinity) + edge.weight
      if (tentative < (gScore.get(edge.to) ?? Infinity)) {
        gScore.set(edge.to, tentative)
        prev.set(edge.to, id)
        open.push({ id: edge.to, f: tentative + heuristic(edge.to, goalId) })
      }
    }
  }

  const reached = (gScore.get(goalId) ?? Infinity) < Infinity
  const path: string[] = []
  if (reached) {
    let cur: string | null = goalId
    while (cur !== null) {
      path.unshift(cur)
      cur = prev.get(cur) ?? null
    }
  }

  return Object.freeze({
    algorithm: 'ASTAR',
    visitOrder: path.length > 0 ? path : visitOrder,
    totalCost: gScore.get(goalId) ?? Infinity,
    reached,
  })
}
