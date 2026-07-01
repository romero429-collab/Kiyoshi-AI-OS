/**
 * Reservoir Substrate — Physical Reservoir / Echo-State Network Computing
 *
 * Exploits the high-dimensional nonlinear dynamics of a physical reservoir
 * (spin-torque oscillator arrays, photonic delay-line reservoirs, mechanical
 * buckling arrays) as a recurrent computational layer — no backpropagation
 * needed.  Naturally suited to temporal pattern recognition at low power.
 *
 * Simulation runs a full echo-state network (ESN) with random sparse
 * recurrent weights scaled to the desired spectral radius.
 *
 * Environment variables:
 *   RESERVOIR_HOST + RESERVOIR_TOKEN → custom physical reservoir REST gateway
 */

import { ISubstrate, SubstrateCategory } from '../substrate-manager'

export class ReservoirSubstrate implements ISubstrate {
  readonly name:     string           = 'Reservoir'
  readonly category: SubstrateCategory = 'reservoir'

  private readonly nodes:           number = 1000
  private readonly spectralRadius:  number = 0.9
  private readonly inputDimension:  number = 100
  private readonly reservoirType:   string = 'Spin-Torque Oscillator Array'

  isLive(): boolean {
    return !!(process.env['RESERVOIR_HOST'] && process.env['RESERVOIR_TOKEN'])
  }

  async execute(code: string, input: unknown): Promise<unknown> {
    console.log(`🌊 Reservoir executing on ${this.nodes}-node ${this.reservoirType}`)
    const start = Date.now()

    if (process.env['RESERVOIR_HOST'] && process.env['RESERVOIR_TOKEN']) {
      return this.runRemoteReservoir(code, start)
    }

    return this.runESNSimulation(start)
  }

  getSpecifications(): Record<string, unknown> {
    return {
      type:          'Reservoir / Echo-State',
      platforms:     'Spin-torque oscillators · Photonic delay-line · Mechanical buckling · Optical fibre loop',
      reservoirType: this.reservoirType,
      nodes:         this.nodes,
      spectralRadius: this.spectralRadius,
      inputDimension: this.inputDimension,
      powerClass:    'microwatts',
      latency:       'nanoseconds',
      liveReady:     this.isLive(),
    }
  }

  // ── Remote physical reservoir REST gateway ──────────────────────────────────

  private async runRemoteReservoir(input: string, start: number): Promise<unknown> {
    try {
      const res = await fetch(`${process.env['RESERVOIR_HOST']}/compute`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': 'Bearer ' + process.env['RESERVOIR_TOKEN'],
        },
        body: JSON.stringify({ input, nodes: this.nodes, spectralRadius: this.spectralRadius }),
      })
      if (!res.ok) throw new Error(`Reservoir gateway ${res.status}`)
      const data = await res.json()
      return { platform: 'Reservoir', mode: 'real', provider: this.reservoirType, executionTimeMs: Date.now() - start, ...data as object }
    } catch (err) {
      console.warn(`🌊 Reservoir gateway fallback: ${(err as Error).message}`)
      return this.runESNSimulation(start)
    }
  }

  // ── Echo-State Network simulation ────────────────────────────────────────────

  private async runESNSimulation(start: number): Promise<unknown> {
    const N = Math.min(this.nodes, 200)   // cap for speed
    const T = 50                          // timesteps

    // Build random sparse recurrent weight matrix
    const W: number[][] = Array.from({ length: N }, () =>
      Array.from({ length: N }, () => Math.random() < 0.1 ? (Math.random() * 2 - 1) : 0),
    )
    // Scale to desired spectral radius (approximate via max absolute row sum)
    const rho = W.reduce((mx, row) => Math.max(mx, row.reduce((s, v) => s + Math.abs(v), 0)), 0) || 1
    const scale = this.spectralRadius / rho
    W.forEach(row => row.forEach((_, j) => { row[j]! *= scale }))

    // Random input weights
    const Win: number[] = Array.from({ length: N }, () => Math.random() * 2 - 1)

    // Run reservoir for T steps
    let state = Array(N).fill(0)
    const stateHistory: number[][] = []
    for (let t = 0; t < T; t++) {
      const u = Math.sin(t * 0.3) // simple periodic input signal
      state = state.map((x, i) =>
        Math.tanh(W[i]!.reduce((s, w, j) => s + w * state[j]!, 0) + (Win[i]! ?? 0) * u),
      )
      stateHistory.push([...state])
    }

    const meanActivity = state.reduce((s, v) => s + Math.abs(v), 0) / N

    await new Promise(r => setTimeout(r, 15 + Math.random() * 25))
    return {
      platform:        'Reservoir',
      mode:            'simulation (Echo-State Network)',
      reservoirType:   this.reservoirType,
      nodes:           N,
      timesteps:       T,
      spectralRadius:  this.spectralRadius,
      meanActivity:    meanActivity.toFixed(4),
      trainingFree:    true,
      temporalMemory:  true,
      executionTimeMs: Date.now() - start,
    }
  }
}

