import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// All your Etsy products extracted from API structure
const etsyProducts = [
  {
    listing_id: 1619843244,
    title: "Circassian Dancer | Riso Art Print |  Living Room Wall Decor | Handmade",
    price_int: 2000,
    quantity: 8,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/35691b/5646531209/il_1588xN.5646531209_bi8k.jpg"}]
  },
  {
    listing_id: 1634010829,
    title: "Male Circassian Dancer | Riso Art Print |  Living Room Wall Decor | Handmade",
    price_int: 1400,
    quantity: 12,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/59d567/5591225380/il_1588xN.5591225380_ctsb.jpg"}]
  },
  {
    listing_id: 1441149696,
    title: "Fez Fascination | Riso Art Print | History Illustration |  Wall Art",
    price_int: 600,
    quantity: 8,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/4b5b41/4840910269/il_1588xN.4840910269_kwal.jpg"}]
  },
  {
    listing_id: 1493198594,
    title: "Mediterranean Melodies | Riso Art Print |  Seaside Illustration | Summer House Art | Father's Day Gift",
    price_int: 600,
    quantity: 7,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/fe768b/5017099698/il_1588xN.5017099698_lk9a.jpg"}]
  },
  {
    listing_id: 1217616313,
    title: "Armenian Bride | Historical Illustration | Wall Decor  | Woman Illustration | Digital Art Print",
    price_int: 600,
    quantity: 5,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/c14ec3/3829203314/il_1588xN.3829203314_5583.jpg"}]
  },
  {
    listing_id: 1619433254,
    title: "Zeybek Dancer | Riso Art Print |  Living Room Wall Decor | Handmade",
    price_int: 1400,
    quantity: 17,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/2c8a3c/5598448816/il_1588xN.5598448816_g9ki.jpg"}]
  },
  {
    listing_id: 1619778574,
    title: "Belly Dancer | Riso Art Print |  Living Room Wall Decor | Handmade",
    price_int: 1400,
    quantity: 19,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/65c5ed/5598430922/il_1588xN.5598430922_ss4v.jpg"}]
  },
  {
    listing_id: 1619843648,
    title: "Female Zeybek Dancer | Riso Art Print |  Living Room Wall Decor | Handmade",
    price_int: 1400,
    quantity: 16,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/0a33b3/5646531215/il_1588xN.5646531215_j4jx.jpg"}]
  },
  {
    listing_id: 1239639499,
    title: "Mevhide |  Historical Era Art | Digital Art Print  | Ottoman | Muslim Art",
    price_int: 600,
    quantity: 3,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/a0b8f8/3995142838/il_1588xN.3995142838_e5w3.jpg"}]
  },
  {
    listing_id: 1239639235,
    title: "Sitting Lady of Çatalhöyük |  Riso Print | Goddesses | Historical Art | Digital Art print",
    price_int: 600,
    quantity: 2,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/d7ac1e/3995142796/il_1588xN.3995142796_2jc8.jpg"}]
  },
  {
    listing_id: 1441194962,
    title: "Tea Time | Riso Art Print |  Food Illustration |  Wall Art",
    price_int: 600,
    quantity: 6,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/a891f5/4968649839/il_1588xN.4968649839_3c0p.jpg"}]
  },
  {
    listing_id: 1549424750,
    title: "Embracing the Change | Riso Art Print |  Snake Illustration | Comic Art",
    price_int: 600,
    quantity: 9,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/88e9f8/5206915863/il_1588xN.5206915863_lz5v.jpg"}]
  },
  {
    listing_id: 1493198534,
    title: "Sulukule Dancer | Riso Art Print |  Living Room Wall Decor | Handmade",
    price_int: 600,
    quantity: 6,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/ea8e48/5017099700/il_1588xN.5017099700_4wnp.jpg"}]
  },
  {
    listing_id: 1554624590,
    title: "To a New Beginning | Riso Art Print |  Ouroboros Snake |  Rebirth Symbol",
    price_int: 600,
    quantity: 4,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/f4b09e/5252518201/il_1588xN.5252518201_hd3z.jpg"}]
  },
  {
    listing_id: 1554624536,
    title: "Wrapped in Love | Riso Art Print |  Gift Ideas for Dog Lovers",
    price_int: 600,
    quantity: 7,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/4ba01f/5204325364/il_1588xN.5204325364_3ctn.jpg"}]
  },
  {
    listing_id: 1217616417,
    title: "Lady in Flowers | Digital Art Print | Floral Illustration",
    price_int: 600,
    quantity: 1,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/1e3ab6/3942755589/il_1588xN.3942755589_3b5e.jpg"}]
  },
  {
    listing_id: 1493198528,
    title: "Male Sulukule Dancer | Riso Art Print |  Living Room Wall Decor | Handmade",
    price_int: 600,
    quantity: 7,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/8d0845/5017099694/il_1588xN.5017099694_3b70.jpg"}]
  },
  {
    listing_id: 1619778568,
    title: "Male Belly Dancer | Riso Art Print |  Living Room Wall Decor | Handmade",
    price_int: 1400,
    quantity: 20,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/bb15ee/5598430918/il_1588xN.5598430918_7xxz.jpg"}]
  },
  {
    listing_id: 1217616311,
    title: "Fatma |  Historical Illustration | Local Village Lady  | Headscarf |",
    price_int: 600,
    quantity: 5,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/0e1bb0/3942755583/il_1588xN.3942755583_7ys8.jpg"}]
  },
  {
    listing_id: 1217616309,
    title: "Istanbul Gentleman | Historical Illustration  | Wall Decor | Men Illustration | Digital Art Print",
    price_int: 600,
    quantity: 2,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/c14ec3/3829203314/il_1588xN.3829203314_5583.jpg"}]
  },
  {
    listing_id: 1217616271,
    title: "Art Print \"Lady with the Cat\" | Gift Ideas for Cat Lovers",
    price_int: 600,
    quantity: 5,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/7ce458/3995142800/il_1588xN.3995142800_kvux.jpg"}]
  },
  {
    listing_id: 1239639497,
    title: "Medusa |  Historical Illustration | Era Art | Greek Mythology | Women Illustration | Digital Art print",
    price_int: 600,
    quantity: 3,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/a0b8f8/3995142838/il_1588xN.3995142838_e5w3.jpg"}]
  },
  {
    listing_id: 1239639451,
    title: "A6 Postcard \"HAHAHA\"  Laughter Postcards | Floral Pattern | Bright colours |",
    price_int: 300,
    quantity: 10,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/c6d4d8/3995142834/il_1588xN.3995142834_mxw2.jpg"}]
  },
  {
    listing_id: 1239639449,
    title: "Art Print \"Lady of the Night\" | Mythological Women Drawing",
    price_int: 600,
    quantity: 6,
    listing_images: [{"url_1588xN": "https://i.etsystatic.com/32900154/r/il/3b9f59/3947142242/il_1588xN.3947142242_6q1i.jpg"}]
  }
]

function determineType(title: string): string {
  const titleLower = title.toLowerCase()
  if (titleLower.includes('postcard')) return 'POSTCARD'
  if (titleLower.includes('riso') || titleLower.includes('risograph')) return 'RISO'
  return 'FINE_PRINT'
}

function createDescription(title: string): string {
  const type = determineType(title)
  if (type === 'RISO') {
    return `Beautiful ${title.split('|')[0].trim()} created with traditional Risograph printing technique. Handmade art print perfect for home decoration.`
  } else if (type === 'POSTCARD') {
    return `Charming ${title.split('|')[0].trim()} designed as a postcard. Perfect for sending to friends or collecting.`
  } else {
    return `High-quality digital art print of ${title.split('|')[0].trim()}. Beautiful illustration perfect for wall decoration.`
  }
}

const products = etsyProducts.map(listing => ({
  title: listing.title,
  description: createDescription(listing.title),
  type: determineType(listing.title),
  basePrice: listing.price_int / 100,
  images: listing.listing_images.map(img => img.url_1588xN),
  variants: [{ 
    size: "A4", 
    price: listing.price_int / 100, 
    stock: listing.quantity 
  }]
}))

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
    
    for (const productData of products) {
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