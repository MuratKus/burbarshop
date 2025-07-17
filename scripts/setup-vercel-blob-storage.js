#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');

/**
 * Setup script for Vercel Blob Storage integration
 * This migrates from Etsy CDN to your own storage
 */

function createBlobIntegration() {
  console.log('🔧 Setting up Vercel Blob Storage integration...\n');

  // 1. Environment variables setup
  const envExample = `
# Add these to your .env.local for Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_your_token_here"

# Production deployment will auto-generate these:
# BLOB_STORE_ID will be auto-set by Vercel
# BLOB_TOKEN will be auto-set by Vercel
`;

  fs.writeFileSync('.env.blob.example', envExample.trim());
  console.log('✅ Created .env.blob.example');

  // 2. Create image upload utility
  const imageUploadUtil = `import { put, del } from '@vercel/blob';

export class ImageService {
  /**
   * Upload image to Vercel Blob Storage
   */
  static async uploadImage(file: File | Buffer, filename: string): Promise<string> {
    try {
      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: true, // Prevents filename conflicts
      });
      
      return blob.url;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new Error('Image upload failed');
    }
  }

  /**
   * Delete image from Vercel Blob Storage
   */
  static async deleteImage(url: string): Promise<void> {
    try {
      await del(url);
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw new Error('Image deletion failed');
    }
  }

  /**
   * Generate optimized image URLs for different sizes
   */
  static getOptimizedUrl(originalUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}): string {
    const url = new URL(originalUrl);
    
    if (options.width) url.searchParams.set('w', options.width.toString());
    if (options.height) url.searchParams.set('h', options.height.toString());
    if (options.quality) url.searchParams.set('q', options.quality.toString());
    
    return url.toString();
  }

  /**
   * Create responsive image variants
   */
  static getResponsiveUrls(originalUrl: string) {
    return {
      thumbnail: this.getOptimizedUrl(originalUrl, { width: 300, height: 300, quality: 80 }),
      medium: this.getOptimizedUrl(originalUrl, { width: 600, height: 600, quality: 85 }),
      large: this.getOptimizedUrl(originalUrl, { width: 1200, height: 1200, quality: 90 }),
      original: originalUrl
    };
  }
}
`;

  fs.writeFileSync('lib/image-service.ts', imageUploadUtil);
  console.log('✅ Created lib/image-service.ts');

  // 3. Create migration script
  const migrationScript = `#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const { put } = require('@vercel/blob');
const https = require('https');

const prisma = new PrismaClient();

async function downloadImageAsBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(\`HTTP \${response.statusCode}\`));
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

  console.log(\`Found \${products.length} products to migrate\`);

  for (const product of products) {
    try {
      const images = JSON.parse(product.images);
      const newImageUrls = [];

      for (let i = 0; i < images.length; i++) {
        const etsyUrl = images[i];
        console.log(\`  Downloading: \${product.slug}-\${i + 1}\`);
        
        // Download image from Etsy
        const imageBuffer = await downloadImageAsBuffer(etsyUrl);
        
        // Upload to Vercel Blob
        const filename = \`products/\${product.slug}-\${i + 1}.jpg\`;
        const blob = await put(filename, imageBuffer, {
          access: 'public',
        });
        
        newImageUrls.push(blob.url);
        console.log(\`  ✅ Uploaded: \${blob.url}\`);
      }

      // Update product with new URLs
      await prisma.product.update({
        where: { id: product.id },
        data: { images: JSON.stringify(newImageUrls) }
      });

      console.log(\`✅ Migrated \${product.title}\`);
    } catch (error) {
      console.error(\`❌ Failed to migrate \${product.title}:\`, error.message);
    }
  }

  await prisma.$disconnect();
  console.log('🎉 Migration completed!');
}

if (require.main === module) {
  migrateImagesToBlob().catch(console.error);
}
`;

  fs.writeFileSync('scripts/migrate-to-blob.js', migrationScript);
  console.log('✅ Created scripts/migrate-to-blob.js');

  // 4. Create Next.js image component
  const imageComponent = `import Image from 'next/image';
import { ImageService } from '@/lib/image-service';

interface ProductImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  variant?: 'thumbnail' | 'medium' | 'large' | 'original';
}

export function ProductImage({ 
  src, 
  alt, 
  width = 500, 
  height = 500, 
  className = '',
  priority = false,
  variant = 'medium'
}: ProductImageProps) {
  // Get optimized URL based on variant
  const responsiveUrls = ImageService.getResponsiveUrls(src);
  const optimizedSrc = responsiveUrls[variant];

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      className={\`object-cover \${className}\`}
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}

// Usage examples:
// <ProductImage src={product.images[0]} alt={product.title} variant="thumbnail" />
// <ProductImage src={product.images[0]} alt={product.title} variant="large" priority />
`;

  fs.writeFileSync('components/ui/product-image.tsx', imageComponent);
  console.log('✅ Created components/ui/product-image.tsx');

  // 5. Update package.json scripts
  console.log('\n📋 Next Steps:');
  console.log('1. Install Vercel Blob: npm install @vercel/blob');
  console.log('2. Add BLOB_READ_WRITE_TOKEN to .env.local');
  console.log('3. Run migration: node scripts/migrate-to-blob.js');
  console.log('4. Update image components to use ProductImage');
  console.log('5. Deploy to Vercel (auto-configures Blob Storage)');

  // 6. Create cost estimation
  const costInfo = `
# Vercel Blob Storage Costs

## Free Tier
- 5GB storage
- 100GB bandwidth per month
- Perfect for starting out

## Pro Tier ($20/month)
- 100GB storage  
- 1TB bandwidth per month
- Most small shops stay in free tier

## Cost per image (estimate):
- Average art print image: ~500KB
- 1000 products × 2 images = ~1GB storage
- Well within free tier!

## Compared to alternatives:
- Cloudinary: $89/month for similar
- AWS S3: ~$25/month + CloudFront costs
- Vercel Blob: $0-20/month total
`;

  fs.writeFileSync('scripts/STORAGE-COSTS.md', costInfo.trim());
  console.log('\n💰 Cost analysis saved to scripts/STORAGE-COSTS.md');
}

if (require.main === module) {
  createBlobIntegration();
}

module.exports = { createBlobIntegration };