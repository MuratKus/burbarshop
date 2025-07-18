import { NextRequest, NextResponse } from 'next/server'
import { usageMonitor, ServiceMonitors } from '@/lib/monitoring'

export async function GET(request: NextRequest) {
  try {
    // Update current usage from all services
    ServiceMonitors.vercel.recordFunctionInvocation()
    ServiceMonitors.neon.recordDatabaseQuery()
    ServiceMonitors.stripe.recordAPICall()
    ServiceMonitors.resend.recordEmailSent()
    
    // Get warnings and current status
    const warnings = usageMonitor.getWarnings()
    const allServices = ['vercel', 'neon', 'stripe', 'resend']
    
    const serviceStatus = allServices.map(service => {
      const usage = usageMonitor.getUsage(service)
      return {
        service,
        metrics: usage,
        status: usage.some(u => u.percentage >= 85) ? 'critical' :
                usage.some(u => u.percentage >= 70) ? 'warning' : 'healthy'
      }
    })
    
    return NextResponse.json({
      status: warnings.length === 0 ? 'healthy' : 'warning',
      services: serviceStatus,
      warnings: warnings.map(w => ({
        service: w.service,
        metric: w.metric,
        percentage: Math.round(w.percentage),
        current: w.current,
        limit: w.limit,
        message: `${w.service} ${w.metric} at ${w.percentage.toFixed(1)}%`
      })),
      lastCheck: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Usage check failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check usage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { service, metric, current, limit } = body
    
    if (!service || !metric || current === undefined || limit === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: service, metric, current, limit' },
        { status: 400 }
      )
    }
    
    // Record custom usage
    usageMonitor.recordUsage(service, metric, current, limit)
    
    return NextResponse.json({
      success: true,
      recorded: {
        service,
        metric,
        current,
        limit,
        percentage: (current / limit) * 100
      }
    })
    
  } catch (error) {
    console.error('Failed to record usage:', error)
    return NextResponse.json(
      {
        error: 'Failed to record usage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}