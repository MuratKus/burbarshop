const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Handle database URL fallback
if (!process.env.DATABASE_URL) {
  if (process.env.DATABASE_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.DATABASE_DATABASE_URL;
  } else if (process.env.POSTGRES_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_URL;
  }
}

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('🔍 Checking current products...');
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        images: true,
        etsyListingId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`\n📊 Found ${products.length} products:`);
    
    products.forEach(product => {
      const images = JSON.parse(product.images || '[]');
      const hasEtsyId = product.etsyListingId ? '✅' : '❌';
      
      console.log(`\n${hasEtsyId} ${product.title}`);
      console.log(`   Images: ${images.length}`);
      console.log(`   Etsy ID: ${product.etsyListingId || 'None'}`);
      
      if (images.length > 0) {
        console.log(`   First image: ${images[0].substring(0, 80)}...`);
      }
    });
    
    const withEtsyId = products.filter(p => p.etsyListingId).length;
    const withoutEtsyId = products.filter(p => !p.etsyListingId).length;
    
    console.log(`\n📈 Summary:`);
    console.log(`   Products with Etsy ID: ${withEtsyId}`);
    console.log(`   Products without Etsy ID: ${withoutEtsyId}`);
    console.log(`   Average images per product: ${(products.reduce((sum, p) => sum + JSON.parse(p.images || '[]').length, 0) / products.length).toFixed(1)}`);
    
  } catch (error) {
    console.error('❌ Error checking products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();