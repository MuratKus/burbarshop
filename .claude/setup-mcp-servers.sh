#!/bin/bash

echo "🚀 Setting up persistent MCP servers..."

# Remove existing MCP server configurations
echo "📋 Removing existing MCP configurations..."
claude mcp remove shadcn-ui 2>/dev/null || true
claude mcp remove playwright 2>/dev/null || true
claude mcp remove shadcn-ui-mcp-server 2>/dev/null || true

# Add local persistent MCP servers
echo "🎨 Adding Shadcn UI MCP server (local persistent)..."
claude mcp add shadcn-ui-local -s project ./.claude/mcp-servers/shadcn-ui-server.js

echo "🎭 Adding Playwright MCP server (local persistent)..."
claude mcp add playwright-local -s project ./.claude/mcp-servers/playwright-server.js

echo "✅ MCP servers configured!"
echo ""
echo "📋 Current MCP servers:"
claude mcp list

echo ""
echo "🔧 To use these servers:"
echo "1. Exit Claude Code (type 'exit')"
echo "2. Start Claude Code again (type 'claude')"
echo "3. The servers will auto-start when needed"
echo ""
echo "🧪 Test commands:"
echo '- "Take a screenshot of the homepage"'
echo '- "Add a new button component using shadcn-ui"'
echo '- "Show available shadcn-ui components"'