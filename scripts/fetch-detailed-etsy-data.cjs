const https = require('https');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Handle database URL fallback
if (!process.env.DATABASE_URL) {
  if (process.env.DATABASE_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.DATABASE_DATABASE_URL;
  } else if (process.env.POSTGRES_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_URL;
  } else {
    console.error('❌ No DATABASE_URL found in environment');
    process.exit(1);
  }
}

const prisma = new PrismaClient();

// Function to fetch detailed listing data from Etsy API
function fetchDetailedListingData(listingId) {
  return new Promise((resolve, reject) => {
    const url = `https://www.etsy.com/api/v3/ajax/bespoke/shop/32900154/listing-editor-data/edit/${listingId}`;
    
    const options = {
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en-DE;q=0.9,en;q=0.8,de-DE;q=0.7,de;q=0.6,tr-TR;q=0.5,tr;q=0.4',
        'content-type': 'application/json',
        'cookie': 'user_prefs=n-seQfMhfeeYzXD9nwNSmggW7YljZACC9P6LDTA6Wik02EVJJ680J0dHKTVPNzRYSUfJ2QcqYgShcBGxDAA.; fve=1737478528.0; ua=531227642bc86f3b5fd7103a0c0b4fd6; _ga=GA1.1.694987907.1737478531; _pin_unauth=dWlkPU5URTRZVGxoTkRVdE0yTTJZUzAwTWpNeUxUbGhOV1F0Tnpjd056STVZbUZoT0daag; uaid=Tli96U-O6g-jlunBPWMtUedJcytjZACC9P6LDSA6oyS7rFqpNDEzRclKyTMqpzDAMUTXr9zC0dw927WqKsA7Vdc9PzOlxFeplgEA; exp_ebid=m=RRolJEHTs16fG%2FA69HuF%2BtOBoqr94vWZMiQvrA67UjA%3D,v=u-Zj7GXAAh9h1UqC41Vrb2xG8sXY7CtE; p=eyJnZHByX3RwIjoxLCJnZHByX3AiOjEsIkFkdmVydGlzaW5nIjoxLCJGdW5jdGlvbmFsIjoxfQ..; _gcl_au=1.1.688733953.1752460153; lantern=8b8e6035-7628-4372-b5dc-12f34fa5b9b0; _fbp=fb.1.1752460155798.6907949577672871; session-key-www=146595362-1394885273479-562a49aa6bcc5362d3d30ecd600bd073d001daae1452ade89c1b74b9|1760526966; session-key-apex=146595362-1394885273479-a88da1611cbbace2170916104fbc9de94b32cf483b4f6bde18a3aced|1760526966; LD=1; et-v1-1-1-_etsy_com=2%3A7819383049f1718003c09c9c4ab2b62a1d13453f%3A1752750966%3A1752750966%3A__athena_compat-146595362-1394885273479-0798cbe582b14efb1b7864d0ea19f5175eeb03718841aa12a358205f2e8000db8018642b415cb20c; last_browse_page=https%3A%2F%2Fwww.etsy.com%2Fde-en%2Fshop%2FBurcinBarbaros; fbm_89186614300=base_domain=.www.etsy.com; fbsr_89186614300=SONRvShpdop1RQVIV1LYHVCC-mrr7h__WH28Ib2fDjg.eyJ1c2VyX2lkIjoiMTAxNTY2NjE5MzE1NTA0NDMiLCJjb2RlIjoiQVFDMlBqRXZHNF9ST0FEcGxxS19rTkNIbzVmQ0pfcTBCMnROV3lNQlVCX2JQd256cmR4dHVDaVZvYXJ3dUZ4bENndXB0Qng3NFk5MW9qY2hpekxpMjczN3d5MTU5UnJlcmZCU2d3dU1RWG8wS21WZHhaNFlQNDVCeFU5U2Z5WF8xSWJGNmJ5QklPVlR4eXhCMlBlcExWZW5oWXR6TnM0dzNZbzNJUUhQVGtGc1BKLWUyXzYxLVd1Ny1QMnVWZnJuS2xaN29fLXpkZkJaLTIxU2xlYTVHLVk0NmJYUnczSEV5TjVka0k1ZGJqeEc3ZnZORllEbDFTT1BFdHhwcUhMNEJ3LVY2NXgyaXFreDNyOTVaaGVIMjgxOV9EWDNOaTRvN1h5b3IxOUFYdFo5WXliYzh3eDk5c2N4aVhFYUlBOEZ1TXd4YzRZQWNjOUtRdkFQZkRIbXgyc1d4OVBMWjJVeHV6NU9RbXMzUnRycXZnIiwib2F1dGhfdG9rZW4iOiJFQUFBQUZNUHZ2QndCUEtxc2h2Vm5DS3ZYZzczNzJNemlwU1ZCRVI2UUpGVkxObXRjYWpSa1lGM3p5UVpDMzlEeWNTRWFydUxVUmhaQnhZT21aQUdBRmp6VWdrM1NYc0NkODlpMndIZGtqTHBFc3owbmlHdVlhWkJ4cEVBcFFWUjFWTWJuV05hQUZJekM3clJzdU5YdWlzaTlMNURIYzFMQ255Q3NaQUR5NEk5c05aQ1dneTlGSDkxclhlRWdHcnFOWVpEIiwiYWxnb3JpdGhtIjoiSE1BQy1TSEEyNTYiLCJpc3N1ZWRfYXQiOjE3NTI4NTI5ODV9; ship_by_date_seller_v_client_timezone_analytics=true; _tq_id.TV-8172638145-1.a4d5=a93fbf2ec99ae727.1752460159.0.1752853260..; _uetsid=898cd530624d11f08fd735f40425f8f3; _uetvid=8626c7f0d81811ef9433bd7e91089304; datadome=qO0Ymj7l5iglOgi3fEUQVTrrslmUSiuAyVIwDz0Wvq3~On1pOPYo1ilL1VgnYAnVw0asLXDVxAxlE70CfvoJ7OxLC2MyiuG4DrKPryTiDTaEkDNuChqjvYfOXu3WVprZ; _ga_KR3J610VYM=GS2.1.s1752852888$o13$g1$t1752854077$j60$l0$h0',
        'downlink': '10',
        'dpr': '1.6',
        'ect': '4g',
        'priority': 'u=1, i',
        'referer': `https://www.etsy.com/your/shops/me/listing-editor/edit/${listingId}`,
        'rtt': '100',
        'sec-ch-dpr': '1.6',
        'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-arch': '"x86"',
        'sec-ch-ua-bitness': '"64"',
        'sec-ch-ua-full-version-list': '"Google Chrome";v="137.0.7151.120", "Chromium";v="137.0.7151.120", "Not/A)Brand";v="24.0.0.0"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-ch-ua-platform-version': '"15.3.0"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        'x-detected-locale': 'EUR|en-US|DE',
        'x-page-guid': 'ff12df50778.847e62555ee7f4a20946.00',
        'x-transform-response': 'camel-case'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Failed to parse JSON for listing ${listingId}: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

// Test the detailed API with a single listing
async function testDetailedAPI() {
  try {
    console.log('🔍 Testing detailed Etsy API...');
    
    // Test with the listing ID from your curl command
    const listingId = '1634010829';
    const detailedData = await fetchDetailedListingData(listingId);
    
    console.log('📊 Detailed API Response Keys:');
    console.log(Object.keys(detailedData));
    
    // Look for listing data - try different property names
    const listing = detailedData.listing || detailedData.listingData || detailedData.listingEditorData;
    
    if (listing) {
      console.log('\n📝 Listing Data Structure:');
      console.log('Title:', listing.title);
      console.log('Available keys:', Object.keys(listing));
      
      // Check for images in different locations
      const images = listing.images || listing.formattedListingImages || [];
      if (images && Array.isArray(images)) {
        console.log('\n🖼️  Images found:', images.length);
        images.forEach((img, index) => {
          console.log(`Image ${index + 1}:`, img.url1588XN || img.url570XN || img.urlFullXFull || img.url || 'No URL found');
        });
      }
      
      // Check for videos in different locations
      const videos = listing.videos || listing.formFields?.videos || [];
      if (videos && Array.isArray(videos)) {
        console.log('\n🎥 Videos found:', videos.length);
        videos.forEach((video, index) => {
          console.log(`Video ${index + 1}:`, video.url || video.videoUrl || 'No URL found');
        });
      }
      
      // Also check formFields for media
      if (listing.formFields) {
        console.log('\n📋 Form Fields available:', Object.keys(listing.formFields));
        
        // Check video field specifically
        if (listing.formFields.video) {
          console.log('📹 Video data:', listing.formFields.video);
        }
        
        // Check listingImages field
        if (listing.formFields.listingImages) {
          console.log('🖼️  Listing Images data:', listing.formFields.listingImages.length);
        }
      }
      
      // Debug: show sample structure
      console.log('\n🔍 Sample listing structure:');
      console.log(JSON.stringify(listing, null, 2).substring(0, 1000) + '...');
    } else {
      console.log('\n❌ No listing data found. Showing available data structure:');
      console.log(JSON.stringify(detailedData, null, 2).substring(0, 1500) + '...');
    }
    
    console.log('\n✅ Detailed API test complete');
    
  } catch (error) {
    console.error('❌ Error testing detailed API:', error.message);
    console.error('Full error:', error);
  }
}

// Update all products with detailed images and videos
async function updateAllProductsWithDetailedData() {
  try {
    console.log('🔄 Updating all products with detailed images and videos...');
    
    // Get all products with Etsy listing IDs
    const products = await prisma.product.findMany({
      where: {
        etsyListingId: {
          not: null
        }
      },
      select: {
        id: true,
        title: true,
        etsyListingId: true
      }
    });
    
    console.log(`📦 Found ${products.length} products to update`);
    
    let updated = 0;
    
    for (const product of products) {
      console.log(`\n🎨 Processing: ${product.title} (ID: ${product.etsyListingId})`);
      
      try {
        // Fetch detailed data for this listing
        const detailedData = await fetchDetailedListingData(product.etsyListingId);
        
        if (!detailedData.listing) {
          console.log('   ❌ No listing data found');
          continue;
        }
        
        const listing = detailedData.listing;
        
        // Extract all images from formattedListingImages
        const images = [];
        if (listing.formattedListingImages && Array.isArray(listing.formattedListingImages)) {
          listing.formattedListingImages.forEach(img => {
            if (img.url1588XN) {
              images.push(img.url1588XN);
            } else if (img.url570XN) {
              images.push(img.url570XN);
            } else if (img.urlFullXFull) {
              images.push(img.urlFullXFull);
            } else if (img.url) {
              images.push(img.url);
            }
          });
        }
        
        // Extract videos from formFields.video
        const videos = [];
        if (listing.formFields?.video && listing.formFields.video.url) {
          videos.push(listing.formFields.video.url);
        }
        
        // Also extract improved description if available
        const description = listing.formFields?.description || 'Beautiful artwork by Burcinbar';
        
        // Update the product
        await prisma.product.update({
          where: { id: product.id },
          data: {
            images: JSON.stringify(images),
            videos: JSON.stringify(videos),
            description: description
          }
        });
        
        console.log(`   ✅ Updated with ${images.length} images and ${videos.length} videos`);
        updated++;
        
        // Add a small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`   ❌ Error fetching details: ${error.message}`);
        continue;
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updated} products with detailed data!`);
    
  } catch (error) {
    console.error('❌ Error updating products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run based on command line argument
const action = process.argv[2];

if (action === 'test') {
  testDetailedAPI();
} else if (action === 'update') {
  updateAllProductsWithDetailedData();
} else {
  console.log('Usage:');
  console.log('  node fetch-detailed-etsy-data.cjs test    # Test detailed API with single listing');
  console.log('  node fetch-detailed-etsy-data.cjs update  # Update all products with detailed data');
}

module.exports = { fetchDetailedListingData, testDetailedAPI, updateAllProductsWithDetailedData };