const { PrismaClient } = require('@prisma/client')

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function populateProductSlugs() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Fetching products without slugs...')
    
    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        slug: true
      }
    })
    
    console.log(`Found ${products.length} products`)
    
    for (const product of products) {
      // Skip if product already has a slug
      if (product.slug) {
        console.log(`Product "${product.title}" already has slug: ${product.slug}`)
        continue
      }
      
      let baseSlug = generateSlug(product.title)
      let slug = baseSlug
      let counter = 1
      
      // Ensure slug is unique
      while (true) {
        const existing = await prisma.product.findUnique({
          where: { slug }
        })
        
        if (!existing) {
          break
        }
        
        slug = `${baseSlug}-${counter}`
        counter++
      }
      
      // Update product with new slug
      await prisma.product.update({
        where: { id: product.id },
        data: { slug }
      })
      
      console.log(`Generated slug for "${product.title}": ${slug}`)
    }
    
    console.log('✅ All products now have slugs!')
    
  } catch (error) {
    console.error('Error populating slugs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateProductSlugs()