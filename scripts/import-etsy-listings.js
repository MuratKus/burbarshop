#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to create slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
}

// Helper function to determine product type from tags and title
function determineProductType(title, tags) {
  const titleLower = title.toLowerCase();
  const allTags = tags.join(' ').toLowerCase();
  
  if (titleLower.includes('postcard') || allTags.includes('postcard')) {
    return 'POSTCARD';
  }
  if (titleLower.includes('riso') || allTags.includes('riso') || allTags.includes('risograph')) {
    return 'RISO_PRINT';
  }
  // Default to fine print for art prints
  return 'FINE_PRINT';
}

// Helper function to determine sizes from Etsy inventory data
function determineSizes(listing) {
  const sizes = [];
  
  // Check if there are variations in pricing (indicates different sizes)
  if (listing.has_variation_pricing) {
    // If there are different price points, assume different sizes
    const minPrice = listing.inventory_min_price_int / 100;
    const maxPrice = listing.inventory_max_price_int / 100;
    
    if (minPrice !== maxPrice) {
      // Multiple sizes with different prices
      sizes.push(
        { size: 'A5', price: minPrice, stock: Math.floor(listing.quantity / 2) },
        { size: 'A4', price: maxPrice, stock: Math.ceil(listing.quantity / 2) }
      );
    } else {
      // Same price but multiple sizes (from title/tags)
      const title = listing.title.toLowerCase();
      if (title.includes('a4')) {
        sizes.push({ size: 'A4', price: minPrice, stock: listing.quantity });
      } else if (title.includes('a5')) {
        sizes.push({ size: 'A5', price: minPrice, stock: listing.quantity });
      } else {
        // Default size based on type
        const type = determineProductType(listing.title, listing.tags);
        const defaultSize = type === 'POSTCARD' ? 'A5' : 'A4';
        sizes.push({ size: defaultSize, price: minPrice, stock: listing.quantity });
      }
    }
  } else {
    // Single size/price
    const price = listing.price_int / 100;
    const title = listing.title.toLowerCase();
    
    let defaultSize = 'A4';
    if (title.includes('postcard') || title.includes('a5')) {
      defaultSize = 'A5';
    } else if (title.includes('square')) {
      defaultSize = 'SQUARE';
    }
    
    sizes.push({ size: defaultSize, price: price, stock: listing.quantity });
  }
  
  return sizes;
}

// Helper function to extract description from title and tags
function createDescription(title, tags) {
  // Create a description from tags, filtering out common ones
  const commonTags = ['handmade', 'digital art print', 'gift ideas', 'wall decor', 'art', 'print'];
  const relevantTags = tags.filter(tag => 
    !commonTags.some(common => tag.toLowerCase().includes(common.toLowerCase()))
  );
  
  // Create description based on title and relevant tags
  const titleParts = title.split('|').map(part => part.trim());
  const mainTitle = titleParts[0];
  const subTitle = titleParts.slice(1).join(' • ');
  
  let description = `${mainTitle}`;
  if (subTitle) {
    description += `\n\n${subTitle}`;
  }
  
  if (relevantTags.length > 0) {
    description += `\n\nFeaturing: ${relevantTags.slice(0, 5).join(', ')}`;
  }
  
  description += '\n\nHigh-quality art print perfect for home decoration. Professionally printed with attention to detail.';
  
  return description;
}

async function importEtsyListings() {
  try {
    console.log('🎨 Starting Etsy listings import...');
    
    // Read the response.json file
    const responseData = fs.readFileSync(
      path.join(__dirname, '..', 'response.json'), 
      'utf8'
    );
    
    const listings = JSON.parse(responseData);
    console.log(`📦 Found ${listings.length} listings to import`);
    
    let imported = 0;
    let skipped = 0;
    
    for (const listing of listings) {
      try {
        // Create slug and check if product already exists
        const slug = createSlug(listing.title);
        const existingProduct = await prisma.product.findUnique({
          where: { slug }
        });
        
        if (existingProduct) {
          console.log(`⏭️  Skipping "${listing.title}" - already exists`);
          skipped++;
          continue;
        }
        
        // Extract all image URLs (use high quality ones)
        const images = listing.listing_images.map(img => img.url_1000x1000 || img.url_794xN || img.url);
        
        // Determine product type
        const type = determineProductType(listing.title, listing.tags);
        
        // Create description
        const description = createDescription(listing.title, listing.tags);
        
        // Determine sizes and pricing
        const sizes = determineSizes(listing);
        const basePrice = Math.min(...sizes.map(s => s.price));
        
        // Create the product
        const product = await prisma.product.create({
          data: {
            title: listing.title,
            slug: slug,
            description: description,
            images: JSON.stringify(images),
            basePrice: basePrice,
            type: type,
            variants: {
              create: sizes.map(size => ({
                size: size.size,
                price: size.price,
                stock: size.stock
              }))
            }
          },
          include: {
            variants: true
          }
        });
        
        console.log(`✅ Imported: "${listing.title}" (${type}) with ${sizes.length} variant(s)`);
        imported++;
        
      } catch (error) {
        console.error(`❌ Error importing "${listing.title}":`, error.message);
      }
    }
    
    console.log(`\n🎉 Import completed!`);
    console.log(`✅ Imported: ${imported} products`);
    console.log(`⏭️  Skipped: ${skipped} products (already exist)`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
if (require.main === module) {
  importEtsyListings().catch(console.error);
}

module.exports = { importEtsyListings };