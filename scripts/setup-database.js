#!/usr/bin/env node

/**
 * Database Setup Script for Burbar Shop
 * 
 * This script helps set up the database with sample data or Etsy-extracted data.
 * It handles schema migrations, seeding, and data validation.
 * 
 * Usage:
 *   node scripts/setup-database.js --reset
 *   node scripts/setup-database.js --seed-sample
 *   node scripts/setup-database.js --seed-etsy --shop-url=https://www.etsy.com/shop/YourShop
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
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

class DatabaseSetup {
  constructor() {
    this.sampleData = {
      products: [
        {
          title: 'Botanical Dreams Fine Print',
          description: 'A beautiful botanical illustration featuring delicate leaves and flowers, perfect for nature lovers and those who appreciate organic forms.',
          type: 'FINE_PRINT',
          basePrice: 35.00,
          images: ['/uploads/sample/botanical-1.jpg', '/uploads/sample/botanical-2.jpg'],
          variants: [
            { size: 'A5', price: 25.00, stock: 15 },
            { size: 'A4', price: 35.00, stock: 12 },
            { size: 'A3', price: 50.00, stock: 8 }
          ],
          reviews: [
            {
              rating: 5,
              comment: 'Absolutely stunning print! The colors are vibrant and the quality is excellent.',
              name: 'Sarah M.',
              email: 'sarah@example.com',
              verified: true,
              approved: true
            },
            {
              rating: 4,
              comment: 'Beautiful artwork, exactly as described. Fast shipping!',
              name: 'James K.',
              email: 'james@example.com',
              verified: true,
              approved: true
            }
          ]
        },
        {
          title: 'Abstract Expressions Riso Print',
          description: 'Bold abstract composition created using the risograph printing technique, featuring vibrant colors and unique textures.',
          type: 'RISO',
          basePrice: 28.00,
          images: ['/uploads/sample/abstract-1.jpg', '/uploads/sample/abstract-2.jpg'],
          variants: [
            { size: 'A5', price: 22.00, stock: 20 },
            { size: 'A4', price: 28.00, stock: 15 },
            { size: 'Square', price: 32.00, stock: 10 }
          ],
          reviews: [
            {
              rating: 5,
              comment: 'Love the unique texture and vibrant colors! Perfect for my studio.',
              name: 'Maya L.',
              email: 'maya@example.com',
              verified: true,
              approved: true
            }
          ]
        },
        {
          title: 'Vintage Postcard Collection',
          description: 'A set of vintage-inspired postcards featuring nostalgic designs and classic typography.',
          type: 'POSTCARD',
          basePrice: 15.00,
          images: ['/uploads/sample/postcard-1.jpg', '/uploads/sample/postcard-2.jpg'],
          variants: [
            { size: 'Standard', price: 15.00, stock: 50 },
            { size: 'Set of 5', price: 60.00, stock: 25 }
          ],
          reviews: [
            {
              rating: 5,
              comment: 'Perfect for sending to friends! Great quality cardstock.',
              name: 'Emma R.',
              email: 'emma@example.com',
              verified: true,
              approved: true
            },
            {
              rating: 4,
              comment: 'Lovely designs, good value for money.',
              name: 'David P.',
              email: 'david@example.com',
              verified: false,
              approved: true
            }
          ]
        }
      ],
      
      users: [
        {
          name: 'Admin User',
          email: 'admin@burbarshop.com'
        },
        {
          name: 'Test Customer',
          email: 'customer@example.com'
        }
      ],
      
      orders: [
        {
          email: 'customer@example.com',
          status: 'DELIVERED',
          subtotal: 70.00,
          shippingCost: 5.99,
          total: 75.99,
          paymentMethod: 'stripe',
          shippingAddress: JSON.stringify({
            street: '123 Art Street',
            city: 'Creative City',
            postalCode: '12345',
            country: 'Netherlands'
          })
        }
      ]
    };
  }

  async resetDatabase() {
    console.log('🔄 Resetting database...');
    
    try {
      // Reset database
      execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
      console.log('✅ Database reset successfully');
      
      // Generate Prisma client
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma client generated successfully');
      
    } catch (error) {
      console.error('❌ Error resetting database:', error);
      throw error;
    }
  }

  async seedSampleData() {
    console.log('🌱 Seeding sample data...');
    
    try {
      // Create users
      for (const userData of this.sampleData.users) {
        await prisma.user.create({
          data: userData
        });
      }
      console.log(`✅ Created ${this.sampleData.users.length} users`);
      
      // Create products with variants and reviews
      for (const productData of this.sampleData.products) {
        const product = await prisma.product.create({
          data: {
            title: productData.title,
            description: productData.description,
            type: productData.type,
            basePrice: productData.basePrice,
            images: JSON.stringify(productData.images),
            slug: this.generateSlug(productData.title),
            variants: {
              create: productData.variants
            }
          },
          include: { variants: true }
        });
        
        // Create reviews
        for (const reviewData of productData.reviews) {
          await prisma.review.create({
            data: {
              productId: product.id,
              ...reviewData
            }
          });
        }
        
        console.log(`✅ Created product: ${product.title} (${product.variants.length} variants, ${productData.reviews.length} reviews)`);
      }
      
      // Create sample orders
      for (const orderData of this.sampleData.orders) {
        const order = await prisma.order.create({
          data: {
            email: orderData.email,
            status: orderData.status,
            subtotal: orderData.subtotal,
            shippingCost: orderData.shippingCost,
            total: orderData.total,
            paymentMethod: orderData.paymentMethod,
            shippingAddress: orderData.shippingAddress
          }
        });
        
        console.log(`✅ Created order: ${order.id}`);
      }
      
      console.log('🎉 Sample data seeded successfully!');
      
    } catch (error) {
      console.error('❌ Error seeding sample data:', error);
      throw error;
    }
  }

  async seedEtsyData(shopUrl) {
    console.log(`🛍️ Seeding Etsy data from: ${shopUrl}`);
    
    try {
      const EtsyExtractor = require('./etsy-extractor');
      const extractor = new EtsyExtractor({
        headless: true,
        downloadImages: true
      });
      
      await extractor.init();
      await extractor.extractShopListings(shopUrl);
      await extractor.saveToDatabase();
      await extractor.close();
      
      console.log('✅ Etsy data seeded successfully!');
      
    } catch (error) {
      console.error('❌ Error seeding Etsy data:', error);
      throw error;
    }
  }

  async validateDatabase() {
    console.log('🔍 Validating database...');
    
    try {
      const productCount = await prisma.product.count();
      const userCount = await prisma.user.count();
      const orderCount = await prisma.order.count();
      const reviewCount = await prisma.review.count();
      const variantCount = await prisma.productVariant.count();
      
      console.log('📊 Database Summary:');
      console.log(`- Products: ${productCount}`);
      console.log(`- Variants: ${variantCount}`);
      console.log(`- Users: ${userCount}`);
      console.log(`- Orders: ${orderCount}`);
      console.log(`- Reviews: ${reviewCount}`);
      
      // Validate data integrity
      const productsWithoutVariants = await prisma.product.findMany({
        where: { variants: { none: {} } }
      });
      
      if (productsWithoutVariants.length > 0) {
        console.log(`⚠️  Warning: ${productsWithoutVariants.length} products have no variants`);
      }
      
      console.log('✅ Database validation completed');
      
    } catch (error) {
      console.error('❌ Error validating database:', error);
      throw error;
    }
  }

  async createSampleImages() {
    console.log('🖼️  Creating sample image placeholders...');
    
    const sampleDir = path.join(process.cwd(), 'public', 'uploads', 'sample');
    if (!fs.existsSync(sampleDir)) {
      fs.mkdirSync(sampleDir, { recursive: true });
    }
    
    // Create simple SVG placeholders
    const svgTemplate = (text, color) => `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="${color}"/>
        <text x="200" y="200" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy="0.3em">${text}</text>
      </svg>
    `;
    
    const placeholders = [
      { name: 'botanical-1.svg', text: 'Botanical Dreams', color: '#B8C5B0' },
      { name: 'botanical-2.svg', text: 'Detail View', color: '#A8B5A0' },
      { name: 'abstract-1.svg', text: 'Abstract Art', color: '#E85A4F' },
      { name: 'abstract-2.svg', text: 'Riso Print', color: '#D54A3F' },
      { name: 'postcard-1.svg', text: 'Vintage Postcard', color: '#F8F6F1' },
      { name: 'postcard-2.svg', text: 'Collection', color: '#E8E6E1' }
    ];
    
    for (const placeholder of placeholders) {
      const svg = svgTemplate(placeholder.text, placeholder.color);
      fs.writeFileSync(path.join(sampleDir, placeholder.name), svg);
    }
    
    console.log(`✅ Created ${placeholders.length} sample image placeholders`);
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async close() {
    await prisma.$disconnect();
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const setup = new DatabaseSetup();
  
  try {
    if (args.includes('--reset')) {
      await setup.resetDatabase();
    }
    
    if (args.includes('--seed-sample')) {
      await setup.createSampleImages();
      await setup.seedSampleData();
    }
    
    if (args.includes('--seed-etsy')) {
      const shopUrl = args.find(arg => arg.startsWith('--shop-url='))?.split('=')[1];
      if (!shopUrl) {
        console.error('❌ Please provide --shop-url when using --seed-etsy');
        process.exit(1);
      }
      await setup.seedEtsyData(shopUrl);
    }
    
    if (args.includes('--validate')) {
      await setup.validateDatabase();
    }
    
    if (args.length === 0) {
      console.log('🛠️  Database Setup Script');
      console.log('Usage:');
      console.log('  node scripts/setup-database.js --reset                    # Reset database');
      console.log('  node scripts/setup-database.js --seed-sample              # Seed with sample data');
      console.log('  node scripts/setup-database.js --seed-etsy --shop-url=URL # Seed with Etsy data');
      console.log('  node scripts/setup-database.js --validate                 # Validate database');
      console.log('  node scripts/setup-database.js --reset --seed-sample      # Reset and seed');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await setup.close();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseSetup;