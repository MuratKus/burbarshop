#!/usr/bin/env node

/**
 * Shadcn UI MCP Server
 * Local wrapper for persistent shadcn-ui MCP server
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🎨 Starting Shadcn UI MCP Server...');

// Start the shadcn-ui MCP server
const server = spawn('npx', ['@jpisnice/shadcn-ui-mcp-server'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    // Ensure GitHub token is available if needed
    GITHUB_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN || process.env.GITHUB_TOKEN
  }
});

server.on('error', (error) => {
  console.error('❌ Shadcn UI MCP Server error:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`🎨 Shadcn UI MCP Server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down Shadcn UI MCP Server...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down Shadcn UI MCP Server...');
  server.kill('SIGINT');
});