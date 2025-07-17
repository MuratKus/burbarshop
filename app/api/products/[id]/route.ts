import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateUniqueSlug } from '@/lib/slug'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          orderBy: {
            size: 'asc'
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()
    
    // Generate new slug if title changed
    const updateData: any = {
      title: data.title,
      description: data.description,
      images: data.images,
      basePrice: data.basePrice,
      type: data.type,
    }
    
    // Check if title changed and generate new slug
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { title: true, slug: true }
    })
    
    if (existingProduct && existingProduct.title !== data.title) {
      const baseSlug = generateUniqueSlug(data.title)
      let slug = baseSlug
      let counter = 1
      
      // Ensure the new slug is unique (excluding current product)
      while (await prisma.product.findUnique({ 
        where: { 
          slug,
          NOT: { id }
        } 
      })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
      
      updateData.slug = slug
    }
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        variants: {
          deleteMany: {},
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
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}