#!/usr/bin/env node

/**
 * Realistic Data Generator for Burbar Shop
 * 
 * Since Etsy has strong bot detection, this script generates realistic 
 * product data that mimics what you'd find on Etsy, specifically for 
 * art prints, postcards, and riso prints.
 */

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

class RealisticDataGenerator {
  constructor() {
    this.artStyles = [
      'Abstract', 'Minimalist', 'Botanical', 'Geometric', 'Vintage', 'Modern',
      'Watercolor', 'Line Art', 'Collage', 'Typography', 'Illustration', 'Photography'
    ];
    
    this.subjects = [
      'Florals', 'Landscapes', 'Portraits', 'Still Life', 'Architecture', 'Animals',
      'Cityscapes', 'Seascapes', 'Mountains', 'Forests', 'Sunsets', 'Patterns'
    ];
    
    this.adjectives = [
      'Dreamy', 'Vibrant', 'Serene', 'Bold', 'Delicate', 'Striking',
      'Ethereal', 'Warm', 'Cool', 'Soft', 'Dramatic', 'Peaceful'
    ];
    
    this.reviewerNames = [
      'Sarah M.', 'Emma R.', 'James K.', 'Maya L.', 'David P.', 'Luna S.',
      'Alex T.', 'Zoe W.', 'Ryan B.', 'Aria C.', 'Noah F.', 'Mia H.',
      'Ethan J.', 'Chloe N.', 'Liam O.', 'Sophia Q.', 'Oliver V.', 'Ava X.'
    ];
    
    this.reviewComments = [
      'Absolutely stunning print! The colors are vibrant and the quality is excellent.',
      'Perfect for my living room. Great quality and fast shipping!',
      'Beautiful artwork, exactly as described. Will definitely order again.',
      'Love the unique style and attention to detail. Highly recommend!',
      'Great quality paper and printing. Looks amazing framed.',
      'Exactly what I was looking for. Perfect size and beautiful colors.',
      'Fast shipping and careful packaging. The print is gorgeous!',
      'Amazing quality and the artist was so helpful with my questions.',
      'Beautiful piece that adds character to my space.',
      'High quality print with rich colors. Very satisfied!',
      'Exceeded my expectations. Beautiful artwork and great service.',
      'Perfect for gifting. The recipient loved it!',
      'Great addition to my art collection. Beautifully printed.',
      'Lovely design and excellent printing quality.',
      'Exactly as pictured. Great quality and fast delivery.'
    ];
  }

  generateProductTitle() {
    const style = this.getRandomItem(this.artStyles);
    const subject = this.getRandomItem(this.subjects);
    const adjective = this.getRandomItem(this.adjectives);
    
    const patterns = [
      `${adjective} ${style} ${subject}`,
      `${style} ${subject} Art`,
      `${adjective} ${subject} Print`,
      `${style} ${adjective} ${subject}`,
      `${subject} in ${style} Style`
    ];
    
    return this.getRandomItem(patterns);
  }

  generateDescription(title, type) {
    const style = this.artStyles.find(s => title.includes(s)) || this.getRandomItem(this.artStyles);
    const subject = this.subjects.find(s => title.includes(s)) || this.getRandomItem(this.subjects);
    
    let typeDescription;
    switch (type) {
      case 'FINE_PRINT':
        typeDescription = 'This high-quality fine art print is produced on premium archival paper';
        break;
      case 'RISO':
        typeDescription = 'This unique risograph print features vibrant colors and distinctive textures';
        break;
      case 'POSTCARD':
        typeDescription = 'This beautiful postcard is printed on thick, premium cardstock';
        break;
    }
    
    const descriptions = [
      `${typeDescription} and captures the essence of ${style.toLowerCase()} ${subject.toLowerCase()}. Perfect for adding a touch of artistic flair to any space, this piece combines contemporary aesthetics with timeless appeal.`,
      
      `A stunning ${style.toLowerCase()} interpretation of ${subject.toLowerCase()}. ${typeDescription} with careful attention to color accuracy and detail. This artwork brings warmth and character to any room.`,
      
      `${typeDescription} featuring ${style.toLowerCase()} ${subject.toLowerCase()}. Each piece is carefully crafted to ensure the highest quality reproduction, making it a perfect addition to your art collection or as a thoughtful gift.`,
      
      `This beautiful ${style.toLowerCase()} ${subject.toLowerCase()} design is ${typeDescription}. The artwork showcases intricate details and rich colors that will enhance any living space, office, or creative environment.`
    ];
    
    return this.getRandomItem(descriptions);
  }

  generateVariants(type) {
    const variants = [];
    
    switch (type) {
      case 'FINE_PRINT':
        variants.push(
          { size: 'A5', price: this.randomPrice(15, 25), stock: this.randomStock() },
          { size: 'A4', price: this.randomPrice(25, 40), stock: this.randomStock() },
          { size: 'A3', price: this.randomPrice(40, 60), stock: this.randomStock() }
        );
        break;
        
      case 'RISO':
        variants.push(
          { size: 'A5', price: this.randomPrice(18, 28), stock: this.randomStock() },
          { size: 'A4', price: this.randomPrice(28, 45), stock: this.randomStock() },
          { size: 'Square', price: this.randomPrice(30, 50), stock: this.randomStock() }
        );
        break;
        
      case 'POSTCARD':
        variants.push(
          { size: 'Standard', price: this.randomPrice(8, 15), stock: this.randomStock() },
          { size: 'Set of 5', price: this.randomPrice(35, 60), stock: this.randomStock() },
          { size: 'Set of 10', price: this.randomPrice(65, 100), stock: this.randomStock() }
        );
        break;
    }
    
    return variants;
  }

  generateReviews(count = 3) {
    const reviews = [];
    
    for (let i = 0; i < count; i++) {
      reviews.push({
        rating: this.randomRating(),
        comment: this.getRandomItem(this.reviewComments),
        name: this.getRandomItem(this.reviewerNames),
        email: this.generateEmail(this.getRandomItem(this.reviewerNames)),
        verified: Math.random() > 0.3, // 70% verified
        approved: true,
        createdAt: this.randomDate()
      });
    }
    
    return reviews;
  }

  generateEmail(name) {
    const username = name.toLowerCase().replace(/[^a-z]/g, '');
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com'];
    return `${username}@${this.getRandomItem(domains)}`;
  }

  generateProducts(count = 15) {
    const products = [];
    const types = ['FINE_PRINT', 'RISO', 'POSTCARD'];
    
    for (let i = 0; i < count; i++) {
      const type = this.getRandomItem(types);
      const title = this.generateProductTitle();
      const description = this.generateDescription(title, type);
      const variants = this.generateVariants(type);
      const reviews = this.generateReviews(Math.floor(Math.random() * 5) + 1);
      
      products.push({
        title,
        description,
        type,
        basePrice: variants[0].price,
        images: this.generatePlaceholderImages(title),
        variants,
        reviews
      });
    }
    
    return products;
  }

  generatePlaceholderImages(title) {
    // Generate placeholder image URLs
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const imageCount = Math.floor(Math.random() * 3) + 1;
    const images = [];
    
    for (let i = 0; i < imageCount; i++) {
      images.push(`/uploads/generated/${slug}-${i + 1}.jpg`);
    }
    
    return images;
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  randomPrice(min, max) {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  }

  randomStock() {
    return Math.floor(Math.random() * 25) + 5;
  }

  randomRating() {
    // Weighted towards higher ratings (like real reviews)
    const ratings = [5, 5, 5, 5, 5, 4, 4, 4, 3, 3, 2, 1];
    return this.getRandomItem(ratings);
  }

  randomDate() {
    const start = new Date(2023, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  async saveToDatabase(products) {
    console.log('💾 Saving realistic data to database...');
    
    for (const productData of products) {
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
              approved: reviewData.approved,
              createdAt: reviewData.createdAt
            }
          });
        }
        
        console.log(`✅ Created: ${product.title} (${product.variants.length} variants, ${productData.reviews.length} reviews)`);
        
      } catch (error) {
        console.error(`❌ Error saving ${productData.title}:`, error);
      }
    }
  }

  async generatePlaceholderImageFiles(products) {
    console.log('🖼️  Creating placeholder image files...');
    
    const generatedDir = path.join(process.cwd(), 'public', 'uploads', 'generated');
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }
    
    const colors = ['#B8C5B0', '#E85A4F', '#F8F6F1', '#2C2C2C', '#6B7280', '#1E3A8A'];
    
    for (const product of products) {
      const slug = this.generateSlug(product.title);
      const color = this.getRandomItem(colors);
      
      for (let i = 0; i < product.images.length; i++) {
        const filename = `${slug}-${i + 1}.svg`;
        const filepath = path.join(generatedDir, filename);
        
        const svg = `
          <svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="600" fill="${color}"/>
            <text x="300" y="280" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" opacity="0.8">${product.title}</text>
            <text x="300" y="320" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.6">${product.type.replace('_', ' ')}</text>
            <text x="300" y="360" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.4">Image ${i + 1}</text>
          </svg>
        `;
        
        fs.writeFileSync(filepath, svg);
      }
    }
    
    console.log('✅ Generated placeholder images');
  }

  async close() {
    await prisma.$disconnect();
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const count = parseInt(args.find(arg => arg.startsWith('--count='))?.split('=')[1]) || 15;
  
  const generator = new RealisticDataGenerator();
  
  try {
    console.log('🎨 Generating realistic art shop data...');
    
    const products = generator.generateProducts(count);
    await generator.generatePlaceholderImageFiles(products);
    await generator.saveToDatabase(products);
    
    console.log('\n📊 Generation Summary:');
    console.log(`- Products created: ${products.length}`);
    console.log(`- Total variants: ${products.reduce((sum, p) => sum + p.variants.length, 0)}`);
    console.log(`- Total reviews: ${products.reduce((sum, p) => sum + p.reviews.length, 0)}`);
    console.log(`- Images generated: ${products.reduce((sum, p) => sum + p.images.length, 0)}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await generator.close();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = RealisticDataGenerator;