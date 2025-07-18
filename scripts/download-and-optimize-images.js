#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const https = require('https');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create directory if it doesn't exist
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Create optimized filename
function createOptimizedFilename(productSlug, imageIndex, originalUrl) {
  const extension = path.extname(new URL(originalUrl).pathname) || '.jpg';
  return `${productSlug}-${imageIndex + 1}${extension}`;
}

async function downloadAndOptimizeImages() {
  try {
    console.log('📥 Starting image download and optimization...\n');

    // Create directories
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    const thumbsDir = path.join(uploadsDir, 'thumbs');
    
    ensureDir(uploadsDir);
    ensureDir(thumbsDir);

    // Get products with external image URLs
    const products = await prisma.product.findMany({
      where: {
        images: {
          contains: 'etsystatic.com'
        }
      }
    });

    console.log(`🎨 Found ${products.length} products with external images`);

    let downloaded = 0;
    let failed = 0;

    for (const product of products) {
      try {
        console.log(`\n📦 Processing: "${product.title}"`);
        
        const images = JSON.parse(product.images);
        const newImagePaths = [];

        for (let i = 0; i < images.length; i++) {
          const imageUrl = images[i];
          const filename = createOptimizedFilename(product.slug, i, imageUrl);
          const filepath = path.join(uploadsDir, filename);
          const publicPath = `/uploads/products/${filename}`;

          try {
            console.log(`   Downloading image ${i + 1}/${images.length}...`);
            await downloadImage(imageUrl, filepath);
            newImagePaths.push(publicPath);
            console.log(`   ✅ Saved: ${filename}`);
          } catch (error) {
            console.log(`   ❌ Failed to download image ${i + 1}: ${error.message}`);
            // Keep original URL as fallback
            newImagePaths.push(imageUrl);
          }
        }

        // Update product with new image paths
        await prisma.product.update({
          where: { id: product.id },
          data: {
            images: JSON.stringify(newImagePaths)
          }
        });

        downloaded++;
        console.log(`   ✅ Updated product with ${newImagePaths.length} images`);

      } catch (error) {
        console.error(`   ❌ Failed to process "${product.title}":`, error.message);
        failed++;
      }
    }

    console.log(`\n🎉 Image download completed!`);
    console.log(`✅ Processed: ${downloaded} products`);
    console.log(`❌ Failed: ${failed} products`);

    // Generate summary
    const summary = {
      totalProducts: products.length,
      processed: downloaded,
      failed: failed,
      storageLocation: uploadsDir,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'scripts', 'image-download-summary.json'),
      JSON.stringify(summary, null, 2)
    );

    console.log(`\n📊 Summary saved to scripts/image-download-summary.json`);

  } catch (error) {
    console.error('❌ Image download failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Alternative: Create image optimization strategy documentation
function createImageStrategy() {
  const strategy = `# Image Storage Strategy for Burbar Shop

## Current Status
- Images imported as direct Etsy CDN links
- 24 products with external image dependencies
- High quality (1000x1000px) images from etsystatic.com

## Recommended Approaches

### 1. Download & Store Locally ✅ (This script)
\`\`\`bash
npm run images:download
\`\`\`
- **Pros**: Full control, fast loading, no external dependencies
- **Cons**: Storage costs, need image optimization pipeline
- **Storage**: ~/public/uploads/products/

### 2. Use Vercel Blob Storage
\`\`\`bash
npm install @vercel/blob
\`\`\`
- **Pros**: Serverless, CDN, automatic optimization
- **Cons**: Vercel vendor lock-in, costs scale with usage
- **Best for**: Production deployments on Vercel

### 3. Use Cloudinary
\`\`\`bash
npm install cloudinary
\`\`\`
- **Pros**: Advanced image transformations, automatic optimization, CDN
- **Cons**: Additional service dependency, costs
- **Best for**: Professional e-commerce with many image variants

### 4. Use Next.js Image Optimization
\`\`\`jsx
import Image from 'next/image'
<Image src="/uploads/products/image.jpg" width={500} height={500} />
\`\`\`
- **Pros**: Built-in optimization, responsive images, lazy loading
- **Cons**: Requires local/blob storage first
- **Best for**: All approaches above

## Implementation Priority
1. ✅ Download images locally (this script)
2. 🔄 Implement Next.js Image component
3. 🔄 Add image compression (sharp)
4. 🔄 Generate thumbnails for product grid
5. 🔄 Consider CDN for production

## Performance Targets
- **Page Load**: <2s for product images
- **Image Size**: <200KB for product grid thumbnails
- **High Resolution**: <1MB for product detail view
- **Format**: WebP with JPEG fallback
`;

  fs.writeFileSync(
    path.join(process.cwd(), 'scripts', 'IMAGE-STRATEGY.md'),
    strategy
  );

  console.log('📝 Image strategy documentation created: scripts/IMAGE-STRATEGY.md');
}

// Run the download or just create strategy
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--strategy-only')) {
    createImageStrategy();
  } else if (args.includes('--download')) {
    downloadAndOptimizeImages().catch(console.error);
  } else {
    console.log('📋 Image Management Options:');
    console.log('');
    console.log('  --download      Download all external images locally');
    console.log('  --strategy-only Create strategy documentation only');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/download-and-optimize-images.js --download');
    console.log('  node scripts/download-and-optimize-images.js --strategy-only');
    
    createImageStrategy();
  }
}

module.exports = { downloadAndOptimizeImages, createOptimizedFilename };