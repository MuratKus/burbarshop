import { NextApiRequest, NextApiResponse } from 'next'

// Simple admin login - in production, use proper authentication
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { username, password } = req.body

  // Demo credentials - replace with proper authentication
  if (username === 'admin' && password === 'password') {
    return res.status(200).json({ success: true })
  }

  return res.status(401).json({ message: 'Invalid credentials' })
}