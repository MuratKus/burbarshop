#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const { put } = require('@vercel/blob');
const https = require('https');

const prisma = new PrismaClient();

async function downloadImageAsBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function migrateImagesToBlob() {
  console.log('📦 Migrating images from Etsy CDN to Vercel Blob...');
  
  const products = await prisma.product.findMany({
    where: {
      images: { contains: 'etsystatic.com' }
    }
  });

  console.log(`Found ${products.length} products to migrate`);

  for (const product of products) {
    try {
      const images = JSON.parse(product.images);
      const newImageUrls = [];

      for (let i = 0; i < images.length; i++) {
        const etsyUrl = images[i];
        console.log(`  Downloading: ${product.slug}-${i + 1}`);
        
        // Download image from Etsy
        const imageBuffer = await downloadImageAsBuffer(etsyUrl);
        
        // Upload to Vercel Blob
        const filename = `products/${product.slug}-${i + 1}.jpg`;
        const blob = await put(filename, imageBuffer, {
          access: 'public',
        });
        
        newImageUrls.push(blob.url);
        console.log(`  ✅ Uploaded: ${blob.url}`);
      }

      // Update product with new URLs
      await prisma.product.update({
        where: { id: product.id },
        data: { images: JSON.stringify(newImageUrls) }
      });

      console.log(`✅ Migrated ${product.title}`);
    } catch (error) {
      console.error(`❌ Failed to migrate ${product.title}:`, error.message);
    }
  }

  await prisma.$disconnect();
  console.log('🎉 Migration completed!');
}

if (require.main === module) {
  migrateImagesToBlob().catch(console.error);
}
