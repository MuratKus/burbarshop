import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  if (req.method === 'GET') {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          variants: true
        }
      })

      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      res.status(200).json(product)
    } catch (error) {
      console.error('Error fetching product:', error)
      res.status(500).json({ error: 'Failed to fetch product' })
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, description, type, basePrice, images, variants } = req.body

      // Update product
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          title,
          description,
          type,
          basePrice,
          images: JSON.stringify(images),
        },
        include: {
          variants: true
        }
      })

      // Delete existing variants
      await prisma.productVariant.deleteMany({
        where: { productId: id }
      })

      // Create new variants
      if (variants && variants.length > 0) {
        await prisma.productVariant.createMany({
          data: variants.map((variant: any) => ({
            productId: id,
            size: variant.size,
            price: variant.price,
            stock: variant.stock
          }))
        })
      }

      // Fetch updated product with variants
      const finalProduct = await prisma.product.findUnique({
        where: { id },
        include: {
          variants: true
        }
      })

      res.status(200).json(finalProduct)
    } catch (error) {
      console.error('Error updating product:', error)
      res.status(500).json({ error: 'Failed to update product' })
    }
  } else if (req.method === 'DELETE') {
    try {
      // Delete product (variants will be deleted due to cascade)
      await prisma.product.delete({
        where: { id }
      })

      res.status(200).json({ message: 'Product deleted successfully' })
    } catch (error) {
      console.error('Error deleting product:', error)
      res.status(500).json({ error: 'Failed to delete product' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}