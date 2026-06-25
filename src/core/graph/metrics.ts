/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 4: Graph Theory of Computation — §4.10, §4.11, §4.12
 *
 * §4.10 Graph Metrics — computed over G on every build.
 * §4.11 Centrality    — degree, betweenness, closeness, eigenvector.
 * §4.12 Architectural Health — H(G) = f(coupling, cohesion, depth, …).
 *
 * Objective: maximise H(G).
 *
 * Complexity:
 *   computeMetrics    O(|V|² + |V||E|) — BFS from every vertex for diameter
 *   computeCentrality O(|V|² + |V||E|) — BFS-based betweenness + closeness
 *   computeHealth     O(|V| + |E|)
 */

import { SystemGraph } from './system-graph'
import { DependencyGraph } from './dependency-graph'
import { GraphMetrics, CentralityScores, ArchitecturalHealth } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// GRAPH METRICS  (§4.10)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute all §4.10 metrics for the given SystemGraph G and its
 * companion DependencyGraph GD.
 *
 * Metrics:
 *   vertexCount                  |V|
 *   edgeCount                    |E|
 *   averageDegree                |E| / |V|
 *   maximumDepth                 longest path in GD (DAG)
 *   dependencyDiameter           maximum shortest path length in GD
 *   stronglyConnectedComponents  count of SCCs in G (via Kosaraju)
 *   cyclomaticDependency         |E| - |V| + 2P  (McCabe, P=1)
 *   averageTraversalCost         average edge weight in G
 *   architecturalEntropy         Shannon entropy of out-degree distribution
 *
 * Complexity: O(|V|² + |V||E|).
 */
export function computeMetrics(g: SystemGraph, gd: DependencyGraph): GraphMetrics {
  const V = g.vertexCount
  const E = g.edgeCount
  const edges = g.getAllEdges()

  const averageDegree = V > 0 ? E / V : 0

  // ── Average traversal cost ───────────────────────────────────────────────
  const averageTraversalCost = E > 0
    ? edges.reduce((s, e) => s + e.weight, 0) / E
    : 0

  // ── Cyclomatic dependency  |E| - |V| + 2  (§4.10) ───────────────────────
  const cyclomaticDependency = Math.max(0, gd.edgeCount - gd.vertexCount + 2)

  // ── Maximum depth & diameter in GD via BFS from every vertex ─────────────
  const vertices = gd.getVertexIds()
  let maximumDepth = 0
  let dependencyDiameter = 0

  for (const src of vertices) {
    const dist = bfsDistances(src, gd)
    for (const d of dist.values()) {
      if (d > maximumDepth) maximumDepth = d
      if (d > dependencyDiameter) dependencyDiameter = d
    }
  }

  // ── SCCs in G (Kosaraju, §4.10 "Strongly Connected Components") ──────────
  const stronglyConnectedComponentCount = countSCCs(g)

  // ── Architectural entropy — Shannon H of out-degree distribution ──────────
  const architecturalEntropy = shannonEntropy(g)

  return Object.freeze({
    vertexCount: V,
    edgeCount: E,
    averageDegree,
    maximumDepth,
    dependencyDiameter,
    stronglyConnectedComponentCount,
    cyclomaticDependency,
    averageTraversalCost,
    architecturalEntropy,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// CENTRALITY  (§4.11)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Threshold above which a vertex is flagged for excessive responsibility
 * review (§4.11).
 */
export const CENTRALITY_REVIEW_THRESHOLD = 0.5

/**
 * Compute all four centrality measures for every vertex in G (§4.11):
 *   Degree Centrality      = |N(v)| / (|V| - 1)
 *   Betweenness Centrality = fraction of all-pairs shortest paths through v
 *   Closeness Centrality   = (|V| - 1) / Σ d(v, u)   for reachable u
 *   Eigenvector Centrality = power iteration (20 rounds)
 *
 * Complexity: O(|V|² + |V||E|).
 */
export function computeCentrality(g: SystemGraph): ReadonlyArray<CentralityScores> {
  const vertices = g.getAllVertices()
  const n = vertices.length
  if (n === 0) return []

  const ids = vertices.map(v => v.id)

  // ── Degree centrality ────────────────────────────────────────────────────
  const outDeg = new Map<string, number>()
  for (const v of ids) outDeg.set(v, 0)
  for (const e of g.getAllEdges()) outDeg.set(e.from, (outDeg.get(e.from) ?? 0) + 1)

  const degreeCentrality = new Map<string, number>()
  const denom = Math.max(1, n - 1)
  for (const [id, deg] of outDeg.entries()) degreeCentrality.set(id, deg / denom)

  // ── BFS-based betweenness & closeness ────────────────────────────────────
  const betweenness = new Map<string, number>(ids.map(id => [id, 0]))
  const closeness   = new Map<string, number>(ids.map(id => [id, 0]))

  for (const src of ids) {
    const { dist, pathCounts, deps } = bfsExtended(src, g, ids)

    // Closeness: (|V| - 1) / sum of distances
    const sumDist = Array.from(dist.values()).filter(d => d < Infinity).reduce((s, d) => s + d, 0)
    const reachable = Array.from(dist.values()).filter(d => d < Infinity && d > 0).length
    closeness.set(src, reachable > 0 && sumDist > 0 ? reachable / sumDist : 0)

    // Betweenness contribution
    const delta = new Map<string, number>(ids.map(id => [id, 0]))
    const stack = [...deps].reverse() // process in reverse BFS order (approximate)
    for (const w of stack) {
      for (const v of (getPredecessors(w, src, dist, g))) {
        const c = (pathCounts.get(v) ?? 0) / (pathCounts.get(w) ?? 1)
        delta.set(v, (delta.get(v) ?? 0) + c * (1 + (delta.get(w) ?? 0)))
      }
      if (w !== src) {
        betweenness.set(w, (betweenness.get(w) ?? 0) + (delta.get(w) ?? 0))
      }
    }
  }

  // Normalise betweenness by (|V|-1)(|V|-2)
  const bNorm = Math.max(1, (n - 1) * (n - 2))
  for (const [id, val] of betweenness.entries()) betweenness.set(id, val / bNorm)

  // ── Eigenvector centrality — 20-round power iteration ────────────────────
  const eigen = powerIteration(g, ids, 20)

  // ── Assemble results ──────────────────────────────────────────────────────
  return ids.map(id => {
    const degree     = degreeCentrality.get(id) ?? 0
    const between    = betweenness.get(id) ?? 0
    const close      = closeness.get(id) ?? 0
    const eigenScore = eigen.get(id) ?? 0
    const exceedsThreshold =
      degree > CENTRALITY_REVIEW_THRESHOLD ||
      between > CENTRALITY_REVIEW_THRESHOLD ||
      close > CENTRALITY_REVIEW_THRESHOLD ||
      eigenScore > CENTRALITY_REVIEW_THRESHOLD

    return Object.freeze({ vertexId: id, degree, betweenness: between, closeness: close, eigenvector: eigenScore, exceedsThreshold })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURAL HEALTH  H(G)  (§4.12)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute H(G) ∈ [0, 1] — architectural health score.
 *
 * H is a weighted composite of eight factors:
 *   coupling             (−) high avg out-degree → lower score
 *   cohesion             (+) fraction of verified edges
 *   depth                (−) normalised maximum depth
 *   complexity           (−) normalised cyclomatic dependency
 *   cycleCount           (−) DAG violations
 *   averagePathLength    (−) normalised mean shortest path
 *   documentationCoverage (+) fraction of vertices with 'doc' metadata
 *   verificationSuccess  (+) fraction of vertices with verified=true edges
 *
 * Objective: maximise H(G) (§4.12).
 *
 * Complexity: O(|V| + |E|).
 */
export function computeHealth(g: SystemGraph, gd: DependencyGraph, metrics: GraphMetrics): ArchitecturalHealth {
  const V = g.vertexCount
  const edges = g.getAllEdges()
  const E = edges.length

  // Coupling: normalised average out-degree (lower is better)
  const coupling = V > 0 ? Math.min(1, metrics.averageDegree / 10) : 0

  // Cohesion: fraction of edges that are verified
  const cohesion = E > 0 ? edges.filter(e => e.verified).length / E : 1

  // Depth: normalised maximum depth (target ≤ 5 layers)
  const depth = Math.min(1, metrics.maximumDepth / 10)

  // Complexity: normalised cyclomatic dependency (target ≤ 10)
  const complexity = Math.min(1, metrics.cyclomaticDependency / 20)

  // Cycle count in GD
  const { hasCycle, cycle } = gd.detectCycle()
  const cycleCount = hasCycle ? cycle.length : 0

  // Average path length: use dependencyDiameter as proxy
  const averagePathLength = metrics.dependencyDiameter

  // Documentation coverage: fraction of vertices with a 'doc' field in metadata
  const allVertices = g.getAllVertices()
  const documentationCoverage = V > 0
    ? allVertices.filter(v => v.metadata['doc'] !== undefined).length / V
    : 1

  // Verification success: fraction of vertices with all incident edges verified
  const verificationSuccess = V > 0
    ? allVertices.filter(v => {
        const inc = edges.filter(e => e.from === v.id)
        return inc.length === 0 || inc.every(e => e.verified)
      }).length / V
    : 1

  // Score:  reward cohesion, documentation, verification
  //         penalise coupling, depth, complexity, cycles, path length
  const score = Math.max(0, Math.min(1,
    0.20 * cohesion +
    0.15 * documentationCoverage +
    0.15 * verificationSuccess +
    0.15 * (1 - coupling) +
    0.15 * (1 - depth) +
    0.10 * (1 - complexity) +
    0.10 * (cycleCount === 0 ? 1 : 0) +
    0.05 * (averagePathLength <= 4 ? 1 : Math.max(0, 1 - (averagePathLength - 4) / 10)),
  ))

  return Object.freeze({
    coupling,
    cohesion,
    depth,
    complexity,
    cycleCount,
    averagePathLength,
    documentationCoverage,
    verificationSuccess,
    score,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** BFS returning distances from src in GD. */
function bfsDistances(src: string, gd: DependencyGraph): Map<string, number> {
  const dist = new Map<string, number>([[src, 0]])
  const queue = [src]
  while (queue.length > 0) {
    const u = queue.shift()!
    for (const v of gd.getDependencies(u)) {
      if (!dist.has(v)) {
        dist.set(v, (dist.get(u) ?? 0) + 1)
        queue.push(v)
      }
    }
  }
  return dist
}

/** Extended BFS returning dist, σ (path count), and visitation order. */
function bfsExtended(
  src: string,
  g: SystemGraph,
  _ids: string[],
): { dist: Map<string, number>; pathCounts: Map<string, number>; deps: string[] } {
  const dist = new Map<string, number>([[src, 0]])
  const pathCounts = new Map<string, number>([[src, 1]])
  const queue = [src]
  const deps: string[] = []

  while (queue.length > 0) {
    const u = queue.shift()!
    deps.push(u)
    for (const nb of g.getOutNeighbors(u)) {
      if (!dist.has(nb)) {
        dist.set(nb, (dist.get(u) ?? 0) + 1)
        pathCounts.set(nb, 0)
        queue.push(nb)
      }
      if (dist.get(nb) === (dist.get(u) ?? 0) + 1) {
        pathCounts.set(nb, (pathCounts.get(nb) ?? 0) + (pathCounts.get(u) ?? 0))
      }
    }
  }

  return { dist, pathCounts, deps }
}

/** Approximate predecessors on shortest paths from src to w. */
function getPredecessors(w: string, src: string, dist: Map<string, number>, g: SystemGraph): string[] {
  if (w === src) return []
  const dw = dist.get(w) ?? Infinity
  return g.getInNeighbors(w).filter(v => (dist.get(v) ?? Infinity) === dw - 1)
}

/** Kosaraju-based SCC count — returns the number of SCCs in G. */
function countSCCs(g: SystemGraph): number {
  const ids = g.getAllVertices().map(v => v.id)
  const visited = new Set<string>()
  const order: string[] = []

  const dfs1 = (u: string) => {
    visited.add(u)
    for (const v of g.getOutNeighbors(u)) {
      if (!visited.has(v)) dfs1(v)
    }
    order.push(u)
  }

  for (const id of ids) { if (!visited.has(id)) dfs1(id) }

  const visited2 = new Set<string>()
  let count = 0

  const dfs2 = (u: string) => {
    visited2.add(u)
    for (const v of g.getInNeighbors(u)) {
      if (!visited2.has(v)) dfs2(v)
    }
  }

  for (const id of [...order].reverse()) {
    if (!visited2.has(id)) { dfs2(id); count++ }
  }

  return count
}

/** Shannon entropy of the out-degree distribution. */
function shannonEntropy(g: SystemGraph): number {
  const ids = g.getAllVertices().map(v => v.id)
  const total = ids.length
  if (total === 0) return 0
  const freq = new Map<number, number>()
  for (const id of ids) {
    const deg = g.getOutNeighbors(id).length
    freq.set(deg, (freq.get(deg) ?? 0) + 1)
  }
  let H = 0
  for (const count of freq.values()) {
    const p = count / total
    if (p > 0) H -= p * Math.log2(p)
  }
  return H
}

/** Power iteration for eigenvector centrality (20 rounds). */
function powerIteration(g: SystemGraph, ids: string[], rounds: number): Map<string, number> {
  let scores = new Map<string, number>(ids.map(id => [id, 1 / ids.length]))

  for (let r = 0; r < rounds; r++) {
    const next = new Map<string, number>(ids.map(id => [id, 0]))
    for (const id of ids) {
      for (const nb of g.getOutNeighbors(id)) {
        next.set(nb, (next.get(nb) ?? 0) + (scores.get(id) ?? 0))
      }
    }
    // Normalise
    const norm = Math.max(1e-10, Math.sqrt(Array.from(next.values()).reduce((s, v) => s + v * v, 0)))
    for (const [id, val] of next.entries()) next.set(id, val / norm)
    scores = next
  }

  return scores
}
