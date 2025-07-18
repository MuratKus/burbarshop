import { PrismaClient } from '@prisma/client';

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function clearVideos() {
  console.log('🎬 Clearing broken videos from local database...');
  
  try {
    const products = await localPrisma.product.findMany();
    console.log(`📦 Found ${products.length} products to update`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      let hasVideos = false;
      
      try {
        const videos = product.videos ? JSON.parse(product.videos) : [];
        hasVideos = videos && videos.length > 0;
      } catch (e) {
        hasVideos = Boolean(product.videos);
      }
      
      if (hasVideos) {
        await localPrisma.product.update({
          where: { id: product.id },
          data: { videos: null }
        });
        updatedCount++;
        console.log(`  ✅ Cleared videos for: ${product.title}`);
      }
    }
    
    console.log(`🎉 Cleared videos from ${updatedCount} products`);
    
  } catch (error) {
    console.error('❌ Failed to clear videos:', error);
    throw error;
  } finally {
    await localPrisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  clearVideos();
}

export { clearVideos };