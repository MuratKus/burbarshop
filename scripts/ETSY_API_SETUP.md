# Etsy API Setup Guide

This guide will help you set up the Etsy API extractor to pull your real shop data directly from Etsy's official API.

## 🔑 Step 1: Get Your Etsy API Key

1. **Go to Etsy Developer Portal**
   - Visit: https://www.etsy.com/developers/your-account
   - Sign in with your Etsy account

2. **Create a New App**
   - Click "Create a New App"
   - Fill in the app details:
     - **App Name**: `Burbar Shop Data Extractor`
     - **App Description**: `Extract my shop data for my personal website`
     - **App Type**: `Private` (for personal use)
     - **Purpose**: `Data extraction for personal website`

3. **Get Your API Key**
   - Once created, you'll see your **API Key** (also called Keystring)
   - Copy this key - you'll need it in the next step

## 🔧 Step 2: Add API Key to Your Environment

Add your API key to your `.env.local` file:

```bash
# Add this line to your .env.local file
ETSY_API_KEY=your_api_key_here
```

For example:
```bash
ETSY_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901
```

## 🚀 Step 3: Find Your Shop Information

You need either your **Shop ID** or **Shop Name**:

### Option A: Shop Name (Easier)
Your shop name is in your Etsy shop URL:
- URL: `https://www.etsy.com/shop/BurcinBarbaros`
- Shop Name: `BurcinBarbaros`

### Option B: Shop ID (More Reliable)
To find your Shop ID:
1. Go to your Etsy shop
2. View page source (right-click → View Source)
3. Search for `"shop_id"` - you'll find a number like `12345678`

## 📦 Step 4: Extract Your Data

Now you can extract your real shop data:

```bash
# Using shop name (easier)
npm run extract:etsy-api -- --shop-name=BurcinBarbaros

# Using shop ID (more reliable)
npm run extract:etsy-api -- --shop-id=12345678

# Limit number of products
npm run extract:etsy-api -- --shop-name=BurcinBarbaros --limit=20

# Skip image downloads (faster)
npm run extract:etsy-api -- --shop-name=BurcinBarbaros --no-images
```

## 📊 What Gets Extracted

The API extractor will get:
- ✅ **All active listings** from your shop
- ✅ **Product details**: titles, descriptions, prices
- ✅ **High-quality images** (downloads to `/public/uploads/etsy/`)
- ✅ **Customer reviews** and ratings
- ✅ **Product variants** (sizes, colors, etc.)
- ✅ **Real inventory counts**
- ✅ **Product tags** for categorization

## 🔄 Example Workflow

```bash
# 1. Reset database
npm run db:reset

# 2. Extract your real shop data
npm run extract:etsy-api -- --shop-name=BurcinBarbaros

# 3. Validate the data
npm run db:setup -- --validate

# 4. Start your development server
npm run dev
```

## 🛠️ Advanced Options

### Multiple Shops
If you have multiple shops:
```bash
# Extract from first shop
npm run extract:etsy-api -- --shop-name=FirstShop

# Extract from second shop (adds to existing data)
npm run extract:etsy-api -- --shop-name=SecondShop
```

### Batch Processing
```bash
# Extract with custom limits
npm run extract:etsy-api -- --shop-name=BurcinBarbaros --limit=100

# Skip images for faster processing
npm run extract:etsy-api -- --shop-name=BurcinBarbaros --no-images
```

## 🔍 Troubleshooting

### Common Issues

1. **"ETSY_API_KEY environment variable is required"**
   - Make sure you added `ETSY_API_KEY=your_key` to `.env.local`
   - Restart your terminal after adding the key

2. **"API Error 403: Forbidden"**
   - Check if your API key is correct
   - Make sure your app is set to "Private" mode
   - Ensure you're using the correct shop name/ID

3. **"Shop not found"**
   - Double-check your shop name spelling
   - Try using Shop ID instead of shop name
   - Make sure your shop is active and public

4. **Rate limiting**
   - The script automatically handles rate limits
   - If you get errors, try running again later

### Debug Mode

To see detailed API requests:
```bash
# Add debug logging
ETSY_API_KEY=your_key node scripts/etsy-api-extractor.js --shop-name=BurcinBarbaros --debug
```

## 🔐 Security Notes

- **Keep your API key secret** - never commit it to version control
- **Use environment variables** - always store keys in `.env.local`
- **Private apps only** - don't create public apps unless needed
- **Regular rotation** - consider rotating your API key periodically

## 📚 API Documentation

For more advanced usage, refer to:
- [Etsy API Documentation](https://developers.etsy.com/documentation)
- [API Reference](https://developers.etsy.com/documentation/reference)

## 🎯 Expected Results

After running the extractor, you should see:
```
📊 Extraction Summary:
- Shop: BurcinBarbaros
- Listings found: 25
- Products extracted: 25
- Total reviews: 85
- Images downloaded: 75
```

Your database will now have real product data from your Etsy shop, ready for development and testing! 🎨