#!/usr/bin/env node

/**
 * Playwright MCP Server
 * Local wrapper for persistent playwright MCP server
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🎭 Starting Playwright MCP Server...');

// Start the playwright MCP server
const server = spawn('npx', ['@playwright/mcp@latest'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    // Set any Playwright-specific environment variables
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0'
  }
});

server.on('error', (error) => {
  console.error('❌ Playwright MCP Server error:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`🎭 Playwright MCP Server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down Playwright MCP Server...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down Playwright MCP Server...');
  server.kill('SIGINT');
});