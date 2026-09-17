/**
 * Tests for the Autonomous Debugging Engine (ADE-Ω) — Phase 3 Engineering
 * Covers: debug() static analysis, setBreakpoint, addWatchExpression
 */

import { AutonomousDebuggingEngine, ADE } from '../../engineering/debugging/debugger'

beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}))
afterAll(() => jest.restoreAllMocks())

describe('AutonomousDebuggingEngine', () => {
  let ade: AutonomousDebuggingEngine

  beforeEach(() => {
    ade = new AutonomousDebuggingEngine()
  })

  it('debug() on clean code returns success:true with no issues', async () => {
    const result = await ade.debug('function foo() { return 42; }', [])
    expect(result.success).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('debug() detects "var" and returns a warning', async () => {
    const result = await ade.debug('var x = 1;', [])
    const types = result.issues.map(i => i.type)
    expect(types).toContain('warning')
  })

  it('debug() detects "==" and returns a warning about "==="', async () => {
    const result = await ade.debug('if (x == 1) {}', [])
    const messages = result.issues.map(i => i.message)
    expect(messages.some(m => m.includes('==='))).toBe(true)
  })

  it('debug() detects "eval" and returns an error', async () => {
    const result = await ade.debug('eval("code")', [])
    const types = result.issues.map(i => i.type)
    expect(types).toContain('error')
  })

  it('debug() sets success:false when any issue is found', async () => {
    const result = await ade.debug('var x = eval("")', [])
    expect(result.success).toBe(false)
  })

  it('debug() generates a "Fix:" suggestion for each issue', async () => {
    const result = await ade.debug('var x = 1; if (x == 2) {}', [])
    expect(result.suggestions.length).toBeGreaterThan(0)
    expect(result.suggestions.every(s => s.startsWith('Fix:'))).toBe(true)
  })

  it('debug() always returns stackTrace (array) and variables (object)', async () => {
    const result = await ade.debug('const x = 1;', [])
    expect(Array.isArray(result.stackTrace)).toBe(true)
    expect(typeof result.variables).toBe('object')
  })

  it('setBreakpoint() does not throw', () => {
    expect(() => ade.setBreakpoint('app.ts', 42)).not.toThrow()
  })

  it('addWatchExpression() does not throw', () => {
    expect(() => ade.addWatchExpression('this.count')).not.toThrow()
  })

  it('ADE is alias for AutonomousDebuggingEngine', () => {
    expect(new ADE()).toBeInstanceOf(AutonomousDebuggingEngine)
  })
})
