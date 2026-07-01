/**
 * Tests for the Automated Test Engine (ATE-Ω) — Phase 3 Engineering
 * Covers: generateTests, runTests, generateCoverageReport, getResults
 */

import { AutomatedTestEngine, ATE } from '../../engineering/testing/test-engine'

beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}))
afterAll(() => jest.restoreAllMocks())

describe('AutomatedTestEngine', () => {
  let ate: AutomatedTestEngine

  beforeEach(() => {
    ate = new AutomatedTestEngine()
  })

  it('generateTests() returns a suite with the given name and 3 tests', async () => {
    const suite = await ate.generateTests('function foo() {}', { name: 'foo-tests' })
    expect(suite.name).toBe('foo-tests')
    expect(suite.tests).toHaveLength(3)
  })

  it('runTests() passes all 3 generated tests', async () => {
    const suite = await ate.generateTests('code', { name: 's1' })
    const result = await ate.runTests(suite)
    expect(result.passed).toBe(3)
    expect(result.failed).toBe(0)
    expect(result.totalTests).toBe(3)
  })

  it('runTests() result includes a coverage object', async () => {
    const suite = await ate.generateTests('code', { name: 's2' })
    const result = await ate.runTests(suite)
    expect(result.coverage).toHaveProperty('lineCoverage')
  })

  it('getResults() accumulates results across multiple runs', async () => {
    const suite = await ate.generateTests('code', { name: 's3' })
    await ate.runTests(suite)
    await ate.runTests(suite)
    expect(ate.getResults().length).toBe(2)
  })

  it('generateCoverageReport() returns all three coverage types', async () => {
    const report = await ate.generateCoverageReport()
    expect(report).toHaveProperty('lineCoverage')
    expect(report).toHaveProperty('branchCoverage')
    expect(report).toHaveProperty('functionCoverage')
  })

  it('ATE is alias for AutomatedTestEngine', () => {
    expect(new ATE()).toBeInstanceOf(AutomatedTestEngine)
  })
}, 15_000)
