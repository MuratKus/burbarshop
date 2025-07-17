import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateUniqueSlug } from '@/lib/slug'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: {
          orderBy: {
            size: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const response = NextResponse.json(products)
    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=300')
    return response
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Generate unique slug for the product
    const baseSlug = generateUniqueSlug(data.title)
    let slug = baseSlug
    let counter = 1
    
    // Check if slug already exists and make it unique
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    const product = await prisma.product.create({
      data: {
        title: data.title,
        slug: slug,
        description: data.description,
        images: data.images || [],
        basePrice: data.basePrice,
        type: data.type,
        variants: {
          create: data.variants.map((variant: any) => ({
            size: variant.size,
            price: variant.price,
            stock: variant.stock
          }))
        }
      },
      include: {
        variants: true
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}