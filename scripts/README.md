# Database Setup & Etsy Data Extraction Scripts

This directory contains scripts to help set up your Burbar Shop database with real product data and reviews extracted from Etsy.

## Prerequisites

Install the required dependencies:

```bash
npm install puppeteer cheerio
```

## Scripts Overview

### 1. Etsy Data Extractor (`etsy-extractor.js`)

Extracts product information and reviews from Etsy listings and populates your database.

**Features:**
- Extracts product titles, descriptions, prices, images
- Extracts customer reviews and ratings
- Downloads product images locally
- Respects rate limiting and Etsy's terms
- Converts data to match your Prisma schema

**Usage:**

```bash
# Extract from entire Etsy shop
node scripts/etsy-extractor.js --shop-url=https://www.etsy.com/shop/YourShopName

# Extract from specific product listings
node scripts/etsy-extractor.js --listing-urls=https://www.etsy.com/listing/123,https://www.etsy.com/listing/456

# Debug mode (shows browser)
node scripts/etsy-extractor.js --shop-url=https://www.etsy.com/shop/YourShop --debug

# Skip image downloads
node scripts/etsy-extractor.js --shop-url=https://www.etsy.com/shop/YourShop --no-images
```

### 2. Database Setup (`setup-database.js`)

Comprehensive database setup script with sample data seeding and validation.

**Features:**
- Reset database and apply migrations
- Seed with sample data for development
- Integrate with Etsy extractor
- Validate database integrity
- Create sample image placeholders

**Usage:**

```bash
# Reset database and apply migrations
node scripts/setup-database.js --reset

# Seed with sample data
node scripts/setup-database.js --seed-sample

# Seed with Etsy data
node scripts/setup-database.js --seed-etsy --shop-url=https://www.etsy.com/shop/YourShop

# Validate database
node scripts/setup-database.js --validate

# Complete setup (reset + sample data)
node scripts/setup-database.js --reset --seed-sample
```

## Step-by-Step Setup Guide

### Option 1: Quick Setup with Sample Data

```bash
# 1. Reset database and seed with sample data
npm run db:sample

# 2. Validate everything is working
npm run db:setup -- --validate

# 3. Start your development server
npm run dev
```

### Option 2: Realistic Art Shop Data (Recommended)

```bash
# 1. Generate realistic art shop data (15 products with reviews)
npm run db:fresh

# 2. Generate more products if needed
npm run db:realistic -- --count=25

# 3. Validate the data
npm run db:setup -- --validate

# 4. Start your development server
npm run dev
```

### Option 3: Real Etsy Data via API (Recommended for Your Shop)

✅ **Best for your own shop**: Uses official Etsy API with your credentials.

```bash
# 1. Set up API key (see ETSY_API_SETUP.md)
# Add ETSY_API_KEY=your_key to .env.local

# 2. Extract your real shop data
npm run extract:etsy-api -- --shop-name=BurcinBarbaros

# 3. Validate the data
npm run db:setup -- --validate

# 4. Start your development server
npm run dev
```

### Option 4: Manual Etsy Web Scraping (May be blocked)

⚠️ **Note**: Etsy has strong bot detection. Use the API extractor or realistic data generator instead.

```bash
# 1. Try web scraping (may fail due to bot detection)
npm run extract:etsy -- --shop-url=https://www.etsy.com/shop/YourShopName

# 2. If blocked, use API extractor or realistic data generator instead
npm run extract:etsy-api -- --shop-name=YourShopName
```

## Data Mapping

The extractor automatically maps Etsy data to your database schema:

### Products
- **Title** → `product.title`
- **Description** → `product.description`
- **Images** → Downloaded to `/public/uploads/etsy/` and stored as JSON
- **Type** → Auto-detected as `FINE_PRINT`, `POSTCARD`, or `RISO` based on title/description
- **Price** → `product.basePrice` and `variant.price`

### Variants
- **Size Options** → `productVariant.size`
- **Prices** → `productVariant.price`
- **Stock** → `productVariant.stock` (randomized since real stock isn't available)

### Reviews
- **Rating** → `review.rating` (1-5 stars)
- **Comment** → `review.comment`
- **Author** → `review.author`
- **Date** → `review.createdAt`
- **Verified** → `review.isVerified` (set to true for Etsy reviews)

## Rate Limiting & Ethics

The extractor includes built-in rate limiting and follows ethical scraping practices:

- **2-second delay** between requests
- **User-agent rotation** to avoid detection
- **Respects robots.txt** guidelines
- **Limited to 20 products** per shop by default
- **Graceful error handling** and retries

## Troubleshooting

### Common Issues

1. **Browser fails to launch:**
   ```bash
   # Install required dependencies
   sudo apt-get update
   sudo apt-get install -y gconf-service libasound2-dev libatk1.0-dev libc6-dev libcairo2-dev libcups2-dev libdbus-1-dev libexpat1-dev libfontconfig1-dev libgcc1 libgconf-2-4 libgdk-pixbuf2.0-dev libglib2.0-dev libgtk-3-dev libnspr4-dev libpango-1.0-dev libpangocairo-1.0-dev libstdc++6 libx11-dev libx11-xcb-dev libxcb1-dev libxcomposite-dev libxcursor-dev libxdamage-dev libxext-dev libxfixes-dev libxi-dev libxrandr-dev libxrender-dev libxss-dev libxtst-dev ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
   ```

2. **Database connection issues:**
   ```bash
   # Make sure your database is running
   npx prisma migrate dev
   npx prisma generate
   ```

3. **Image download fails:**
   ```bash
   # Check permissions
   mkdir -p public/uploads/etsy
   chmod 755 public/uploads/etsy
   ```

### Debug Mode

Run with `--debug` flag to see the browser in action:

```bash
node scripts/etsy-extractor.js --shop-url=https://www.etsy.com/shop/YourShop --debug
```

## Data Privacy & Legal

⚠️ **Important:** This tool is for educational and development purposes only.

- **Respect Etsy's Terms of Service**
- **Don't use for commercial scraping**
- **Only extract your own shop data or with permission**
- **Be mindful of rate limits**
- **Consider using Etsy's official API for production**

## Integration with Claude Code

These scripts work seamlessly with your MCP servers:

```bash
# After extracting data, use Claude Code to:
claude "Show me all the products we just imported from Etsy"
claude "Generate a report of review ratings for our products"
claude "Update stock levels for products with low inventory"
```

The extracted data becomes immediately available through your MCP database server, allowing Claude Code to help you manage your inventory, analyze reviews, and process orders.

## Support

If you encounter issues:

1. Check the console output for detailed error messages
2. Verify your database connection and schema
3. Ensure all dependencies are installed
4. Try running with `--debug` flag for more information

For questions about the scripts or database setup, refer to the main project documentation or create an issue in the repository.