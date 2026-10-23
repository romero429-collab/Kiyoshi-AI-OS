/**
 * Tests for the Universal Compiler — Phase 3 Engineering
 * Covers: compileToMultiple — happy path, multi-substrate, unsupported substrate error
 */

import { UniversalCompiler } from '../../engineering/compiler/universal-compiler'

beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}))
afterAll(() => jest.restoreAllMocks())

describe('UniversalCompiler', () => {
  let compiler: UniversalCompiler

  beforeEach(() => {
    compiler = new UniversalCompiler()
  })

  it('compileToMultiple() returns a Map with one entry per substrate', async () => {
    const result = await compiler.compileToMultiple({ source: 'hello' }, ['cpu', 'gpu-nvidia'])
    expect(result.size).toBe(2)
    expect(result.has('cpu')).toBe(true)
    expect(result.has('gpu-nvidia')).toBe(true)
  })

  it('each compiled entry has compiled:true and the correct substrate name', async () => {
    const result = await compiler.compileToMultiple({ source: 'code' }, ['cpu'])
    const entry = result.get('cpu')
    expect(entry).toHaveProperty('compiled', true)
    expect(entry).toHaveProperty('substrate', 'cpu')
  })

  it('throws for an unsupported substrate', async () => {
    await expect(
      compiler.compileToMultiple({ source: 'code' }, ['unknown-substrate'])
    ).rejects.toThrow('Unsupported substrate: unknown-substrate')
  })

  it('compiles to all classical substrates without error', async () => {
    const substrates = ['cpu', 'gpu-nvidia', 'gpu-amd', 'gpu-intel', 'fpga']
    const result = await compiler.compileToMultiple({}, substrates)
    expect(result.size).toBe(5)
  })

  it('compiles to all quantum substrates without error', async () => {
    const substrates = ['quantum-ibm', 'quantum-google', 'quantum-ionq']
    const result = await compiler.compileToMultiple({}, substrates)
    expect(result.size).toBe(3)
  })

  it('compiles to bio/neuro/photonic substrates', async () => {
    const substrates = ['biological', 'neural-sim', 'optical', 'neuromorphic']
    const result = await compiler.compileToMultiple({}, substrates)
    expect(result.size).toBe(4)
  })
})
