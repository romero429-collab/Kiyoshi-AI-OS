/**
 * Tests for the Knowledge Graph System (KGS-Ω) — Phase 2 Intelligence
 * Covers: addEntity, addRelation, query, reasoning, getStatistics
 */

import { KnowledgeGraphSystem, KGS } from '../../intelligence/knowledge/knowledge-graph'

beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}))
afterAll(() => jest.restoreAllMocks())

describe('KnowledgeGraphSystem', () => {
  let kgs: KnowledgeGraphSystem

  beforeEach(() => {
    kgs = new KnowledgeGraphSystem()
  })

  it('getStatistics() starts at zero nodes and edges', () => {
    const stats = kgs.getStatistics()
    expect(stats.nodes).toBe(0)
    expect(stats.edges).toBe(0)
    expect(stats.semanticTerms).toBe(0)
  })

  it('addEntity() increments node count', () => {
    kgs.addEntity('n1', 'machine learning')
    expect(kgs.getStatistics().nodes).toBe(1)
  })

  it('addEntity() for multiple entities counts all', () => {
    kgs.addEntity('n1', 'deep learning')
    kgs.addEntity('n2', 'neural network')
    expect(kgs.getStatistics().nodes).toBe(2)
  })

  it('query() by keyword returns matching entities', () => {
    kgs.addEntity('n1', 'neural network')
    const results = kgs.query('neural')
    expect(results.length).toBeGreaterThan(0)
  })

  it('query() returns empty array for unknown keyword', () => {
    const results = kgs.query('xyzzy-not-found')
    expect(results).toEqual([])
  })

  it('addRelation() increments edge count', () => {
    kgs.addEntity('a', 'alpha')
    kgs.addEntity('b', 'beta')
    kgs.addRelation('a', 'b', 'related-to')
    expect(kgs.getStatistics().edges).toBe(1)
  })

  it('reasoning() returns structured result with query, results, and inferences', async () => {
    kgs.addEntity('t1', 'deep learning')
    const result = await kgs.reasoning('deep')
    expect(result).toHaveProperty('query', 'deep')
    expect(result).toHaveProperty('results')
    expect(result).toHaveProperty('inferences')
    expect(Array.isArray(result.inferences)).toBe(true)
  })

  it('KGS is alias for KnowledgeGraphSystem', () => {
    expect(new KGS()).toBeInstanceOf(KnowledgeGraphSystem)
  })
})
