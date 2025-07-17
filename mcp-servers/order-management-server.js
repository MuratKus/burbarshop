#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Initialize Prisma
const prisma = new PrismaClient();

// Email function (simplified version of your existing email.ts)
async function sendEmail(data) {
  try {
    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY || !process.env.EMAIL_FROM) {
      console.log('=ç Email would be sent (SendGrid not configured):');
      console.log('To:', data.to);
      console.log('Subject:', data.subject);
      console.log('HTML:', data.html);
      return true;
    }

    // SendGrid integration
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: data.to,
      from: process.env.EMAIL_FROM,
      subject: data.subject,
      html: data.html,
    };
    
    await sgMail.send(msg);
    console.log(' Email sent successfully to:', data.to);
    
    return true;
  } catch (error) {
    console.error('L Email sending error:', error);
    return false;
  }
}

// Email templates
function generateShippingNotificationEmail(order, trackingNumber, trackingUrl) {
  const shippingAddress = JSON.parse(order.shippingAddress);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Order Has Shipped!</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333;">Your Order Has Shipped! =æ</h1>
        <p style="color: #666;">Your Burbar Shop order is on its way!</p>
      </div>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0ea5e9;">
        <h2 style="color: #333; margin-bottom: 15px;">Tracking Information</h2>
        <p><strong>Order ID:</strong> #${order.id.slice(-8).toUpperCase()}</p>
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        <p><strong>Shipped Date:</strong> ${new Date().toLocaleDateString()}</p>
        
        ${trackingUrl ? `
        <div style="text-align: center; margin-top: 20px;">
          <a href="${trackingUrl}" 
             style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Track Your Package
          </a>
        </div>
        ` : ''}
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-bottom: 15px;">Shipping Address</h2>
        <p>${shippingAddress.firstName} ${shippingAddress.lastName}</p>
        <p>${shippingAddress.address}</p>
        <p>${shippingAddress.city}, ${shippingAddress.postalCode}</p>
        <p>${shippingAddress.country}</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-bottom: 15px;">Items Shipped</h2>
        ${order.items.map(item => `
          <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <p><strong>${item.product.title}</strong> (${item.productVariant.size})</p>
            <p>Quantity: ${item.quantity}</p>
          </div>
        `).join('')}
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #666; margin-bottom: 10px;">Questions about your order?</p>
        <a href="${process.env.NEXTAUTH_URL}/orders/${order.id}" 
           style="background-color: #333; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Order Details
        </a>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email. Please do not reply.<br>
          If you have questions, contact us at support@burbarshop.com
        </p>
      </div>
    </body>
    </html>
  `;
}

// Validation schemas
const UpdateOrderStatusSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  tracking_number: z.string().optional(),
  tracking_url: z.string().url().optional(),
  notes: z.string().optional(),
});

const GetOrdersSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  limit: z.number().min(1).max(100).default(20),
  days_back: z.number().min(1).max(365).optional(),
  email: z.string().email().optional(),
});

const GetOrderDetailsSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
});

// Create server instance
const server = new Server(
  {
    name: 'burbar-orders',
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
        name: 'update_order_status',
        description: 'Update order status and send notifications. Requires tracking number when marking as SHIPPED.',
        inputSchema: {
          type: 'object',
          properties: {
            order_id: {
              type: 'string',
              description: 'The order ID to update',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
              description: 'New status for the order',
            },
            tracking_number: {
              type: 'string',
              description: 'Tracking number (required when status is SHIPPED)',
            },
            tracking_url: {
              type: 'string',
              description: 'Full tracking URL for customer convenience',
            },
            notes: {
              type: 'string',
              description: 'Optional notes about the status change',
            },
          },
          required: ['order_id', 'status'],
        },
      },
      {
        name: 'get_orders',
        description: 'Get list of orders with optional filters',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
              description: 'Filter by order status',
            },
            limit: {
              type: 'number',
              description: 'Number of orders to return (1-100, default 20)',
              minimum: 1,
              maximum: 100,
            },
            days_back: {
              type: 'number',
              description: 'Only show orders from the last N days',
              minimum: 1,
              maximum: 365,
            },
            email: {
              type: 'string',
              description: 'Filter by customer email',
            },
          },
        },
      },
      {
        name: 'get_order_details',
        description: 'Get detailed information about a specific order',
        inputSchema: {
          type: 'object',
          properties: {
            order_id: {
              type: 'string',
              description: 'The order ID to retrieve',
            },
          },
          required: ['order_id'],
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
      case 'update_order_status': {
        const validated = UpdateOrderStatusSchema.parse(args);
        
        // Validate tracking number requirement for SHIPPED status
        if (validated.status === 'SHIPPED' && !validated.tracking_number) {
          throw new Error('Tracking number is required when marking order as SHIPPED');
        }

        // Get current order to check if it exists
        const currentOrder = await prisma.order.findUnique({
          where: { id: validated.order_id },
          include: {
            items: {
              include: {
                product: true,
                productVariant: true,
              },
            },
          },
        });

        if (!currentOrder) {
          throw new Error(`Order ${validated.order_id} not found`);
        }

        // Update the order
        const updateData = {
          status: validated.status,
          updatedAt: new Date(),
        };

        if (validated.status === 'SHIPPED') {
          updateData.trackingNumber = validated.tracking_number;
          updateData.trackingUrl = validated.tracking_url;
          updateData.shippedAt = new Date();
        }

        const updatedOrder = await prisma.order.update({
          where: { id: validated.order_id },
          data: updateData,
          include: {
            items: {
              include: {
                product: true,
                productVariant: true,
              },
            },
          },
        });

        // Send email notification for shipped orders
        let emailSent = false;
        if (validated.status === 'SHIPPED') {
          const emailHtml = generateShippingNotificationEmail(
            updatedOrder,
            validated.tracking_number,
            validated.tracking_url
          );

          emailSent = await sendEmail({
            to: updatedOrder.email,
            subject: `Your Burbar Shop order has shipped! #${updatedOrder.id.slice(-8).toUpperCase()}`,
            html: emailHtml,
          });
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                order_id: updatedOrder.id,
                previous_status: currentOrder.status,
                new_status: updatedOrder.status,
                tracking_number: updatedOrder.trackingNumber,
                tracking_url: updatedOrder.trackingUrl,
                shipped_at: updatedOrder.shippedAt,
                email_sent: emailSent,
                customer_email: updatedOrder.email,
                notes: validated.notes,
                updated_at: updatedOrder.updatedAt,
              }, null, 2),
            },
          ],
        };
      }

      case 'get_orders': {
        const validated = GetOrdersSchema.parse(args || {});
        
        const whereConditions = {};
        
        if (validated.status) {
          whereConditions.status = validated.status;
        }
        
        if (validated.email) {
          whereConditions.email = validated.email;
        }
        
        if (validated.days_back) {
          const daysAgo = new Date();
          daysAgo.setDate(daysAgo.getDate() - validated.days_back);
          whereConditions.createdAt = {
            gte: daysAgo,
          };
        }

        const orders = await prisma.order.findMany({
          where: whereConditions,
          include: {
            items: {
              include: {
                product: {
                  select: { title: true, type: true },
                },
                productVariant: {
                  select: { size: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: validated.limit,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                total_orders: orders.length,
                filters_applied: {
                  status: validated.status || 'all',
                  days_back: validated.days_back || 'all time',
                  email: validated.email || 'all customers',
                },
                orders: orders.map(order => ({
                  id: order.id,
                  short_id: order.id.slice(-8).toUpperCase(),
                  status: order.status,
                  email: order.email,
                  total: order.total,
                  items_count: order.items.length,
                  tracking_number: order.trackingNumber,
                  shipped_at: order.shippedAt,
                  created_at: order.createdAt,
                  items: order.items.map(item => ({
                    product: item.product.title,
                    size: item.productVariant.size,
                    quantity: item.quantity,
                    price: item.price,
                  })),
                })),
              }, null, 2),
            },
          ],
        };
      }

      case 'get_order_details': {
        const validated = GetOrderDetailsSchema.parse(args);
        
        const order = await prisma.order.findUnique({
          where: { id: validated.order_id },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            items: {
              include: {
                product: true,
                productVariant: true,
              },
            },
          },
        });

        if (!order) {
          throw new Error(`Order ${validated.order_id} not found`);
        }

        const shippingAddress = JSON.parse(order.shippingAddress);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                id: order.id,
                short_id: order.id.slice(-8).toUpperCase(),
                status: order.status,
                email: order.email,
                customer: order.user,
                subtotal: order.subtotal,
                shipping_cost: order.shippingCost,
                total: order.total,
                payment_method: order.paymentMethod,
                payment_id: order.paymentId,
                tracking_number: order.trackingNumber,
                tracking_url: order.trackingUrl,
                shipped_at: order.shippedAt,
                created_at: order.createdAt,
                updated_at: order.updatedAt,
                shipping_address: shippingAddress,
                items: order.items.map(item => ({
                  id: item.id,
                  product: {
                    id: item.product.id,
                    title: item.product.title,
                    type: item.product.type,
                  },
                  variant: {
                    id: item.productVariant.id,
                    size: item.productVariant.size,
                  },
                  quantity: item.quantity,
                  price: item.price,
                  total: item.quantity * item.price,
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
  console.error('Burbar Order Management MCP server running on stdio');
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main().catch(async (error) => {
  console.error('Server error:', error);
  await prisma.$disconnect();
  process.exit(1);
});