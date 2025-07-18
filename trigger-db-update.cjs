#!/usr/bin/env node

// Simple script to trigger database update via API
const https = require('https');

const data = JSON.stringify({
  secret: 'fix-images-now-please'
});

const options = {
  hostname: 'www.burcinbarbaros.com',
  port: 443,
  path: '/api/fix-images',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🔄 Triggering database update...');

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(body);
      console.log('✅ Response:', JSON.stringify(result, null, 2));
    } catch (e) {
      console.log('📄 Response:', body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(data);
req.end();