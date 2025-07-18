#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files with unescaped quote errors
const filesToFix = [
  'app/auth/magic/page.tsx',
  'app/auth/verify/page.tsx', 
  'app/checkout/success/page.tsx',
  'app/test-login/page.tsx',
  'app/track-order/page.tsx'
];

console.log('🔧 Fixing unescaped quotes in React components...\n');

filesToFix.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  
  if (fs.existsSync(fullPath)) {
    console.log(`Fixing ${file}...`);
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix common unescaped quotes in JSX
    content = content.replace(/Don't/g, "Don&apos;t");
    content = content.replace(/can't/g, "can&apos;t");
    content = content.replace(/won't/g, "won&apos;t");
    content = content.replace(/We'll/g, "We&apos;ll");
    content = content.replace(/You'll/g, "You&apos;ll");
    content = content.replace(/It's/g, "It&apos;s");
    content = content.replace(/That's/g, "That&apos;s");
    content = content.replace(/We're/g, "We&apos;re");
    content = content.replace(/You're/g, "You&apos;re");
    content = content.replace(/They're/g, "They&apos;re");
    content = content.replace(/I'm/g, "I&apos;m");
    content = content.replace(/doesn't/g, "doesn&apos;t");
    content = content.replace(/hasn't/g, "hasn&apos;t");
    content = content.replace(/haven't/g, "haven&apos;t");
    content = content.replace(/isn't/g, "isn&apos;t");
    content = content.replace(/wasn't/g, "wasn&apos;t");
    content = content.replace(/weren't/g, "weren&apos;t");
    
    // Fix double quotes in JSX text 
    content = content.replace(/>([^<]*)"([^"]*)"([^<]*)</g, '>$1&quot;$2&quot;$3<');
    
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed ${file}`);
  } else {
    console.log(`❌ File not found: ${file}`);
  }
});

console.log('\n🎉 Quote fixing complete!');