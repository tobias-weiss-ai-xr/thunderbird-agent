// README-IMPLEMENTATION.md
# Thunderbird MCP - Implementation Guide

This document explains what has been implemented and what's needed to make it work with actual Thunderbird.

## Implementation Status

### ✅ Completed Components

1. **MCP Server** (`src/index.ts`)
   - 14 MCP tools defined and working
   - HTTP polling bridge implemented
   - Mock responses when Thunderbird not connected
   - All tests passing

2. **Thunderbird Extension** (`extension/`)
   - Background script with all 14 tool handlers
   - HTTP polling to MCP server every 2 seconds
   - Connection status reporting
   - Error handling and fallbacks

3. **Type Definitions** (`src/types/thunderbird.d.ts`)
   - Complete Thunderbird WebExtension API types
   - Fixed TypeScript compilation errors

4. **Rules Engine** (`src/utils/rulesEngine.ts`)
   - File persistence implemented
   - Operations persist to `automationRules.json`

### ⏳ Last Steps to Make It Work

#### 1. Build and Install the Extension

The extension files are in `extension/`. To install in Thunderbird:

**Option A: Load Temporarily (for development)**
```
1. Open Thunderbird
2. Go to Add-ons Manager (Ctrl+Shift+A)
3. Click the gear icon → "Install Add-on From File..."
4. Navigate to thunderbird-mcp-server/extension/
5. Select the folder (or build an .xpi first)
```

**Option B: Build .xpi first**
```bash
cd extension
# Create a zip with extension files
zip -r thunderbird-mcp-bridge.xpi * manifest.json
# Then install in Thunderbird
```

#### 2. Start the MCP Server

```bash
cd /path/to/thunderbird-mcp-server
bun run src/index.ts
```

You should see:
```
[MCP Server] HTTP API listening on http://localhost:3476
[FastMCP warning] could not infer client capabilities... (normal)
[Extension] Successfully connected to MCP server
```

#### 3. Verify Connection

Check the health endpoint:
```bash
curl http://localhost:3476/health
```

Expected response (should show `thunderbirdConnected: true`):
```json
{
  "status": "ok",
  "thunderbirdConnected": true,
  "pendingMessages": 0,
  "timestamp": 1771449086224
}
```

#### 4. Use with OpenCode

1. Ensure OpenCode is configured (see `OPENCODE_INTEGRATION.md`)
2. Restart OpenCode
3. Ask questions like "Show me my emails"
4. The MCP server will communicate with Thunderbird via the extension

## Testing Without Thunderbird

The system automatically falls back to mock responses when Thunderbird is not connected. This allows:
- Testing the MCP tools
- Validating the API interface
- Development without needing Thunderbird installed

To test mock mode:
1. Start the MCP server
2. Don't install the extension
3. All tools will return simulated responses

## Troubleshooting

### Extension Not Connecting

1. Check Thunderbird Web Console for errors:
   - Open Thunderbird
   - Tools → Developer Tools → Error Console

2. Verify HTTP server is running:
   ```bash
   curl http://localhost:3476/health
   ```

3. Check if port 3476 is free:
   ```bash
   # Windows
   netstat -ano | findstr :3476

   # Linux/Mac
   lsof -i :3476
   ```

### Tools Return Mock Responses

- Expected behavior when extension not installed
- Check extension is loaded in Thunderbird Add-ons Manager
- Verify connection status with `/health` endpoint

### Tests Fail Due to Port in Use

Run tests with HTTP server disabled:
```bash
ENABLE_HTTP_SERVER=false bun test
```

## Architecture Details

### HTTP Polling Mechanism

**Why HTTP Polling?**
- No system-level configuration
- Works cross-platform
- Easy to debug
- Testable without Thunderbird

**Polling Flow:**
```
Every 2 seconds:
Extension → GET /api/messages → MCP Server returns queued messages

When MCP tool called:
MCP Server → Queue message (with unique ID) → Wait for response
Extension → Polls → Picks up message → Processes → POST /api/messages/{id}
MCP Server → Receives response → Resolves promise → Returns to OpenCode
```

**Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health and connection status |
| `/api/messages` | GET | Poll for pending messages |
| `/api/messages/{id}` | POST | Send response to a message |
| `/api/extension-status` | POST | Extension announces connection |

### Future Enhancements

1. **Native Messaging** (more secure, lower latency)
   - Add native messaging host to system
   - Extension uses `browser.runtime.sendNativeMessage`
   - MCP server communicates via stdin/stdout

2. **WebSocket** (lower than polling)
   - Keep-alive connection
   - Instant message delivery
   - Automatic reconnection

3. **Encryption** (for HTTP polling)
   - TLS certificate for secure communication
   - Authentication tokens

## Developer Notes

### Adding New Tools

1. Add tool to `src/index.ts` using `server.addTool()`
2. Add handler to `extension/background.js`
3. Add handler to `getHandlerForAction()` map
4. Update TypeScript types if needed
5. Add tests

### Message Format

Messages sent from MCP server to extension:
```json
{
  "action": "fetchEmails",
  "accountId": "optional-account-id",
  "folderId": "optional-folder-id",
  "limit": 100
}
```

Responses from extension to MCP server:
```json
{
  "success": true,
  "emails": [...],
  "error": "error message if success is false"
}
```

## License

This project is part of the thunderbird-mcp implementation.