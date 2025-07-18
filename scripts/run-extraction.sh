#!/bin/bash

# Production Data Extraction Script for Burbar Shop
echo "🔧 Setting up environment for data extraction..."

# Set production database URL from .env.production
export PROD_DATABASE_URL=$(grep "DATABASE_DATABASE_URL=" .env.production | cut -d '"' -f 2)

# Set local database URL from .env.local
export DATABASE_URL=$(grep "DATABASE_URL=" .env.local | cut -d '"' -f 2)

echo "✅ Production DB: ${PROD_DATABASE_URL:0:30}..."
echo "✅ Local DB: ${DATABASE_URL:0:30}..."

# Ensure Prisma client is generated
echo "🔄 Generating Prisma client..."
npx prisma generate

# Run the extraction script
echo "🚀 Starting data extraction..."
node scripts/extract-production-data.js

echo "🎉 Extraction complete!"