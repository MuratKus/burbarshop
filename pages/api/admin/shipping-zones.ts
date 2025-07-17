import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const zones = await prisma.shippingZone.findMany({
        orderBy: { name: 'asc' }
      })
      
      // Parse countries JSON for each zone
      const parsedZones = zones.map(zone => ({
        ...zone,
        countries: JSON.parse(zone.countries)
      }))
      
      res.status(200).json(parsedZones)
    } catch (error) {
      console.error('Error fetching shipping zones:', error)
      res.status(500).json({ error: 'Failed to fetch shipping zones' })
    }
  } else if (req.method === 'POST') {
    try {
      const { name, countries, rate } = req.body

      const zone = await prisma.shippingZone.create({
        data: {
          name,
          countries: JSON.stringify(countries),
          rate
        }
      })

      res.status(201).json({
        ...zone,
        countries: JSON.parse(zone.countries)
      })
    } catch (error) {
      console.error('Error creating shipping zone:', error)
      res.status(500).json({ error: 'Failed to create shipping zone' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}