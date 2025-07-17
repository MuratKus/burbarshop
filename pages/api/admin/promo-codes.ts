import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const promoCodes = await prisma.promoCode.findMany({
        orderBy: { createdAt: 'desc' }
      })
      res.status(200).json(promoCodes)
    } catch (error) {
      console.error('Error fetching promo codes:', error)
      res.status(500).json({ error: 'Failed to fetch promo codes' })
    }
  } else if (req.method === 'POST') {
    try {
      const { code, description, type, value, minOrder, maxUses, validUntil } = req.body

      // Check if code already exists
      const existing = await prisma.promoCode.findUnique({
        where: { code }
      })
      
      if (existing) {
        return res.status(400).json({ message: 'Promo code already exists' })
      }

      const promoCode = await prisma.promoCode.create({
        data: {
          code,
          description,
          type,
          value,
          minOrder,
          maxUses,
          validUntil: validUntil ? new Date(validUntil) : null
        }
      })

      res.status(201).json(promoCode)
    } catch (error) {
      console.error('Error creating promo code:', error)
      res.status(500).json({ error: 'Failed to create promo code' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}