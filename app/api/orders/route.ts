import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkInventoryAvailability, reserveInventory, type InventoryItem } from '@/lib/inventory'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')

    // If userId is provided, get orders for that user
    if (userId) {
      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
              productVariant: true
            }
          },
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return NextResponse.json(orders)
    }

    // If email is provided, get orders for that email (guest orders)
    if (email) {
      const orders = await prisma.order.findMany({
        where: { email: email.toLowerCase() },
        include: {
          items: {
            include: {
              product: true,
              productVariant: true
            }
          },
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return NextResponse.json({ orders })
    }

    // Admin route - get all orders
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
            productVariant: true
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('Creating order with data:', JSON.stringify(data, null, 2))
    
    // Prepare inventory items for checking/reserving
    const inventoryItems: InventoryItem[] = data.items.map((item: any) => ({
      variantId: item.variantId,
      quantity: item.quantity
    }))

    // Check inventory availability before creating the order
    console.log('Checking inventory availability...')
    const inventoryChecks = await checkInventoryAvailability(inventoryItems)
    
    // Check if any items are out of stock
    const outOfStockItems = inventoryChecks.filter(check => !check.isAvailable)
    if (outOfStockItems.length > 0) {
      const errorMessage = outOfStockItems.map(item => 
        `Variant ${item.variantId}: requested ${item.requested}, only ${item.available} available`
      ).join('; ')
      
      return NextResponse.json({ 
        error: 'Insufficient inventory', 
        details: errorMessage,
        outOfStockItems 
      }, { status: 400 })
    }

    // Reserve inventory first, then create the order
    console.log('Reserving inventory...')
    await reserveInventory(inventoryItems)

    console.log('Creating order...')
    const order = await prisma.order.create({
      data: {
        email: data.email,
        subtotal: data.subtotal,
        shippingCost: data.shippingCost,
        total: data.total,
        status: 'PENDING',
        paymentMethod: 'stripe',
        paymentId: data.paymentIntentId,
        shippingAddress: JSON.stringify(data.shippingAddress),
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            productVariantId: item.variantId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true,
            productVariant: true
          }
        }
      }
    })

    console.log('Order created successfully with inventory reserved:', order.id)
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    
    // Check if it's an inventory error
    if (error.message.includes('Insufficient stock')) {
      return NextResponse.json({ 
        error: 'Out of stock', 
        details: error.message 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to create order', 
      details: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}