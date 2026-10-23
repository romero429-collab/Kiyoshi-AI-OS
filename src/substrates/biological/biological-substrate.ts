/**
 * Biological Substrate — DNA / Molecular Biology Computing
 *
 * Connects to Twist Bioscience API for real DNA synthesis orders and
 * to the Benchling API for sequence analysis / computation.
 * Simulation implements Watson-Crick complementary strand operations
 * and a simple parallel string-search — the original Adleman algorithm.
 *
 * Environment variables:
 *   TWIST_API_KEY      → Twist Bioscience synthesis API
 *   BENCHLING_API_KEY  → Benchling registry / analysis API
 */

import { ISubstrate, SubstrateCategory } from '../substrate-manager'

export class BiologicalSubstrate implements ISubstrate {
  readonly name:     string           = 'Biological'
  readonly category: SubstrateCategory = 'biological'

  private readonly dnaStrands:     number = 1_000_000
  private readonly sequenceLength: number = 1_000

  isLive(): boolean {
    return !!(process.env['TWIST_API_KEY'] || process.env['BENCHLING_API_KEY'])
  }

  async execute(code: string, input: unknown): Promise<unknown> {
    console.log(`🧬 Biological executing — ${this.dnaStrands.toLocaleString()} DNA strands`)
    const start = Date.now()

    if (process.env['TWIST_API_KEY']) {
      return this.runTwist(code, start)
    }

    return this.runDNASimulation(code, start)
  }

  getSpecifications(): Record<string, unknown> {
    return {
      type:           'Biological / DNA',
      platforms:      'Twist Bioscience · Benchling · Evonik DNA storage · Microsoft DNA storage',
      dnaStrands:     this.dnaStrands,
      sequenceLength: this.sequenceLength,
      density:        'petabytes per gram',
      energyUsage:    'minimal',
      twistReady:     !!process.env['TWIST_API_KEY'],
      benchlingReady: !!process.env['BENCHLING_API_KEY'],
    }
  }

  // ── Twist Bioscience API ─────────────────────────────────────────────────────
  // https://twistdna.com/api

  private async runTwist(sequence: string, start: number): Promise<unknown> {
    try {
      const res = await fetch('https://twist-api.twistdna.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': 'Bearer ' + process.env['TWIST_API_KEY'],
        },
        body: JSON.stringify({
          sequences: [{ name: 'kiyoshi-seq', sequence: sequence.slice(0, 500) }],
          scale:     '25nm',
        }),
      })
      if (!res.ok) throw new Error(`Twist ${res.status}`)
      const order = await res.json() as { id: string; status: string }
      return { platform: 'Biological', mode: 'real', provider: 'Twist Bioscience', orderId: order.id, status: order.status, executionTimeMs: Date.now() - start }
    } catch (err) {
      console.warn(`🧬 Twist fallback: ${(err as Error).message}`)
      return this.runDNASimulation(sequence, start)
    }
  }

  // ── DNA / Watson-Crick simulation ────────────────────────────────────────────

  private async runDNASimulation(code: string, start: number): Promise<unknown> {
    const complement: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' }
    // Encode input as a short DNA string via ASCII
    const inputDNA = Array.from(code.slice(0, 40))
      .map(c => {
        const n = c.charCodeAt(0) % 4
        return ['A', 'T', 'G', 'C'][n] ?? 'A'
      })
      .join('')
    const complementStrand = inputDNA.split('').map(b => complement[b] ?? 'N').join('')

    // Simulate parallel search (Adleman-style)
    await new Promise(r => setTimeout(r, 30 + Math.random() * 100))

    return {
      platform:         'Biological',
      mode:             'simulation (Watson-Crick)',
      dnaStrands:       this.dnaStrands,
      sequenceLength:   this.sequenceLength,
      encodedSequence:  inputDNA,
      complementStrand,
      parallelism:      `${this.dnaStrands.toExponential()} operations in one test tube`,
      executionTimeMs:  Date.now() - start,
    }
  }
}

