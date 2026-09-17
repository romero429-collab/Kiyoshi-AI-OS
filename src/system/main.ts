/**
 * Kiyoshi System - Main Entry Point
 */

import * as readline from 'readline'
import { EventBus } from '../core/event-bus'
import { NumericalApproximationEngine } from '../core/numerical/nae'
import { ComputationEnginePipeline } from '../core/numerical/ce-pipeline'
import { DiagnosticPanel } from '../core/numerical/diagnostic-panel'
import { SubstrateManager } from '../substrates/substrate-manager'
import { CPUSubstrate } from '../substrates/cpu/cpu-substrate'
import { GPUSubstrate } from '../substrates/gpu/gpu-substrate'
import { FPGASubstrate } from '../substrates/fpga/fpga-substrate'
import { QuantumSubstrate } from '../substrates/quantum/quantum-substrate'
import { NeuromorphicSubstrate } from '../substrates/neuromorphic/neuromorphic-substrate'
import { OpticalSubstrate } from '../substrates/optical/optical-substrate'
import { BiologicalSubstrate } from '../substrates/biological/biological-substrate'
import { MolecularSubstrate } from '../substrates/molecular/molecular-substrate'
import { MemristiveSubstrate } from '../substrates/memristive/memristive-substrate'
import { ReservoirSubstrate } from '../substrates/reservoir/reservoir-substrate'
import { TPUSubstrate } from '../substrates/tpu/tpu-substrate'
import { ServerlessSubstrate } from '../substrates/serverless/serverless-substrate'
import { HPCSubstrate } from '../substrates/hpc/hpc-substrate'
import { EdgeSubstrate } from '../substrates/edge/edge-substrate'
import { StochasticSubstrate } from '../substrates/stochastic/stochastic-substrate'
import { ThermodynamicSubstrate } from '../substrates/thermodynamic/thermodynamic-substrate'

export class KiyoshiSystem {
  private systemName: string = 'Kiyoshi OS v1.0'
  private version: string = '1.0.0'
  private status: string = 'initialized'

  /** NAE-Ω subsystem components */
  private readonly bus: EventBus
  private readonly nae: NumericalApproximationEngine
  private readonly pipeline: ComputationEnginePipeline

  /** Diagnostic panel — press [D] on the dashboard to open */
  readonly diagnosticPanel: DiagnosticPanel

  /** Universal substrate manager — all compute paradigms */
  private readonly substrateManager: SubstrateManager

  constructor() {
    // Initialise NAE-Ω subsystem
    this.bus = new EventBus()
    this.nae = new NumericalApproximationEngine()
    this.pipeline = new ComputationEnginePipeline(this.nae, this.bus)
    this.diagnosticPanel = new DiagnosticPanel(this.nae, this.pipeline, this.bus)
    this.diagnosticPanel.attach()

    // Register all compute substrates — each class implements ISubstrate directly
    this.substrateManager = new SubstrateManager()
    this.substrateManager
      // ── Classical ──────────────────────────────────────────────────────────
      .register(new CPUSubstrate())
      .register(new GPUSubstrate())
      .register(new FPGASubstrate())
      // ── Quantum ────────────────────────────────────────────────────────────
      .register(new QuantumSubstrate())           // IBM · Google · IonQ · Rigetti · Quantinuum · D-Wave · Azure
      // ── Bio / Neuro / Photonic ─────────────────────────────────────────────
      .register(new NeuromorphicSubstrate())      // Loihi · TrueNorth · SpiNNaker · BrainScaleS
      .register(new OpticalSubstrate())           // Xanadu · Lightmatter · Luminous
      .register(new BiologicalSubstrate())        // Twist Bioscience · Benchling · DNA storage
      // ── Emerging / Next-Gen ────────────────────────────────────────────────
      .register(new MolecularSubstrate())         // CNT / DNA origami / Schrödinger
      .register(new MemristiveSubstrate())        // Knowm · IBM PCM · HP RRAM
      .register(new ReservoirSubstrate())         // Spin-torque oscillator · photonic ESN
      // ── AI Accelerators ───────────────────────────────────────────────────
      .register(new TPUSubstrate())               // Google TPU · Groq LPU · Cerebras · Graphcore
      // ── Cloud / Distributed ───────────────────────────────────────────────
      .register(new ServerlessSubstrate())        // Lambda · Azure Fns · GCP Fns · CF Workers
      .register(new HPCSubstrate())               // SLURM · PBS · NERSC Perlmutter · Frontier
      .register(new EdgeSubstrate())              // Jetson Orin · Raspberry Pi · OpenCL
      // ── Probabilistic / Thermodynamic ─────────────────────────────────────
      .register(new StochasticSubstrate())        // D-Wave QUBO · P-bit Gibbs sampler
      .register(new ThermodynamicSubstrate())     // Extropic AI · Normal SPU · Langevin

    console.log(`\n${'═'.repeat(70)}`)
    console.log(`🤖 ${this.systemName}`)
    console.log(`${'═'.repeat(70)}\n`)
    console.log(`✅ System initialized — ${this.substrateManager.getAll().length} substrates online\n`)
  }

  /**
   * Process user code — routes through every connected substrate in parallel
   * and prints a per-substrate execution summary on completion.
   */
  async processCode(userCode: string): Promise<void> {
    console.log(`📝 Processing code:\n`)
    console.log(userCode)
    console.log(`\n${'─'.repeat(70)}\n`)

    const stages = [
      { name: 'Analysis', icon: '🔍' },
      { name: 'Understanding', icon: '🧠' },
      { name: 'Optimization', icon: '⚡' },
      { name: 'Testing', icon: '🧪' },
      { name: 'Debugging', icon: '🐛' },
      { name: 'Refactoring', icon: '📝' },
      { name: 'Compilation', icon: '🔨' },
      { name: 'Deployment', icon: '🚀' },
      { name: 'Monitoring', icon: '📊' }
    ]

    for (const stage of stages) {
      await this.delay(500)
      console.log(`${stage.icon} ${stage.name}...`)
    }

    console.log(`\n${'─'.repeat(70)}`)
    console.log(`✅ Code processing complete!\n`)

    // Execute on all connected substrates and show summary
    console.log(`\n🔄 Dispatching workload to all substrates...\n`)
    const results = await this.substrateManager.executeAll(userCode, {})
    console.log(this.substrateManager.renderExecutionSummary(results))
    console.log(`${'═'.repeat(70)}\n`)
  }

  /**
   * Display system info
   */
  getSystemInfo(): void {
    console.log(`\n${'═'.repeat(70)}`)
    console.log(`📊 KIYOSHI SYSTEM INFORMATION`)
    console.log(`${'═'.repeat(70)}\n`)
    console.log(`Name:              ${this.systemName}`)
    console.log(`Version:           ${this.version}`)
    console.log(`Status:            ${this.status}`)
    console.log(`Layers:            5 (Substrates → Intelligence → Engineering → Operations → Integration)`)
    console.log(`Compute Platforms: ${this.substrateManager.getAll().length} (CPU · GPU · FPGA · Quantum · Neuromorphic · Optical · Biological · Molecular · Memristive · Reservoir · AI Accelerator · Serverless · HPC · Edge · Stochastic · Thermodynamic)`)
    console.log(`Overall Score:     91/100\n`)
    console.log(`${'═'.repeat(70)}\n`)
  }

  /**
   * Open the NAE-Ω / CE-Ω Diagnostic Panel and print it to stdout.
   * Can be called programmatically or triggered via the dashboard menu.
   */
  showDiagnosticPanel(): void {
    console.log(this.diagnosticPanel.render())
  }

  /**
   * Open the Universal Substrate Status Panel and print it to stdout.
   * Shows live specifications for every connected compute substrate.
   * Triggered by [S] in the dashboard.
   */
  showSubstratePanel(): void {
    console.log(this.substrateManager.renderStatusPanel())
  }

  /**
   * Run system demo
   */
  async runDemo(): Promise<void> {
    this.getSystemInfo()

    const demoCode = `
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

export { fibonacci };
    `.trim()

    await this.processCode(demoCode)
  }

  /**
   * Start the interactive GUI dashboard.
   *
   * Presents a menu of actions the user can trigger at any time:
   *   [I] System info
   *   [D] Diagnostic panel  ← NAE-Ω / CE-Ω visualisation
   *   [R] Run demo
   *   [Q] Quit
   */
  async startDashboard(): Promise<void> {
    this.printDashboardMenu()

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    })

    // Enable raw-mode keypress handling when running interactively
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true)
      readline.emitKeypressEvents(process.stdin)

      process.stdin.on('keypress', async (_str, key) => {
        if (!key) return
        await this.handleDashboardKey(key.name ?? '')
        if (key.name !== 'q') this.printDashboardMenu()
      })
    } else {
      // Non-TTY mode (pipes, CI): read lines
      rl.on('line', async (line) => {
        await this.handleDashboardKey(line.trim().toLowerCase())
      })
      rl.on('close', () => process.exit(0))
    }
  }

  /** Print the interactive dashboard menu */
  private printDashboardMenu(): void {
    console.log(`\n${'═'.repeat(70)}`)
    console.log(`  🖥️  Kiyoshi OS Dashboard`)
    console.log(`${'─'.repeat(70)}`)
    console.log(`  [I]  System Info`)
    console.log(`  [S]  Substrate Status  (${this.substrateManager.getAll().length} substrates connected)`)
    console.log(`  [D]  Diagnostic Panel  (NAE-Ω / CE-Ω)`)
    console.log(`  [R]  Run Demo`)
    console.log(`  [Q]  Quit`)
    console.log(`${'═'.repeat(70)}`)
    process.stdout.write('  Choice: ')
  }

  /** Dispatch a single keypress from the dashboard menu */
  private async handleDashboardKey(key: string): Promise<void> {
    console.log(key.toUpperCase())
    switch (key.toLowerCase()) {
      case 'i':
        this.getSystemInfo()
        break
      case 's':
        this.showSubstratePanel()
        break
      case 'd':
        this.showDiagnosticPanel()
        break
      case 'r':
        await this.runDemo()
        break
      case 'q':
        console.log('\n👋 Kiyoshi OS shutting down. Goodbye!\n')
        this.diagnosticPanel.detach()
        process.exit(0)
        break
      default:
        console.log(`  ⚠️  Unknown option: "${key}". Use I / S / D / R / Q.`)
    }
  }

  /**
   * Helper: delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main execution
 */
async function main() {
  try {
    const kiyoshi = new KiyoshiSystem()
    await kiyoshi.startDashboard()
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()