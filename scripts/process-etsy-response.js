#!/usr/bin/env node

/**
 * Process Etsy response.json and create products in database
 * This script reads the response.json file and creates basic product records
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

function determineType(title, description, tags) {
  const text = `${title} ${description} ${tags ? tags.join(' ') : ''}`.toLowerCase();
  
  if (text.includes('postcard')) return 'POSTCARD';
  if (text.includes('riso') || text.includes('risograph')) return 'RISO';
  return 'FINE_PRINT';
}

function extractBasicVariants(listing) {
  const variants = [];
  
  // Extract price - use price_int (cents) or fallback to price string
  let basePrice = 0;
  if (listing.price_int) {
    basePrice = listing.price_int / 100; // Convert cents to euros
  } else if (listing.price) {
    basePrice = parseFloat(listing.price);
  }
  
  // Try to extract from inventory if available
  if (listing.inventory && listing.inventory.products) {
    listing.inventory.products.forEach(product => {
      if (product.offerings) {
        product.offerings.forEach(offering => {
          let size = 'A4'; // default
          
          // Try to extract size from property values
          if (product.propertyValues) {
            product.propertyValues.forEach(prop => {
              if (prop.valueDisplayName) {
                const sizeName = prop.valueDisplayName.toUpperCase();
                if (sizeName.includes('A4')) size = 'A4';
                else if (sizeName.includes('A5')) size = 'A5';
                else if (sizeName.includes('SQUARE')) size = 'Square';
                else if (sizeName.includes('POSTCARD')) size = 'Postcard';
                else if (sizeName.includes('A3')) size = 'A3';
                else if (sizeName.includes('CUSTOM')) size = 'Custom';
                else if (sizeName.match(/^[A-Z0-9]+$/)) size = prop.valueDisplayName;
              }
            });
          }
          
          variants.push({
            size: size,
            price: offering.price.amount / 100, // Convert from cents
            stock: offering.quantity || 1
          });
        });
      }
    });
  }
  
  // If no variants found, create a default one
  if (variants.length === 0) {
    variants.push({
      size: 'A4',
      price: basePrice,
      stock: listing.quantity || 1
    });
  }
  
  return variants;
}

async function processResponseJson() {
  try {
    console.log('📖 Reading response.json...');
    
    const responseData = fs.readFileSync(
      path.join(__dirname, '..', 'response.json'), 
      'utf8'
    );
    
    const listings = JSON.parse(responseData);
    console.log(`📦 Found ${listings.length} listings to process`);
    
    let created = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const listing of listings) {
      try {
        const slug = generateSlug(listing.title);
        
        // Check if product already exists
        const existingProduct = await prisma.product.findUnique({
          where: { slug }
        });
        
        if (existingProduct) {
          console.log(`⏭️  Product already exists: "${listing.title}"`);
          skipped++;
          continue;
        }
        
        console.log(`📦 Creating product: "${listing.title}"`);
        
        // Extract basic product data
        const variants = extractBasicVariants(listing);
        const basePrice = Math.min(...variants.map(v => v.price));
        
        // Extract images from listing
        const images = [];
        if (listing.listing_images && listing.listing_images.length > 0) {
          listing.listing_images.forEach(img => {
            if (img.url_1588xN) images.push(img.url_1588xN);
            else if (img.url_1140xN) images.push(img.url_1140xN);
            else if (img.url_794xN) images.push(img.url_794xN);
            else if (img.url) images.push(img.url);
          });
        }
        
        // Create product
        const product = await prisma.product.create({
          data: {
            title: listing.title,
            description: listing.description || '',
            type: determineType(listing.title, listing.description, listing.tags),
            basePrice: basePrice,
            images: JSON.stringify(images),
            slug: slug,
            variants: {
              create: variants
            }
          },
          include: { variants: true }
        });
        
        console.log(`✅ Created: "${listing.title}" with ${variants.length} variants`);
        created++;
        
      } catch (error) {
        console.error(`❌ Error creating "${listing.title}":`, error.message);
        failed++;
      }
    }
    
    console.log(`\n🎉 Processing completed!`);
    console.log(`✅ Created: ${created} products`);
    console.log(`⏭️  Skipped: ${skipped} products (already exist)`);
    console.log(`❌ Failed: ${failed} products`);
    
    // Show summary
    const totalProducts = await prisma.product.count();
    const totalVariants = await prisma.productVariant.count();
    
    console.log(`\n📊 Database summary:`);
    console.log(`📦 ${totalProducts} total products`);
    console.log(`📐 ${totalVariants} total variants`);
    
  } catch (error) {
    console.error('❌ Processing failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  processResponseJson().catch(console.error);
}

module.exports = { processResponseJson };