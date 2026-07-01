/**
 * Tests for the Autonomous Code Generation Engine (ACGE-Ω) — Phase 3 Engineering
 * Covers: generateFunction, generateClass, synthesizeCode, refineCode
 */

import {
  AutonomousCodeGenerationEngine,
  ACGE,
} from '../../engineering/codegen/code-generation-engine'

beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}))
afterAll(() => jest.restoreAllMocks())

describe('AutonomousCodeGenerationEngine', () => {
  let acge: AutonomousCodeGenerationEngine

  beforeEach(() => {
    acge = new AutonomousCodeGenerationEngine()
  })

  it('generateFunction() returns a string containing "function"', async () => {
    const code = await acge.generateFunction('multiply two numbers')
    expect(typeof code).toBe('string')
    expect(code).toContain('function')
  })

  it('generateFunction() embeds the specification in a comment', async () => {
    const spec = 'add two numbers'
    const code = await acge.generateFunction(spec)
    expect(code).toContain(spec)
  })

  it('generateClass() includes the class name', async () => {
    const code = await acge.generateClass('Vehicle', ['make', 'model'])
    expect(code).toContain('Vehicle')
    expect(code).toContain('class')
  })

  it('generateClass() includes all provided properties', async () => {
    const props = ['color', 'size', 'weight']
    const code = await acge.generateClass('Box', props)
    for (const prop of props) {
      expect(code).toContain(prop)
    }
  })

  it('synthesizeCode() returns a non-empty string', async () => {
    const code = await acge.synthesizeCode('create an HTTP server')
    expect(typeof code).toBe('string')
    expect(code.length).toBeGreaterThan(0)
  })

  it('refineCode() preserves original code and appends a Refined marker', async () => {
    const original = 'function foo() {}'
    const refined = await acge.refineCode(original, 'add error handling')
    expect(refined).toContain(original)
    expect(refined).toContain('Refined')
  })

  it('ACGE is alias for AutonomousCodeGenerationEngine', () => {
    expect(new ACGE()).toBeInstanceOf(AutonomousCodeGenerationEngine)
  })
})
