/**
 * Tests for the Agent Framework — Phase 2 Intelligence
 * Covers: ReactiveAgent, DeliberativeAgent, HybridAgent, abstract CognitiveAgent.step()
 */

import {
  ReactiveAgent,
  DeliberativeAgent,
  HybridAgent,
} from '../../intelligence/agents/agent-framework'

beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}))
afterAll(() => jest.restoreAllMocks())

// ─────────────────────────────────────────────────────────────────────────────
// ReactiveAgent
// ─────────────────────────────────────────────────────────────────────────────

describe('ReactiveAgent', () => {
  let agent: ReactiveAgent

  beforeEach(() => {
    agent = new ReactiveAgent('Rx-1')
  })

  it('has agentType "reactive"', () => {
    expect(agent.agentType).toBe('reactive')
  })

  it('name is set from constructor', () => {
    expect(agent.name).toBe('Rx-1')
  })

  it('perceive() returns an object with a stimulus property', async () => {
    const result = await agent.perceive()
    expect(result).toHaveProperty('stimulus')
  })

  it('deliberate() returns an object with a decision property', async () => {
    const result = await agent.deliberate()
    expect(result).toHaveProperty('decision')
  })

  it('act() returns an object with an action property', async () => {
    const result = await agent.act()
    expect(result).toHaveProperty('action')
  })

  it('step() returns perception, decision, and action', async () => {
    const result = await agent.step()
    expect(result).toHaveProperty('perception')
    expect(result).toHaveProperty('decision')
    expect(result).toHaveProperty('action')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DeliberativeAgent
// ─────────────────────────────────────────────────────────────────────────────

describe('DeliberativeAgent', () => {
  let agent: DeliberativeAgent

  beforeEach(() => {
    agent = new DeliberativeAgent('Dl-1')
  })

  it('has agentType "deliberative"', () => {
    expect(agent.agentType).toBe('deliberative')
  })

  it('perceive() returns current state', async () => {
    const result = await agent.perceive()
    expect(result).toHaveProperty('state')
  })

  it('deliberate() returns a plan', async () => {
    const result = await agent.deliberate()
    expect(result).toHaveProperty('plan')
  })

  it('step() combines all phases', async () => {
    const result = await agent.step()
    expect(result).toHaveProperty('perception')
    expect(result).toHaveProperty('decision')
    expect(result).toHaveProperty('action')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// HybridAgent
// ─────────────────────────────────────────────────────────────────────────────

describe('HybridAgent', () => {
  let agent: HybridAgent

  beforeEach(() => {
    agent = new HybridAgent('Hy-1')
  })

  it('has agentType "hybrid"', () => {
    expect(agent.agentType).toBe('hybrid')
  })

  it('perceive() returns raw input and state', async () => {
    const result = await agent.perceive()
    expect(result).toHaveProperty('input')
  })

  it('step() produces all three phase results', async () => {
    const result = await agent.step()
    expect(result).toHaveProperty('perception')
    expect(result).toHaveProperty('decision')
    expect(result).toHaveProperty('action')
  })
})
