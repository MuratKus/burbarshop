import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm } from 'formidable'
import fs from 'fs'
import path from 'path'

// Disable body parser for formidable
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = new IncomingForm()
    form.uploadDir = path.join(process.cwd(), 'public/uploads')
    form.keepExtensions = true
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(form.uploadDir)) {
      fs.mkdirSync(form.uploadDir, { recursive: true })
    }

    const [fields, files] = await form.parse(req)
    const uploadedFiles = Array.isArray(files.images) ? files.images : [files.images].filter(Boolean)
    
    const urls: string[] = []
    
    for (const file of uploadedFiles) {
      if (file && file.filepath) {
        // Generate unique filename
        const timestamp = Date.now()
        const originalName = file.originalFilename || 'image'
        const ext = path.extname(originalName)
        const filename = `${timestamp}-${Math.random().toString(36).substring(7)}${ext}`
        const newPath = path.join(form.uploadDir, filename)
        
        // Move file to final location
        fs.renameSync(file.filepath, newPath)
        
        // Return public URL
        urls.push(`/uploads/${filename}`)
      }
    }
    
    res.status(200).json({ urls })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
}