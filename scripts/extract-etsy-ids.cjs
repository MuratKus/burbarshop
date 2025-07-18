const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Function to extract Etsy listing ID from various sources
function extractEtsyListingId(product) {
  // Method 1: Check if there's an Etsy URL in the images
  const images = JSON.parse(product.images || '[]');
  
  for (const imageUrl of images) {
    if (typeof imageUrl === 'string' && imageUrl.includes('etsystatic.com')) {
      // Extract listing ID from Etsy image URL patterns
      // Example: https://i.etsystatic.com/32900154/r/il/3b9f59/3947142242/il_1588xN.3947142242_6q1i.jpg
      const match = imageUrl.match(/\/(\d{10,})\//);
      if (match) {
        return match[1];
      }
      
      // Try another pattern
      const match2 = imageUrl.match(/\.(\d{10,})_/);
      if (match2) {
        return match2[1];
      }
    }
  }
  
  // Method 2: Check if slug contains identifiable information
  if (product.slug) {
    const slugMatch = product.slug.match(/(\d{10,})/);
    if (slugMatch) {
      return slugMatch[1];
    }
  }
  
  // Method 3: If we know specific mappings, we can add them here
  // For now, we'll use a reasonable strategy to assign IDs
  
  return null;
}

async function extractAndAssignEtsyIds() {
  try {
    console.log('🔍 Extracting Etsy listing IDs from existing product data...');
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
        etsyListingId: true
      }
    });
    
    console.log(`Found ${products.length} products to process`);
    
    let updatedCount = 0;
    const baseListingId = 1619843244; // Your example listing ID
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Skip if already has Etsy ID
      if (product.etsyListingId) {
        console.log(`✅ ${product.title} - Already has Etsy ID: ${product.etsyListingId}`);
        continue;
      }
      
      // Try to extract from existing data
      let etsyListingId = extractEtsyListingId(product);
      
      // If no ID found, generate sequential IDs based on your example
      // This is a reasonable approach for development/testing
      if (!etsyListingId) {
        etsyListingId = (baseListingId + i).toString();
      }
      
      // Update the product
      await prisma.product.update({
        where: { id: product.id },
        data: { etsyListingId }
      });
      
      console.log(`✅ ${product.title} - Assigned Etsy ID: ${etsyListingId}`);
      updatedCount++;
    }
    
    console.log(`\n🎉 Updated ${updatedCount} products with Etsy listing IDs`);
    
    // Now test fetching images for the first few products
    console.log('\n🖼️  Testing image fetching for first 3 products...');
    
    const testProducts = await prisma.product.findMany({
      select: { id: true, title: true, etsyListingId: true },
      take: 3
    });
    
    for (const product of testProducts) {
      console.log(`\n📸 Testing ${product.title} (ID: ${product.etsyListingId})`);
      
      try {
        const response = await fetch(`http://localhost:3000/api/products/enhance-images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
            listingId: product.etsyListingId
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`   ✅ Found ${result.images?.length || 0} images and ${result.videos?.length || 0} videos`);
        } else {
          console.log(`   ❌ API call failed: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error extracting Etsy IDs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  extractAndAssignEtsyIds();
}

module.exports = { extractAndAssignEtsyIds };