#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyEtsyImport() {
  try {
    console.log('🔍 Verifying Etsy import specifically...\n');

    // Look for products with Etsy-style titles or image URLs
    const etsyProducts = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: 'Riso Art Print' } },
          { title: { contains: 'Historical Illustration' } },
          { title: { contains: 'Digital Art Print' } },
          { images: { contains: 'etsystatic.com' } }
        ]
      },
      include: {
        variants: true
      }
    });

    console.log(`📦 Found ${etsyProducts.length} Etsy products:`);
    
    etsyProducts.forEach((product, index) => {
      const images = JSON.parse(product.images);
      console.log(`\n${index + 1}. "${product.title}" (${product.type})`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Images: ${images.length} (${images[0]?.includes('etsystatic') ? 'Etsy URLs' : 'Local URLs'})`);
      console.log(`   Base price: $${product.basePrice}`);
      console.log(`   Variants: ${product.variants.length}`);
      
      product.variants.forEach(variant => {
        console.log(`     - ${variant.size}: $${variant.price} (stock: ${variant.stock})`);
      });

      // Show first image URL
      if (images.length > 0) {
        console.log(`   First image: ${images[0].substring(0, 80)}...`);
      }
    });

    // Check for products with Etsy image URLs
    const productsWithEtsyImages = etsyProducts.filter(p => {
      const images = JSON.parse(p.images);
      return images.some(img => img.includes('etsystatic.com'));
    });

    console.log(`\n🖼️  Products with Etsy image URLs: ${productsWithEtsyImages.length}`);

    // Statistics by type for Etsy products
    const typeStats = {};
    etsyProducts.forEach(product => {
      typeStats[product.type] = (typeStats[product.type] || 0) + 1;
    });

    console.log('\n📊 Etsy Products by Type:');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} products`);
    });

    console.log('\n✅ Etsy import verification complete!');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
if (require.main === module) {
  verifyEtsyImport().catch(console.error);
}

module.exports = { verifyEtsyImport };