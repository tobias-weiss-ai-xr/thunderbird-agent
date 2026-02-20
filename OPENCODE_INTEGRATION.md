# Thunderbird MCP - OpenCode Integration Guide

## Overview

This guide explains how to integrate and use thunderbird-mcp with OpenCode.

## Installation Steps

### 1. Clone and Setup

```bash
# Clone the repository (if not already done)
git clone <repository-url> thunderbird-mcp
cd thunderbird-mcp/thunderbird-mcp-server
```

### 2. Install Dependencies

```bash
# Install Bun runtime (if not installed)
# On Linux/macOS:
curl -fsSL https://bun.sh/install | bash

# On Windows (PowerShell):
irm bun.sh/install.ps1 | iex

# Install project dependencies
bun install
```

### 3. Verify Installation

```bash
# Run tests to verify everything works
bun test
```

Expected output:
```
bun test v1.3.6

 20 pass
 0 fail
 34 expect() calls
Ran 20 tests across 5 files.
```

### 4. OpenCode Configuration

The thunderbird-mcp server is pre-configured in OpenCode's configuration file at:
`~/.config/opencode/opencode.json`

The configuration entry:
```json
"thunderbird-mcp": {
  "command": [
    "bun",
    "run",
    "C:/Users/Tobias/git/thunderbird-mcp/thunderbird-mcp-server/src/index.ts"
  ],
  "enabled": true,
  "type": "local"
}
```

**Important**: Adjust the path if your project is located elsewhere:
```json
"command": [
  "bun",
  "run",
  "/absolute/path/to/your/thunderbird-mcp/thunderbird-mcp-server/src/index.ts"
],
```

### 5. Restart OpenCode

After configuration changes, restart OpenCode for the changes to take effect.

## Usage

### Accessing MCP Tools

Once OpenCode is running, thunderbird-mcp tools will be available:

1. **Open the MCP Tools Panel** in OpenCode
2. **Select "thunderbird-mcp"** from the server list
3. **Available tools**:
   - Email: `fetch_emails`, `send_email`, `delete_email`, `batch_delete_emails`, `batch_archive_emails`
   - Calendar: `fetch_events`, `create_event`, `delete_event`
   - Contacts: `fetch_contacts`, `create_contact`, `delete_contact`
   - Automation: `list_automation_rules`, `upsert_automation_rule`, `delete_automation_rule`

### Example Queries

In OpenCode, you can now ask questions like:

```
"Fetch all my emails from the inbox"
```
- Uses: `fetch_emails`

```
"Create a meeting for tomorrow at 2pm"
```
- Uses: `create_event`

```
"Find all contacts named John"
```
- Uses: `fetch_contacts`

```
"Delete the last 10 emails from spam folder"
```
- Uses: `batch_delete_emails`

## Troubleshooting

### Server Won't Start

**Problem**: OpenCode shows thunderbird-mcp as offline

**Solutions**:
1. Check Bun is installed: `bun --version`
2. Verify path in opencode.json is correct
3. Run server manually to see error messages:
   ```bash
   cd C:/Users/Tobias/git/thunderbird-mcp/thunderbird-mcp-server
   bun run src/index.ts
   ```
4. Check dependencies are installed: `bun install`

### Tools Not Available

**Problem**: MCP tools panel shows no tools from thunderbird-mcp

**Solutions**:
1. Verify the server starts successfully
2. Check OpenCode logs for MCP server errors
3. Ensure `"enabled": true` in the configuration
4. Restart OpenCode after configuration changes

### Path Issues on Windows

**Problem**: Path not found when trying to start server

**Solution**: Use forward slashes in Windows paths for JSON:
- ✅ Correct: `"C:/Users/..."`
- ❌ Wrong: `"C:\\Users\\..."`

### TypeScript Errors

**Problem**: Server has TypeScript errors during development

**Solution**:
```bash
# Check diagnostics
npx tsc --noEmit

# Or use VS Code / OpenCode type checking
```

## Development

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/mcpServer.test.ts

# Run tests in watch mode
bun test --watch
```

### Making Changes

1. Edit source files in `src/`
2. Run `bun test` to verify
3. Restart OpenCode for changes to take effect

### Debugging

Enable verbose logging:
```bash
DEBUG=* bun run src/index.ts
```

## Advanced Configuration

### Custom Command Options

If you need to modify how the server starts:

```json
"thunderbird-mcp": {
  "command": [
    "bun",
    "run",
    "--cwd",
    "/path/to/project",
    "/path/to/src/index.ts"
  ],
  "env": {
    "NODE_ENV": "development",
    "THUNDERBIRD_DEBUG": "true"
  },
  "enabled": true,
  "type": "local"
}
```

### Multiple Configurations

For development vs production:

```json
"thunderbird-mcp-dev": {
  "command": [
    "bun",
    "run",
    "C:/Users/Tobias/git/thunderbird-mcp-dev/thunderbird-mcp-server/src/index.ts"
  ],
  "enabled": true,
  "type": "local"
},
"thunderbird-mcp": {
  "command": [
    "bun",
    "run",
    "C:/Users/Tobias/git/thunderbird-mcp/thunderbird-mcp-server/src/index.ts"
  ],
  "enabled": true,
  "type": "local"
}
```

## Support

For issues:
1. Check the main README.md for documentation
2. Review REFACTORING.md for recent changes
3. Run tests to verify installation
4. Check OpenCode logs for MCP server errors

## Next Steps

- Install Thunderbird extension for full functionality
- Implement `communicateWithThunderbird()` communication layer
- Set up integration testing with actual Thunderbird instance
- Configure automation rules in `automationRules.json`