# Thunderbird MCP Server

A Modular Control Protocol (MCP) server for controlling Thunderbird email client using FastMCP.

## Overview

This server provides MCP tools for managing Thunderbird's emails, calendar events, and contacts. It bridges between MCP clients and Thunderbird's WebExtension API.

## OpenCode Integration

The thunderbird-mcp server is configured to work with [OpenCode](https://opencode.ai).

### Configuration

The server is registered in `~/.config/opencode/opencode.json`:

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

### Prerequisites

1. **Bun runtime**: Ensure Bun is installed
   ```bash
   curl -fsSL https://bun.sh/install | bash
   # or on Windows:
   # powershell -c "irm bun.sh/install.ps1|iex"
   ```

2. **Project location**: The server must be at `C:/Users/Tobias/git/thunderbird-mcp/thunderbird-mcp-server/`

3. **Dependencies installed**:
   ```bash
   bun install
   ```

### Using with OpenCode

Once configured, the thunderbird-mcp tools will be available in OpenCode under the MCP tools section. The server will start automatically when needed.

## Local Development

For local development without OpenCode:

1. Install dependencies:
   ```bash
   bun install
   ```

2. Run the server directly:
   ```bash
   bun run src/index.ts
   ```

## Project Structure

- `src/`: Source code
  - `index.ts`: Main MCP server entry point with tool definitions
  - `modules/`: Business logic services (email, calendar, contact)
  - `routes/`: Legacy HTTP API routes (deprecated)
  - `utils/`: Utility functions (rules engine)
  - `types/`: TypeScript type definitions
- `tests/`: Test files
- `extension/`: Thunderbird extension files
- `automationRules.json`: Automation rule configuration

## MCP Tools

### Email Tools
- `fetch_emails` - Fetch emails from accounts/folders
- `send_email` - Send an email
- `delete_email` - Delete a single email
- `batch_delete_emails` - Delete multiple emails
- `batch_archive_emails` - Archive multiple emails
- `move_email` - Move an email to a specific folder
- `get_folders` - List all available folders for classification

### Calendar Tools
- `fetch_events` - Fetch calendar events
- `create_event` - Create a new calendar event
- `delete_event` - Delete a calendar event

### Contact Tools
- `fetch_contacts` - Fetch contacts
- `create_contact` - Create a new contact
- `delete_contact` - Delete a contact

### Automation Rules Tools
- `list_automation_rules` - List all email automation rules
- `upsert_automation_rule` - Create/update an automation rule
- `delete_automation_rule` - Delete an automation rule

### AI-Powered Email Sorting Tools
- `classify_email` - **AI-powered email classification** - suggests target folder with confidence score
- `auto_sort_inbox` - **Automatic inbox sorting** - classify and optionally move emails in bulk
- `learn_from_feedback` - **Teach the AI** - correct misclassifications to improve accuracy
- `get_ai_training_data` - Export current training data and folder rules

### AI Analysis Tools
- `analyze_email` - Extract insights, sentiment, entities from email content
- `categorize_emails` - Auto-label emails (urgent, work, personal, newsletters, etc.)
- `generate_draft_reply` - Create AI draft responses with customizable tone

## Thunderbird Extension

The server communicates with Thunderbird through a companion extension located in `extension/`. The extension handles the actual browser API calls and communicates with the MCP server via native messaging.

**Note**: The extension communication is currently a placeholder. Implementation needed for full functionality.

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete architecture documentation with component interaction flow
- **[INSTALLATION.md](INSTALLATION.md)** - Installation guide, usage examples, troubleshooting, development workflow

## Architecture Notes

- **MCP Protocol**: Uses FastMCP framework for tool definitions
- **Type Safety**: Full TypeScript support with custom type definitions
- **Module System**: ESM modules with ES2022 target
- **Communication**: HTTP polling bridge to Thunderbird extension on port **8642**
- **OpenCode**: Integrated as local MCP server for AI-assisted development
- **Components**: MCP server and Thunderbird extension work together (see ARCHITECTURE.md)

## Development

Run tests:
```bash
bun test
```

Build TypeScript:
```bash
bun run build
```

## Status

✅ Core MCP server implementation
✅ 22 tools defined (email, calendar, contact, automation, AI sorting, AI analysis)
✅ TypeScript type definitions
✅ All tests passing
✅ HTTP polling bridge to Thunderbird extension implemented (port 8642)
✅ AI-powered email sorting with rule-based classification
✅ Learning from user feedback
✅ Extension simulator for testing without Thunderbird
✅ Complete architecture documentation
⏳ Real Thunderbird extension needs to be installed for full functionality

## Quick Start (Development)

**Option 1: Using Extension Simulator**
```bash
# Terminal 1: Start MCP server
bun run src/index.ts

# Terminal 2: Start extension simulator
bun run scripts/simulate-extension.ts

# Terminal 3: Test
bun run scripts/test-full-flow.ts
```

**Option 2: Using Real Thunderbird Extension**
1. Install extension in Thunderbird (see [INSTALLATION.md](INSTALLATION.md))
2. Start MCP server: `bun run src/index.ts`
3. Use MCP tools via OpenCode or other MCP clients

### AI-Powered Email Sorting Features

The server now includes intelligent email sorting capabilities:

1. **Rule-Based Classification** - Keywords, sender domains, and patterns
2. **Folder Suggestion** - `classify_email` suggests target folders with confidence scores
3. **Bulk Sorting** - `auto_sort_inbox` can process entire inbox in preview or execute mode
4. **Learning** - `learn_from_feedback` improves classifications over time
5. **Privacy-First** - All classification happens locally, no external API calls

Example usage:
```
# Preview sorting suggestions
auto_sort_inbox(dryRun: true)

# Execute sorting with 70% confidence threshold
auto_sort_inbox(executeMode: true, minConfidence: 0.7)

# Correct a misclassification
learn_from_feedback(emailId: "123", correctFolder: "Finanzen")
```

## Communication Architecture

The thunderbird-mcp server communicates with Thunderbird via an HTTP polling bridge:

### Architecture Diagram

```
OpenCode/AI Client
    ↓ (MCP Protocol)
MCP Server (src/index.ts)
     ↓ (HTTP Server: localhost:8642)
     ├─ GET /api/messages         ← Extension polls here
     ├─ POST /api/messages/{id}   ← Extension sends responses here
     └─ POST /api/extension-status ─ Extension announces connection
    ↓ (HTTP Polling)
Thunderbird Extension (extension/background.js)
    ↓ (Thunderbird WebExtension API)
Thunderbird Email Client
```

### Communication Flow (Implemented)

1. **MCP Server Startup**
   - Starts MCP protocol server (stdio/stderr)
    - Starts HTTP server on localhost:8642
    - Waits for extension to connect

2. **Extension Startup**
   - Loads in Thunderbird
   - Polls `/api/messages` every 2 seconds
   - POSTs to `/api/extension-status` to announce connection

3. **MCP Tool Execution**
   - OpenCode calls tool (e.g., "fetch_emails")
   - MCP server creates message with unique ID
   - Message added to queue
   - Promise waits for response (5s timeout)
   - Extension picks up message on next poll
   - Extension calls Thunderbird API
   - Extension POSTs response to `/api/messages/{id}`
   - Promise resolves
   - Response returned to OpenCode

4. **Fallback Behavior**
   - If Thunderbird not connected, returns mock responses
   - Allows testing without Thunderbird installed

### Installation

To enable actual Thunderbird integration:

1. **Install the extension in Thunderbird**:
   ```bash
   # Load the .xpi file temporarily for development
   thunderbird <path-to-thunderbird-mcp-server>/extension/
   ```

2. **Verify connection**:
    - Server logs should show "Extension status: CONNECTED"
    - Check health endpoint: `curl http://localhost:8642/health`

### Configuration

Environment variables:
- `ENABLE_HTTP_SERVER=false` - Start MCP server without HTTP bridge (useful for testing)
- `MCP_SERVER_PORT=8642` - Override default MCP server port (must match extension)
- Default: HTTP bridge is enabled on port 8642
