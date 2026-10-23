/**
 * Tests for the Probabilistic Graphical Systems (PGS-Ω) — Phase 2 Intelligence
 * Covers: addNode, addEdge, setEvidence, inference(), getMarginalization()
 */

import { ProbabilisticGraphicalSystems, PGS } from '../../intelligence/probabilistic/probabilistic-systems'

beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}))
afterAll(() => jest.restoreAllMocks())

describe('ProbabilisticGraphicalSystems', () => {
  let pgs: ProbabilisticGraphicalSystems

  beforeEach(() => {
    pgs = new ProbabilisticGraphicalSystems()
  })

  it('inference() returns null for unknown node', async () => {
    const result = await pgs.inference('unknown')
    expect(result).toBeNull()
  })

  it('inference() returns probability in [0,1] for a known node', async () => {
    pgs.addNode('rain', { 'true': 0.4, 'false': 0.6 })
    const result = await pgs.inference('rain')
    expect(result).not.toBeNull()
    expect(result!.probability).toBeGreaterThanOrEqual(0)
    expect(result!.probability).toBeLessThanOrEqual(1)
  })

  it('inference() returns a confidence value', async () => {
    pgs.addNode('rain', { 'true': 0.4, 'false': 0.6 })
    const result = await pgs.inference('rain')
    expect(result).toHaveProperty('confidence')
  })

  it('inference() reflects evidence set via setEvidence()', async () => {
    pgs.addNode('rain', { 'true': 0.4, 'false': 0.6 })
    pgs.setEvidence('rain', 'true')
    const result = await pgs.inference('rain')
    expect(result!.probability).toBeCloseTo(0.4, 5)
  })

  it('getMarginalization() returns 0 for an unknown node', () => {
    expect(pgs.getMarginalization('ghost')).toBe(0)
  })

  it('getMarginalization() returns the average of all prior values', () => {
    pgs.addNode('weather', { sun: 0.5, cloud: 0.3, rain: 0.2 })
    const m = pgs.getMarginalization('weather')
    expect(m).toBeCloseTo((0.5 + 0.3 + 0.2) / 3, 5)
  })

  it('addEdge() connects parent → child without throwing', () => {
    pgs.addNode('cloudy', { 'true': 0.6, 'false': 0.4 })
    pgs.addNode('rain', { 'true': 0.4, 'false': 0.6 })
    expect(() =>
      pgs.addEdge('cloudy', 'rain', { 'true': 0.8, 'false': 0.2 })
    ).not.toThrow()
  })

  it('PGS is alias for ProbabilisticGraphicalSystems', () => {
    expect(new PGS()).toBeInstanceOf(ProbabilisticGraphicalSystems)
  })
})
