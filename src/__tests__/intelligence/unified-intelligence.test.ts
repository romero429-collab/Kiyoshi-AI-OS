/**
 * Tests for the Unified Intelligence Architecture (UIA-Ω) — Phase 2 Intelligence
 * Covers: CognitiveAgent, UnifiedIntelligenceArchitecture, agent pool, processInformation,
 *         coordinateAgents, getStatus
 */

import {
  UnifiedIntelligenceArchitecture,
  CognitiveAgent,
  UIA,
} from '../../intelligence/core/unified-intelligence'

beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}))
afterAll(() => jest.restoreAllMocks())

// ─────────────────────────────────────────────────────────────────────────────
// CognitiveAgent (concrete class in unified-intelligence)
// ─────────────────────────────────────────────────────────────────────────────

describe('CognitiveAgent', () => {
  let agent: CognitiveAgent

  beforeEach(() => {
    agent = new CognitiveAgent('Agent-1', 'researcher', 'analysis')
  })

  it('name, type, and role are set correctly', () => {
    expect(agent.name).toBe('Agent-1')
    expect(agent.type).toBe('researcher')
    expect(agent.role).toBe('analysis')
  })

  it('execute() returns completion result with agent name', async () => {
    const result = await agent.execute('analyze data')
    expect(result).toHaveProperty('agent', 'Agent-1')
    expect(result).toHaveProperty('status', 'completed')
    expect(result).toHaveProperty('task', 'analyze data')
  })

  it('perceive() returns sensory data', async () => {
    const result = await agent.perceive()
    expect(result).toHaveProperty('sensory')
  })

  it('deliberate() returns a decision', async () => {
    const result = await agent.deliberate()
    expect(result).toHaveProperty('decision')
  })

  it('act() returns an execution result', async () => {
    const result = await agent.act()
    expect(result).toHaveProperty('result')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// UnifiedIntelligenceArchitecture
// ─────────────────────────────────────────────────────────────────────────────

describe('UnifiedIntelligenceArchitecture', () => {
  let uia: UnifiedIntelligenceArchitecture

  beforeEach(() => {
    uia = new UnifiedIntelligenceArchitecture()
  })

  it('getStatus() reports zero agents on construction', () => {
    expect(uia.getStatus().activeAgents).toBe(0)
  })

  it('createAgent() adds agent to the pool', async () => {
    await uia.createAgent('Bot1', 'analysis', 'data-processing')
    expect(uia.getStatus().activeAgents).toBe(1)
  })

  it('createAgent() accumulates multiple agents', async () => {
    await uia.createAgent('A', 'worker', 'compute')
    await uia.createAgent('B', 'worker', 'compute')
    expect(uia.getStatus().activeAgents).toBe(2)
  })

  it('processInformation() returns perception, reasoning, and emotion', async () => {
    const result = await uia.processInformation('test input')
    expect(result).toHaveProperty('perception')
    expect(result).toHaveProperty('reasoning')
    expect(result).toHaveProperty('emotion')
  })

  it('processInformation() increments memories', async () => {
    await uia.processInformation('first input')
    const status = uia.getStatus()
    expect(status.memories).toBeGreaterThan(0)
  })

  it('coordinateAgents() with empty pool reports agentsInvolved: 0', async () => {
    const result = await uia.coordinateAgents('test task')
    expect(result.agentsInvolved).toBe(0)
  })

  it('coordinateAgents() dispatches to all pooled agents', async () => {
    await uia.createAgent('A', 'worker', 'compute')
    await uia.createAgent('B', 'worker', 'compute')
    const result = await uia.coordinateAgents('run job')
    expect(result.agentsInvolved).toBe(2)
  })

  it('UIA is alias for UnifiedIntelligenceArchitecture', () => {
    expect(new UIA()).toBeInstanceOf(UnifiedIntelligenceArchitecture)
  })
})
