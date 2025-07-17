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

// Validation schemas
const AnalyticsSchema = z.object({
  days_back: z.number().min(1).max(365).default(30),
});

const InventorySchema = z.object({
  low_stock_threshold: z.number().min(0).default(5),
});

const CustomerStatsSchema = z.object({
  days_back: z.number().min(1).max(365).default(30),
});

const ProductPerformanceSchema = z.object({
  days_back: z.number().min(1).max(365).default(30),
  limit: z.number().min(1).max(50).default(10),
});

// Create server instance
const server = new Server(
  {
    name: 'burbar-database',
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
        name: 'get_sales_analytics',
        description: 'Get sales analytics and revenue data',
        inputSchema: {
          type: 'object',
          properties: {
            days_back: {
              type: 'number',
              description: 'Number of days to look back for analytics (1-365, default 30)',
              minimum: 1,
              maximum: 365,
            },
          },
        },
      },
      {
        name: 'check_inventory',
        description: 'Check inventory levels and identify low stock items',
        inputSchema: {
          type: 'object',
          properties: {
            low_stock_threshold: {
              type: 'number',
              description: 'Items with stock below this number are considered low stock (default 5)',
              minimum: 0,
            },
          },
        },
      },
      {
        name: 'get_customer_stats',
        description: 'Get customer statistics and behavior insights',
        inputSchema: {
          type: 'object',
          properties: {
            days_back: {
              type: 'number',
              description: 'Number of days to look back for customer data (1-365, default 30)',
              minimum: 1,
              maximum: 365,
            },
          },
        },
      },
      {
        name: 'get_product_performance',
        description: 'Get best and worst performing products',
        inputSchema: {
          type: 'object',
          properties: {
            days_back: {
              type: 'number',
              description: 'Number of days to look back for product data (1-365, default 30)',
              minimum: 1,
              maximum: 365,
            },
            limit: {
              type: 'number',
              description: 'Number of products to return (1-50, default 10)',
              minimum: 1,
              maximum: 50,
            },
          },
        },
      },
      {
        name: 'get_order_trends',
        description: 'Get order trends and patterns over time',
        inputSchema: {
          type: 'object',
          properties: {
            days_back: {
              type: 'number',
              description: 'Number of days to look back for trend data (1-365, default 30)',
              minimum: 1,
              maximum: 365,
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
      case 'get_sales_analytics': {
        const validated = AnalyticsSchema.parse(args || {});
        
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - validated.days_back);

        // Get orders in the time period
        const orders = await prisma.order.findMany({
          where: {
            createdAt: { gte: daysAgo },
            status: { not: 'CANCELLED' },
          },
          include: {
            items: true,
          },
        });

        // Calculate metrics
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalItems = orders.reduce((sum, order) => 
          sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Group by status
        const ordersByStatus = orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {});

        // Daily breakdown
        const dailyStats = {};
        orders.forEach(order => {
          const date = order.createdAt.toISOString().split('T')[0];
          if (!dailyStats[date]) {
            dailyStats[date] = { orders: 0, revenue: 0 };
          }
          dailyStats[date].orders += 1;
          dailyStats[date].revenue += order.total;
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                period: `Last ${validated.days_back} days`,
                summary: {
                  total_orders: totalOrders,
                  total_revenue: Math.round(totalRevenue * 100) / 100,
                  total_items_sold: totalItems,
                  average_order_value: Math.round(averageOrderValue * 100) / 100,
                },
                orders_by_status: ordersByStatus,
                daily_breakdown: Object.entries(dailyStats)
                  .sort()
                  .map(([date, stats]) => ({
                    date,
                    orders: stats.orders,
                    revenue: Math.round(stats.revenue * 100) / 100,
                  })),
              }, null, 2),
            },
          ],
        };
      }

      case 'check_inventory': {
        const validated = InventorySchema.parse(args || {});
        
        // Get all product variants with their stock levels
        const variants = await prisma.productVariant.findMany({
          include: {
            product: {
              select: { id: true, title: true, type: true },
            },
          },
          orderBy: { stock: 'asc' },
        });

        const lowStockItems = variants.filter(v => v.stock <= validated.low_stock_threshold);
        const outOfStockItems = variants.filter(v => v.stock === 0);
        const totalProducts = variants.length;
        const averageStock = variants.reduce((sum, v) => sum + v.stock, 0) / totalProducts;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                inventory_summary: {
                  total_variants: totalProducts,
                  low_stock_count: lowStockItems.length,
                  out_of_stock_count: outOfStockItems.length,
                  average_stock: Math.round(averageStock * 100) / 100,
                  low_stock_threshold: validated.low_stock_threshold,
                },
                low_stock_items: lowStockItems.map(variant => ({
                  product_id: variant.product.id,
                  product_title: variant.product.title,
                  product_type: variant.product.type,
                  variant_id: variant.id,
                  size: variant.size,
                  current_stock: variant.stock,
                  price: variant.price,
                })),
                out_of_stock_items: outOfStockItems.map(variant => ({
                  product_id: variant.product.id,
                  product_title: variant.product.title,
                  product_type: variant.product.type,
                  variant_id: variant.id,
                  size: variant.size,
                  price: variant.price,
                })),
              }, null, 2),
            },
          ],
        };
      }

      case 'get_customer_stats': {
        const validated = CustomerStatsSchema.parse(args || {});
        
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - validated.days_back);

        // Get orders in the time period
        const orders = await prisma.order.findMany({
          where: {
            createdAt: { gte: daysAgo },
            status: { not: 'CANCELLED' },
          },
        });

        // Customer analysis
        const customerEmails = [...new Set(orders.map(o => o.email))];
        const newCustomers = [];
        const returningCustomers = [];

        for (const email of customerEmails) {
          const firstOrder = await prisma.order.findFirst({
            where: { email },
            orderBy: { createdAt: 'asc' },
          });
          
          if (firstOrder.createdAt >= daysAgo) {
            newCustomers.push(email);
          } else {
            returningCustomers.push(email);
          }
        }

        // Order frequency per customer
        const ordersPerCustomer = {};
        orders.forEach(order => {
          ordersPerCustomer[order.email] = (ordersPerCustomer[order.email] || 0) + 1;
        });

        const multiOrderCustomers = Object.entries(ordersPerCustomer)
          .filter(([email, count]) => count > 1)
          .sort(([,a], [,b]) => b - a);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                period: `Last ${validated.days_back} days`,
                customer_summary: {
                  total_customers: customerEmails.length,
                  new_customers: newCustomers.length,
                  returning_customers: returningCustomers.length,
                  repeat_purchase_rate: Math.round((returningCustomers.length / customerEmails.length) * 100),
                },
                top_customers: multiOrderCustomers.slice(0, 10).map(([email, orderCount]) => ({
                  email,
                  order_count: orderCount,
                  total_spent: orders
                    .filter(o => o.email === email)
                    .reduce((sum, o) => sum + o.total, 0),
                })),
                order_frequency: {
                  single_order: Object.values(ordersPerCustomer).filter(count => count === 1).length,
                  multiple_orders: Object.values(ordersPerCustomer).filter(count => count > 1).length,
                },
              }, null, 2),
            },
          ],
        };
      }

      case 'get_product_performance': {
        const validated = ProductPerformanceSchema.parse(args || {});
        
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - validated.days_back);

        // Get order items in the time period
        const orderItems = await prisma.orderItem.findMany({
          where: {
            order: {
              createdAt: { gte: daysAgo },
              status: { not: 'CANCELLED' },
            },
          },
          include: {
            product: true,
            productVariant: true,
          },
        });

        // Group by product and calculate metrics
        const productStats = {};
        orderItems.forEach(item => {
          const productId = item.product.id;
          if (!productStats[productId]) {
            productStats[productId] = {
              product: item.product,
              total_quantity: 0,
              total_revenue: 0,
              order_count: 0,
              sizes_sold: new Set(),
            };
          }
          
          productStats[productId].total_quantity += item.quantity;
          productStats[productId].total_revenue += item.quantity * item.price;
          productStats[productId].order_count += 1;
          productStats[productId].sizes_sold.add(item.productVariant.size);
        });

        // Convert to array and sort
        const productPerformance = Object.values(productStats)
          .map(stats => ({
            product_id: stats.product.id,
            title: stats.product.title,
            type: stats.product.type,
            base_price: stats.product.basePrice,
            total_quantity_sold: stats.total_quantity,
            total_revenue: Math.round(stats.total_revenue * 100) / 100,
            times_ordered: stats.order_count,
            sizes_sold: Array.from(stats.sizes_sold),
            average_price: Math.round((stats.total_revenue / stats.total_quantity) * 100) / 100,
          }))
          .sort((a, b) => b.total_revenue - a.total_revenue);

        const topPerformers = productPerformance.slice(0, validated.limit);
        const underPerformers = productPerformance.slice(-Math.min(5, productPerformance.length));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                period: `Last ${validated.days_back} days`,
                summary: {
                  total_products_sold: productPerformance.length,
                  total_items_sold: productPerformance.reduce((sum, p) => sum + p.total_quantity_sold, 0),
                  total_revenue: Math.round(productPerformance.reduce((sum, p) => sum + p.total_revenue, 0) * 100) / 100,
                },
                top_performers: topPerformers,
                underperformers: underPerformers.reverse(),
              }, null, 2),
            },
          ],
        };
      }

      case 'get_order_trends': {
        const validated = AnalyticsSchema.parse(args || {});
        
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - validated.days_back);

        const orders = await prisma.order.findMany({
          where: {
            createdAt: { gte: daysAgo },
          },
        });

        // Trends by day of week
        const dayOfWeekStats = {};
        const hourlyStats = {};
        
        orders.forEach(order => {
          const date = new Date(order.createdAt);
          const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
          const hour = date.getHours();
          
          dayOfWeekStats[dayOfWeek] = (dayOfWeekStats[dayOfWeek] || 0) + 1;
          hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
        });

        // Status transition insights
        const statusCounts = orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {});

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                period: `Last ${validated.days_back} days`,
                order_trends: {
                  total_orders: orders.length,
                  orders_by_day_of_week: dayOfWeekStats,
                  orders_by_hour: hourlyStats,
                  orders_by_status: statusCounts,
                },
                insights: {
                  busiest_day: Object.entries(dayOfWeekStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'No data',
                  busiest_hour: Object.entries(hourlyStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'No data',
                  completion_rate: Math.round((statusCounts.DELIVERED || 0) / orders.length * 100),
                },
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
  console.error('Burbar Database MCP server running on stdio');
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