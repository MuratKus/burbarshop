#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

// Vercel API client
class VercelClient {
  constructor(token) {
    this.token = token
    this.baseUrl = 'https://api.vercel.com'
    this.headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: { ...this.headers, ...options.headers }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(`Vercel API Error: ${response.status} - ${error.error?.message || error.message}`)
    }

    return response.json()
  }

  async listDeployments(projectId, limit = 20) {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (projectId) {
      params.append('projectId', projectId)
    }
    return this.request(`/v6/deployments?${params}`)
  }

  async getDeployment(deploymentId) {
    return this.request(`/v13/deployments/${deploymentId}`)
  }

  async deleteDeployment(deploymentId) {
    return this.request(`/v13/deployments/${deploymentId}`, {
      method: 'DELETE'
    })
  }

  async listProjects() {
    return this.request('/v9/projects')
  }

  async getProject(projectId) {
    return this.request(`/v9/projects/${projectId}`)
  }

  async cancelDeployment(deploymentId) {
    return this.request(`/v12/deployments/${deploymentId}/cancel`, {
      method: 'PATCH'
    })
  }

  async getDeploymentLogs(deploymentId) {
    return this.request(`/v2/deployments/${deploymentId}/events`)
  }
}

// Validation schemas
const ListDeploymentsSchema = z.object({
  projectId: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  status: z.enum(['BUILDING', 'ERROR', 'INITIALIZING', 'QUEUED', 'READY', 'CANCELED']).optional()
})

const DeploymentIdSchema = z.object({
  deploymentId: z.string().min(1, 'Deployment ID is required')
})

const CleanupDeploymentsSchema = z.object({
  projectId: z.string().optional(),
  keepCount: z.number().min(1).max(50).default(5),
  olderThanDays: z.number().min(1).default(7),
  excludeProduction: z.boolean().default(true)
})

// Initialize MCP server
const server = new Server(
  {
    name: 'burbar-vercel',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// Get Vercel token from environment
const VERCEL_TOKEN = process.env.VERCEL_TOKEN
if (!VERCEL_TOKEN) {
  console.error('VERCEL_TOKEN environment variable is required')
  process.exit(1)
}

const vercel = new VercelClient(VERCEL_TOKEN)

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_deployments',
        description: 'List Vercel deployments for a project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project ID to filter deployments (optional)'
            },
            limit: {
              type: 'number',
              description: 'Number of deployments to return (1-100, default: 20)',
              minimum: 1,
              maximum: 100,
              default: 20
            },
            status: {
              type: 'string',
              enum: ['BUILDING', 'ERROR', 'INITIALIZING', 'QUEUED', 'READY', 'CANCELED'],
              description: 'Filter by deployment status (optional)'
            }
          }
        }
      },
      {
        name: 'get_deployment',
        description: 'Get detailed information about a specific deployment',
        inputSchema: {
          type: 'object',
          properties: {
            deploymentId: {
              type: 'string',
              description: 'The deployment ID to get details for'
            }
          },
          required: ['deploymentId']
        }
      },
      {
        name: 'delete_deployment',
        description: 'Safely delete a specific deployment (non-production only)',
        inputSchema: {
          type: 'object',
          properties: {
            deploymentId: {
              type: 'string',
              description: 'The deployment ID to delete'
            }
          },
          required: ['deploymentId']
        }
      },
      {
        name: 'cleanup_old_deployments',
        description: 'Safely cleanup old deployments while preserving recent and production ones',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project ID to cleanup (optional - will use all projects if not specified)'
            },
            keepCount: {
              type: 'number',
              description: 'Number of recent deployments to keep (default: 5)',
              minimum: 1,
              maximum: 50,
              default: 5
            },
            olderThanDays: {
              type: 'number',
              description: 'Only delete deployments older than this many days (default: 7)',
              minimum: 1,
              default: 7
            },
            excludeProduction: {
              type: 'boolean',
              description: 'Exclude production deployments from cleanup (default: true)',
              default: true
            }
          }
        }
      },
      {
        name: 'list_projects',
        description: 'List all Vercel projects',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'cancel_deployment',
        description: 'Cancel a deployment that is currently building',
        inputSchema: {
          type: 'object',
          properties: {
            deploymentId: {
              type: 'string',
              description: 'The deployment ID to cancel'
            }
          },
          required: ['deploymentId']
        }
      },
      {
        name: 'get_deployment_logs',
        description: 'Get build and runtime logs for a deployment',
        inputSchema: {
          type: 'object',
          properties: {
            deploymentId: {
              type: 'string',
              description: 'The deployment ID to get logs for'
            }
          },
          required: ['deploymentId']
        }
      }
    ]
  }
})

// Tool implementations
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'list_deployments': {
        const validated = ListDeploymentsSchema.parse(args || {})
        const result = await vercel.listDeployments(validated.projectId, validated.limit)
        
        // Filter by status if provided
        let deployments = result.deployments || []
        if (validated.status) {
          deployments = deployments.filter(d => d.state === validated.status)
        }

        const formatted = deployments.map(d => ({
          id: d.uid,
          url: d.url,
          state: d.state,
          createdAt: d.createdAt,
          projectId: d.projectId,
          target: d.target || 'preview',
          source: d.source || 'git'
        }))

        return {
          content: [
            {
              type: 'text',
              text: `Found ${formatted.length} deployments:\n\n` +
                    formatted.map(d => 
                      `• ${d.state} - ${d.url}\n  ID: ${d.id}\n  Created: ${new Date(d.createdAt).toLocaleString()}\n  Target: ${d.target}\n`
                    ).join('\n')
            }
          ]
        }
      }

      case 'get_deployment': {
        const validated = DeploymentIdSchema.parse(args || {})
        const deployment = await vercel.getDeployment(validated.deploymentId)

        return {
          content: [
            {
              type: 'text',
              text: `Deployment Details:\n\n` +
                    `ID: ${deployment.uid}\n` +
                    `URL: ${deployment.url}\n` +
                    `State: ${deployment.state}\n` +
                    `Created: ${new Date(deployment.createdAt).toLocaleString()}\n` +
                    `Project: ${deployment.projectId}\n` +
                    `Target: ${deployment.target || 'preview'}\n` +
                    `Source: ${deployment.source || 'git'}\n` +
                    `Build Duration: ${deployment.buildingAt && deployment.readyStateAt ? 
                      Math.round((deployment.readyStateAt - deployment.buildingAt) / 1000) + 's' : 'N/A'}`
            }
          ]
        }
      }

      case 'delete_deployment': {
        const validated = DeploymentIdSchema.parse(args || {})
        
        // Get deployment details first to check if it's safe to delete
        const deployment = await vercel.getDeployment(validated.deploymentId)
        
        if (deployment.target === 'production') {
          throw new Error('Cannot delete production deployments for safety reasons. Use Vercel dashboard for production changes.')
        }

        await vercel.deleteDeployment(validated.deploymentId)

        return {
          content: [
            {
              type: 'text',
              text: `✅ Successfully deleted deployment: ${deployment.url}\n` +
                    `ID: ${validated.deploymentId}\n` +
                    `State was: ${deployment.state}`
            }
          ]
        }
      }

      case 'cleanup_old_deployments': {
        const validated = CleanupDeploymentsSchema.parse(args || {})
        const cutoffDate = new Date(Date.now() - (validated.olderThanDays * 24 * 60 * 60 * 1000))
        
        const result = await vercel.listDeployments(validated.projectId, 100)
        const deployments = result.deployments || []
        
        // Filter deployments for cleanup
        const toDelete = deployments
          .filter(d => new Date(d.createdAt) < cutoffDate)
          .filter(d => !validated.excludeProduction || d.target !== 'production')
          .filter(d => d.state !== 'BUILDING') // Don't delete building deployments
          .slice(validated.keepCount) // Keep the most recent ones
        
        let deleted = []
        let errors = []

        for (const deployment of toDelete) {
          try {
            await vercel.deleteDeployment(deployment.uid)
            deleted.push(deployment)
          } catch (error) {
            errors.push({ deployment: deployment.uid, error: error.message })
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `Cleanup Results:\n\n` +
                    `✅ Deleted ${deleted.length} deployments\n` +
                    `❌ Failed to delete ${errors.length} deployments\n\n` +
                    `Deleted:\n` +
                    deleted.map(d => `• ${d.url} (${new Date(d.createdAt).toLocaleDateString()})`).join('\n') +
                    (errors.length > 0 ? '\n\nErrors:\n' + errors.map(e => `• ${e.deployment}: ${e.error}`).join('\n') : '')
            }
          ]
        }
      }

      case 'list_projects': {
        const result = await vercel.listProjects()
        const projects = result.projects || []

        return {
          content: [
            {
              type: 'text',
              text: `Found ${projects.length} projects:\n\n` +
                    projects.map(p => 
                      `• ${p.name}\n  ID: ${p.id}\n  Framework: ${p.framework || 'Unknown'}\n  Created: ${new Date(p.createdAt).toLocaleDateString()}\n`
                    ).join('\n')
            }
          ]
        }
      }

      case 'cancel_deployment': {
        const validated = DeploymentIdSchema.parse(args || {})
        await vercel.cancelDeployment(validated.deploymentId)

        return {
          content: [
            {
              type: 'text',
              text: `✅ Successfully cancelled deployment: ${validated.deploymentId}`
            }
          ]
        }
      }

      case 'get_deployment_logs': {
        const validated = DeploymentIdSchema.parse(args || {})
        const logs = await vercel.getDeploymentLogs(validated.deploymentId)

        return {
          content: [
            {
              type: 'text',
              text: `Deployment Logs:\n\n` +
                    (logs.length > 0 ? 
                      logs.slice(-20).map(log => `[${new Date(log.created).toLocaleTimeString()}] ${log.text}`).join('\n') :
                      'No logs available for this deployment')
            }
          ]
        }
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid parameters: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      )
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error.message}`
    )
  }
})

// Start the server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Vercel MCP server running on stdio')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}