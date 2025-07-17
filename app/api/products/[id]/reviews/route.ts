import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: productId } = params

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        approved: true
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0

    return NextResponse.json({
      reviews,
      stats: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        ratingDistribution: {
          5: reviews.filter(r => r.rating === 5).length,
          4: reviews.filter(r => r.rating === 4).length,
          3: reviews.filter(r => r.rating === 3).length,
          2: reviews.filter(r => r.rating === 2).length,
          1: reviews.filter(r => r.rating === 1).length,
        }
      }
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: productId } = params
    const { rating, title, comment, name, email, userId } = await request.json()

    // Validation
    if (!rating || !comment || !name || !email) {
      return NextResponse.json(
        { error: 'Rating, comment, name, and email are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user has already reviewed this product
    if (email) {
      const existingReview = await prisma.review.findFirst({
        where: {
          productId,
          email: email.toLowerCase()
        }
      })

      if (existingReview) {
        return NextResponse.json(
          { error: 'You have already reviewed this product' },
          { status: 400 }
        )
      }
    }

    // Check if user purchased this product (for verified badge)
    let verified = false
    if (email) {
      const hasPurchased = await prisma.order.findFirst({
        where: {
          email: email.toLowerCase(),
          status: { in: ['DELIVERED', 'PROCESSING', 'SHIPPED'] },
          items: {
            some: {
              productId
            }
          }
        }
      })
      verified = !!hasPurchased
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        userId: userId || null,
        email: email.toLowerCase(),
        name,
        rating: parseInt(rating),
        title: title || null,
        comment,
        verified,
        approved: true // Auto-approve for now, could add moderation later
      }
    })

    return NextResponse.json({
      success: true,
      review,
      message: 'Review submitted successfully'
    })

  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}