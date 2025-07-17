import { prisma } from './prisma'
import type { Product } from './types'

export async function getProducts() {
  return await prisma.product.findMany({
    include: {
      variants: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getProductById(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true
    }
  })
}

export async function getProductsByType(type: string) {
  return await prisma.product.findMany({
    where: { type },
    include: {
      variants: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function searchProducts(query: string) {
  return await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } }
      ]
    },
    include: {
      variants: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getProductVariant(productId: string, variantId: string) {
  return await prisma.productVariant.findUnique({
    where: { 
      id: variantId,
      productId: productId
    },
    include: {
      product: true
    }
  })
}

export function parseProductImages(imagesString: string): string[] {
  try {
    return JSON.parse(imagesString)
  } catch {
    return []
  }
}

export function stringifyProductImages(images: string[]): string {
  return JSON.stringify(images)
}