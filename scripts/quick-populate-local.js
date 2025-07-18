import { PrismaClient } from '@prisma/client';

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

async function quickPopulate() {
  console.log('🚀 Quick population of local database...');
  
  try {
    // Extract products from production (without image download)
    console.log('📦 Extracting products from production...');
    const products = await prodPrisma.product.findMany({
      include: {
        variants: true
      }
    });
    
    console.log(`✅ Found ${products.length} products`);
    
    // Clear existing local data
    console.log('🗑️  Clearing local database...');
    await localPrisma.orderItem.deleteMany();
    await localPrisma.order.deleteMany();
    await localPrisma.productVariant.deleteMany();
    await localPrisma.product.deleteMany();
    
    console.log('📝 Populating local database...');
    
    // Insert products with local image paths
    for (const productData of products) {
      const { variants, ...product } = productData;
      
      // Convert image URLs to local paths if they exist
      let localImages = [];
      try {
        const originalImages = JSON.parse(product.images || '[]');
        localImages = originalImages.map((url, index) => {
          if (url && url.startsWith('http')) {
            const filename = `${product.slug}-${index}.jpg`;
            return `/images/products/${filename}`;
          }
          return url;
        });
      } catch (e) {
        console.warn(`⚠️  Failed to parse images for ${product.title}`);
        localImages = [];
      }
      
      console.log(`  📄 Creating: ${product.title}`);
      
      const createdProduct = await localPrisma.product.create({
        data: {
          ...product,
          images: JSON.stringify(localImages)
        }
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
    
    console.log(`🎉 Successfully populated ${products.length} products!`);
    
    // Verify
    const localCount = await localPrisma.product.count();
    console.log(`✅ Verification: ${localCount} products in local database`);
    
  } catch (error) {
    console.error('❌ Population failed:', error);
    throw error;
  } finally {
    await prodPrisma.$disconnect();
    await localPrisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  quickPopulate();
}

export { quickPopulate };