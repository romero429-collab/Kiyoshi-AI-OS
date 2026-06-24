/**
 * Monitoring & Observability System (MOB-Ω)
 * Real-time monitoring, logging, and metrics
 */

export class MonitoringObservabilitySystem {
  private metrics: Map<string, MetricTimeSeries> = new Map()
  private logs: LogEntry[] = []
  private alerts: Alert[] = []
  private traces: Trace[] = []

  constructor() {
    console.log(`📊 Monitoring & Observability System initialized`)
  }

  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, new MetricTimeSeries(name))
    }
    this.metrics.get(name)!.addPoint(value, tags)
  }

  recordLog(level: string, message: string, context?: any): void {
    const entry = new LogEntry(level, message, context)
    this.logs.push(entry)

    if (level === 'ERROR' || level === 'CRITICAL') {
      console.error(`📋 [${level}] ${message}`)
    } else if (level === 'WARN') {
      console.warn(`📋 [${level}] ${message}`)
    } else {
      console.log(`📋 [${level}] ${message}`)
    }
  }

  createAlert(condition: string, severity: string, handler: () => void): void {
    const alert = new Alert(condition, severity, handler)
    this.alerts.push(alert)
    console.log(`🚨 Alert created: ${condition} (${severity})`)
  }

  startTrace(operationName: string): Trace {
    const trace = new Trace(operationName)
    this.traces.push(trace)
    return trace
  }

  async generateReport(): Promise<MonitoringReport> {
    console.log(`📊 Generating monitoring report...`)

    const metricsData: any = {}
    for (const [name, series] of this.metrics) {
      metricsData[name] = {
        current: series.getCurrentValue(),
        average: series.getAverage(),
        min: series.getMin(),
        max: series.getMax()
      }
    }

    return {
      timestamp: Date.now(),
      metrics: metricsData,
      logCount: this.logs.length,
      alertsTriggered: this.alerts.filter(a => a.triggered).length,
      tracesRecorded: this.traces.length,
      health: 'healthy'
    }
  }

  getMetrics(): Map<string, MetricTimeSeries> {
    return this.metrics
  }
}

class MetricTimeSeries {
  name: string
  points: { timestamp: number; value: number; tags?: Record<string, string> }[] = []

  constructor(name: string) {
    this.name = name
  }

  addPoint(value: number, tags?: Record<string, string>): void {
    this.points.push({ timestamp: Date.now(), value, tags })
    // Keep only last 1000 points
    if (this.points.length > 1000) {
      this.points.shift()
    }
  }

  getCurrentValue(): number {
    return this.points.length > 0 ? this.points[this.points.length - 1].value : 0
  }

  getAverage(): number {
    if (this.points.length === 0) return 0
    const sum = this.points.reduce((acc, p) => acc + p.value, 0)
    return sum / this.points.length
  }

  getMin(): number {
    if (this.points.length === 0) return 0
    return Math.min(...this.points.map(p => p.value))
  }

  getMax(): number {
    if (this.points.length === 0) return 0
    return Math.max(...this.points.map(p => p.value))
  }
}

class LogEntry {
  level: string
  message: string
  context: any
  timestamp: number

  constructor(level: string, message: string, context?: any) {
    this.level = level
    this.message = message
    this.context = context
    this.timestamp = Date.now()
  }
}

class Alert {
  condition: string
  severity: string
  handler: () => void
  triggered: boolean = false

  constructor(condition: string, severity: string, handler: () => void) {
    this.condition = condition
    this.severity = severity
    this.handler = handler
  }
}

class Trace {
  id: string
  operationName: string
  startTime: number
  endTime?: number
  spans: Span[] = []

  constructor(operationName: string) {
    this.id = `trace-${Date.now()}`
    this.operationName = operationName
    this.startTime = Date.now()
  }

  finish(): void {
    this.endTime = Date.now()
  }
}

class Span {
  traceId: string
  spanId: string
  operationName: string

  constructor(traceId: string, operationName: string) {
    this.traceId = traceId
    this.spanId = `span-${Date.now()}`
    this.operationName = operationName
  }
}

interface MonitoringReport {
  timestamp: number
  metrics: any
  logCount: number
  alertsTriggered: number
  tracesRecorded: number
  health: string
}

export { MonitoringObservabilitySystem as MOB }
