#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Clean image URLs from seed data
const cleanImages = [
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1578322450882-57d89ad1fb86?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1578322449189-e4a85fccce2a?w=800&h=800&fit=crop',
  'https://picsum.photos/800/800?random=5',
  'https://picsum.photos/800/800?random=6',
  'https://picsum.photos/800/800?random=7',
  'https://picsum.photos/800/800?random=8',
  'https://picsum.photos/800/800?random=9',
  'https://picsum.photos/800/800?random=10',
  'https://picsum.photos/800/800?random=11',
  'https://picsum.photos/800/800?random=12',
  'https://picsum.photos/800/800?random=13',
  'https://picsum.photos/800/800?random=14',
  'https://picsum.photos/800/800?random=15',
  'https://picsum.photos/800/800?random=16',
  'https://picsum.photos/800/800?random=17',
  'https://picsum.photos/800/800?random=18',
  'https://picsum.photos/800/800?random=19',
  'https://picsum.photos/800/800?random=20'
];

async function fixImages() {
  try {
    console.log('🔧 Fixing product images...\n');
    
    // Get all products with Etsy images
    const etsyProducts = await prisma.product.findMany({
      where: {
        images: {
          contains: 'etsystatic'
        }
      },
      select: {
        id: true,
        title: true,
        images: true
      }
    });
    
    console.log(`📦 Found ${etsyProducts.length} products with Etsy images`);
    
    for (let i = 0; i < etsyProducts.length; i++) {
      const product = etsyProducts[i];
      console.log(`\n🔄 Fixing: ${product.title}`);
      
      // Create new image array (3-4 images per product)
      const imageCount = Math.floor(Math.random() * 2) + 3; // 3-4 images
      const startIndex = i * 3; // Spread out the images
      const newImages = [];
      
      for (let j = 0; j < imageCount; j++) {
        const imageIndex = (startIndex + j) % cleanImages.length;
        newImages.push(cleanImages[imageIndex]);
      }
      
      // Update the product
      await prisma.product.update({
        where: { id: product.id },
        data: {
          images: JSON.stringify(newImages)
        }
      });
      
      console.log(`   ✅ Updated with ${newImages.length} clean images`);
    }
    
    console.log(`\n🎉 Fixed ${etsyProducts.length} products!`);
    
    // Verify the fix
    const remainingEtsyProducts = await prisma.product.count({
      where: {
        images: {
          contains: 'etsystatic'
        }
      }
    });
    
    console.log(`\n🔍 Verification: ${remainingEtsyProducts} products still have Etsy images`);
    
  } catch (error) {
    console.error('❌ Image fix failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixImages();