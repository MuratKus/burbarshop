#!/usr/bin/env node

/**
 * Quick test script to check if we can access Etsy pages
 */

const puppeteer = require('puppeteer');

async function testEtsyAccess() {
  console.log('🧪 Testing Etsy page access...');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set additional headers to appear more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });
    
    // Test different URLs
    const testUrls = [
      'https://www.etsy.com/',
      'https://www.etsy.com/shop/BurcinBarbaros',
      'https://www.etsy.com/c/art-and-collectibles'
    ];
    
    for (const url of testUrls) {
      console.log(`\n🔗 Testing: ${url}`);
      
      try {
        await page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: 30000 
        });
        
        const title = await page.title();
        const currentUrl = page.url();
        
        console.log(`✅ Success!`);
        console.log(`📄 Title: ${title}`);
        console.log(`🔗 Final URL: ${currentUrl}`);
        
        // Check if we were redirected to a blocking page
        if (currentUrl.includes('blocked') || currentUrl.includes('captcha') || title.includes('blocked')) {
          console.log('⚠️  Detected blocking/captcha page');
        }
        
        // Try to find some basic content
        const hasContent = await page.evaluate(() => {
          const listings = document.querySelectorAll('a[href*="/listing/"]').length;
          const shops = document.querySelectorAll('a[href*="/shop/"]').length;
          const searchResults = document.querySelectorAll('[data-test-id], [data-listing-id]').length;
          
          return {
            listings,
            shops,
            searchResults,
            bodyText: document.body.innerText.substring(0, 200)
          };
        });
        
        console.log(`📊 Content found:`, hasContent);
        
      } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
      }
      
      await page.waitForTimeout(2000);
    }
    
  } catch (error) {
    console.error('❌ Browser error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testEtsyAccess().catch(console.error);