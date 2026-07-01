/**
 * Tests for the Automated Refactoring Engine (ARE-Ω) — Phase 3 Engineering
 * Covers: suggestRefactorings, applyAllRefactorings, getMetrics
 */

import {
  AutomatedRefactoringEngine,
  ARE,
} from '../../engineering/refactoring/refactoring-engine'

beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}))
afterAll(() => jest.restoreAllMocks())

describe('AutomatedRefactoringEngine', () => {
  let are: AutomatedRefactoringEngine

  beforeEach(() => {
    are = new AutomatedRefactoringEngine()
  })

  it('suggestRefactorings() returns an array', async () => {
    const suggestions = await are.suggestRefactorings('function foo() {}')
    expect(Array.isArray(suggestions)).toBe(true)
  })

  it('suggestRefactorings() suggests "Extract Method" for high-complexity code', async () => {
    // 10 if-branches → complexity > 0.7
    const complex = Array(10).fill('if (x) {}').join('\n')
    const suggestions = await are.suggestRefactorings(complex)
    const rules = suggestions.map(s => s.rule)
    expect(rules).toContain('Extract Method')
  })

  it('suggestRefactorings() suggests removing duplication when "duplicate" appears', async () => {
    const suggestions = await are.suggestRefactorings('// duplicate code here')
    const rules = suggestions.map(s => s.rule)
    expect(rules).toContain('Remove Code Duplication')
  })

  it('applyAllRefactorings() replaces "var " with "let "', async () => {
    const result = await are.applyAllRefactorings('var x = 1; var y = 2;')
    expect(result.code).not.toContain('var ')
    expect(result.code).toContain('let ')
    expect(result.appliedRefactorings).toContain('Replace var with let')
  })

  it('applyAllRefactorings() replaces " == " with " === "', async () => {
    const result = await are.applyAllRefactorings('if (a == b) {}')
    expect(result.code).toContain('===')
    expect(result.appliedRefactorings).toContain('Replace == with ===')
  })

  it('applyAllRefactorings() returns a positive estimatedImprovement', async () => {
    const result = await are.applyAllRefactorings('const x = 1;')
    expect(result.estimatedImprovement).toBeGreaterThan(0)
  })

  it('getMetrics() returns complexity, linesOfCode, and maintainability', () => {
    const code = 'if (a) {}\nfor (;;) {}\nconst x = 1;'
    const metrics = are.getMetrics(code)
    expect(metrics).toHaveProperty('complexity')
    expect(metrics).toHaveProperty('linesOfCode')
    expect(metrics).toHaveProperty('maintainability')
  })

  it('getMetrics() linesOfCode matches newline count', () => {
    const code = 'line1\nline2\nline3'
    expect(are.getMetrics(code).linesOfCode).toBe(3)
  })

  it('getMetrics() complexity grows with more branching keywords', () => {
    const simple = 'const x = 1;'
    const complex = 'if(a){} if(b){} for(;;){} while(true){} if(c){}'
    expect(are.getMetrics(complex).complexity).toBeGreaterThan(
      are.getMetrics(simple).complexity
    )
  })

  it('ARE is alias for AutomatedRefactoringEngine', () => {
    expect(new ARE()).toBeInstanceOf(AutomatedRefactoringEngine)
  })
})
