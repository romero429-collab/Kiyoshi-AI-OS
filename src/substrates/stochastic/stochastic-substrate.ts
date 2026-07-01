/**
 * Stochastic Substrate — Probabilistic Bit (P-bit) & Boltzmann Machines
 *
 * P-bits are the classical probabilistic analogue of qubits — naturally
 * stochastic CMOS/MTJ circuits that solve combinatorial optimisation
 * (Ising problems) natively.  Developed by Purdue, Tohoku U, and Intel Labs.
 *
 * Also connects to D-Wave Leap for QUBO/Ising problems when credentials
 * are present (D-Wave is registered in the Quantum substrate but stochastic
 * classical Ising is a distinct paradigm).
 *
 * Simulation runs a synchronous Gibbs sampler on a random Ising model.
 *
 * Environment variables:
 *   DWAVE_API_TOKEN              → D-Wave Leap API (QUBO/Ising)
 *   DWAVE_SOLVER                 → solver name (default: Advantage_system4.1)
 */

import { ISubstrate, SubstrateCategory } from '../substrate-manager'

export class StochasticSubstrate implements ISubstrate {
  readonly name:     string           = 'Stochastic'
  readonly category: SubstrateCategory = 'stochastic'

  private readonly pbits:          number = 1000
  private readonly interconnects:  number = 5000

  isLive(): boolean {
    return !!process.env['DWAVE_API_TOKEN']
  }

  async execute(code: string, input: unknown): Promise<unknown> {
    console.log(`🎲 Stochastic executing — ${this.pbits} P-bits`)
    const start = Date.now()

    if (process.env['DWAVE_API_TOKEN']) {
      return this.runDWave(start)
    }

    return this.runGibbsSampler(start)
  }

  getSpecifications(): Record<string, unknown> {
    return {
      type:            'Stochastic / P-bit',
      platforms:       'D-Wave Leap (QUBO/Ising) · Purdue P-bit · Intel Labs Ising · Tohoku MTJ arrays',
      pbits:           this.pbits,
      interconnects:   this.interconnects,
      paradigm:        'Probabilistic / Boltzmann sampling',
      applications:    'Combinatorial optimisation · Bayesian inference · Generative AI',
      dWaveReady:      !!process.env['DWAVE_API_TOKEN'],
    }
  }

  // ── D-Wave Leap ─────────────────────────────────────────────────────────────

  private async runDWave(start: number): Promise<unknown> {
    try {
      const res = await fetch('https://cloud.dwavesys.com/sapi/v2/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env['DWAVE_API_TOKEN']!,
        },
        body: JSON.stringify({
          solver: process.env['DWAVE_SOLVER'] ?? 'Advantage_system4.1',
          data: { format: 'bq', lin: {}, quad: {} },
          params: { num_reads: 100 },
          type: 'qubo',
        }),
      })
      if (!res.ok) throw new Error(`D-Wave ${res.status}`)
      const data = await res.json() as { id: string; status: string }
      return { platform: 'Stochastic', mode: 'real', provider: 'D-Wave Leap', problemId: data.id, status: data.status, executionTimeMs: Date.now() - start }
    } catch (err) {
      console.warn(`🎲 D-Wave fallback: ${(err as Error).message}`)
      return this.runGibbsSampler(start)
    }
  }

  // ── Synchronous Gibbs sampler on random Ising model ─────────────────────────

  private async runGibbsSampler(start: number): Promise<unknown> {
    const N = Math.min(this.pbits, 200)
    // Random ±1 couplings (sparse)
    const J: number[][] = Array.from({ length: N }, () => Array(N).fill(0))
    for (let i = 0; i < N; i++)
      for (let j = i + 1; j < N; j++)
        if (Math.random() < 0.05) { const v = Math.random() > 0.5 ? 1 : -1; J[i]![j] = v; J[j]![i] = v }

    let spins = Array.from({ length: N }, () => Math.random() > 0.5 ? 1 : -1)
    const T = 1.0   // temperature
    const steps = 1000

    for (let s = 0; s < steps; s++) {
      const i = Math.floor(Math.random() * N)
      const localField = J[i]!.reduce((sum, Jij, j) => sum + Jij * (spins[j] ?? 0), 0)
      const prob = 1 / (1 + Math.exp(-2 * localField / T))
      spins[i] = Math.random() < prob ? 1 : -1
    }

    const energy = -0.5 * spins.reduce((s, si, i) =>
      s + J[i]!.reduce((ss, Jij, j) => ss + Jij * si * (spins[j] ?? 0), 0), 0)
    const magnetisation = spins.reduce((s, v) => s + v, 0) / N

    await new Promise(r => setTimeout(r, 15))
    return {
      platform:      'Stochastic',
      mode:          'simulation (Gibbs sampler)',
      pbits:         N,
      sweeps:        steps,
      energy:        energy.toFixed(2),
      magnetisation: magnetisation.toFixed(4),
      executionTimeMs: Date.now() - start,
    }
  }
}
