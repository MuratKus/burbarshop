import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to extract images from Etsy listing page
async function getEtsyListingImages(listingId: string) {
  try {
    console.log(`🔍 Fetching images for Etsy listing ${listingId}...`);
    
    // Fetch the public Etsy listing page
    const response = await fetch(`https://www.etsy.com/listing/${listingId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract images from HTML using multiple approaches
    const images = [];
    const videos = [];
    
    // Method 1: Look for high-resolution images in the HTML
    const imageRegex = /https:\/\/i\.etsystatic\.com\/[^"'\s]+\.jpg/g;
    const imageMatches = html.match(imageRegex);
    
    if (imageMatches) {
      // Filter and deduplicate images
      const uniqueImages = [...new Set(imageMatches)]
        .filter(img => 
          !img.includes('_75x75') && 
          !img.includes('_170x135') && 
          !img.includes('_340x270') &&
          !img.includes('listing-page-ad') &&
          !img.includes('avatars') &&
          !img.includes('badges')
        )
        .map(img => {
          // Convert to highest resolution available
          return img
            .replace(/il_\d+xN/, 'il_fullxfull')
            .replace(/il_\d+x\d+/, 'il_fullxfull')
            .replace(/\/c_limit,w_\d+/, '/c_limit,w_2000'); // Higher resolution
        })
        .slice(0, 15); // Limit to 15 images
      
      images.push(...uniqueImages);
    }
    
    // Method 2: Look for JSON-LD structured data
    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs;
    const jsonLdMatches = html.match(jsonLdRegex);
    
    if (jsonLdMatches) {
      jsonLdMatches.forEach(match => {
        try {
          const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
          const data = JSON.parse(jsonContent);
          
          if (data.image) {
            if (Array.isArray(data.image)) {
              images.push(...data.image);
            } else {
              images.push(data.image);
            }
          }
        } catch (e) {
          // Skip invalid JSON
        }
      });
    }
    
    // Method 3: Look for video URLs
    const videoRegex = /https:\/\/v\.etsystatic\.com\/[^"'\s]+\.mp4/g;
    const videoMatches = html.match(videoRegex);
    
    if (videoMatches) {
      const uniqueVideos = [...new Set(videoMatches)].slice(0, 5); // Limit to 5 videos
      videos.push(...uniqueVideos);
    }
    
    // Deduplicate final results
    const finalImages = [...new Set(images)].filter(img => img && typeof img === 'string');
    const finalVideos = [...new Set(videos)].filter(video => video && typeof video === 'string');
    
    console.log(`✅ Found ${finalImages.length} images and ${finalVideos.length} videos for listing ${listingId}`);
    
    return {
      images: finalImages,
      videos: finalVideos,
      success: true
    };
    
  } catch (error) {
    console.error(`❌ Error fetching images for listing ${listingId}:`, error);
    return {
      images: [],
      videos: [],
      success: false,
      error: error.message
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId, listingId } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // Get the product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        images: true,
        etsyListingId: true
      }
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Use provided listing ID or extract from product
    const etsyListingId = listingId || product.etsyListingId;
    
    if (!etsyListingId) {
      return NextResponse.json({ error: 'No Etsy listing ID available' }, { status: 400 });
    }
    
    console.log(`Enhancing images for product: ${product.title}, Etsy ID: ${etsyListingId}`);
    
    // Fetch images from Etsy
    const etsyData = await getEtsyListingImages(etsyListingId);
    
    if (!etsyData.success) {
      return NextResponse.json({ 
        error: 'Failed to fetch Etsy images', 
        details: etsyData.error 
      }, { status: 500 });
    }
    
    // Combine current images with new ones
    const currentImages = JSON.parse(product.images || '[]');
    const allImages = [...currentImages, ...etsyData.images];
    
    // Remove duplicates and limit to reasonable number
    const uniqueImages = [...new Set(allImages)].slice(0, 15);
    
    // Update product with enhanced images
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        images: JSON.stringify(uniqueImages),
        // Store videos separately if we add a videos field later
        // videos: JSON.stringify(etsyData.videos)
      }
    });
    
    return NextResponse.json({
      success: true,
      product: {
        id: updatedProduct.id,
        title: updatedProduct.title,
        imagesCount: uniqueImages.length,
        videosCount: etsyData.videos.length
      },
      images: uniqueImages,
      videos: etsyData.videos
    });
    
  } catch (error) {
    console.error('Error enhancing product images:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all products that need image enhancement
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        images: true,
        etsyListingId: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Analyze current image status
    const analysis = products.map(product => {
      const currentImages = JSON.parse(product.images || '[]');
      return {
        id: product.id,
        title: product.title,
        currentImageCount: currentImages.length,
        hasEtsyId: !!product.etsyListingId,
        etsyListingId: product.etsyListingId
      };
    });
    
    return NextResponse.json({
      success: true,
      totalProducts: products.length,
      products: analysis
    });
    
  } catch (error) {
    console.error('Error analyzing products:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}