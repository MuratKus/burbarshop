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

export async function POST(request: Request) {
  try {
    const { secret } = await request.json()
    
    if (secret !== 'cleanup-duplicates-now') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('🧹 Starting duplicate cleanup...')
    
    // Find products with Etsy URLs (the duplicates we want to remove)
    // Check for various Etsy patterns
    const etsyProducts = await prisma.product.findMany({
      where: {
        OR: [
          { images: { contains: 'etsystatic' } },
          { images: { contains: 'etsy.com' } },
          { images: { contains: 'i.etsystatic.com' } },
          { images: { contains: 'https://i.etsystatic.com' } }
        ]
      },
      include: {
        variants: true
      }
    })
    
    console.log(`📦 Found ${etsyProducts.length} products with Etsy URLs`)
    
    // Delete variants first, then products
    let deletedVariants = 0
    let deletedProducts = 0
    
    for (const product of etsyProducts) {
      // Delete variants
      await prisma.productVariant.deleteMany({
        where: {
          productId: product.id
        }
      })
      deletedVariants += product.variants.length
      
      // Delete product
      await prisma.product.delete({
        where: {
          id: product.id
        }
      })
      deletedProducts++
      
      console.log(`🗑️  Deleted: ${product.title}`)
    }
    
    // Verify cleanup
    const remainingEtsyProducts = await prisma.product.count({
      where: {
        images: {
          contains: 'etsystatic'
        }
      }
    })
    
    const totalProducts = await prisma.product.count()
    
    console.log(`✅ Cleanup complete!`)
    console.log(`   Deleted: ${deletedProducts} products, ${deletedVariants} variants`)
    console.log(`   Remaining Etsy products: ${remainingEtsyProducts}`)
    console.log(`   Total products: ${totalProducts}`)
    
    return NextResponse.json({
      success: true,
      message: `Removed ${deletedProducts} duplicate products`,
      deletedProducts,
      deletedVariants,
      remainingEtsyProducts,
      totalProducts
    })
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  try {
    // Check current state
    const totalProducts = await prisma.product.count()
    const etsyProducts = await prisma.product.count({
      where: {
        OR: [
          { images: { contains: 'etsystatic' } },
          { images: { contains: 'etsy.com' } },
          { images: { contains: 'i.etsystatic.com' } },
          { images: { contains: 'https://i.etsystatic.com' } }
        ]
      }
    })
    
    const localProducts = await prisma.product.count({
      where: {
        images: {
          contains: '/images/'
        }
      }
    })
    
    return NextResponse.json({
      totalProducts,
      etsyProducts,
      localProducts,
      hasDuplicates: etsyProducts > 0
    })
    
  } catch (error) {
    console.error('❌ Status check failed:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}