import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { title, description, type, basePrice, images, variants } = req.body

      const product = await prisma.product.create({
        data: {
          title,
          description,
          type,
          basePrice,
          images: JSON.stringify(images),
          variants: {
            create: variants.map((variant: any) => ({
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

      res.status(201).json(product)
    } catch (error) {
      console.error('Error creating product:', error)
      res.status(500).json({ error: 'Failed to create product' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}