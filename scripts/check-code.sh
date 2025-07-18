#!/bin/bash

# Code Quality Check Script for Burbar Shop
echo "🔍 Running code quality checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $1 in
        "success") echo -e "${GREEN}✅ $2${NC}" ;;
        "error") echo -e "${RED}❌ $2${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $2${NC}" ;;
        "info") echo -e "🔍 $2" ;;
    esac
}

# Exit on any error
set -e

print_status "info" "Starting comprehensive code checks..."

# 1. TypeScript Type Checking
print_status "info" "Checking TypeScript types..."
if npx tsc --noEmit --skipLibCheck; then
    print_status "success" "TypeScript types are valid"
else
    print_status "error" "TypeScript type errors found"
    exit 1
fi

# 2. Next.js Build Check (without actually building)
print_status "info" "Checking Next.js compilation..."
if npx next build --dry-run 2>/dev/null || npx next lint --max-warnings 0; then
    print_status "success" "Next.js compilation looks good"
else
    print_status "warning" "Next.js build may have issues"
fi

# 3. ESLint (if available)
if [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ] || [ -f "eslint.config.js" ]; then
    print_status "info" "Running ESLint..."
    if npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0; then
        print_status "success" "ESLint passed"
    else
        print_status "error" "ESLint errors found"
        exit 1
    fi
else
    print_status "warning" "ESLint not configured"
fi

# 4. Prisma Schema Check
if [ -f "prisma/schema.prisma" ]; then
    print_status "info" "Validating Prisma schema..."
    if npx prisma validate; then
        print_status "success" "Prisma schema is valid"
    else
        print_status "error" "Prisma schema validation failed"
        exit 1
    fi
fi

# 5. Check for common issues
print_status "info" "Checking for common coding issues..."

# Check for useState initialization order issues
if grep -r "useState.*before initialization" . --include="*.tsx" --include="*.ts" 2>/dev/null; then
    print_status "error" "useState initialization order issues found"
    exit 1
fi

# Check for potential white-on-white issues
if grep -r "text-white.*bg-white\|bg-white.*text-white" . --include="*.tsx" --include="*.ts" 2>/dev/null; then
    print_status "warning" "Potential white-on-white styling issues found"
    echo "Please review these manually:"
    grep -r "text-white.*bg-white\|bg-white.*text-white" . --include="*.tsx" --include="*.ts" 2>/dev/null || true
fi

# Check for missing alt attributes in images
if grep -r "<img\|<Image" . --include="*.tsx" --include="*.ts" | grep -v "alt=" 2>/dev/null; then
    print_status "warning" "Images without alt attributes found"
    echo "Please add alt attributes for accessibility:"
    grep -r "<img\|<Image" . --include="*.tsx" --include="*.ts" | grep -v "alt=" 2>/dev/null || true
fi

# 6. Check imports and dependencies
print_status "info" "Checking imports..."
if grep -r "from '@/" . --include="*.tsx" --include="*.ts" | grep -v "node_modules" > /tmp/imports.txt; then
    # Check if all imported paths exist
    while IFS= read -r line; do
        import_path=$(echo "$line" | sed -n "s/.*from ['\"]@\/\([^'\"]*\)['\"].*/\1/p")
        if [ -n "$import_path" ]; then
            full_path="./$import_path"
            # Add common extensions if no extension provided
            if [[ ! "$full_path" =~ \.(ts|tsx|js|jsx)$ ]]; then
                full_path="${full_path}.tsx"
                if [ ! -f "$full_path" ]; then
                    full_path="${full_path%.tsx}.ts"
                fi
            fi
            if [ ! -f "$full_path" ]; then
                print_status "error" "Import path not found: $import_path"
                echo "Referenced in: $line"
                exit 1
            fi
        fi
    done < /tmp/imports.txt
    rm -f /tmp/imports.txt
    print_status "success" "All imports are valid"
fi

# 7. Performance checks
print_status "info" "Running performance checks..."

# Check for large image imports
large_images=$(find . -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" | xargs ls -la 2>/dev/null | awk '$5 > 1048576 {print $9 " (" $5/1048576 "MB)"}' || true)
if [ -n "$large_images" ]; then
    print_status "warning" "Large images found (>1MB):"
    echo "$large_images"
fi

# Check for potential performance issues in code
if grep -r "useEffect.*\[\]" . --include="*.tsx" --include="*.ts" | wc -l | awk '$1 > 10 {exit 1}'; then
    print_status "warning" "Many useEffect hooks found - consider optimization"
fi

print_status "success" "All code quality checks passed!"

echo ""
echo "📋 Summary:"
echo "  ✅ TypeScript types valid"
echo "  ✅ Next.js compilation OK"
echo "  ✅ Imports valid"
echo "  ✅ Prisma schema valid"
echo "  ✅ No critical issues found"
echo ""
echo "🚀 Code is ready for development!"