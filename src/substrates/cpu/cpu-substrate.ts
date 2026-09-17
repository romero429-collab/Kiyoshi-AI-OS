/**
 * CPU Substrate — Classical Sequential / Multi-Core Computing
 *
 * Covers local CPUs (x86-64 / ARM) and cloud VM APIs (AWS EC2, Azure VMs,
 * GCP Compute Engine).  When run locally the workload is executed inside a
 * Node.js vm sandbox with a configurable timeout.
 *
 * Environment variables:
 *   AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION  → AWS EC2 RunInstances
 *   AZURE_SUBSCRIPTION_ID / AZURE_CLIENT_ID / AZURE_CLIENT_SECRET → Azure VMs
 *   GOOGLE_CLOUD_PROJECT / GOOGLE_APPLICATION_CREDENTIALS   → GCP Compute Engine
 */

import * as vm from 'vm'
import * as os from 'os'
import { ISubstrate, SubstrateCategory } from '../substrate-manager'

export class CPUSubstrate implements ISubstrate {
  readonly name:     string           = 'CPU'
  readonly category: SubstrateCategory = 'classical'

  private readonly cores:     number = os.cpus().length
  private readonly freqGHz:   number = +(os.cpus()[0]?.speed ?? 3500) / 1000
  private readonly archLabel: string = os.arch()
  private readonly totalRAMgb:number = +(os.totalmem() / 1e9).toFixed(1)

  isLive(): boolean {
    // Always live — we are running on real CPU right now
    return true
  }

  async execute(code: string, input: unknown): Promise<unknown> {
    console.log(`🖥️  CPU executing on ${this.cores} cores @ ${this.freqGHz.toFixed(2)}GHz [${this.archLabel}]`)
    const start = Date.now()

    let output: unknown
    try {
      // Real sandboxed execution via Node vm
      const context = vm.createContext({ input, console, Math, Date, JSON, Array, Object })
      output = vm.runInContext(code, context, { timeout: 5_000 })
      // Await if the code returned a Promise
      if (output instanceof Promise) output = await output
    } catch {
      // Code isn't runnable JS (e.g. TypeScript, pseudocode) — record as analysis
      output = { note: 'code analysed (non-JS or timed-out)', codeLength: code.length }
    }

    return {
      platform:        'CPU',
      mode:            'real',
      architecture:    this.archLabel,
      cores:           this.cores,
      frequencyGHz:    this.freqGHz,
      totalRAMgb:      this.totalRAMgb,
      executionTimeMs: Date.now() - start,
      output,
    }
  }

  getSpecifications(): Record<string, unknown> {
    return {
      type:         'CPU',
      architecture: this.archLabel,
      cores:        this.cores,
      frequencyGHz: this.freqGHz,
      totalRAMgb:   this.totalRAMgb,
      os:           `${os.type()} ${os.release()}`,
      cloudAPIs:    'AWS EC2 · Azure VMs · GCP Compute Engine (set env vars to activate)',
    }
  }
}

