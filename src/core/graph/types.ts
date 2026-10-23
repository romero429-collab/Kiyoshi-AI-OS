/**
 * KIYOSHI AI OPERATING SYSTEM
 * Volume I — Mathematical Foundations
 * Chapter 4: Graph Theory of Computation
 *
 * Core type definitions for the system graph G = (V, E).
 *
 * §4.1  System Graph       G = (V, E)
 * §4.2  Module Definition  M = (ID, S, I, O, T, D)
 * §4.3  Edge Definition    e(u, v) with type, weight, priority, direction
 */

// ─────────────────────────────────────────────────────────────────────────────
// VERTEX  (§4.1 / §4.2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every module is exactly one vertex in G.
 * No anonymous modules are permitted (§4.1).
 *
 * Corresponds to M = (ID, S, I, O, T, D) from §4.2.
 */
export interface Vertex {
  /** ID — unique identifier; no two vertices share an id. */
  readonly id: string
  /** Human-readable label. */
  readonly label: string
  /** Semantic version (satisfies Invariant 5: every interface is versioned). */
  readonly version: string
  /** D — dependency set: ids of vertices this vertex depends upon. */
  readonly dependencies: ReadonlyArray<string>
  /** Optional metadata (module kind, description, etc.). */
  readonly metadata: Readonly<Record<string, unknown>>
}

// ─────────────────────────────────────────────────────────────────────────────
// EDGE TYPE  (§4.3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every edge possesses a declared type (§4.3).
 *
 * Event         — runtime event delivery
 * Dependency    — implementation dependency (must form a DAG)
 * Resource      — shared resource claim
 * Control       — control-flow signal
 * Synchronization — barrier / rendezvous
 * Ownership     — ownership / lifecycle responsibility
 * Visibility    — read-only observation
 */
export type EdgeType =
  | 'EVENT'
  | 'DEPENDENCY'
  | 'RESOURCE'
  | 'CONTROL'
  | 'SYNCHRONIZATION'
  | 'OWNERSHIP'
  | 'VISIBILITY'

// ─────────────────────────────────────────────────────────────────────────────
// EDGE  (§4.3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A directed, labeled edge e(u, v) in G.
 *
 * Every edge possesses Weight, Priority, Direction,
 * Verification Status, and Version (§4.3).
 */
export interface Edge {
  /** Source vertex id — the module that initiates the relationship. */
  readonly from: string
  /** Target vertex id — the module that receives the relationship. */
  readonly to: string
  /** Declared type of the relationship (§4.3). */
  readonly type: EdgeType
  /** Non-negative cost / latency weight. Lower is cheaper. */
  readonly weight: number
  /** Scheduling priority (mirrors EventPriority for EVENT edges). */
  readonly priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW'
  /** Whether the edge has passed architectural verification. */
  readonly verified: boolean
  /** Semantic version of the interface contract on this edge. */
  readonly version: string
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATION SUBGRAPH  (§4.6)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A = (VA, EA) — induced subgraph representing one application.
 *
 * VA ⊆ V and EA ⊆ E (§4.6).
 */
export interface ApplicationGraph {
  readonly applicationId: string
  readonly vertexIds: ReadonlyArray<string>
  readonly edges: ReadonlyArray<Edge>
}

// ─────────────────────────────────────────────────────────────────────────────
// GRAPH METRICS RESULT  (§4.10)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Metrics computed over G on every build (§4.10).
 */
export interface GraphMetrics {
  readonly vertexCount: number
  readonly edgeCount: number
  readonly averageDegree: number
  readonly maximumDepth: number
  readonly dependencyDiameter: number
  readonly stronglyConnectedComponentCount: number
  readonly cyclomaticDependency: number
  readonly averageTraversalCost: number
  readonly architecturalEntropy: number
}

// ─────────────────────────────────────────────────────────────────────────────
// CENTRALITY RESULT  (§4.11)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Centrality scores for one vertex (§4.11).
 */
export interface CentralityScores {
  readonly vertexId: string
  /** |N(v)| / (|V| - 1) */
  readonly degree: number
  /** Fraction of shortest paths passing through this vertex. */
  readonly betweenness: number
  /** Reciprocal of the average shortest path length from this vertex. */
  readonly closeness: number
  /** Influence derived from neighbour centrality (power-iteration). */
  readonly eigenvector: number
  /** True when any centrality dimension exceeds the review threshold. */
  readonly exceedsThreshold: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURAL HEALTH  (§4.12)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * H(G) — Architectural health score in [0, 1].
 *
 * Composed of: coupling, cohesion, depth, complexity, cycle count,
 * average path length, documentation coverage, verification success (§4.12).
 *
 * Objective: maximise H(G).
 */
export interface ArchitecturalHealth {
  /** Coupling penalty — lower coupling raises H. */
  readonly coupling: number
  /** Cohesion reward — higher cohesion raises H. */
  readonly cohesion: number
  /** Depth penalty — shallower graphs raise H. */
  readonly depth: number
  /** Complexity penalty. */
  readonly complexity: number
  /** Number of dependency cycles (must be 0 for a valid DAG). */
  readonly cycleCount: number
  /** Average shortest path length across all reachable pairs. */
  readonly averagePathLength: number
  /** Fraction [0, 1] of vertices that carry documentation metadata. */
  readonly documentationCoverage: number
  /** Fraction [0, 1] of vertices whose verify() returned PASS. */
  readonly verificationSuccess: number
  /** Aggregate H(G) in [0, 1].  Maximise this value. */
  readonly score: number
}

// ─────────────────────────────────────────────────────────────────────────────
// TRAVERSAL  (§4.8)
// ─────────────────────────────────────────────────────────────────────────────

/** Result of a graph traversal. */
export interface TraversalResult {
  readonly algorithm: 'BFS' | 'DFS' | 'TOPOLOGICAL' | 'DIJKSTRA' | 'ASTAR'
  /** Ordered list of vertex ids visited during the traversal. */
  readonly visitOrder: ReadonlyArray<string>
  /** Total accumulated edge weight along the result path. */
  readonly totalCost: number
  /** Whether the traversal reached the intended goal. */
  readonly reached: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE DISCOVERY REPORT  (§4.9)
// ─────────────────────────────────────────────────────────────────────────────

export type DiscoveryStatus = 'ACCEPTED' | 'REJECTED'

/** Result of attempting to register a new vertex into G (§4.9). */
export interface DiscoveryReport {
  readonly vertexId: string
  readonly status: DiscoveryStatus
  /** Failure reason when status is REJECTED. */
  readonly reason?: string
  readonly timestamp: number
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE VERTEX / EDGE  (§4.7)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vertex kinds in the Knowledge Graph GK (§4.7).
 */
export type KnowledgeVertexKind =
  | 'CONCEPT'
  | 'OBJECT'
  | 'USER'
  | 'COMMAND'
  | 'FUNCTION'
  | 'FILE'
  | 'RELATIONSHIP'

/**
 * A vertex in GK = (VK, EK) (§4.7).
 */
export interface KnowledgeVertex {
  readonly id: string
  readonly kind: KnowledgeVertexKind
  readonly label: string
  readonly metadata: Readonly<Record<string, unknown>>
}

/**
 * Semantic relationship labels for edges in GK (§4.7).
 */
export type KnowledgeRelation =
  | 'DEPENDS_ON'
  | 'CONTAINS'
  | 'CREATES'
  | 'REQUIRES'
  | 'EXPLAINS'
  | 'CALCULATES'
  | 'REFERENCES'
  | 'EXTENDS'

/** A directed edge in GK. */
export interface KnowledgeEdge {
  readonly from: string
  readonly to: string
  readonly relation: KnowledgeRelation
  /** Confidence in [0, 1] of the asserted relationship. */
  readonly confidence: number
}

// ─────────────────────────────────────────────────────────────────────────────
// AI REASONING RESULT  (§4.13)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every AI reasoning operation returns this structure (§4.13).
 *
 * The AI never guesses.  Instead it traverses Knowledge, Evidence,
 * Constraints, Confidence, and Explanation.
 */
export interface ReasoningResult {
  /** Answer or resolved vertex id. */
  readonly result: string
  /** Confidence in [0, 1]. */
  readonly confidence: number
  /** Ordered sequence of vertex ids that constitute the supporting path. */
  readonly supportingPath: ReadonlyArray<string>
  /** Human-readable explanation of the traversal. */
  readonly explanation: string
  /** Alternative results with their confidence scores. */
  readonly alternatives: ReadonlyArray<{ result: string; confidence: number }>
}
