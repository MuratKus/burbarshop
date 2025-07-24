# Claude Code MCP Server Configuration

This directory contains Model Context Protocol (MCP) server configurations for enhanced Claude Code functionality.

## Available MCP Servers

### 🚀 **Production Servers (Always Available)**
- **burbar-vercel**: Deployment management, logs, project control

### 🛠️ **Local Persistent Servers**
- **shadcn-ui-local**: Component generation and UI development
- **playwright-local**: Browser automation, testing, and screenshots

## Quick Setup

```bash
# Run the setup script
./.claude/setup-mcp-servers.sh

# Restart Claude Code to activate
exit
claude
```

## Manual Setup

```bash
# Add Shadcn UI MCP server
claude mcp add shadcn-ui-local -s project ./.claude/mcp-servers/shadcn-ui-server.js

# Add Playwright MCP server  
claude mcp add playwright-local -s project ./.claude/mcp-servers/playwright-server.js

# List all configured servers
claude mcp list
```

## Usage Examples

### Shadcn UI Operations
```
"Add a new dialog component to the project"
"Generate a data table component with sorting"
"Show available shadcn-ui components"
"Add a form component with validation"
```

### Playwright Operations
```
"Take a screenshot of the homepage"
"Take a screenshot of /admin/orders page"
"Test the checkout flow"
"Test responsive design on mobile"
"Navigate to the shop page and take a screenshot"
```

### Vercel Operations
```
"List all deployments for burbarshop"
"Get deployment logs for the latest deployment"
"Show me project information"
```

## Troubleshooting

### MCP Server Not Working
1. **Check if configured**: `claude mcp list`
2. **Restart Claude Code**: `exit` then `claude`
3. **Check server logs**: Look for error messages when starting

### Playwright Issues
- Ensure Playwright browsers are installed: `npx playwright install`
- Check if the server process is running

### Shadcn UI Issues
- Ensure GitHub token is available: `echo $GITHUB_PERSONAL_ACCESS_TOKEN`
- Verify the project has a valid `components.json` file

## File Structure

```
.claude/
├── README.md                 # This file
├── setup-mcp-servers.sh     # Quick setup script
└── mcp-servers/
    ├── shadcn-ui-server.js   # Shadcn UI MCP wrapper
    ├── playwright-server.js  # Playwright MCP wrapper
    └── vercel-server.js      # Vercel MCP server (existing)
```

## Environment Variables

Make sure these are set in your environment:

```bash
# For Shadcn UI MCP (GitHub integration)
export GITHUB_PERSONAL_ACCESS_TOKEN="your_github_token_here"

# For Vercel MCP
export VERCEL_TOKEN="your_vercel_token_here"
```