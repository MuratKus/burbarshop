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

// Your Etsy shop ID
const SHOP_ID = '32900154';

// Function to make authenticated request to Etsy API
function fetchEtsyListings(limit = 5, offset = 0) {
  return new Promise((resolve, reject) => {
    const url = `https://www.etsy.com/api/v3/ajax/shop/${SHOP_ID}//listings/v3/search?limit=${limit}&offset=${offset}&sort_field=ending_date&sort_order=descending&state=active&language_id=0&query=&shop_section_id=&listing_tag=&is_featured=&shipping_profile_id=&return_policy_id=&production_partner_id=&is_retail=true&is_retail_only=&is_pattern=&is_pattern_only=&is_digital=&channels=&is_waitlisted=&has_video=&quality_issue=`;
    
    const options = {
      headers: {
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'en-US,en-DE;q=0.9,en;q=0.8,de-DE;q=0.7,de;q=0.6,tr-TR;q=0.5,tr;q=0.4',
        'content-type': 'application/json',
        'cookie': 'user_prefs=n-seQfMhfeeYzXD9nwNSmggW7YljZACC9P6LDTA6Wik02EVJJ680J0dHKTVPNzRYSUfJ2QcqYgShcBGxDAA.; fve=1737478528.0; ua=531227642bc86f3b5fd7103a0c0b4fd6; _ga=GA1.1.694987907.1737478531; _pin_unauth=dWlkPU5URTRZVGxoTkRVdE0yTTJZUzAwTWpNeUxUbGhOV1F0Tnpjd056STVZbUZoT0daag; uaid=Tli96U-O6g-jlunBPWMtUedJcytjZACC9P6LDSA6oyS7rFqpNDEzRclKyTMqpzDAMUTXr9zC0dw927WqKsA7Vdc9PzOlxFeplgEA; exp_ebid=m=RRolJEHTs16fG%2FA69HuF%2BtOBoqr94vWZMiQvrA67UjA%3D,v=u-Zj7GXAAh9h1UqC41Vrb2xG8sXY7CtE; p=eyJnZHByX3RwIjoxLCJnZHByX3AiOjEsIkFkdmVydGlzaW5nIjoxLCJGdW5jdGlvbmFsIjoxfQ..; _gcl_au=1.1.688733953.1752460153; lantern=8b8e6035-7628-4372-b5dc-12f34fa5b9b0; _fbp=fb.1.1752460155798.6907949577672871; session-key-www=146595362-1394885273479-562a49aa6bcc5362d3d30ecd600bd073d001daae1452ade89c1b74b9|1760526966; session-key-apex=146595362-1394885273479-a88da1611cbbace2170916104fbc9de94b32cf483b4f6bde18a3aced|1760526966; LD=1; et-v1-1-1-_etsy_com=2%3A7819383049f1718003c09c9c4ab2b62a1d13453f%3A1752750966%3A1752750966%3A__athena_compat-146595362-1394885273479-0798cbe582b14efb1b7864d0ea19f5175eeb03718841aa12a358205f2e8000db8018642b415cb20c; last_browse_page=https%3A%2F%2Fwww.etsy.com%2Fde-en%2Fshop%2FBurcinBarbaros; fbm_89186614300=base_domain=.www.etsy.com; fbsr_89186614300=SONRvShpdop1RQVIV1LYHVCC-mrr7h__WH28Ib2fDjg.eyJ1c2VyX2lkIjoiMTAxNTY2NjE5MzE1NTA0NDMiLCJjb2RlIjoiQVFDMlBqRXZHNF9ST0FEcGxxS19rTkNIbzVmQ0pfcTBCMnROV3lNQlVCX2JQd256cmR4dHVDaVZvYXJ3dUZ4bENndXB0Qng3NFk5MW9qY2hpekxpMjczN3d5MTU5UnJlcmZCU2d3dU1RWG8wS21WZHhaNFlQNDVCeFU5U2Z5WF8xSWJGNmJ5QklPVlR4eXhCMlBlcExWZW5oWXR6TnM0dzNZbzNJUUhQVGtGc1BKLWUyXzYxLVd1Ny1QMnVWZnJuS2xaN29fLXpkZkJaLTIxU2xlYTVHLVk0NmJYUnczSEV5TjVka0k1ZGJqeEc3ZnZORllEbDFTT1BFdHhwcUhMNEJ3LVY2NXgyaXFreDNyOTVaaGVIMjgxOV9EWDNOaTRvN1h5b3IxOUFYdFo5WXliYzh3eDk5c2N4aVhFYUlBOEZ1TXd4YzRZQWNjOUtRdkFQZkRIbXgyc1d4OVBMWjJVeHV6NU9RbXMzUnRycXZnIiwib2F1dGhfdG9rZW4iOiJFQUFBQUZNUHZ2QndCUEtxc2h2Vm5DS3ZYZzczNzJNemlwU1ZCRVI2UUpGVkxObXRjYWpSa1lGM3p5UVpDMzlEeWNTRWFydUxVUmhaQnhZT21aQUdBRmp6VWdrM1NYc0NkODlpMndIZGtqTHBFc3owbmlHdVlhWkJ4cEVBcFFWUjFWTWJuV05hQUZJekM3clJzdU5YdWlzaTlMNURIYzFMQ255Q3NaQUR5NEk5c05aQ1dneTlGSDkxclhlRWdHcnFOWVpEIiwiYWxnb3JpdGhtIjoiSE1BQy1TSEEyNTYiLCJpc3N1ZWRfYXQiOjE3NTI4NTI5ODV9; ship_by_date_seller_v_client_timezone_analytics=true; _tq_id.TV-8172638145-1.a4d5=a93fbf2ec99ae727.1752460159.0.1752853260..; _uetsid=898cd530624d11f08fd735f40425f8f3; _uetvid=8626c7f0d81811ef9433bd7e91089304; _ga_KR3J610VYM=GS2.1.s1752852888$o13$g1$t1752853285$j20$l0$h0; datadome=qO0Ymj7l5iglOgi3fEUQVTrrslmUSiuAyVIwDz0Wvq3~On1pOPYo1ilL1VgnYAnVw0asLXDVxAxlE70CfvoJ7OxLC2MyiuG4DrKPryTiDTaEkDNuChqjvYfOXu3WVprZ',
        'downlink': '10',
        'dpr': '1.6',
        'ect': '4g',
        'priority': 'u=1, i',
        'referer': 'https://www.etsy.com/your/shops/me/tools/listings?ref=seller-platform-mcnav',
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
        'x-requested-with': 'XMLHttpRequest'
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
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

async function testEtsyAPI() {
  try {
    console.log('🔍 Testing Etsy API with small limit...');
    
    // Fetch just 3 listings to understand the structure
    const response = await fetchEtsyListings(3, 0);
    
    console.log('📊 API Response Structure:');
    console.log('Keys:', Object.keys(response));
    console.log('Response type:', typeof response);
    
    // Debug the actual response
    console.log('\n🔍 Raw response (first 500 chars):');
    console.log(JSON.stringify(response, null, 2).substring(0, 500));
    
    // Response is directly an array
    const listings = Array.isArray(response) ? response : [];
    
    if (listings.length > 0) {
      const firstListing = listings[0];
      console.log('\n📝 First Listing Structure:');
      console.log('ID:', firstListing.listing_id);
      console.log('Title:', firstListing.title);
      console.log('Price:', firstListing.price);
      console.log('Has video:', firstListing.has_video);
      
      // Look for image data
      if (firstListing.listing_images && Array.isArray(firstListing.listing_images)) {
        console.log('\n🖼️  Images found:', firstListing.listing_images.length);
        if (firstListing.listing_images[0]) {
          const firstImage = firstListing.listing_images[0];
          console.log('Sample image URLs:');
          console.log('  - 570xN:', firstImage.url_570xN);
          console.log('  - 1588xN:', firstImage.url_1588xN);
          console.log('  - fullxfull:', firstImage.url);
        }
      }
      
      if (firstListing.has_video) {
        console.log('🎥 This listing has videos');
      }
      
      console.log('\n✅ API structure confirmed - ready to process all listings');
    } else {
      console.log('\n❌ No listings found in response');
    }
    
    console.log(`\n✅ Found ${listings.length} listings`);
    
  } catch (error) {
    console.error('❌ Error testing Etsy API:', error.message);
    console.error('Full error:', error);
  }
}

async function replaceWithRealEtsyData() {
  try {
    console.log('🔄 Replacing products with real Etsy data...');
    
    // Fetch all listings from Etsy
    const response = await fetchEtsyListings(50, 0); // Get up to 50 listings
    
    if (!Array.isArray(response) || response.length === 0) {
      console.log('❌ No listings found in Etsy API response');
      return;
    }
    
    console.log(`📦 Found ${response.length} Etsy listings`);
    
    // Clear existing products
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    
    console.log('🧹 Cleared existing products');
    
    // Process each Etsy listing
    for (const listing of response) {
      console.log(`\n🎨 Processing: ${listing.title}`);
      
      // Extract images
      const images = [];
      if (listing.listing_images && Array.isArray(listing.listing_images)) {
        listing.listing_images.forEach(img => {
          if (img.url_1588xN) {
            images.push(img.url_1588xN);
          } else if (img.url_570xN) {
            images.push(img.url_570xN);
          } else if (img.url) {
            images.push(img.url);
          }
        });
      }
      
      // Extract videos - placeholder for now since we need to fetch them separately
      const videos = [];
      if (listing.has_video) {
        // Note: Video URLs would need to be fetched from a separate API endpoint
        // For now, we'll just note that this listing has videos
        console.log('   📹 This listing has videos (would need separate API call)');
      }
      
      // Determine product type based on title/tags
      let productType = 'FINE_PRINT';
      const titleLower = listing.title.toLowerCase();
      if (titleLower.includes('postcard')) {
        productType = 'POSTCARD';
      } else if (titleLower.includes('riso')) {
        productType = 'RISO_PRINT';
      }
      
      // Generate unique slug
      let slug = listing.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
      
      // Ensure unique slug
      let counter = 1;
      let uniqueSlug = slug;
      while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      
      // Create product
      const product = await prisma.product.create({
        data: {
          title: listing.title,
          slug: uniqueSlug,
          description: listing.description || 'Beautiful artwork by Burcinbar',
          images: JSON.stringify(images),
          videos: JSON.stringify(videos),
          basePrice: parseFloat(listing.price) || 25.00,
          type: productType,
          etsyListingId: listing.listing_id.toString()
        }
      });
      
      // Create variants based on product type
      const variants = [];
      if (productType === 'POSTCARD') {
        variants.push(
          { size: 'A5', price: parseFloat(listing.price) || 8.00, stock: 20 },
          { size: 'SQUARE', price: (parseFloat(listing.price) || 8.00) + 2, stock: 15 }
        );
      } else if (productType === 'RISO_PRINT') {
        variants.push(
          { size: 'A4', price: parseFloat(listing.price) || 35.00, stock: 5 },
          { size: 'A5', price: (parseFloat(listing.price) || 35.00) - 7, stock: 8 }
        );
      } else {
        variants.push(
          { size: 'A4', price: parseFloat(listing.price) || 25.00, stock: 6 },
          { size: 'A5', price: (parseFloat(listing.price) || 25.00) - 5, stock: 10 },
          { size: 'SQUARE', price: (parseFloat(listing.price) || 25.00) + 5, stock: 4 }
        );
      }
      
      // Create variants
      for (const variant of variants) {
        await prisma.productVariant.create({
          data: {
            ...variant,
            productId: product.id
          }
        });
      }
      
      console.log(`   ✅ Created with ${images.length} images and ${videos.length} videos`);
    }
    
    console.log(`\n🎉 Successfully created ${response.length} products from Etsy data!`);
    
  } catch (error) {
    console.error('❌ Error replacing with Etsy data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run based on command line argument
const action = process.argv[2];

if (action === 'test') {
  testEtsyAPI();
} else if (action === 'replace') {
  replaceWithRealEtsyData();
} else {
  console.log('Usage:');
  console.log('  node fetch-etsy-listings.cjs test     # Test API with small limit');
  console.log('  node fetch-etsy-listings.cjs replace  # Replace all products with real Etsy data');
}

module.exports = { fetchEtsyListings, testEtsyAPI, replaceWithRealEtsyData };