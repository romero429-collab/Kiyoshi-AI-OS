/**
 * Thermodynamic Substrate — Energy-Based & Langevin Dynamics Computing
 *
 * Thermodynamic computers solve inference and optimisation using controlled
 * thermal noise — Langevin dynamics in hardware.  Key players: Extropic AI,
 * Normal Computing, and MIT/Caltech research groups.
 *
 * Connects to Extropic AI's cloud API and to Normal Computing's stochastic
 * processing unit (SPU) API when credentials are present.
 * Falls back to a Langevin dynamics simulation.
 *
 * Environment variables:
 *   EXTROPIC_API_KEY    → Extropic AI thermodynamic computing API
 *   NORMAL_API_KEY      → Normal Computing SPU API
 */

import { ISubstrate, SubstrateCategory } from '../substrate-manager'

export class ThermodynamicSubstrate implements ISubstrate {
  readonly name:     string           = 'Thermodynamic'
  readonly category: SubstrateCategory = 'thermodynamic'

  private readonly temperatureK:    number = 300    // room temp
  private readonly dimensions:      number = 512    // latent space dims
  private readonly timestep:        number = 0.01   // Langevin dt
  private readonly friction:        number = 1.0    // γ

  isLive(): boolean {
    return !!(process.env['EXTROPIC_API_KEY'] || process.env['NORMAL_API_KEY'])
  }

  async execute(code: string, input: unknown): Promise<unknown> {
    console.log(`🌡️  Thermodynamic executing — T=${this.temperatureK}K`)
    const start = Date.now()

    if (process.env['EXTROPIC_API_KEY']) return this.runExtropic(code, start)
    if (process.env['NORMAL_API_KEY'])   return this.runNormal(code, start)

    return this.runLangevinSimulation(start)
  }

  getSpecifications(): Record<string, unknown> {
    return {
      type:          'Thermodynamic',
      platforms:     'Extropic AI · Normal Computing SPU · MIT Noise-Annealing · Caltech Thermodynamic NN',
      temperature:   `${this.temperatureK}K`,
      dimensions:    this.dimensions,
      paradigm:      'Langevin dynamics / Boltzmann sampling / diffusion',
      applications:  'Generative AI · Probabilistic inference · Optimisation',
      extropicReady: !!process.env['EXTROPIC_API_KEY'],
      normalReady:   !!process.env['NORMAL_API_KEY'],
    }
  }

  // ── Extropic AI API ─────────────────────────────────────────────────────────
  // https://extropic.ai

  private async runExtropic(input: string, start: number): Promise<unknown> {
    try {
      const res = await fetch('https://api.extropic.ai/v1/sample', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': 'Bearer ' + process.env['EXTROPIC_API_KEY'],
        },
        body: JSON.stringify({ prompt: input, temperature: this.temperatureK / 300, steps: 50 }),
      })
      if (!res.ok) throw new Error(`Extropic ${res.status}`)
      const data = await res.json()
      return { platform: 'Thermodynamic', mode: 'real', provider: 'Extropic AI', executionTimeMs: Date.now() - start, ...data as object }
    } catch (err) {
      console.warn(`🌡️  Extropic fallback: ${(err as Error).message}`)
      return this.runLangevinSimulation(start)
    }
  }

  // ── Normal Computing SPU ────────────────────────────────────────────────────

  private async runNormal(input: string, start: number): Promise<unknown> {
    try {
      const res = await fetch('https://api.normalcomputing.ai/v1/compute', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': 'Bearer ' + process.env['NORMAL_API_KEY'],
        },
        body: JSON.stringify({ input, mode: 'langevin', steps: 100 }),
      })
      if (!res.ok) throw new Error(`Normal ${res.status}`)
      const data = await res.json()
      return { platform: 'Thermodynamic', mode: 'real', provider: 'Normal Computing SPU', executionTimeMs: Date.now() - start, ...data as object }
    } catch (err) {
      console.warn(`🌡️  Normal Computing fallback: ${(err as Error).message}`)
      return this.runLangevinSimulation(start)
    }
  }

  // ── Langevin dynamics simulation ────────────────────────────────────────────
  // dx = -∇U(x) dt + √(2kT/γ) dW

  private async runLangevinSimulation(start: number): Promise<unknown> {
    const D = Math.min(this.dimensions, 64)
    const kT = 1.0 * (this.temperatureK / 300)
    const sigma = Math.sqrt(2 * kT / this.friction * this.timestep)
    const steps = 500

    // Initial position
    let x = Array.from({ length: D }, () => (Math.random() * 2 - 1))

    // Simple double-well potential: U(x) = Σ (x_i² - 1)²
    let finalEnergy = 0
    for (let s = 0; s < steps; s++) {
      x = x.map(xi => {
        const grad = 4 * xi * (xi * xi - 1)   // dU/dx_i
        const noise = sigma * gaussRandom()
        return xi - this.friction * grad * this.timestep + noise
      })
    }
    finalEnergy = x.reduce((e, xi) => e + (xi * xi - 1) ** 2, 0) / D

    const mean = x.reduce((s, v) => s + v, 0) / D
    const variance = x.reduce((s, v) => s + (v - mean) ** 2, 0) / D

    await new Promise(r => setTimeout(r, 20))
    return {
      platform:        'Thermodynamic',
      mode:            'simulation (Langevin dynamics)',
      dimensions:      D,
      steps,
      temperature:     `${this.temperatureK}K`,
      finalEnergy:     finalEnergy.toFixed(4),
      mean:            mean.toFixed(4),
      variance:        variance.toFixed(4),
      executionTimeMs: Date.now() - start,
    }
  }
}

// Box-Muller Gaussian random sample
function gaussRandom(): number {
  const u1 = Math.random(), u2 = Math.random()
  return Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2)
}
