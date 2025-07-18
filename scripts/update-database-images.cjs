#!/usr/bin/env node

/**
 * Update database with local image paths
 * This script replaces Etsy URLs with local paths in the database
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateDatabaseImages() {
  try {
    console.log('🔄 Updating database with local image paths...\n');
    
    // Read the image mapping
    const mappingFile = path.join(__dirname, 'image-mapping.json');
    if (!fs.existsSync(mappingFile)) {
      throw new Error('Image mapping file not found. Run download-artwork.cjs first.');
    }
    
    const imageMapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
    
    // Read the original Etsy data
    const responseData = fs.readFileSync(
      path.join(__dirname, '..', 'response-etsy-backup.json'),
      'utf8'
    );
    const listings = JSON.parse(responseData);
    
    console.log(`📦 Processing ${listings.length} listings...`);
    
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const listing of listings) {
      try {
        const listingId = listing.listing_id;
        const title = listing.title;
        
        console.log(`\n📦 Processing: "${title}"`);
        
        // Check if we have local images for this listing
        const localImages = imageMapping[listingId];
        if (!localImages || localImages.length === 0) {
          console.log('⚠️  No local images found for this listing');
          skipped++;
          continue;
        }
        
        // Find the product in the database by title (or create a slug-based search)
        const slug = title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        
        // Try to find the product by slug or title
        let product = await prisma.product.findFirst({
          where: {
            OR: [
              { slug: slug },
              { title: { contains: title.substring(0, 20) } }
            ]
          }
        });
        
        if (!product) {
          // Create the product if it doesn't exist
          console.log('➕ Creating new product...');
          
          // Determine product type
          let productType = 'FINE_PRINT';
          if (title.toLowerCase().includes('postcard')) productType = 'POSTCARD';
          else if (title.toLowerCase().includes('riso')) productType = 'RISO_PRINT';
          
          // Extract price
          const basePrice = listing.price_int ? listing.price_int / 100 : parseFloat(listing.price) || 20;
          
          product = await prisma.product.create({
            data: {
              title: title,
              description: listing.description || '',
              type: productType,
              basePrice: basePrice,
              images: JSON.stringify(localImages),
              slug: slug,
              variants: {
                create: [
                  {
                    size: 'A4',
                    price: basePrice,
                    stock: listing.quantity || 5
                  }
                ]
              }
            }
          });
          
          console.log(`✅ Created new product: "${title}"`);
          updated++;
        } else {
          // Update existing product with local images
          await prisma.product.update({
            where: { id: product.id },
            data: {
              images: JSON.stringify(localImages)
            }
          });
          
          console.log(`✅ Updated existing product: "${title}"`);
          updated++;
        }
        
      } catch (error) {
        console.error(`❌ Failed to process "${listing.title}":`, error.message);
        failed++;
      }
    }
    
    console.log(`\n🎉 Database update completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   Updated: ${updated} products`);
    console.log(`   Skipped: ${skipped} products`);
    console.log(`   Failed: ${failed} products`);
    
    // Verify no Etsy URLs remain
    const remainingEtsyProducts = await prisma.product.count({
      where: {
        images: {
          contains: 'etsystatic'
        }
      }
    });
    
    console.log(`\n🔍 Verification: ${remainingEtsyProducts} products still have Etsy URLs`);
    
    if (remainingEtsyProducts === 0) {
      console.log('🎉 All Etsy URLs have been replaced with local paths!');
    }
    
  } catch (error) {
    console.error('❌ Database update failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  updateDatabaseImages().catch(console.error);
}

module.exports = { updateDatabaseImages };