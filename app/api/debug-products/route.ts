import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Ensure DATABASE_URL is set from available environment variables
if (!process.env.DATABASE_URL) {
  if (process.env.DATABASE_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.DATABASE_DATABASE_URL
  } else if (process.env.DATABASE_POSTGRES_URL) {
    process.env.DATABASE_URL = process.env.DATABASE_POSTGRES_URL
  } else if (process.env.DATABASE_POSTGRES_PRISMA_URL) {
    process.env.DATABASE_URL = process.env.DATABASE_POSTGRES_PRISMA_URL
  }
}

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get all products with their images
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        images: true,
        slug: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Analyze the images
    const analysis = products.map(product => {
      let parsedImages = []
      let imageType = 'unknown'
      
      try {
        parsedImages = JSON.parse(product.images)
        if (parsedImages.length > 0) {
          const firstImage = parsedImages[0]
          if (firstImage.includes('etsystatic.com')) {
            imageType = 'etsy'
          } else if (firstImage.includes('/images/')) {
            imageType = 'local'
          } else if (firstImage.includes('unsplash.com')) {
            imageType = 'unsplash'
          } else if (firstImage.includes('picsum.photos')) {
            imageType = 'picsum'
          } else {
            imageType = 'other'
          }
        }
      } catch (e) {
        imageType = 'parse_error'
      }
      
      return {
        id: product.id,
        title: product.title.substring(0, 50),
        slug: product.slug,
        imageType,
        imageCount: parsedImages.length,
        firstImage: parsedImages[0] || 'none',
        createdAt: product.createdAt
      }
    })
    
    // Group by image type
    const byType = analysis.reduce((acc, product) => {
      acc[product.imageType] = acc[product.imageType] || []
      acc[product.imageType].push(product)
      return acc
    }, {})
    
    // Look for potential duplicates (same title)
    const titleCounts = {}
    analysis.forEach(product => {
      const shortTitle = product.title.substring(0, 30)
      titleCounts[shortTitle] = (titleCounts[shortTitle] || 0) + 1
    })
    
    const duplicateTitles = Object.keys(titleCounts).filter(title => titleCounts[title] > 1)
    
    return NextResponse.json({
      totalProducts: products.length,
      byImageType: Object.keys(byType).map(type => ({
        type,
        count: byType[type].length,
        products: byType[type]
      })),
      duplicateTitles,
      allProducts: analysis
    })
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}