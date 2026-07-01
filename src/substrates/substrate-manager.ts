/**
 * KIYOSHI AI OPERATING SYSTEM
 * Universal Substrate Manager
 *
 * SubstrateManager provides a single aggregation point for every compute
 * substrate registered in the system.  It exposes:
 *
 *   register()       — add any object that satisfies ISubstrate
 *   getAll()         — enumerate all registered substrates
 *   executeAll()     — broadcast a workload to every substrate in parallel
 *   renderStatusPanel() — formatted ASCII report for the GUI dashboard
 *
 * Invariant: a substrate may only be registered once per name.
 * Complexity — executeAll: O(n) with Promise.all parallelism.
 */

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Common contract that every compute substrate must satisfy.
 *
 * The existing substrate classes already expose execute() and
 * getSpecifications(); this interface formalises that contract and adds
 * a required `name` string so the manager can label each substrate in reports.
 */
export interface ISubstrate {
  /** Short human-readable name, e.g. "CPU", "GPU", "Quantum". */
  readonly name: string
  /** Execute a workload and return a platform-specific result object. */
  execute(code: string, input: unknown): Promise<unknown>
  /** Return a plain-object description of hardware capabilities. */
  getSpecifications(): Record<string, unknown>
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULT
// ─────────────────────────────────────────────────────────────────────────────

/** Outcome of one substrate's execution attempt. */
export interface SubstrateResult {
  readonly name: string
  readonly success: boolean
  readonly durationMs: number
  /** Populated when success = true. */
  readonly output?: unknown
  /** Populated when success = false. */
  readonly error?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// MANAGER
// ─────────────────────────────────────────────────────────────────────────────

const PANEL_WIDTH = 72

export class SubstrateManager {
  private readonly substrates = new Map<string, ISubstrate>()

  /**
   * Register a substrate.  Throws if a substrate with the same name is already
   * registered (enforces the uniqueness invariant).
   *
   * Complexity: O(1).
   */
  register(substrate: ISubstrate): this {
    if (this.substrates.has(substrate.name)) {
      throw new Error(`SubstrateManager: duplicate substrate name "${substrate.name}"`)
    }
    this.substrates.set(substrate.name, substrate)
    return this
  }

  /** Return all registered substrates in registration order. */
  getAll(): ISubstrate[] {
    return Array.from(this.substrates.values())
  }

  /** Return a single substrate by name, or undefined if not registered. */
  get(name: string): ISubstrate | undefined {
    return this.substrates.get(name)
  }

  /**
   * Execute the same workload on every registered substrate in parallel.
   *
   * Individual failures are captured per-result and never propagate — the
   * caller always receives an array of length equal to the number of registered
   * substrates.
   *
   * Complexity: O(n) wall-clock (parallel), O(n) memory.
   */
  async executeAll(code: string, input: unknown): Promise<SubstrateResult[]> {
    const tasks = Array.from(this.substrates.values()).map(
      async (substrate): Promise<SubstrateResult> => {
        const start = Date.now()
        try {
          const output = await substrate.execute(code, input)
          return {
            name: substrate.name,
            success: true,
            durationMs: Date.now() - start,
            output,
          }
        } catch (err) {
          return {
            name: substrate.name,
            success: false,
            durationMs: Date.now() - start,
            error: err instanceof Error ? err.message : String(err),
          }
        }
      },
    )
    return Promise.all(tasks)
  }

  /**
   * Render a formatted ASCII status panel listing every registered substrate,
   * its hardware specifications, and connectivity status.
   *
   * Designed to be printed directly to the terminal by the dashboard.
   *
   * Complexity: O(n · k) where n = substrates, k = spec keys per substrate.
   */
  renderStatusPanel(): string {
    const hr  = '═'.repeat(PANEL_WIDTH)
    const div = '─'.repeat(PANEL_WIDTH)
    const lines: string[] = []

    lines.push(hr)
    lines.push(this.centre('KIYOSHI OS  —  UNIVERSAL SUBSTRATE STATUS'))
    lines.push(this.centre(`${this.substrates.size} substrate(s) connected`))
    lines.push(hr)
    lines.push('')

    let idx = 0
    for (const substrate of this.substrates.values()) {
      idx++
      const specs = substrate.getSpecifications()
      const icon  = substrateIcon(substrate.name)

      lines.push(`  ${icon}  [${idx}] ${substrate.name}`)
      lines.push(`  ${'·'.repeat(PANEL_WIDTH - 2)}`)

      for (const [key, value] of Object.entries(specs)) {
        const label = key.padEnd(22)
        lines.push(`       ${label} ${String(value)}`)
      }
      lines.push('')
    }

    lines.push(div)
    lines.push(`  ✅ All ${this.substrates.size} substrates ONLINE`)
    lines.push(hr)

    return lines.join('\n')
  }

  /**
   * Render a compact summary of execution results returned by executeAll().
   *
   * Complexity: O(n).
   */
  renderExecutionSummary(results: SubstrateResult[]): string {
    const hr  = '═'.repeat(PANEL_WIDTH)
    const div = '─'.repeat(PANEL_WIDTH)
    const lines: string[] = []

    lines.push(hr)
    lines.push(this.centre('SUBSTRATE EXECUTION SUMMARY'))
    lines.push(hr)
    lines.push('')

    for (const r of results) {
      const icon   = r.success ? '✅' : '❌'
      const timing = `${r.durationMs}ms`
      lines.push(
        `  ${icon}  ${substrateIcon(r.name)} ${r.name.padEnd(16)} ${timing.padStart(8)}` +
        (r.error ? `  ⚠  ${r.error.slice(0, 30)}` : ''),
      )
    }

    const passed  = results.filter(r => r.success).length
    const failed  = results.length - passed
    lines.push('')
    lines.push(div)
    lines.push(
      `  Result: ${passed}/${results.length} succeeded` +
      (failed > 0 ? `  (${failed} failed)` : '  — all OK'),
    )
    lines.push(hr)

    return lines.join('\n')
  }

  // ── Formatting helpers ─────────────────────────────────────────────────────

  private centre(text: string): string {
    const pad = Math.max(0, Math.floor((PANEL_WIDTH - text.length) / 2))
    return ' '.repeat(pad) + text
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Map a substrate name to a representative emoji icon. */
function substrateIcon(name: string): string {
  const icons: Record<string, string> = {
    CPU:          '🖥️ ',
    GPU:          '⚡',
    FPGA:         '⚙️ ',
    Quantum:      '⚛️ ',
    Neuromorphic: '🧠',
    Optical:      '💡',
    Biological:   '🧬',
  }
  return icons[name] ?? '🔲'
}
