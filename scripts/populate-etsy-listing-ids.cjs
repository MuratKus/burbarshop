const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mapping of product titles to Etsy listing IDs
// You can extract these from your existing products or Etsy URLs
const ETSY_LISTING_MAP = {
  // Example mapping - you'll need to populate this with actual data
  'Turkish Folk Dance Postcard': '1619843244',
  'Historical Portrait Print': '1234567890',
  // Add more mappings as needed
};

async function populateEtsyListingIds() {
  try {
    console.log('🔗 Populating Etsy listing IDs...');
    
    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        etsyListingId: true
      }
    });
    
    console.log(`Found ${products.length} products to process`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      // Skip if already has Etsy listing ID
      if (product.etsyListingId) {
        console.log(`✅ ${product.title} - Already has Etsy ID: ${product.etsyListingId}`);
        continue;
      }
      
      // Try to find mapping
      const etsyListingId = ETSY_LISTING_MAP[product.title];
      
      if (etsyListingId) {
        await prisma.product.update({
          where: { id: product.id },
          data: { etsyListingId }
        });
        
        console.log(`✅ ${product.title} - Added Etsy ID: ${etsyListingId}`);
        updatedCount++;
      } else {
        console.log(`⚠️  ${product.title} - No Etsy ID mapping found`);
      }
    }
    
    console.log(`\n🎉 Updated ${updatedCount} products with Etsy listing IDs`);
    
    // Show products that still need Etsy IDs
    const productsWithoutIds = await prisma.product.findMany({
      where: { etsyListingId: null },
      select: { id: true, title: true }
    });
    
    if (productsWithoutIds.length > 0) {
      console.log(`\n📝 Products still needing Etsy IDs (${productsWithoutIds.length}):`);
      productsWithoutIds.forEach(product => {
        console.log(`- ${product.title}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error populating Etsy listing IDs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  populateEtsyListingIds();
}

module.exports = { populateEtsyListingIds };