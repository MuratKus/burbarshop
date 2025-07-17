import { prisma } from '@/lib/prisma'

/**
 * Links guest orders to a user account when they sign up or log in
 * This allows users to see their previous orders made as guests
 */
export async function linkGuestOrdersToUser(userId: string, email: string) {
  try {
    // Find all orders with this email that don't have a userId (guest orders)
    const guestOrders = await prisma.order.findMany({
      where: {
        email: email.toLowerCase(),
        userId: null // Only guest orders
      }
    })

    if (guestOrders.length === 0) {
      return { linked: 0, message: 'No guest orders found for this email' }
    }

    // Update all guest orders to link them to the user
    const updateResult = await prisma.order.updateMany({
      where: {
        email: email.toLowerCase(),
        userId: null
      },
      data: {
        userId: userId
      }
    })

    return {
      linked: updateResult.count,
      message: `Successfully linked ${updateResult.count} guest order${updateResult.count === 1 ? '' : 's'} to your account`
    }

  } catch (error) {
    console.error('Error linking guest orders to user:', error)
    throw new Error('Failed to link guest orders to user account')
  }
}

/**
 * Get all orders for a user (both linked and direct orders)
 */
export async function getUserOrders(userId: string, email?: string) {
  try {
    const whereCondition = email 
      ? {
          OR: [
            { userId: userId },
            { email: email.toLowerCase(), userId: null } // Include any remaining guest orders
          ]
        }
      : { userId: userId }

    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        items: {
          include: {
            product: true,
            productVariant: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return orders
  } catch (error) {
    console.error('Error fetching user orders:', error)
    throw new Error('Failed to fetch user orders')
  }
}