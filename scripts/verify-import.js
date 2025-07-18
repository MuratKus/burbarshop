#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyImport() {
  try {
    console.log('🔍 Verifying Etsy import...\n');

    // Count products by type
    const productStats = await prisma.product.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    });

    console.log('📊 Product Statistics:');
    productStats.forEach(stat => {
      console.log(`  ${stat.type}: ${stat._count.id} products`);
    });

    // Count total variants
    const totalVariants = await prisma.productVariant.count();
    console.log(`  Total variants: ${totalVariants}`);

    // Get sample products with variants
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      include: {
        variants: true
      }
    });

    console.log('\n🎨 Sample Products:');
    sampleProducts.forEach(product => {
      const imageCount = JSON.parse(product.images).length;
      console.log(`  "${product.title}" (${product.type})`);
      console.log(`    Images: ${imageCount}, Variants: ${product.variants.length}`);
      console.log(`    Base price: $${product.basePrice}`);
      product.variants.forEach(variant => {
        console.log(`      - ${variant.size}: $${variant.price} (stock: ${variant.stock})`);
      });
      console.log('');
    });

    // Check for duplicates
    const duplicates = await prisma.product.groupBy({
      by: ['title'],
      having: {
        title: {
          _count: {
            gt: 1
          }
        }
      },
      _count: {
        title: true
      }
    });

    if (duplicates.length > 0) {
      console.log('⚠️  Duplicate products found:');
      duplicates.forEach(dup => {
        console.log(`  "${dup.title}" (${dup._count.title} copies)`);
      });
    } else {
      console.log('✅ No duplicate products found');
    }

    // Check image URLs are valid
    const productWithImages = await prisma.product.findFirst({
      where: {
        NOT: {
          images: '[]'
        }
      }
    });

    if (productWithImages) {
      const images = JSON.parse(productWithImages.images);
      console.log('\n🖼️  Sample image URLs:');
      images.slice(0, 2).forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
      });
    }

    console.log('\n🎉 Import verification complete!');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
if (require.main === module) {
  verifyImport().catch(console.error);
}

module.exports = { verifyImport };