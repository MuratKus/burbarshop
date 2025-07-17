#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Cookies extracted from your curl command
const ETSY_COOKIES = `user_prefs=n-seQfMhfeeYzXD9nwNSmggW7YljZACC9P6LDTA6Wik02EVJJ680J0dHKTVPNzRYSUfJ2QcqYgShcBGxDAA.; fve=1737478528.0; ua=531227642bc86f3b5fd7103a0c0b4fd6; _ga=GA1.1.694987907.1737478531; _pin_unauth=dWlkPU5URTRZVGxoTkRVdE0yTTJZUzAwTWpNeUxUbGhOV1F0Tnpjd056STVZbUZoT0daag; uaid=Tli96U-O6g-jlunBPWMtUedJcytjZACC9P6LDSA6oyS7rFqpNDEzRclKyTMqpzDAMUTXr9zC0dw927WqKsA7Vdc9PzOlxFeplgEA; exp_ebid=m=RRolJEHTs16fG%2FA69HuF%2BtOBoqr94vWZMiQvrA67UjA%3D,v=u-Zj7GXAAh9h1UqC41Vrb2xG8sXY7CtE; p=eyJnZHByX3RwIjoxLCJnZHByX3AiOjEsIkFkdmVydGlzaW5nIjoxLCJGdW5jdGlvbmFsIjoxfQ..; _gcl_au=1.1.688733953.1752460153; lantern=8b8e6035-7628-4372-b5dc-12f34fa5b9b0; _fbp=fb.1.1752460155798.6907949577672871; session-key-www=146595362-1394885273479-562a49aa6bcc5362d3d30ecd600bd073d001daae1452ade89c1b74b9|1760526966; session-key-apex=146595362-1394885273479-a88da1611cbbace2170916104fbc9de94b32cf483b4f6bde18a3aced|1760526966; LD=1; et-v1-1-1-_etsy_com=2%3A7819383049f1718003c09c9c4ab2b62a1d13453f; last_browse_page=https%3A%2F%2Fwww.etsy.com%2Fde-en%2Fshop%2FBurcinBarbaros; _ga_KR3J610VYM=GS2.1.s1752764288$o8$g1$t1752764387$j55$l0$h0; _tq_id.TV-8172638145-1.a4d5=a93fbf2ec99ae727.1752460159.0.1752764387..; _uetsid=898cd530624d11f08fd735f40425f8f3; _uetvid=8626c7f0d81811ef9433bd7e91089304; datadome=os8tkDvu1aAUGUnahnshhaOCowJGPw8tqw5I9mtopsTaokes~gOLb1~TO_wUKvosRzz4eru3Bj~0aSyotGnWPPtvFRrcEiWzAfj7duV2CN9RtJWZaMDLHYcvxnaRPmB3`;

const SHOP_ID = '32900154';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchDetailedListingData(listingId) {
  const url = `https://www.etsy.com/api/v3/ajax/bespoke/shop/${SHOP_ID}/listing-editor-data/edit/${listingId}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en-DE;q=0.9,en;q=0.8,de-DE;q=0.7,de;q=0.6,tr-TR;q=0.5,tr;q=0.4',
        'content-type': 'application/json',
        'cookie': ETSY_COOKIES,
        'referer': `https://www.etsy.com/your/shops/me/listing-editor/edit/${listingId}`,
        'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        'x-detected-locale': 'EUR|en-US|DE',
        'x-transform-response': 'camel-case'
      }
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error(`Failed to fetch listing ${listingId}: ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching listing ${listingId}:`, error.message);
    return null;
  }
}

function extractImages(detailedData) {
  const images = [];
  
  // Try to get images from the formatted listing images
  if (detailedData?.listing?.formattedListingImages) {
    detailedData.listing.formattedListingImages.forEach(img => {
      // Get the highest quality version available
      if (img.url1588xN) images.push(img.url1588xN);
      else if (img.url1140xN) images.push(img.url1140xN);
      else if (img.url1000x1000) images.push(img.url1000x1000);
      else if (img.url794xN) images.push(img.url794xN);
      else if (img.fullxfullUrl) images.push(img.fullxfullUrl);
      else if (img.url) images.push(img.url);
    });
  }
  
  // Fallback to regular images field
  if (images.length === 0 && detailedData?.listing?.images) {
    detailedData.listing.images.forEach(img => {
      if (img.url1588xN) images.push(img.url1588xN);
      else if (img.url1140xN) images.push(img.url1140xN);
      else if (img.url1000x1000) images.push(img.url1000x1000);
      else if (img.url794xN) images.push(img.url794xN);
      else if (img.url) images.push(img.url);
    });
  }

  return images;
}

function extractVideos(detailedData) {
  const videos = [];
  
  // Extract videos from listing videos
  if (detailedData?.listing?.videos) {
    detailedData.listing.videos.forEach(video => {
      if (video.url) {
        videos.push({
          url: video.url,
          thumbnail: video.thumbnailUrl || video.thumbnail_url,
          type: 'video/mp4' // Default type, could be extracted from URL
        });
      }
    });
  }
  
  // Also check formattedListingVideos if available
  if (detailedData?.listing?.formattedListingVideos) {
    detailedData.listing.formattedListingVideos.forEach(video => {
      if (video.url) {
        videos.push({
          url: video.url,
          thumbnail: video.thumbnailUrl || video.thumbnail_url,
          type: video.mimeType || 'video/mp4'
        });
      }
    });
  }
  
  return videos;
}

function extractVariants(detailedData) {
  const variants = [];
  
  if (detailedData?.listing?.inventory?.products) {
    detailedData.listing.inventory.products.forEach(product => {
      if (product.offerings) {
        product.offerings.forEach(offering => {
          // Extract size from property values or product name
          let size = 'A4'; // default
          
          if (product.propertyValues) {
            product.propertyValues.forEach(prop => {
              if (prop.valueDisplayName) {
                const sizeName = prop.valueDisplayName.toUpperCase();
                // More comprehensive size detection
                if (sizeName.includes('A4') || sizeName.includes('21') && sizeName.includes('29.7')) size = 'A4';
                else if (sizeName.includes('A5') || sizeName.includes('14.8') && sizeName.includes('21')) size = 'A5';
                else if (sizeName.includes('SQUARE') || sizeName.includes('15') && sizeName.includes('15')) size = 'Square';
                else if (sizeName.includes('POSTCARD') || sizeName.includes('10') && sizeName.includes('15')) size = 'Postcard';
                else if (sizeName.includes('A3') || sizeName.includes('29.7') && sizeName.includes('42')) size = 'A3';
                else if (sizeName.includes('CUSTOM')) size = 'Custom';
                // Use the actual value if it's a clear size designation
                else if (sizeName.match(/^[A-Z0-9]+$/)) size = prop.valueDisplayName;
              }
            });
          }
          
          // Also check if the offering has property information
          if (offering.propertyValues) {
            offering.propertyValues.forEach(prop => {
              if (prop.valueDisplayName) {
                const sizeName = prop.valueDisplayName.toUpperCase();
                if (sizeName.includes('A4') || sizeName.includes('21') && sizeName.includes('29.7')) size = 'A4';
                else if (sizeName.includes('A5') || sizeName.includes('14.8') && sizeName.includes('21')) size = 'A5';
                else if (sizeName.includes('SQUARE') || sizeName.includes('15') && sizeName.includes('15')) size = 'Square';
                else if (sizeName.includes('POSTCARD') || sizeName.includes('10') && sizeName.includes('15')) size = 'Postcard';
                else if (sizeName.includes('A3') || sizeName.includes('29.7') && sizeName.includes('42')) size = 'A3';
                else if (sizeName.includes('CUSTOM')) size = 'Custom';
                else if (sizeName.match(/^[A-Z0-9]+$/)) size = prop.valueDisplayName;
              }
            });
          }
          
          variants.push({
            size: size,
            price: offering.price.amount / 100, // Convert from cents
            stock: offering.quantity || 0
          });
        });
      }
    });
  }
  
  // If no variants found, create a default one
  if (variants.length === 0 && detailedData?.listing?.price) {
    variants.push({
      size: 'A4',
      price: detailedData.listing.price.amount / 100,
      stock: detailedData.listing.quantity || 1
    });
  }
  
  return variants;
}

async function updateProductWithDetailedData() {
  try {
    console.log('🔍 Fetching detailed Etsy data for all products...');
    
    // Read the original response.json to get listing IDs
    const responseData = fs.readFileSync(
      path.join(__dirname, '..', 'response.json'), 
      'utf8'
    );
    
    const listings = JSON.parse(responseData);
    console.log(`📦 Found ${listings.length} listings to update`);
    
    let updated = 0;
    let failed = 0;
    
    for (const listing of listings) {
      try {
        console.log(`📥 Fetching detailed data for: "${listing.title}"`);
        
        // Find the product in our database
        const slug = listing.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');
          
        const product = await prisma.product.findUnique({
          where: { slug },
          include: { variants: true }
        });
        
        if (!product) {
          console.log(`⚠️  Product not found in database: "${listing.title}"`);
          continue;
        }
        
        // Fetch detailed data from Etsy
        const detailedData = await fetchDetailedListingData(listing.listing_id);
        
        if (!detailedData) {
          console.log(`❌ Failed to fetch detailed data for: "${listing.title}"`);
          failed++;
          continue;
        }
        
        // Extract images, videos, and variants
        const newImages = extractImages(detailedData);
        const newVideos = extractVideos(detailedData);
        const newVariants = extractVariants(detailedData);
        
        let updateData = {};
        
        // Update images if we got new ones
        if (newImages.length > 0) {
          updateData.images = JSON.stringify(newImages);
          console.log(`  📷 Found ${newImages.length} images`);
        }
        
        // Update videos if we got new ones
        if (newVideos.length > 0) {
          updateData.videos = JSON.stringify(newVideos);
          console.log(`  🎥 Found ${newVideos.length} videos`);
        }
        
        // Update variants if we have new variant data
        if (newVariants.length > 0) {
          console.log(`  📐 Found ${newVariants.length} variants`);
          
          // Delete existing variants and create new ones
          await prisma.productVariant.deleteMany({
            where: { productId: product.id }
          });
          
          updateData.variants = {
            create: newVariants.map(variant => ({
              size: variant.size,
              price: variant.price,
              stock: variant.stock
            }))
          };
          
          // Update base price to minimum variant price
          updateData.basePrice = Math.min(...newVariants.map(v => v.price));
        }
        
        // Update the product if we have changes
        if (Object.keys(updateData).length > 0) {
          await prisma.product.update({
            where: { id: product.id },
            data: updateData,
            include: { variants: true }
          });
          
          console.log(`✅ Updated: "${listing.title}"`);
          updated++;
        } else {
          console.log(`⏭️  No new data for: "${listing.title}"`);
        }
        
        // Rate limiting - wait between requests
        await sleep(2000);
        
      } catch (error) {
        console.error(`❌ Error updating "${listing.title}":`, error.message);
        failed++;
      }
    }
    
    console.log(`\n🎉 Update completed!`);
    console.log(`✅ Updated: ${updated} products`);
    console.log(`❌ Failed: ${failed} products`);
    
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Instructions for use
if (require.main === module) {
  console.log(`
🔧 SETUP REQUIRED:

1. Update the ETSY_COOKIES constant in this script with your current browser cookies
2. Make sure your cookies are fresh (login to Etsy first)
3. Run: node scripts/fetch-detailed-etsy-data.js

⚠️  WARNING: This script makes API calls to Etsy. Use responsibly and respect rate limits.
  `);
  
  updateProductWithDetailedData().catch(console.error);
}

module.exports = { updateProductWithDetailedData };