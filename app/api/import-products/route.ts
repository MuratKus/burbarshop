import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sample products data (subset of your Etsy products)
const sampleProducts = [
  {
    title: "Circassian Dancer | Riso Art Print | Living Room Wall Decor | Handmade",
    description: "Beautiful Circassian dancer illustration created with Risograph printing technique. Perfect for living room wall decoration.",
    type: "RISO",
    basePrice: 20.00,
    images: ["https://i.etsystatic.com/32900154/r/il/35691b/5646531209/il_1588xN.5646531209_bi8k.jpg"],
    variants: [{ size: "A4", price: 20.00, stock: 8 }]
  },
  {
    title: "Male Circassian Dancer | Riso Art Print | Living Room Wall Decor | Handmade",
    description: "Dynamic male Circassian dancer illustration in traditional costume. Handmade Riso print art.",
    type: "RISO", 
    basePrice: 14.00,
    images: ["https://i.etsystatic.com/32900154/r/il/59d567/5591225380/il_1588xN.5591225380_ctsb.jpg"],
    variants: [{ size: "A4", price: 14.00, stock: 12 }]
  },
  {
    title: "Fez Fascination | Riso Art Print | History Illustration | Wall Art",
    description: "Historical illustration featuring traditional Ottoman fez hat. Cultural artwork perfect for wall decoration.",
    type: "RISO",
    basePrice: 6.00,
    images: ["https://i.etsystatic.com/32900154/r/il/4b5b41/4840910269/il_1588xN.4840910269_kwal.jpg"],
    variants: [{ size: "A4", price: 6.00, stock: 8 }]
  },
  {
    title: "Mediterranean Melodies | Riso Art Print | Seaside Illustration | Summer House Art",
    description: "Vibrant Mediterranean seaside illustration perfect for summer house decoration. Father's Day gift idea.",
    type: "RISO",
    basePrice: 6.00,
    images: ["https://i.etsystatic.com/32900154/r/il/fe768b/5017099698/il_1588xN.5017099698_lk9a.jpg"],
    variants: [{ size: "A4", price: 6.00, stock: 7 }]
  },
  {
    title: "Armenian Bride | Historical Illustration | Wall Decor | Woman Illustration",
    description: "Historical illustration of Armenian bride in traditional costume. Beautiful woman portrait art.",
    type: "FINE_PRINT",
    basePrice: 6.00,
    images: ["https://i.etsystatic.com/32900154/r/il/c14ec3/3829203314/il_1588xN.3829203314_5583.jpg"],
    variants: [{ size: "A4", price: 6.00, stock: 5 }]
  },
  {
    title: "Zeybek Dancer | Riso Art Print | Living Room Wall Decor | Handmade",
    description: "Traditional Turkish Zeybek dancer illustration. Handmade Riso print perfect for home decoration.",
    type: "RISO",
    basePrice: 14.00,
    images: ["https://i.etsystatic.com/32900154/r/il/2c8a3c/5598448816/il_1588xN.5598448816_g9ki.jpg"],
    variants: [{ size: "A4", price: 14.00, stock: 17 }]
  },
  {
    title: "Belly Dancer | Riso Art Print | Living Room Wall Decor | Handmade",
    description: "Graceful belly dancer illustration capturing the essence of traditional dance. Handmade art print.",
    type: "RISO",
    basePrice: 14.00,
    images: ["https://i.etsystatic.com/32900154/r/il/65c5ed/5598430922/il_1588xN.5598430922_ss4v.jpg"],
    variants: [{ size: "A4", price: 14.00, stock: 19 }]
  },
  {
    title: "Tea Time | Riso Art Print | Food Illustration | Wall Art",
    description: "Charming tea time illustration perfect for kitchen or dining room. Food art with cultural significance.",
    type: "RISO",
    basePrice: 6.00,
    images: ["https://i.etsystatic.com/32900154/r/il/a891f5/4968649839/il_1588xN.4968649839_3c0p.jpg"],
    variants: [{ size: "A4", price: 6.00, stock: 6 }]
  }
]

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

export async function POST() {
  try {
    console.log('🌱 Starting product import...')
    
    let created = 0
    let skipped = 0
    
    for (const productData of sampleProducts) {
      const slug = generateSlug(productData.title)
      
      // Check if product already exists
      const existingProduct = await prisma.product.findUnique({
        where: { slug }
      })
      
      if (existingProduct) {
        console.log(`⏭️ Product already exists: "${productData.title}"`)
        skipped++
        continue
      }
      
      console.log(`📦 Creating product: "${productData.title}"`)
      
      // Create product with variants
      await prisma.product.create({
        data: {
          title: productData.title,
          description: productData.description,
          type: productData.type,
          basePrice: productData.basePrice,
          images: JSON.stringify(productData.images),
          slug: slug,
          variants: {
            create: productData.variants.map(variant => ({
              size: variant.size,
              price: variant.price,
              stock: variant.stock
            }))
          }
        }
      })
      
      created++
    }
    
    // Get final count
    const totalProducts = await prisma.product.count()
    const totalVariants = await prisma.productVariant.count()
    
    console.log(`✅ Import completed! Created: ${created}, Skipped: ${skipped}`)
    console.log(`📊 Database now has ${totalProducts} products and ${totalVariants} variants`)
    
    return NextResponse.json({
      success: true,
      created,
      skipped,
      totalProducts,
      totalVariants
    })
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    return NextResponse.json(
      { error: 'Import failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}