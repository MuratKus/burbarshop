import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to stringify images
function stringifyProductImages(images: string[]): string {
  return JSON.stringify(images)
}

// Helper function to generate slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const sampleProducts = [
  {
    title: 'Art Print "Lady of the Night" Mythological Women Drawing',
    description: 'A beautiful abstract landscape print featuring flowing colors and organic shapes. This piece captures the essence of nature through bold brushstrokes and a harmonious color palette.',
    type: 'FINE_PRINT',
    basePrice: 25.00,
    images: stringifyProductImages([
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578322450882-57d89ad1fb86?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578322449189-e4a85fccce2a?w=800&h=800&fit=crop'
    ]),
    variants: [
      { size: 'A4', price: 25.00, stock: 5 },
      { size: 'A5', price: 20.00, stock: 8 },
      { size: 'SQUARE', price: 30.00, stock: 3 },
    ]
  },
  {
    title: 'City Postcard Collection',
    description: 'Urban photography postcard capturing the vibrant energy of city life. Perfect for sending to friends or framing as wall art.',
    type: 'POSTCARD',
    basePrice: 8.00,
    images: stringifyProductImages([
      'https://picsum.photos/800/800?random=5',
      'https://picsum.photos/800/800?random=6',
      'https://picsum.photos/800/800?random=7'
    ]),
    variants: [
      { size: 'A5', price: 8.00, stock: 20 },
      { size: 'SQUARE', price: 10.00, stock: 15 },
    ]
  },
  {
    title: 'Botanical Print Collection',
    description: 'Hand-illustrated botanical print featuring detailed plant studies. Printed using riso printing technique for unique texture and color depth.',
    type: 'RISO_PRINT',
    basePrice: 35.00,
    images: stringifyProductImages([
      'https://picsum.photos/800/800?random=8',
      'https://picsum.photos/800/800?random=9',
      'https://picsum.photos/800/800?random=10'
    ]),
    variants: [
      { size: 'A4', price: 35.00, stock: 4 },
      { size: 'A5', price: 28.00, stock: 7 },
    ]
  },
  {
    title: 'Geometric Pattern Series',
    description: 'Minimalist geometric pattern print with clean lines and modern aesthetic. Perfect for contemporary spaces.',
    type: 'FINE_PRINT',
    basePrice: 30.00,
    images: stringifyProductImages([
      'https://picsum.photos/800/800?random=11',
      'https://picsum.photos/800/800?random=12',
      'https://picsum.photos/800/800?random=13',
      'https://picsum.photos/800/800?random=14',
      'https://picsum.photos/800/800?random=15'
    ]),
    variants: [
      { size: 'A4', price: 30.00, stock: 6 },
      { size: 'SQUARE', price: 35.00, stock: 3 },
    ]
  },
  {
    title: 'Sunset Postcard',
    description: 'Dreamy sunset photography postcard with warm golden tones. A perfect way to share beautiful moments.',
    type: 'POSTCARD',
    basePrice: 8.00,
    images: stringifyProductImages([
      'https://picsum.photos/800/800?random=16',
      'https://picsum.photos/800/800?random=17'
    ]),
    variants: [
      { size: 'A5', price: 8.00, stock: 25 },
    ]
  },
  {
    title: 'Minimalist Portrait Study',
    description: 'Contemporary portrait study using riso printing techniques. Features bold colors and simplified forms.',
    type: 'RISO_PRINT',
    basePrice: 40.00,
    images: stringifyProductImages([
      'https://picsum.photos/800/800?random=18',
      'https://picsum.photos/800/800?random=19',
      'https://picsum.photos/800/800?random=20'
    ]),
    variants: [
      { size: 'A4', price: 40.00, stock: 3 },
      { size: 'A5', price: 32.00, stock: 5 },
      { size: 'SQUARE', price: 45.00, stock: 2 },
    ]
  }
]

const sampleShippingZones = [
  {
    name: 'Domestic',
    countries: JSON.stringify(['US']),
    rate: 5.99
  },
  {
    name: 'Canada',
    countries: JSON.stringify(['CA']),
    rate: 8.99
  },
  {
    name: 'Europe',
    countries: JSON.stringify(['GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE']),
    rate: 12.99
  },
  {
    name: 'International',
    countries: JSON.stringify(['AU', 'JP', 'NZ']),
    rate: 15.99
  }
]

const samplePromoCodes = [
  {
    code: 'WELCOME10',
    description: 'Welcome discount for new customers',
    type: 'PERCENTAGE',
    value: 10,
    minOrder: 20,
    maxUses: 100,
    validUntil: new Date('2024-12-31')
  },
  {
    code: 'FREESHIP',
    description: 'Free shipping on orders over $30',
    type: 'FIXED_AMOUNT',
    value: 5.99,
    minOrder: 30,
    maxUses: null,
    validUntil: null
  }
]

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data (only if no products exist to avoid deleting user-added items)
  const existingProducts = await prisma.product.count()
  if (existingProducts === 0) {
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.productVariant.deleteMany()
    await prisma.product.deleteMany()
    await prisma.shippingZone.deleteMany()
    await prisma.promoCode.deleteMany()
  } else {
    console.log('⚠️  Skipping data clearing - existing products found')
    console.log('💡 To reset database completely, use: npx prisma db push --force-reset')
    return
  }
  await prisma.user.deleteMany()

  // Seed products with variants
  for (const productData of sampleProducts) {
    const { variants, ...product } = productData
    
    // Generate slug from title
    let slug = generateSlug(product.title)
    let counter = 1
    
    // Ensure unique slug
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${generateSlug(product.title)}-${counter}`
      counter++
    }
    
    const createdProduct = await prisma.product.create({
      data: {
        ...product,
        slug
      }
    })

    // Create variants for this product
    for (const variant of variants) {
      await prisma.productVariant.create({
        data: {
          ...variant,
          productId: createdProduct.id
        }
      })
    }

    console.log(`✅ Created product: ${product.title}`)
  }

  // Seed shipping zones
  for (const zone of sampleShippingZones) {
    await prisma.shippingZone.create({
      data: zone
    })
    console.log(`✅ Created shipping zone: ${zone.name}`)
  }

  // Seed promo codes
  for (const promo of samplePromoCodes) {
    await prisma.promoCode.create({
      data: promo
    })
    console.log(`✅ Created promo code: ${promo.code}`)
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })