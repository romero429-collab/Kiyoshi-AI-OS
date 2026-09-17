/**
 * Tests for Multi-Agent Coordination (MA-Ω) — Phase 2 Intelligence
 * Covers: delegateTask, negotiate, resolveConflict
 */

import { MultiAgentCoordination, MAO } from '../../intelligence/coordination/multi-agent-coordination'

beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}))
afterAll(() => jest.restoreAllMocks())

describe('MultiAgentCoordination', () => {
  let mac: MultiAgentCoordination

  beforeEach(() => {
    mac = new MultiAgentCoordination()
  })

  it('delegateTask() with no agents returns undefined', async () => {
    const result = await mac.delegateTask({ name: 'infer', type: 'reasoning', priority: 1 })
    expect(result).toBeUndefined()
  })

  it('negotiate() returns a boolean consensus', async () => {
    const result = await mac.negotiate({ action: 'deploy', resource: 'production' })
    expect(typeof result).toBe('boolean')
  })

  it('resolveConflict() returns a resolved result with a solution', async () => {
    const result = await mac.resolveConflict({ type: 'resource', description: 'CPU conflict' })
    expect(result).toHaveProperty('resolved', true)
    expect(result).toHaveProperty('solution')
  })

  it('MAO is alias for MultiAgentCoordination', () => {
    expect(new MAO()).toBeInstanceOf(MultiAgentCoordination)
  })
})
