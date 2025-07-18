import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

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

// Helper function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Helper function to determine product type
function determineType(title: string): 'FINE_PRINT' | 'POSTCARD' | 'RISO_PRINT' {
  const text = title.toLowerCase()
  if (text.includes('postcard')) return 'POSTCARD'
  if (text.includes('riso')) return 'RISO_PRINT'
  return 'FINE_PRINT'
}

export async function POST(request: Request) {
  try {
    const { secret } = await request.json()
    
    // Simple secret check
    if (secret !== 'fix-images-now-please') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('🔧 Starting complete product and image setup...')
    
    // Read the Etsy data and image mapping
    const etsyDataPath = path.join(process.cwd(), 'response-etsy-backup.json')
    const imageMappingPath = path.join(process.cwd(), 'scripts', 'image-mapping.json')
    
    if (!fs.existsSync(etsyDataPath)) {
      return NextResponse.json({ error: 'Etsy data file not found' }, { status: 404 })
    }
    
    if (!fs.existsSync(imageMappingPath)) {
      return NextResponse.json({ error: 'Image mapping file not found' }, { status: 404 })
    }
    
    const etsyData = JSON.parse(fs.readFileSync(etsyDataPath, 'utf8'))
    const imageMapping = JSON.parse(fs.readFileSync(imageMappingPath, 'utf8'))
    
    console.log(`📦 Processing ${etsyData.length} Etsy listings...`)
    
    // Clear existing products first
    await prisma.productVariant.deleteMany()
    await prisma.product.deleteMany()
    
    const results = []
    
    for (const listing of etsyData) {
      try {
        const title = listing.title
        const slug = generateSlug(title)
        const localImages = imageMapping[listing.listing_id] || []
        
        if (localImages.length === 0) {
          console.log(`⚠️  No images found for: ${title}`)
          continue
        }
        
        console.log(`📦 Creating: ${title}`)
        
        // Extract product data
        const basePrice = listing.price_int ? listing.price_int / 100 : parseFloat(listing.price) || 20
        const productType = determineType(title)
        
        // Create the product with variants
        const product = await prisma.product.create({
          data: {
            title,
            description: listing.description || '',
            type: productType,
            basePrice,
            images: JSON.stringify(localImages),
            slug,
            variants: {
              create: [
                {
                  size: 'A4',
                  price: basePrice,
                  stock: listing.quantity || 5
                },
                {
                  size: 'A5', 
                  price: Math.max(basePrice - 5, 5),
                  stock: listing.quantity || 5
                }
              ]
            }
          }
        })
        
        results.push({
          id: product.id,
          title: product.title,
          type: product.type,
          basePrice: product.basePrice,
          imageCount: localImages.length
        })
        
        console.log(`✅ Created: ${title} (${localImages.length} images)`)
        
      } catch (error) {
        console.error(`❌ Failed to create ${listing.title}:`, error.message)
      }
    }
    
    console.log(`🎉 Setup completed! Created ${results.length} products`)
    
    return NextResponse.json({
      success: true,
      message: `Created ${results.length} products with local images`,
      results: results
    })
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
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
        images: {
          contains: 'etsystatic'
        }
      }
    })
    
    const sampleProduct = await prisma.product.findFirst({
      where: {
        images: {
          contains: 'etsystatic'
        }
      },
      select: {
        title: true,
        images: true
      }
    })
    
    return NextResponse.json({
      totalProducts,
      etsyProducts,
      sampleProduct
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