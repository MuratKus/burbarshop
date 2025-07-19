/**
 * Enhanced client-side error logging for debugging performance issues
 */
import * as React from 'react'

interface LogEvent {
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  timestamp: number
  url?: string
  stack?: string
  userAgent?: string
  component?: string
  props?: any
  performance?: {
    memory?: number
    timing?: any
  }
}

class ClientLogger {
  private logs: LogEvent[] = []
  private maxLogs = 100
  private isClient = typeof window !== 'undefined'

  constructor() {
    // Only set up client-side monitoring if we're in the browser
    if (!this.isClient) return
    
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.error('Unhandled Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    })

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      })
    })

    // Monitor performance issues
    this.monitorPerformance()
  }

  private createLogEvent(level: LogEvent['level'], message: string, extra?: any): LogEvent {
    return {
      level,
      message,
      timestamp: Date.now(),
      url: this.isClient ? window.location.href : 'server',
      userAgent: this.isClient ? navigator.userAgent : 'server',
      performance: this.isClient ? this.getPerformanceData() : undefined,
      ...extra
    }
  }

  private getPerformanceData() {
    if (!this.isClient) return undefined
    
    const data: any = {}
    
    // Memory usage (if available)
    if ('memory' in performance) {
      data.memory = (performance as any).memory.usedJSHeapSize
    }
    
    // Navigation timing
    if (performance.timing) {
      data.timing = {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
      }
    }

    return data
  }

  private monitorPerformance() {
    if (!this.isClient) return
    
    // Monitor long tasks (if supported)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) { // Long task > 50ms
              this.warn('Long Task Detected', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              })
            }
          })
        })
        observer.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        // PerformanceObserver not supported
      }
    }

    // Monitor memory usage periodically
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usedMB = memory.usedJSHeapSize / 1024 / 1024
        
        if (usedMB > 100) { // Alert if using > 100MB
          this.warn('High Memory Usage', {
            usedMB: Math.round(usedMB),
            totalMB: Math.round(memory.totalJSHeapSize / 1024 / 1024),
            limitMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
          })
        }
      }
    }, 10000) // Check every 10 seconds
  }

  private addLog(log: LogEvent) {
    this.logs.push(log)
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Console output with styling
    const style = {
      error: 'color: #ef4444; font-weight: bold',
      warn: 'color: #f59e0b; font-weight: bold',
      info: 'color: #3b82f6',
      debug: 'color: #6b7280'
    }

    console.log(`%c[${log.level.toUpperCase()}] ${log.message}`, style[log.level], log)
  }

  error(message: string, extra?: any) {
    const log = this.createLogEvent('error', message, extra)
    this.addLog(log)
    
    // Send critical errors to server if needed
    if (this.isClient) {
      fetch('/api/client-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      }).catch(() => {}) // Fail silently
    }
  }

  warn(message: string, extra?: any) {
    this.addLog(this.createLogEvent('warn', message, extra))
  }

  info(message: string, extra?: any) {
    this.addLog(this.createLogEvent('info', message, extra))
  }

  debug(message: string, extra?: any) {
    this.addLog(this.createLogEvent('debug', message, extra))
  }

  // Component-specific logging
  logComponentMount(componentName: string, props?: any) {
    this.debug(`Component Mounted: ${componentName}`, { component: componentName, props })
  }

  logComponentUnmount(componentName: string) {
    this.debug(`Component Unmounted: ${componentName}`, { component: componentName })
  }

  logRender(componentName: string, renderCount: number, props?: any) {
    if (renderCount > 10) {
      this.warn(`Excessive Renders: ${componentName}`, { 
        component: componentName, 
        renderCount,
        props 
      })
    }
  }

  logAPICall(url: string, method: string, duration: number) {
    if (duration > 2000) {
      this.warn('Slow API Call', { url, method, duration })
    } else {
      this.debug('API Call', { url, method, duration })
    }
  }

  // Get all logs for debugging
  getLogs() {
    return this.logs
  }

  // Export logs for analysis
  exportLogs() {
    if (!this.isClient) {
      console.log('Export logs not available on server')
      return
    }
    
    const dataStr = JSON.stringify(this.logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `client-logs-${new Date().toISOString()}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  // Clear logs
  clearLogs() {
    this.logs = []
    this.info('Logs cleared')
  }
}

// Global logger instance
export const logger = new ClientLogger()

// Helper hook for React components
export function useClientLogger(componentName: string) {
  const renderCountRef = React.useRef(0)
  
  React.useEffect(() => {
    logger.logComponentMount(componentName)
    return () => logger.logComponentUnmount(componentName)
  }, [componentName])

  React.useEffect(() => {
    renderCountRef.current++
    logger.logRender(componentName, renderCountRef.current)
  })

  return {
    error: (message: string, extra?: any) => logger.error(`[${componentName}] ${message}`, extra),
    warn: (message: string, extra?: any) => logger.warn(`[${componentName}] ${message}`, extra),
    info: (message: string, extra?: any) => logger.info(`[${componentName}] ${message}`, extra),
    debug: (message: string, extra?: any) => logger.debug(`[${componentName}] ${message}`, extra),
  }
}

// Make logger available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).logger = logger
}