/**
 * Service Usage Monitoring & Quota Alerts
 * 
 * Monitors usage across all external services to prevent quota overruns
 * and unexpected charges.
 */

interface UsageMetrics {
  service: string
  metric: string
  current: number
  limit: number
  percentage: number
  timestamp: Date
}

interface AlertThreshold {
  service: string
  metric: string
  warningAt: number  // percentage
  criticalAt: number // percentage
  blockAt: number   // percentage (optional)
}

// Define usage thresholds for all services
const ALERT_THRESHOLDS: AlertThreshold[] = [
  // Vercel
  { service: 'vercel', metric: 'function_invocations', warningAt: 70, criticalAt: 85, blockAt: 95 },
  { service: 'vercel', metric: 'bandwidth', warningAt: 70, criticalAt: 85, blockAt: 95 },
  { service: 'vercel', metric: 'edge_requests', warningAt: 70, criticalAt: 85, blockAt: 95 },
  
  // Neon PostgreSQL
  { service: 'neon', metric: 'compute_hours', warningAt: 70, criticalAt: 85, blockAt: 95 },
  { service: 'neon', metric: 'storage_gb', warningAt: 70, criticalAt: 85, blockAt: 95 },
  { service: 'neon', metric: 'data_transfer', warningAt: 70, criticalAt: 85, blockAt: 95 },
  
  // Stripe
  { service: 'stripe', metric: 'api_requests', warningAt: 80, criticalAt: 90, blockAt: 98 },
  { service: 'stripe', metric: 'webhook_endpoints', warningAt: 80, criticalAt: 90, blockAt: 95 },
  
  // Resend
  { service: 'resend', metric: 'emails_sent', warningAt: 70, criticalAt: 85, blockAt: 95 },
  { service: 'resend', metric: 'api_requests', warningAt: 80, criticalAt: 90, blockAt: 95 },
]

class UsageMonitor {
  private metrics: Map<string, UsageMetrics> = new Map()
  
  /**
   * Record usage for a service metric
   */
  recordUsage(service: string, metric: string, current: number, limit: number) {
    const key = `${service}:${metric}`
    const percentage = (current / limit) * 100
    
    const usage: UsageMetrics = {
      service,
      metric,
      current,
      limit,
      percentage,
      timestamp: new Date()
    }
    
    this.metrics.set(key, usage)
    
    // Check thresholds
    this.checkThresholds(usage)
  }
  
  /**
   * Check if usage exceeds alert thresholds
   */
  private checkThresholds(usage: UsageMetrics) {
    const threshold = ALERT_THRESHOLDS.find(
      t => t.service === usage.service && t.metric === usage.metric
    )
    
    if (!threshold) return
    
    const { percentage } = usage
    
    if (percentage >= threshold.blockAt!) {
      this.triggerAlert('BLOCK', usage, threshold)
      throw new Error(`🚨 USAGE BLOCKED: ${usage.service} ${usage.metric} at ${percentage.toFixed(1)}% (${usage.current}/${usage.limit})`)
    } else if (percentage >= threshold.criticalAt) {
      this.triggerAlert('CRITICAL', usage, threshold)
    } else if (percentage >= threshold.warningAt) {
      this.triggerAlert('WARNING', usage, threshold)
    }
  }
  
  /**
   * Trigger appropriate alert based on severity
   */
  private triggerAlert(level: 'WARNING' | 'CRITICAL' | 'BLOCK', usage: UsageMetrics, threshold: AlertThreshold) {
    const message = `${level}: ${usage.service} ${usage.metric} at ${usage.percentage.toFixed(1)}% (${usage.current}/${usage.limit})`
    
    console.warn(`🚨 ${message}`)
    
    // In production, you might want to:
    // - Send to monitoring service (DataDog, New Relic, etc.)
    // - Send Slack/Discord notifications
    // - Send email alerts
    // - Log to external service
    
    if (level === 'CRITICAL' || level === 'BLOCK') {
      // Could integrate with external alerting here
      this.sendCriticalAlert(message, usage)
    }
  }
  
  /**
   * Send critical alerts to external services
   */
  private async sendCriticalAlert(message: string, usage: UsageMetrics) {
    try {
      // Example: Send to Discord webhook (if configured)
      if (process.env.DISCORD_WEBHOOK_URL) {
        await fetch(process.env.DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🚨 **USAGE ALERT** 🚨\n\n${message}\n\nTime: ${usage.timestamp.toISOString()}`
          })
        })
      }
      
      // Example: Log to external monitoring service
      if (process.env.MONITORING_ENDPOINT) {
        await fetch(process.env.MONITORING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alert_level: 'CRITICAL',
            service: usage.service,
            metric: usage.metric,
            percentage: usage.percentage,
            current: usage.current,
            limit: usage.limit,
            timestamp: usage.timestamp.toISOString()
          })
        })
      }
    } catch (error) {
      console.error('Failed to send critical alert:', error)
    }
  }
  
  /**
   * Get current usage for a service
   */
  getUsage(service: string, metric?: string): UsageMetrics[] {
    if (metric) {
      const usage = this.metrics.get(`${service}:${metric}`)
      return usage ? [usage] : []
    }
    
    return Array.from(this.metrics.values()).filter(u => u.service === service)
  }
  
  /**
   * Get all services approaching limits
   */
  getWarnings(): UsageMetrics[] {
    return Array.from(this.metrics.values()).filter(usage => {
      const threshold = ALERT_THRESHOLDS.find(
        t => t.service === usage.service && t.metric === usage.metric
      )
      return threshold && usage.percentage >= threshold.warningAt
    })
  }
  
  /**
   * Check if service usage should be blocked
   */
  shouldBlock(service: string, metric: string): boolean {
    const usage = this.metrics.get(`${service}:${metric}`)
    if (!usage) return false
    
    const threshold = ALERT_THRESHOLDS.find(
      t => t.service === service && t.metric === metric
    )
    
    return threshold?.blockAt ? usage.percentage >= threshold.blockAt : false
  }
}

// Global usage monitor instance
export const usageMonitor = new UsageMonitor()

/**
 * Middleware to check usage before API calls
 */
export function withUsageCheck(service: string, metric: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      // Check if usage is blocked before proceeding
      if (usageMonitor.shouldBlock(service, metric)) {
        throw new Error(`🚫 Service temporarily blocked due to usage limits: ${service} ${metric}`)
      }
      
      // Proceed with original method
      return await method.apply(this, args)
    }
    
    return descriptor
  }
}

/**
 * Utility functions for specific services
 */
export const ServiceMonitors = {
  vercel: {
    recordFunctionInvocation: () => {
      // This would typically get real metrics from Vercel API
      // For now, we'll simulate based on environment
      const isProduction = process.env.NODE_ENV === 'production'
      const limit = isProduction ? 1000000 : 1000 // Example limits
      const current = Math.floor(Math.random() * limit * 0.3) // Simulate usage
      
      usageMonitor.recordUsage('vercel', 'function_invocations', current, limit)
    }
  },
  
  neon: {
    recordDatabaseQuery: () => {
      // Would get real metrics from Neon API
      const limit = 1000000 // Example: 1M queries per month
      const current = Math.floor(Math.random() * limit * 0.2)
      
      usageMonitor.recordUsage('neon', 'compute_hours', current, limit)
    }
  },
  
  stripe: {
    recordAPICall: () => {
      // Would get real metrics from Stripe API
      const limit = 100000 // Example: 100k API calls per month
      const current = Math.floor(Math.random() * limit * 0.1)
      
      usageMonitor.recordUsage('stripe', 'api_requests', current, limit)
    }
  },
  
  resend: {
    recordEmailSent: () => {
      // Would get real metrics from Resend API
      const limit = 3000 // Free tier: 3k emails per month
      const current = Math.floor(Math.random() * limit * 0.5)
      
      usageMonitor.recordUsage('resend', 'emails_sent', current, limit)
    }
  }
}

/**
 * Usage monitoring middleware for API routes
 */
export function createUsageMiddleware(service: string, metric: string) {
  return (req: any, res: any, next: () => void) => {
    // Record usage before processing request
    ServiceMonitors[service as keyof typeof ServiceMonitors]?.recordAPICall?.()
    
    // Check if we should block the request
    if (usageMonitor.shouldBlock(service, metric)) {
      return res.status(429).json({
        error: 'Service temporarily unavailable due to usage limits',
        service,
        metric,
        retryAfter: '1 hour'
      })
    }
    
    next()
  }
}