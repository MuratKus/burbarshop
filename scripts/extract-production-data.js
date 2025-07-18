import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import { promisify } from 'util';
import { exec } from 'child_process';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const execAsync = promisify(exec);

// Production database connection
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PROD_DATABASE_URL
    }
  }
});

// Local database connection
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
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

async function extractProductsData() {
  console.log('🔄 Extracting products from production database...');
  
  try {
    const products = await prodPrisma.product.findMany({
      include: {
        variants: true
      }
    });
    
    console.log(`✅ Found ${products.length} products in production`);
    
    // Create images directory structure
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'products');
    await fs.mkdir(imagesDir, { recursive: true });
    
    const localProducts = [];
    
    for (const product of products) {
      console.log(`📥 Processing product: ${product.title}`);
      
      // Parse images JSON
      let images = [];
      try {
        images = JSON.parse(product.images);
      } catch (e) {
        console.warn(`⚠️  Failed to parse images for ${product.title}:`, e.message);
        images = [];
      }
      
      // Download images to local storage
      const localImages = [];
      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i];
        if (imageUrl && imageUrl.startsWith('http')) {
          try {
            const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
            const filename = `${product.slug}-${i}${ext}`;
            const localPath = path.join(imagesDir, filename);
            
            console.log(`  📷 Downloading image ${i + 1}/${images.length}: ${filename}`);
            await downloadImage(imageUrl, localPath);
            
            localImages.push(`/images/products/${filename}`);
          } catch (error) {
            console.warn(`  ⚠️  Failed to download image ${imageUrl}:`, error.message);
          }
        }
      }
      
      // Parse videos JSON
      let videos = [];
      try {
        videos = product.videos ? JSON.parse(product.videos) : [];
      } catch (e) {
        console.warn(`⚠️  Failed to parse videos for ${product.title}:`, e.message);
        videos = [];
      }
      
      // Create local product data
      const localProduct = {
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        images: JSON.stringify(localImages),
        videos: JSON.stringify(videos),
        basePrice: product.basePrice,
        type: product.type,
        etsyListingId: product.etsyListingId,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        variants: product.variants
      };
      
      localProducts.push(localProduct);
    }
    
    // Save extracted data to JSON for backup
    const dataFile = path.join(process.cwd(), 'scripts', 'extracted-products.json');
    await fs.writeFile(dataFile, JSON.stringify(localProducts, null, 2));
    console.log(`💾 Saved extracted data to ${dataFile}`);
    
    return localProducts;
    
  } catch (error) {
    console.error('❌ Failed to extract products:', error);
    throw error;
  } finally {
    await prodPrisma.$disconnect();
  }
}

async function populateLocalDatabase(products) {
  console.log('🔄 Populating local database...');
  
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing local data...');
    await localPrisma.orderItem.deleteMany();
    await localPrisma.order.deleteMany();
    await localPrisma.productVariant.deleteMany();
    await localPrisma.product.deleteMany();
    
    // Insert products
    for (const productData of products) {
      const { variants, ...product } = productData;
      
      console.log(`📝 Creating product: ${product.title}`);
      
      const createdProduct = await localPrisma.product.create({
        data: product
      });
      
      // Insert variants
      for (const variant of variants) {
        await localPrisma.productVariant.create({
          data: {
            id: variant.id,
            productId: createdProduct.id,
            size: variant.size,
            price: variant.price,
            stock: variant.stock
          }
        });
      }
    }
    
    console.log(`✅ Successfully populated local database with ${products.length} products`);
    
  } catch (error) {
    console.error('❌ Failed to populate local database:', error);
    throw error;
  } finally {
    await localPrisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 Starting production data extraction...');
  
  try {
    // Extract products from production
    const products = await extractProductsData();
    
    // Populate local database
    await populateLocalDatabase(products);
    
    console.log('🎉 Data extraction and population completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Products: ${products.length}`);
    console.log(`   Images downloaded to: public/images/products/`);
    console.log(`   Backup saved to: scripts/extracted-products.json`);
    
  } catch (error) {
    console.error('💥 Process failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { extractProductsData, populateLocalDatabase };