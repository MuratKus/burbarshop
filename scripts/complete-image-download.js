import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PROD_DATABASE_URL
    }
  }
});

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function completeImageDownload() {
  console.log('🖼️  Completing image downloads...');
  
  try {
    const products = await prodPrisma.product.findMany();
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'products');
    
    let downloadCount = 0;
    let skippedCount = 0;
    
    for (const product of products) {
      console.log(`📸 Checking images for: ${product.title}`);
      
      let images = [];
      try {
        images = JSON.parse(product.images || '[]');
      } catch (e) {
        console.warn(`⚠️  Failed to parse images for ${product.title}`);
        continue;
      }
      
      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i];
        if (imageUrl && imageUrl.startsWith('http')) {
          const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
          const filename = `${product.slug}-${i}${ext}`;
          const localPath = path.join(imagesDir, filename);
          
          // Check if file already exists
          try {
            await fs.access(localPath);
            console.log(`  ✅ Already exists: ${filename}`);
            skippedCount++;
          } catch (error) {
            // File doesn't exist, download it
            try {
              console.log(`  📥 Downloading: ${filename}`);
              await downloadImage(imageUrl, localPath);
              downloadCount++;
            } catch (downloadError) {
              console.warn(`  ⚠️  Failed to download ${filename}:`, downloadError.message);
            }
          }
        }
      }
    }
    
    console.log(`\n🎉 Image download complete!`);
    console.log(`   📥 Downloaded: ${downloadCount} new images`);
    console.log(`   ✅ Skipped (existing): ${skippedCount} images`);
    
  } catch (error) {
    console.error('❌ Image download failed:', error);
    throw error;
  } finally {
    await prodPrisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  completeImageDownload();
}

export { completeImageDownload };