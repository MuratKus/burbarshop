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

async function checkVideoData() {
  try {
    const productsWithVideos = await prisma.product.findMany({
      where: {
        videos: {
          not: '[]'
        }
      },
      select: {
        id: true,
        title: true,
        videos: true
      },
      take: 3
    });
    
    console.log('🎥 Products with videos:');
    productsWithVideos.forEach(product => {
      console.log(`\n📹 ${product.title}`);
      console.log('Raw videos:', product.videos);
      try {
        const videos = JSON.parse(product.videos);
        console.log('Parsed videos:', videos);
        console.log('Type of first video:', typeof videos[0]);
        if (videos[0]) {
          console.log('First video keys:', Object.keys(videos[0]));
        }
      } catch (e) {
        console.log('Error parsing videos:', e.message);
      }
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkVideoData();