/**
 * Tests for the Advanced Reasoning System (ARS-Ω) — Phase 2 Intelligence
 * Covers: addFact, addRule, reason(), query(), getInferenceChain()
 */

import { AdvancedReasoningSystem, ARS } from '../../intelligence/reasoning/reasoning-system'

beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}))
afterAll(() => jest.restoreAllMocks())

describe('AdvancedReasoningSystem', () => {
  let ars: AdvancedReasoningSystem

  beforeEach(() => {
    ars = new AdvancedReasoningSystem()
  })

  it('query() returns false for unknown fact', () => {
    expect(ars.query('nonexistent')).toBe(false)
  })

  it('addFact() makes query() return true', () => {
    ars.addFact('sunny', true)
    expect(ars.query('sunny')).toBe(true)
  })

  it('reason() fires rule when all antecedents are satisfied', async () => {
    ars.addFact('raining', true)
    ars.addRule(['raining'], 'wet')
    await ars.reason()
    expect(ars.query('wet')).toBe(true)
  })

  it('reason() does NOT fire rule when any antecedent is missing', async () => {
    ars.addRule(['hot', 'dry'], 'drought')
    ars.addFact('hot', true)   // 'dry' is absent
    await ars.reason()
    expect(ars.query('drought')).toBe(false)
  })

  it('reason() reports newFacts and totalFacts', async () => {
    ars.addFact('cold', true)
    ars.addRule(['cold'], 'frost')
    const result = await ars.reason()
    expect(result.newFacts).toBe(1)
    expect(result.totalFacts).toBeGreaterThanOrEqual(2)
    expect(result.inferences).toBeGreaterThanOrEqual(1)
  })

  it('reason() does not derive the same fact twice', async () => {
    ars.addFact('x', true)
    ars.addRule(['x'], 'y')
    const first = await ars.reason()
    const second = await ars.reason()
    expect(first.newFacts).toBe(1)
    expect(second.newFacts).toBe(0)
  })

  it('getInferenceChain() returns entries for a derived fact', async () => {
    ars.addFact('a', true)
    ars.addRule(['a'], 'b')
    await ars.reason()
    const chain = ars.getInferenceChain('b')
    expect(chain.length).toBeGreaterThan(0)
  })

  it('getInferenceChain() returns empty array for a non-derived fact', async () => {
    ars.addFact('standalone', true)
    await ars.reason()
    expect(ars.getInferenceChain('standalone')).toEqual([])
  })

  it('ARS is alias for AdvancedReasoningSystem', () => {
    expect(new ARS()).toBeInstanceOf(AdvancedReasoningSystem)
  })
})
