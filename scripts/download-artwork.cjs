#!/usr/bin/env node

/**
 * Download artwork images from Etsy and store locally
 * This script reads the Etsy response backup and downloads all images
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '..', 'public', 'images');

function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading: ${url}`);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Saved: ${path.basename(filePath)}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function generateImageFilename(listing, imageIndex) {
  // Create a clean filename from listing title
  const title = listing.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')     // Replace spaces with dashes
    .replace(/-+/g, '-')      // Remove multiple dashes
    .substring(0, 50);        // Limit length
  
  return `${title}-${imageIndex + 1}.jpg`;
}

async function downloadArtwork() {
  try {
    console.log('🎨 Starting artwork download...\n');
    
    // Ensure images directory exists
    await mkdir(imagesDir, { recursive: true });
    
    // Read the Etsy response backup
    const responseData = fs.readFileSync(
      path.join(__dirname, '..', 'response-etsy-backup.json'),
      'utf8'
    );
    
    const listings = JSON.parse(responseData);
    console.log(`📦 Found ${listings.length} listings to process`);
    
    const imageMapping = {}; // Map old URLs to new paths
    let totalImages = 0;
    let downloaded = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const listing of listings) {
      console.log(`\n📦 Processing: "${listing.title}"`);
      
      if (!listing.listing_images || listing.listing_images.length === 0) {
        console.log('⚠️  No images found for this listing');
        continue;
      }
      
      const localImages = [];
      
      for (let i = 0; i < listing.listing_images.length; i++) {
        const image = listing.listing_images[i];
        totalImages++;
        
        // Use the highest quality image available
        const imageUrl = image.url_1588xN || image.url_1140xN || image.url_794xN || image.url;
        
        if (!imageUrl) {
          console.log(`⚠️  No suitable image URL found for image ${i + 1}`);
          failed++;
          continue;
        }
        
        // Generate local filename
        const filename = generateImageFilename(listing, i);
        const filePath = path.join(imagesDir, filename);
        const localPath = `/images/${filename}`;
        
        // Skip if file already exists
        if (fs.existsSync(filePath)) {
          console.log(`⏭️  Already exists: ${filename}`);
          localImages.push(localPath);
          skipped++;
          continue;
        }
        
        try {
          await downloadImage(imageUrl, filePath);
          localImages.push(localPath);
          downloaded++;
          
          // Add to mapping for database update
          imageMapping[imageUrl] = localPath;
          
          // Small delay to be nice to Etsy's servers
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`❌ Failed to download image: ${error.message}`);
          failed++;
        }
      }
      
      // Store the mapping for this listing
      imageMapping[listing.listing_id] = localImages;
    }
    
    console.log(`\n🎉 Download completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   Total images: ${totalImages}`);
    console.log(`   Downloaded: ${downloaded}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);
    
    // Save the mapping for the database update script
    const mappingFile = path.join(__dirname, 'image-mapping.json');
    await writeFile(mappingFile, JSON.stringify(imageMapping, null, 2));
    console.log(`\n💾 Image mapping saved to: ${mappingFile}`);
    
    return imageMapping;
    
  } catch (error) {
    console.error('❌ Download failed:', error.message);
    throw error;
  }
}

if (require.main === module) {
  downloadArtwork().catch(console.error);
}

module.exports = { downloadArtwork };