/**
 * Monitoring System - Real-time Observability
 */

export class MonitoringSystem {
  private metrics: Map<string, number> = new Map()
  private logs: string[] = []

  recordMetric(name: string, value: number): void {
    this.metrics.set(name, value)
    console.log(`📊 Metric recorded: ${name} = ${value}`)
  }

  recordLog(message: string): void {
    this.logs.push(message)
    console.log(`📝 Log: ${message}`)
  }

  getMetrics(): Map<string, number> {
    return this.metrics
  }

  getLogs(): string[] {
    return this.logs
  }
}
