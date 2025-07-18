#!/bin/bash

# Database Backup Script for Burbar Shop
echo "📦 Creating database backups..."

# Get current date for filename
DATE=$(date +"%Y%m%d_%H%M%S")

# Create backups directory
mkdir -p backups

# Production database backup
echo "🔄 Backing up production database..."
PROD_DB_URL=$(grep "DATABASE_DATABASE_URL=" .env.production | cut -d'"' -f2)

# Extract connection details
PROD_HOST=$(echo $PROD_DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
PROD_PORT=$(echo $PROD_DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
PROD_DB=$(echo $PROD_DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
PROD_USER=$(echo $PROD_DB_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
PROD_PASS=$(echo $PROD_DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

# Backup production (schema + data)
echo "💾 Creating SQL dump of production database..."
PGPASSWORD="$PROD_PASS" pg_dump \
  -h "$PROD_HOST" \
  -p "$PROD_PORT" \
  -U "$PROD_USER" \
  -d "$PROD_DB" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  > "backups/burbarshop_production_${DATE}.sql"

# Backup only data (for easy restoration)
echo "📄 Creating data-only backup..."
PGPASSWORD="$PROD_PASS" pg_dump \
  -h "$PROD_HOST" \
  -p "$PROD_PORT" \
  -U "$PROD_USER" \
  -d "$PROD_DB" \
  --data-only \
  --no-owner \
  --no-privileges \
  > "backups/burbarshop_data_only_${DATE}.sql"

# Local database backup (if exists)
echo "🏠 Backing up local database..."
LOCAL_DB_URL=$(grep "DATABASE_URL=" .env.local | cut -d'"' -f2)

if [ ! -z "$LOCAL_DB_URL" ]; then
  pg_dump "$LOCAL_DB_URL" \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    > "backups/burbarshop_local_${DATE}.sql" 2>/dev/null || echo "⚠️  Local database backup failed (may be empty)"
fi

# Create JSON backup using our extraction script
echo "📋 Creating JSON backup of all data..."
PROD_DATABASE_URL="$PROD_DB_URL" node -e "
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.PROD_DATABASE_URL } }
});

async function backup() {
  try {
    const data = {
      products: await prisma.product.findMany({ include: { variants: true } }),
      users: await prisma.user.findMany(),
      orders: await prisma.order.findMany({ include: { items: true } }),
      shippingZones: await prisma.shippingZone.findMany(),
      promoCodes: await prisma.promoCode.findMany(),
      reviews: await prisma.review.findMany(),
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('backups/burbarshop_complete_${DATE}.json', JSON.stringify(data, null, 2));
    console.log('✅ JSON backup created');
  } catch (error) {
    console.error('❌ JSON backup failed:', error);
  } finally {
    await prisma.\$disconnect();
  }
}

backup();" 2>/dev/null || echo "⚠️  JSON backup failed"

echo ""
echo "🎉 Backup complete!"
echo "📁 Files created:"
ls -la backups/*${DATE}* 2>/dev/null || echo "   No files created"
echo ""
echo "💡 To restore:"
echo "   Production: psql \$DATABASE_URL < backups/burbarshop_production_${DATE}.sql"
echo "   Data only:  psql \$DATABASE_URL < backups/burbarshop_data_only_${DATE}.sql"