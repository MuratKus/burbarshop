#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

// Use local SQLite database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

async function checkLocalDatabase() {
  try {
    console.log('📊 Checking local dev database...\n');
    
    // Get product count
    const productCount = await prisma.product.count();
    console.log(`📦 Total products: ${productCount}`);
    
    // Get a few products with their images
    const products = await prisma.product.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        images: true,
        type: true,
        basePrice: true
      }
    });
    
    console.log('\n🖼️  Sample products and images:');
    products.forEach(product => {
      console.log(`\n📦 ${product.title}`);
      console.log(`   Type: ${product.type}, Price: €${product.basePrice}`);
      
      try {
        const images = JSON.parse(product.images);
        console.log(`   Images (${images.length}):`);
        images.slice(0, 2).forEach((img, i) => {
          console.log(`     ${i + 1}. ${img}`);
        });
      } catch (e) {
        console.log(`   Images: Error parsing - ${product.images}`);
      }
    });
    
    // Check if any images contain etsy
    const etsyProducts = await prisma.product.findMany({
      where: {
        images: {
          contains: 'etsystatic'
        }
      },
      select: {
        id: true,
        title: true
      }
    });
    
    console.log(`\n🚨 Products with Etsy images: ${etsyProducts.length}`);
    
    // Check for clean images (unsplash, picsum)
    const cleanProducts = await prisma.product.findMany({
      where: {
        OR: [
          { images: { contains: 'unsplash' } },
          { images: { contains: 'picsum' } }
        ]
      },
      select: {
        id: true,
        title: true
      }
    });
    
    console.log(`\n✅ Products with clean images: ${cleanProducts.length}`);
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLocalDatabase();