/**
 * KIYOSHI AI OPERATING SYSTEM
 * Universal Substrate Manager
 *
 * The substrate layer is Kiyoshi's hardware abstraction kernel.  It presents
 * a single, uniform interface across every compute paradigm that exists today:
 * classical CPUs, GPUs, FPGAs, gate-model and annealing quantum hardware,
 * neuromorphic chips, photonic processors, biological DNA computing, AI
 * accelerators (TPUs, Groq, Cerebras …), serverless cloud functions, HPC
 * clusters, edge/embedded devices, and several emerging paradigms.
 *
 * Each substrate:
 *   • Reports its compute category (classical / quantum / neuromorphic / …)
 *   • Exposes isLive() so callers know whether a real API is reachable
 *   • Falls back to a high-fidelity simulation when credentials are absent
 *
 * SubstrateManager exposes:
 *   register()          — add any ISubstrate implementation
 *   getAll()            — every registered substrate
 *   getLive()           — only substrates with real connectivity
 *   getSimulated()      — only substrates running in simulation mode
 *   executeAll()        — broadcast a workload in parallel; capture failures
 *   renderStatusPanel() — ASCII dashboard showing live/sim status per substrate
 */

// ─────────────────────────────────────────────────────────────────────────────
// COMPUTE CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

export type SubstrateCategory =
  | 'classical'
  | 'quantum'
  | 'neuromorphic'
  | 'photonic'
  | 'biological'
  | 'accelerator'   // TPU, Groq, Cerebras, Graphcore …
  | 'analog'        // memristive, PCM in-memory compute
  | 'serverless'    // FaaS: Lambda, Azure Functions, GCP …
  | 'hpc'           // SLURM / MPI clusters
  | 'edge'          // Jetson, OpenCL, Raspberry Pi …
  | 'stochastic'    // p-bit, probabilistic computing
  | 'thermodynamic' // Extropic AI, Langevin dynamics
  | 'reservoir'     // echo-state / physical reservoir
  | 'molecular'     // carbon-nanotube / DNA-origami logic
  | 'reconfigurable'// FPGA

// ─────────────────────────────────────────────────────────────────────────────
// CORE INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every compute substrate must satisfy this contract.
 * Classes implement it directly — no external wrapper needed.
 */
export interface ISubstrate {
  /** Display name shown in dashboards, e.g. "Quantum", "GPU", "HPC". */
  readonly name: string
  /** Broad compute paradigm this substrate belongs to. */
  readonly category: SubstrateCategory
  /** Execute a workload and return a platform-specific result object. */
  execute(code: string, input: unknown): Promise<unknown>
  /** Return a plain-object description of hardware / API capabilities. */
  getSpecifications(): Record<string, unknown>
  /**
   * Returns true when a real hardware API is reachable (credentials present
   * and endpoint responding).  Returns false when running in simulation mode.
   */
  isLive(): boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// EXECUTION RESULT
// ─────────────────────────────────────────────────────────────────────────────

export interface SubstrateResult {
  readonly name: string
  readonly category: SubstrateCategory
  readonly live: boolean
  readonly success: boolean
  readonly durationMs: number
  readonly output?: unknown
  readonly error?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// MANAGER
// ─────────────────────────────────────────────────────────────────────────────

const PANEL_WIDTH = 76

export class SubstrateManager {
  private readonly substrates = new Map<string, ISubstrate>()

  /** Register a substrate. Throws on duplicate name. */
  register(substrate: ISubstrate): this {
    if (this.substrates.has(substrate.name)) {
      throw new Error(`SubstrateManager: duplicate name "${substrate.name}"`)
    }
    this.substrates.set(substrate.name, substrate)
    return this
  }

  /** All registered substrates in registration order. */
  getAll(): ISubstrate[] { return Array.from(this.substrates.values()) }

  /** Only substrates with a live real-hardware / API connection. */
  getLive(): ISubstrate[] { return this.getAll().filter(s => s.isLive()) }

  /** Only substrates operating in simulation mode. */
  getSimulated(): ISubstrate[] { return this.getAll().filter(s => !s.isLive()) }

  /** Look up a substrate by name. */
  get(name: string): ISubstrate | undefined { return this.substrates.get(name) }

  /**
   * Broadcast the same workload to every substrate in parallel.
   * Per-substrate failures are captured in the result — never propagate.
   */
  async executeAll(code: string, input: unknown): Promise<SubstrateResult[]> {
    return Promise.all(
      Array.from(this.substrates.values()).map(async (s): Promise<SubstrateResult> => {
        const start = Date.now()
        try {
          const output = await s.execute(code, input)
          return { name: s.name, category: s.category, live: s.isLive(), success: true,  durationMs: Date.now() - start, output }
        } catch (err) {
          return { name: s.name, category: s.category, live: s.isLive(), success: false, durationMs: Date.now() - start,
                   error: err instanceof Error ? err.message : String(err) }
        }
      }),
    )
  }

  // ── Status panel ────────────────────────────────────────────────────────────

  renderStatusPanel(): string {
    const hr  = '═'.repeat(PANEL_WIDTH)
    const div = '─'.repeat(PANEL_WIDTH)
    const lines: string[] = []
    const live      = this.getLive().length
    const simulated = this.getSimulated().length

    lines.push(hr)
    lines.push(this.centre('KIYOSHI OS  —  UNIVERSAL SUBSTRATE STATUS'))
    lines.push(this.centre(`${this.substrates.size} substrate(s)  ·  ${live} live  ·  ${simulated} simulation`))
    lines.push(hr)
    lines.push('')

    let idx = 0
    for (const s of this.substrates.values()) {
      idx++
      const specs  = s.getSpecifications()
      const icon   = substrateIcon(s.category)
      const badge  = s.isLive() ? '🟢 LIVE' : '🔵 SIM '

      lines.push(`  ${icon}  [${String(idx).padStart(2)}] ${s.name.padEnd(20)} ${badge}   (${s.category})`)
      lines.push(`  ${'·'.repeat(PANEL_WIDTH - 2)}`)
      for (const [key, value] of Object.entries(specs)) {
        lines.push(`       ${key.padEnd(24)} ${String(value)}`)
      }
      lines.push('')
    }

    lines.push(div)
    lines.push(`  ✅  ${this.substrates.size} substrates registered   🟢 ${live} live   🔵 ${simulated} simulation`)
    lines.push(hr)
    return lines.join('\n')
  }

  // ── Execution summary ────────────────────────────────────────────────────────

  renderExecutionSummary(results: SubstrateResult[]): string {
    const hr  = '═'.repeat(PANEL_WIDTH)
    const div = '─'.repeat(PANEL_WIDTH)
    const lines: string[] = []

    lines.push(hr)
    lines.push(this.centre('SUBSTRATE EXECUTION SUMMARY'))
    lines.push(hr)
    lines.push('')

    for (const r of results) {
      const ok     = r.success ? '✅' : '❌'
      const liveTag = r.live ? '🟢' : '🔵'
      const timing = `${r.durationMs}ms`
      lines.push(
        `  ${ok} ${liveTag} ${substrateIcon(r.category)} ${r.name.padEnd(20)} ${timing.padStart(8)}` +
        (r.error ? `  ⚠  ${r.error.slice(0, 28)}` : ''),
      )
    }

    const passed = results.filter(r => r.success).length
    const failed = results.length - passed
    lines.push('')
    lines.push(div)
    lines.push(
      `  Result: ${passed}/${results.length} succeeded` +
      (failed > 0 ? `  (${failed} failed)` : '  — all OK'),
    )
    lines.push(hr)
    return lines.join('\n')
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private centre(text: string): string {
    const pad = Math.max(0, Math.floor((PANEL_WIDTH - text.length) / 2))
    return ' '.repeat(pad) + text
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ICON MAP
// ─────────────────────────────────────────────────────────────────────────────

function substrateIcon(category: SubstrateCategory | string): string {
  const icons: Record<string, string> = {
    classical:     '🖥️ ',
    quantum:       '⚛️ ',
    neuromorphic:  '🧠',
    photonic:      '💡',
    biological:    '🧬',
    accelerator:   '🚀',
    analog:        '🔁',
    serverless:    '☁️ ',
    hpc:           '🏗️ ',
    edge:          '📡',
    stochastic:    '🎲',
    thermodynamic: '🌡️ ',
    reservoir:     '🌊',
    molecular:     '🔬',
    reconfigurable:'⚙️ ',
  }
  return icons[category] ?? '🔲'
}
