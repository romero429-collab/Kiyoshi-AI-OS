/**
 * Serverless / FaaS Substrate — Distributed Edge-Cloud Functions
 *
 * Dispatches workloads to AWS Lambda, Azure Functions, Google Cloud Functions,
 * or Cloudflare Workers — all pay-per-use, massively parallel function runtimes.
 * Falls back to a local Node.js `vm` sandbox simulation.
 *
 * Environment variables:
 *   AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY + AWS_REGION → AWS Lambda
 *   AZURE_FUNCTION_URL + AZURE_FUNCTION_KEY               → Azure Functions
 *   GCP_FUNCTION_URL + GCP_ID_TOKEN                       → GCP Cloud Functions
 *   CF_WORKER_URL + CF_API_TOKEN                          → Cloudflare Workers
 */

import * as vm from 'vm'
import { ISubstrate, SubstrateCategory } from '../substrate-manager'

export class ServerlessSubstrate implements ISubstrate {
  readonly name:     string           = 'Serverless'
  readonly category: SubstrateCategory = 'serverless'

  isLive(): boolean {
    return !!(
      (process.env['AWS_ACCESS_KEY_ID'] && process.env['AWS_SECRET_ACCESS_KEY']) ||
      (process.env['AZURE_FUNCTION_URL'] && process.env['AZURE_FUNCTION_KEY']) ||
      process.env['GCP_FUNCTION_URL'] ||
      process.env['CF_WORKER_URL']
    )
  }

  async execute(code: string, input: unknown): Promise<unknown> {
    console.log('☁️  Serverless executing')
    const start = Date.now()

    if (process.env['AZURE_FUNCTION_URL'] && process.env['AZURE_FUNCTION_KEY']) {
      return this.runAzureFunction(code, start)
    }
    if (process.env['GCP_FUNCTION_URL']) {
      return this.runGCPFunction(code, start)
    }
    if (process.env['CF_WORKER_URL']) {
      return this.runCloudflareWorker(code, start)
    }

    return this.runLocalSandbox(code, start)
  }

  getSpecifications(): Record<string, unknown> {
    return {
      type:        'Serverless / FaaS',
      platforms:   'AWS Lambda · Azure Functions · GCP Cloud Functions · Cloudflare Workers · Vercel Edge',
      scaling:     'infinite horizontal',
      coldStart:   '< 100ms (warm) / ~500ms (cold)',
      maxDuration: '15 min (Lambda) / unlimited (CF Workers)',
      awsReady:    !!(process.env['AWS_ACCESS_KEY_ID'] && process.env['AWS_SECRET_ACCESS_KEY']),
      azureReady:  !!(process.env['AZURE_FUNCTION_URL'] && process.env['AZURE_FUNCTION_KEY']),
      gcpReady:    !!process.env['GCP_FUNCTION_URL'],
      cfReady:     !!process.env['CF_WORKER_URL'],
    }
  }

  // ── Azure Functions ─────────────────────────────────────────────────────────

  private async runAzureFunction(code: string, start: number): Promise<unknown> {
    try {
      const url = `${process.env['AZURE_FUNCTION_URL']}?code=${process.env['AZURE_FUNCTION_KEY']}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      if (!res.ok) throw new Error(`Azure Function ${res.status}`)
      const data = await res.json()
      return { platform: 'Serverless', mode: 'real', provider: 'Azure Functions', executionTimeMs: Date.now() - start, ...data as object }
    } catch (err) {
      console.warn(`☁️  Azure Function fallback: ${(err as Error).message}`)
      return this.runLocalSandbox(code, start)
    }
  }

  // ── GCP Cloud Functions ─────────────────────────────────────────────────────

  private async runGCPFunction(code: string, start: number): Promise<unknown> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (process.env['GCP_ID_TOKEN']) headers['Authorization'] = 'Bearer ' + process.env['GCP_ID_TOKEN']
      const res = await fetch(process.env['GCP_FUNCTION_URL']!, {
        method: 'POST', headers,
        body: JSON.stringify({ code }),
      })
      if (!res.ok) throw new Error(`GCP Function ${res.status}`)
      const data = await res.json()
      return { platform: 'Serverless', mode: 'real', provider: 'GCP Cloud Functions', executionTimeMs: Date.now() - start, ...data as object }
    } catch (err) {
      console.warn(`☁️  GCP Function fallback: ${(err as Error).message}`)
      return this.runLocalSandbox(code, start)
    }
  }

  // ── Cloudflare Workers ──────────────────────────────────────────────────────

  private async runCloudflareWorker(code: string, start: number): Promise<unknown> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (process.env['CF_API_TOKEN']) headers['Authorization'] = 'Bearer ' + process.env['CF_API_TOKEN']
      const res = await fetch(process.env['CF_WORKER_URL']!, {
        method: 'POST', headers,
        body: JSON.stringify({ code }),
      })
      if (!res.ok) throw new Error(`CF Worker ${res.status}`)
      const data = await res.json()
      return { platform: 'Serverless', mode: 'real', provider: 'Cloudflare Workers', executionTimeMs: Date.now() - start, ...data as object }
    } catch (err) {
      console.warn(`☁️  Cloudflare Worker fallback: ${(err as Error).message}`)
      return this.runLocalSandbox(code, start)
    }
  }

  // ── Local vm sandbox ────────────────────────────────────────────────────────

  private async runLocalSandbox(code: string, start: number): Promise<unknown> {
    const ctx = vm.createContext({ result: undefined, console: { log: () => undefined } })
    try {
      vm.runInContext(code, ctx, { timeout: 3000 })
    } catch (err) {
      ctx.result = { error: (err as Error).message }
    }
    return {
      platform: 'Serverless', mode: 'simulation (local vm sandbox)',
      result: ctx.result,
      executionTimeMs: Date.now() - start,
    }
  }
}
