#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Running comprehensive code validation...\n');

const scripts = [
  {
    name: 'TypeScript Type Checking',
    command: 'npx tsc --noEmit --strict',
    icon: '🔴'
  },
  {
    name: 'ESLint Analysis',
    command: 'npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0',
    icon: '⚡'
  },
  {
    name: 'Prettier Code Formatting',
    command: 'npx prettier --check .',
    icon: '✨'
  },
  {
    name: 'Next.js Build Check',
    command: 'npm run build',
    icon: '🏗️'
  },
  {
    name: 'Jest Tests',
    command: 'npm run test',
    icon: '🧪'
  }
];

let hasErrors = false;

for (const script of scripts) {
  try {
    console.log(`${script.icon} ${script.name}...`);
    execSync(script.command, { 
      stdio: 'inherit', 
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test' }
    });
    console.log(`✅ ${script.name} passed\n`);
  } catch (error) {
    console.log(`❌ ${script.name} failed\n`);
    hasErrors = true;
    
    // Continue with other checks unless it's a build failure
    if (script.name.includes('Build')) {
      break;
    }
  }
}

if (hasErrors) {
  console.log('💥 Code validation failed. Please fix the issues above before deploying.');
  process.exit(1);
} else {
  console.log('🎉 All validation checks passed! Ready for deployment.');
  process.exit(0);
}