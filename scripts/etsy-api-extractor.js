#!/usr/bin/env node

/**
 * Etsy API Extractor for Burbar Shop
 * 
 * This script uses Etsy's official API to extract your shop data.
 * Much more reliable than web scraping and provides access to all your data.
 * 
 * Setup:
 * 1. Go to https://www.etsy.com/developers/your-account
 * 2. Create a new app
 * 3. Get your API key and shared secret
 * 4. Add them to your .env.local file
 * 
 * Usage:
 *   node scripts/etsy-api-extractor.js --shop-id=YourShopId
 *   node scripts/etsy-api-extractor.js --shop-name=YourShopName
 */

const https = require('https');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key] = value.replace(/"/g, '');
    }
  });
}

const prisma = new PrismaClient();

class EtsyApiExtractor {
  constructor(options = {}) {
    this.options = {
      apiKey: process.env.ETSY_API_KEY,
      downloadImages: true,
      maxListings: 50,
      ...options
    };
    
    if (!this.options.apiKey) {
      throw new Error('ETSY_API_KEY environment variable is required');
    }
    
    console.log(`🔑 API Key loaded: ${this.options.apiKey.substring(0, 8)}...`);
    
    this.baseUrl = 'https://openapi.etsy.com/v3';
    this.extractedData = [];
    this.imageCounter = 0;
  }

  async makeRequest(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add parameters (but not API key in URL for v3)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    console.log(`🔗 API Request: ${endpoint}`);
    
    const options = {
      headers: {
        'x-api-key': this.options.apiKey,
        'User-Agent': 'BurbarShop/1.0',
        'Accept': 'application/json'
      }
    };
    
    return new Promise((resolve, reject) => {
      https.get(url.toString(), options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(result);
            } else {
              reject(new Error(`API Error ${res.statusCode}: ${result.error || data}`));
            }
          } catch (error) {
            reject(new Error(`JSON Parse Error: ${error.message}`));
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  async getShopByName(shopName) {
    console.log(`🔍 Finding shop: ${shopName}`);
    
    try {
      // Test with a simple endpoint first
      console.log('🧪 Testing API key with ping endpoint...');
      const pingResult = await this.makeRequest('/application/openapi-ping');
      console.log('✅ API key works:', pingResult);
      
      // Now try the shop endpoint
      const result = await this.makeRequest(`/application/shops/${shopName}`);
      
      if (result.shop_id) {
        return result;
      } else {
        throw new Error(`Shop "${shopName}" not found`);
      }
    } catch (error) {
      throw new Error(`Error finding shop: ${error.message}`);
    }
  }

  async getShopListings(shopId) {
    console.log(`📦 Fetching listings for shop ID: ${shopId}`);
    
    try {
      const result = await this.makeRequest(`/application/shops/${shopId}/listings`, {
        state: 'active',
        limit: this.options.maxListings,
        includes: 'Images,MainImage,Variations,Inventory'
      });
      
      return result.results || [];
    } catch (error) {
      throw new Error(`Error fetching listings: ${error.message}`);
    }
  }

  async getListingReviews(listingId) {
    console.log(`⭐ Fetching reviews for listing: ${listingId}`);
    
    try {
      const result = await this.makeRequest(`/application/listings/${listingId}/reviews`, {
        limit: 10
      });
      
      return result.results || [];
    } catch (error) {
      console.log(`⚠️  Could not fetch reviews for listing ${listingId}: ${error.message}`);
      return [];
    }
  }

  async extractShopData(shopIdentifier) {
    let shop;
    
    // Determine if it's a shop ID or name
    if (shopIdentifier.match(/^\d+$/)) {
      // It's a shop ID
      shop = { shop_id: shopIdentifier };
    } else {
      // It's a shop name
      shop = await this.getShopByName(shopIdentifier);
    }
    
    console.log(`🏪 Extracting data for shop: ${shop.shop_name || shopIdentifier} (ID: ${shop.shop_id})`);
    
    // Get listings
    const listings = await this.getShopListings(shop.shop_id);
    console.log(`📄 Found ${listings.length} active listings`);
    
    // Process each listing
    for (const listing of listings) {
      await this.processListing(listing);
      
      // Rate limiting
      await this.delay(1000);
    }
    
    return {
      shop,
      listingsCount: listings.length,
      productsExtracted: this.extractedData.length
    };
  }

  async processListing(listing) {
    console.log(`📦 Processing: ${listing.title}`);
    
    try {
      // Get reviews
      const reviews = await this.getListingReviews(listing.listing_id);
      
      // Process images
      const images = listing.images || [];
      const localImages = [];
      
      if (this.options.downloadImages) {
        for (const image of images) {
          const localPath = await this.downloadImage(image.url_fullxfull, listing.title);
          if (localPath) {
            localImages.push(localPath);
          }
        }
      }
      
      // Map to our schema
      const productData = {
        title: listing.title,
        description: this.cleanDescription(listing.description),
        type: this.determineType(listing.title, listing.description, listing.tags),
        basePrice: parseFloat(listing.price.amount / 100), // Etsy prices are in cents
        images: localImages.length > 0 ? localImages : images.map(img => img.url_fullxfull),
        variants: this.extractVariants(listing),
        reviews: this.processReviews(reviews),
        originalData: {
          listing_id: listing.listing_id,
          created_timestamp: listing.created_timestamp,
          updated_timestamp: listing.updated_timestamp,
          state: listing.state,
          tags: listing.tags
        }
      };
      
      this.extractedData.push(productData);
      
      console.log(`✅ Processed: ${productData.title} (${productData.variants.length} variants, ${productData.reviews.length} reviews)`);
      
    } catch (error) {
      console.error(`❌ Error processing listing ${listing.title}:`, error);
    }
  }

  extractVariants(listing) {
    const variants = [];
    
    if (listing.inventory && listing.inventory.products) {
      // Has inventory/variations
      for (const product of listing.inventory.products) {
        const variant = {
          size: this.extractSizeFromProduct(product),
          price: parseFloat(product.price.amount / 100),
          stock: product.quantity
        };
        variants.push(variant);
      }
    } else {
      // No variations, create default variant
      variants.push({
        size: 'Standard',
        price: parseFloat(listing.price.amount / 100),
        stock: listing.quantity || 1
      });
    }
    
    return variants;
  }

  extractSizeFromProduct(product) {
    if (product.property_values) {
      for (const prop of product.property_values) {
        if (prop.property_name && prop.property_name.toLowerCase().includes('size')) {
          return prop.values[0] || 'Standard';
        }
      }
    }
    return 'Standard';
  }

  processReviews(reviews) {
    return reviews.map(review => ({
      rating: review.rating,
      comment: review.review || '',
      author: review.buyer_display_name || 'Anonymous',
      date: new Date(review.created_timestamp * 1000).toISOString(),
      verified: true
    }));
  }

  determineType(title, description, tags) {
    const text = `${title} ${description} ${tags ? tags.join(' ') : ''}`.toLowerCase();
    
    if (text.includes('postcard')) return 'POSTCARD';
    if (text.includes('riso') || text.includes('risograph')) return 'RISO';
    return 'FINE_PRINT';
  }

  cleanDescription(description) {
    if (!description) return '';
    
    // Remove HTML tags and clean up
    return description
      .replace(/<[^>]*>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  async downloadImage(imageUrl, productTitle) {
    if (!this.options.downloadImages) return null;
    
    try {
      const response = await fetch(imageUrl);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const filename = `etsy-api-${Date.now()}-${this.imageCounter++}.jpg`;
        const filepath = path.join(process.cwd(), 'public', 'uploads', 'etsy', filename);
        
        // Ensure directory exists
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filepath, Buffer.from(buffer));
        console.log(`📸 Downloaded: ${filename}`);
        
        return `/uploads/etsy/${filename}`;
      }
    } catch (error) {
      console.error(`❌ Error downloading image: ${error.message}`);
    }
    
    return null;
  }

  async saveToDatabase() {
    console.log('💾 Saving extracted data to database...');
    
    for (const productData of this.extractedData) {
      try {
        // Create product
        const product = await prisma.product.create({
          data: {
            title: productData.title,
            description: productData.description,
            type: productData.type,
            basePrice: productData.basePrice,
            images: JSON.stringify(productData.images),
            slug: this.generateSlug(productData.title),
            variants: {
              create: productData.variants.map(variant => ({
                size: variant.size,
                price: variant.price,
                stock: variant.stock
              }))
            }
          },
          include: { variants: true }
        });
        
        // Create reviews
        for (const reviewData of productData.reviews) {
          await prisma.review.create({
            data: {
              productId: product.id,
              rating: reviewData.rating,
              comment: reviewData.comment,
              name: reviewData.author,
              email: `${reviewData.author.toLowerCase().replace(/\s+/g, '')}@example.com`,
              verified: reviewData.verified,
              approved: true,
              createdAt: new Date(reviewData.date)
            }
          });
        }
        
        console.log(`✅ Saved: ${product.title} (ID: ${product.id})`);
        
      } catch (error) {
        console.error(`❌ Error saving product ${productData.title}:`, error);
      }
    }
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    await prisma.$disconnect();
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const shopId = args.find(arg => arg.startsWith('--shop-id='))?.split('=')[1];
  const shopName = args.find(arg => arg.startsWith('--shop-name='))?.split('=')[1];
  
  if (!shopId && !shopName) {
    console.error('❌ Please provide either --shop-id or --shop-name');
    console.log('Usage:');
    console.log('  node scripts/etsy-api-extractor.js --shop-name=YourShopName');
    console.log('  node scripts/etsy-api-extractor.js --shop-id=12345678');
    console.log('\nSetup:');
    console.log('1. Go to https://www.etsy.com/developers/your-account');
    console.log('2. Create a new app');
    console.log('3. Add ETSY_API_KEY=your_api_key to .env.local');
    process.exit(1);
  }
  
  try {
    const extractor = new EtsyApiExtractor({
      downloadImages: !args.includes('--no-images'),
      maxListings: parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1]) || 50
    });
    
    console.log('🚀 Starting Etsy API Extractor...');
    
    const result = await extractor.extractShopData(shopId || shopName);
    
    // Save to database
    await extractor.saveToDatabase();
    
    // Generate summary
    console.log('\n📊 Extraction Summary:');
    console.log(`- Shop: ${result.shop.shop_name || shopId || shopName}`);
    console.log(`- Listings found: ${result.listingsCount}`);
    console.log(`- Products extracted: ${result.productsExtracted}`);
    console.log(`- Total reviews: ${extractor.extractedData.reduce((sum, p) => sum + p.reviews.length, 0)}`);
    console.log(`- Images downloaded: ${extractor.imageCounter}`);
    
    await extractor.close();
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    
    if (error.message.includes('ETSY_API_KEY')) {
      console.log('\n🔑 API Key Setup:');
      console.log('1. Go to https://www.etsy.com/developers/your-account');
      console.log('2. Create a new app');
      console.log('3. Add ETSY_API_KEY=your_api_key to .env.local');
    }
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = EtsyApiExtractor;