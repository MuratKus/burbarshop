#!/usr/bin/env node

/**
 * Manual Data Input Helper for Burbar Shop
 * 
 * Since Etsy API v3 requires OAuth (complex setup), this script helps you
 * manually input your product data in a structured way.
 * 
 * You can copy-paste product information from your Etsy shop and this
 * script will format it properly for your database.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

class ManualDataInput {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.products = [];
  }

  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async inputProduct() {
    console.log('\n📦 Adding a new product...');
    
    const title = await this.askQuestion('Product title: ');
    if (!title) return null;
    
    const description = await this.askQuestion('Description: ');
    
    const typeOptions = {
      '1': 'POSTCARD',
      '2': 'FINE_PRINT', 
      '3': 'RISO'
    };
    
    console.log('\nProduct type:');
    console.log('1. Postcard');
    console.log('2. Fine Print');
    console.log('3. Riso Print');
    
    const typeChoice = await this.askQuestion('Choose type (1-3): ');
    const type = typeOptions[typeChoice] || 'FINE_PRINT';
    
    const basePrice = parseFloat(await this.askQuestion('Base price (€): ')) || 0;
    
    // Input variants
    const variants = [];
    console.log('\n📏 Adding variants (sizes/options)...');
    
    let addingVariants = true;
    while (addingVariants) {
      const size = await this.askQuestion('Size (or press Enter to finish): ');
      if (!size) break;
      
      const price = parseFloat(await this.askQuestion(`Price for ${size} (€): `)) || basePrice;
      const stock = parseInt(await this.askQuestion(`Stock for ${size}: `)) || 10;
      
      variants.push({ size, price, stock });
      
      const addMore = await this.askQuestion('Add another variant? (y/n): ');
      if (addMore.toLowerCase() !== 'y') {
        addingVariants = false;
      }
    }
    
    // Default variant if none added
    if (variants.length === 0) {
      variants.push({
        size: 'Standard',
        price: basePrice,
        stock: 10
      });
    }
    
    // Input reviews
    const reviews = [];
    console.log('\n⭐ Adding reviews (optional)...');
    
    let addingReviews = true;
    while (addingReviews) {
      const addReview = await this.askQuestion('Add a review? (y/n): ');
      if (addReview.toLowerCase() !== 'y') break;
      
      const rating = parseInt(await this.askQuestion('Rating (1-5): ')) || 5;
      const comment = await this.askQuestion('Review comment: ');
      const name = await this.askQuestion('Reviewer name: ') || 'Anonymous';
      
      if (comment) {
        reviews.push({
          rating,
          comment,
          name,
          email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          verified: true,
          approved: true
        });
      }
      
      const addMore = await this.askQuestion('Add another review? (y/n): ');
      if (addMore.toLowerCase() !== 'y') {
        addingReviews = false;
      }
    }
    
    // Generate placeholder images
    const images = [`/uploads/manual/${this.generateSlug(title)}-1.jpg`];
    
    const product = {
      title,
      description,
      type,
      basePrice,
      images,
      variants,
      reviews
    };
    
    console.log('\n✅ Product added:', title);
    return product;
  }

  async inputFromTemplate() {
    console.log('\n📋 Paste your product data (one product per line):');
    console.log('Format: Title | Description | Type | Price | Size1:Price1:Stock1,Size2:Price2:Stock2');
    console.log('Example: Beautiful Landscape | Amazing art print | FINE_PRINT | 35.00 | A4:35:10,A3:50:5');
    console.log('Press Enter twice when done:\n');
    
    const lines = [];
    let emptyLines = 0;
    
    while (emptyLines < 2) {
      const line = await this.askQuestion('');
      if (line === '') {
        emptyLines++;
      } else {
        lines.push(line);
        emptyLines = 0;
      }
    }
    
    for (const line of lines) {
      const product = this.parseProductLine(line);
      if (product) {
        this.products.push(product);
      }
    }
    
    console.log(`\n✅ Parsed ${this.products.length} products from template`);
  }

  parseProductLine(line) {
    try {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length < 4) return null;
      
      const [title, description, type, basePrice, variantsStr] = parts;
      
      const variants = [];
      if (variantsStr) {
        const variantParts = variantsStr.split(',');
        for (const variant of variantParts) {
          const [size, price, stock] = variant.split(':');
          variants.push({
            size: size.trim(),
            price: parseFloat(price) || parseFloat(basePrice),
            stock: parseInt(stock) || 10
          });
        }
      } else {
        variants.push({
          size: 'Standard',
          price: parseFloat(basePrice),
          stock: 10
        });
      }
      
      return {
        title,
        description,
        type: type.toUpperCase(),
        basePrice: parseFloat(basePrice),
        images: [`/uploads/manual/${this.generateSlug(title)}-1.jpg`],
        variants,
        reviews: []
      };
    } catch (error) {
      console.log(`❌ Error parsing line: ${line}`);
      return null;
    }
  }

  async saveToDatabase() {
    console.log('\n💾 Saving products to database...');
    
    for (const productData of this.products) {
      try {
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
              rating: reviewData.rating,
              comment: reviewData.comment,
              name: reviewData.name,
              email: reviewData.email,
              verified: reviewData.verified,
              approved: reviewData.approved
            }
          });
        }
        
        console.log(`✅ Saved: ${product.title} (${product.variants.length} variants)`);
        
      } catch (error) {
        console.error(`❌ Error saving ${productData.title}:`, error);
      }
    }
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async createPlaceholderImages() {
    console.log('\n🖼️  Creating placeholder images...');
    
    const manualDir = path.join(process.cwd(), 'public', 'uploads', 'manual');
    if (!fs.existsSync(manualDir)) {
      fs.mkdirSync(manualDir, { recursive: true });
    }
    
    for (const product of this.products) {
      const slug = this.generateSlug(product.title);
      const filename = `${slug}-1.svg`;
      const filepath = path.join(manualDir, filename);
      
      const colors = ['#B8C5B0', '#E85A4F', '#F8F6F1', '#2C2C2C'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const svg = `
        <svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
          <rect width="600" height="600" fill="${color}"/>
          <text x="300" y="280" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.8">${product.title}</text>
          <text x="300" y="320" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" opacity="0.6">${product.type.replace('_', ' ')}</text>
          <text x="300" y="360" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" opacity="0.4">€${product.basePrice}</text>
        </svg>
      `;
      
      fs.writeFileSync(filepath, svg);
    }
    
    console.log('✅ Created placeholder images');
  }

  async run() {
    console.log('🎨 Manual Data Input Helper for Burbar Shop');
    console.log('=====================================\n');
    
    const method = await this.askQuestion('Choose input method:\n1. Interactive (one by one)\n2. Template (paste format)\nChoice (1-2): ');
    
    if (method === '1') {
      // Interactive mode
      let addingProducts = true;
      while (addingProducts) {
        const product = await this.inputProduct();
        if (product) {
          this.products.push(product);
        }
        
        const addMore = await this.askQuestion('\nAdd another product? (y/n): ');
        if (addMore.toLowerCase() !== 'y') {
          addingProducts = false;
        }
      }
    } else {
      // Template mode
      await this.inputFromTemplate();
    }
    
    if (this.products.length > 0) {
      await this.createPlaceholderImages();
      await this.saveToDatabase();
      
      console.log('\n📊 Summary:');
      console.log(`- Products added: ${this.products.length}`);
      console.log(`- Total variants: ${this.products.reduce((sum, p) => sum + p.variants.length, 0)}`);
      console.log(`- Total reviews: ${this.products.reduce((sum, p) => sum + p.reviews.length, 0)}`);
    } else {
      console.log('\n❌ No products were added.');
    }
    
    this.rl.close();
    await prisma.$disconnect();
  }
}

// Run the manual input helper
const helper = new ManualDataInput();
helper.run().catch(console.error);