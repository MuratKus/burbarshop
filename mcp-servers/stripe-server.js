#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import Stripe from 'stripe';
import { z } from 'zod';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Validation schemas
const RefundSchema = z.object({
  payment_intent_id: z.string().min(1, "Payment Intent ID is required"),
  amount: z.number().positive().optional(),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
  metadata: z.record(z.string()).optional()
});

const RetrievePaymentSchema = z.object({
  payment_intent_id: z.string().min(1, "Payment Intent ID is required")
});

const ListPaymentsSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  created_after: z.string().optional(),
  created_before: z.string().optional(),
  customer_id: z.string().optional()
});

// Create server instance
const server = new Server(
  {
    name: 'burbar-stripe',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'process_refund',
        description: 'Process a refund for a Stripe payment',
        inputSchema: {
          type: 'object',
          properties: {
            payment_intent_id: {
              type: 'string',
              description: 'The Stripe Payment Intent ID to refund',
            },
            amount: {
              type: 'number',
              description: 'Amount to refund in cents (optional, defaults to full amount)',
            },
            reason: {
              type: 'string',
              enum: ['duplicate', 'fraudulent', 'requested_by_customer'],
              description: 'Reason for the refund',
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata for the refund',
            },
          },
          required: ['payment_intent_id'],
        },
      },
      {
        name: 'retrieve_payment',
        description: 'Retrieve details of a Stripe payment',
        inputSchema: {
          type: 'object',
          properties: {
            payment_intent_id: {
              type: 'string',
              description: 'The Stripe Payment Intent ID to retrieve',
            },
          },
          required: ['payment_intent_id'],
        },
      },
      {
        name: 'list_recent_payments',
        description: 'List recent payments with optional filters',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of payments to retrieve (1-100)',
              minimum: 1,
              maximum: 100,
            },
            created_after: {
              type: 'string',
              description: 'ISO date string - only payments created after this date',
            },
            created_before: {
              type: 'string',
              description: 'ISO date string - only payments created before this date',
            },
            customer_id: {
              type: 'string',
              description: 'Filter by specific customer ID',
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'process_refund': {
        const validated = RefundSchema.parse(args);
        
        // Create the refund
        const refund = await stripe.refunds.create({
          payment_intent: validated.payment_intent_id,
          amount: validated.amount,
          reason: validated.reason,
          metadata: validated.metadata || {},
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                refund_id: refund.id,
                amount_refunded: refund.amount,
                status: refund.status,
                reason: refund.reason,
                created: new Date(refund.created * 1000).toISOString(),
                payment_intent: refund.payment_intent,
              }, null, 2),
            },
          ],
        };
      }

      case 'retrieve_payment': {
        const validated = RetrievePaymentSchema.parse(args);
        
        // Retrieve the payment intent
        const payment = await stripe.paymentIntents.retrieve(validated.payment_intent_id, {
          expand: ['charges', 'customer'],
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                id: payment.id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                created: new Date(payment.created * 1000).toISOString(),
                customer: payment.customer,
                description: payment.description,
                metadata: payment.metadata,
                charges: payment.charges?.data?.map(charge => ({
                  id: charge.id,
                  amount: charge.amount,
                  status: charge.status,
                  receipt_url: charge.receipt_url,
                  refunded: charge.refunded,
                  amount_refunded: charge.amount_refunded,
                })),
              }, null, 2),
            },
          ],
        };
      }

      case 'list_recent_payments': {
        const validated = ListPaymentsSchema.parse(args || {});
        
        const params = {
          limit: validated.limit || 10,
          expand: ['data.customer'],
        };

        if (validated.created_after) {
          params.created = { gte: Math.floor(new Date(validated.created_after).getTime() / 1000) };
        }
        if (validated.created_before) {
          params.created = { 
            ...params.created,
            lte: Math.floor(new Date(validated.created_before).getTime() / 1000) 
          };
        }
        if (validated.customer_id) {
          params.customer = validated.customer_id;
        }

        const payments = await stripe.paymentIntents.list(params);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                total_count: payments.data.length,
                has_more: payments.has_more,
                payments: payments.data.map(payment => ({
                  id: payment.id,
                  amount: payment.amount,
                  currency: payment.currency,
                  status: payment.status,
                  created: new Date(payment.created * 1000).toISOString(),
                  customer: payment.customer,
                  description: payment.description,
                  metadata: payment.metadata,
                })),
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: 'text',
            text: `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Burbar Stripe MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});