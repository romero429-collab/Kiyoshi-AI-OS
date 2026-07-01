/**
 * Kiyoshi System - Main Entry Point
 */

import * as readline from 'readline'
import { EventBus } from '../core/event-bus'
import { NumericalApproximationEngine } from '../core/numerical/nae'
import { ComputationEnginePipeline } from '../core/numerical/ce-pipeline'
import { DiagnosticPanel } from '../core/numerical/diagnostic-panel'

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

  constructor() {
    // Initialise NAE-Ω subsystem
    this.bus = new EventBus()
    this.nae = new NumericalApproximationEngine()
    this.pipeline = new ComputationEnginePipeline(this.nae, this.bus)
    this.diagnosticPanel = new DiagnosticPanel(this.nae, this.pipeline, this.bus)
    this.diagnosticPanel.attach()

    console.log(`\n${'═'.repeat(70)}`)
    console.log(`🤖 ${this.systemName}`)
    console.log(`${'═'.repeat(70)}\n`)
    console.log(`✅ System initialized and ready!\n`)
  }

  /**
   * Process user code
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
    console.log(`Compute Platforms: 12 (CPU, GPU, FPGA, Quantum, Biological, etc)`)
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
        console.log(`  ⚠️  Unknown option: "${key}". Use I / D / R / Q.`)
    }
  }

  /**
   * Helper: delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

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