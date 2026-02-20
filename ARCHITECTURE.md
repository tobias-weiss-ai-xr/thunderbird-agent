# Thunderbird MCP Bridge Architecture

## Overview

The thunderbird-mcp project consists of two tightly coupled components that work together:

1. **MCP Server** (`src/index.ts`) - FastMCP server exposing tools for AI assistants
2. **Thunderbird Extension** (`extension/background.js`) - WebExtension that bridges Thunderbird APIs

Both components are **required** for full functionality. They communicate via HTTP polling.

## Component Responsibilities

### MCP Server (src/index.ts)
- **Exposes MCP tools** for email, calendar, contact, and automation operations
- **Starts HTTP bridge** on port 8642
- **Queues messages** for the extension to process
- **Handles MCP protocol** communication with AI clients (OpenCode, etc.)
- **Implements fallback** to mock responses when extension not connected

### Thunderbird Extension (extension/background.js)
- **Installs in Thunderbird** as a WebExtension
- **Polls MCP server** every 2 seconds for pending messages
- **Executes Thunderbird API calls** via `browser.*` namespace
- **Returns results** to MCP server via HTTP POST
- **Announces connection status** to MCP server on startup

## Communication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Client (OpenCode)                  │
└────────────────────┬────────────────────────────────────────┘
                     │ MCP Protocol (stdio)
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│              MCP Server (src/index.ts)                     │
│  - FastMCP protocol                                        │
│  - Exposes 22+ tools                                          │
│  - HTTP bridge on localhost:8642                               │
│  - Message queue + timeout handling                            │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP Polling (every 2s)
                     ├─ GET /api/messages
                     └─ POST /api/messages/{id}
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│          Thunderbird Extension (extension/)               │
│  - background.js runs in Thunderbird                          │
│  - Polls for messages, calls browser APIs                     │
│  - POSTs responses back to MCP server                       │
│  - Announces connection: POST /api/extension-status         │
└────────────────────┬────────────────────────────────────────────┘
                     │ Thunderbird WebExtension API
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│              Thunderbird Email Client                          │
└─────────────────────────────────────────────────────────────────┘
```

## Step-by-Step Flow

### 1. MCP Server Startup
```typescript
// src/index.ts
const server = new FastMCP({ name: 'thunderbird-mcp', version: '1.0.0' });
const MCP_SERVER_PORT = 8642; // HTTP bridge port

// Start HTTP server for extension communication
startHTTPServer(); // Opens http://localhost:8642

// Start MCP protocol server (stdio/stderr for AI client)
server.start();
```

### 2. Extension Startup
```javascript
// extension/background.js
console.log('Thunderbird MCP Bridge extension loaded');

// Notify MCP server that we're connected
notifyExtensionLoaded();

// Start polling every 2 seconds for pending messages
setInterval(pollForMessages, 2000);
```

### 3. AI Client Request (e.g., "fetch_emails")
```typescript
// Called by OpenCode or other MCP client
server.addTool({
  name: 'fetch_emails',
  handler: async (params) => {
    const result = await communicateWithThunderbird({
      action: 'fetchEmails',
      accountId: params.accountId,
      folderId: params.folderId
    });
    return result;
  }
});
```

### 4. MCP Server Queues Message
```typescript
function communicateWithThunderbird(message) {
  const messageId = `msg-${Date.now()}-${Math.random()}`;
  
  // Add to queue for extension to pick up
  messageQueue.set(messageId, message);
  
  // Wait for response with 5-second timeout
  const response = await new Promise((resolve) => {
    pendingRequests.set(messageId, resolve);
    setTimeout(() => {
      pendingRequests.delete(messageId);
      resolve(getMockResponse()); // Fallback if no extension
    }, 5000);
  });
  
  return response;
}
```

### 5. Extension Polls and Processes
```javascript
async function pollForMessages() {
  // Get pending messages from MCP server
  const response = await fetch('http://localhost:8642/api/messages');
  const data = await response.json();
  
  for (const msg of data.messages) {
    // Call appropriate handler
    const handler = getHandlerForAction(msg.message.action);
    const result = await handler(msg.message);
    
    // Send result back to MCP server
    await fetch(`http://localhost:8642/api/messages/${msg.id}`, {
      method: 'POST',
      body: JSON.stringify(result)
    });
  }
}
```

### 6. Handler Executes Thunderbird API
```javascript
async function handleFetchEmails(request) {
  const accounts = await browser.accounts.list();
  const emails = [];
  
  for (const account of accounts) {
    const folders = await browser.folders.list(account.id);
    for (const folder of folders) {
      const messages = await browser.messages.list(folder.id);
      emails.push(...messages.map(m => ({
        id: m.id,
        subject: m.subject,
        from: m.author,
        date: m.date
      })));
    }
  }
  
  return { success: true, emails };
}
```

### 7. Response Returned to AI Client
```typescript
// MCP server receives POST to /api/messages/{id}
// Resolves the pending promise
const resolver = pendingRequests.get(messageId);
resolver(body);

// Tool handler returns to AI client
return {
  success: true,
  emails: [...] // Actual Thunderbird data
};
```

## HTTP Bridge Endpoints

### GET /health
Returns server status:
```json
{
  "status": "ok",
  "thunderbirdConnected": true,
  "pendingMessages": 0,
  "timestamp": 17389234567
}
```

### POST /api/extension-status
Extension announces connection:
```json
{
  "status": "connected",
  "timestamp": 17389234567
}
```

### GET /api/messages
Extension polls for pending messages:
```json
{
  "messages": [
    {
      "id": "msg-123-abc",
      "message": {
        "action": "fetchEmails",
        "accountId": "account1",
        "folderId": "inbox"
      }
    }
  ]
}
```

### POST /api/messages/{id}
Extension sends response:
```json
{
  "success": true,
  "emails": [...]
}
```

## Actions Handled

### Email Operations
- `fetchEmails` - List emails from folders
- `fetchEmail` - Get single email with full content
- `sendEmail` - Send a new email
- `deleteEmail` - Delete a single email
- `batchDeleteEmails` - Delete multiple emails
- `batchArchiveEmails` - Archive multiple emails
- `moveEmail` - Move email to specific folder

### Calendar Operations
- `fetchEvents` - List calendar events
- `createEvent` - Create new event
- `deleteEvent` - Delete event

### Contact Operations
- `fetchContacts` - List contacts
- `createContact` - Create new contact
- `deleteContact` - Delete contact

### AI Sorting Operations (Server-side)
- `classify_email` - AI-powered folder classification
- `auto_sort_inbox` - Bulk email sorting
- `learn_from_feedback` - Improve classifications

### Automation Rules (Server-side)
- `list_automation_rules` - List email rules
- `upsert_automation_rule` - Create/update rule
- `delete_automation_rule` - Delete rule

## Error Handling & Fallbacks

### Extension Not Connected
When Thunderbird extension is not loaded:
```typescript
// communicateWithThunderbird() waits 5 seconds
setTimeout(() => {
  // If no response from extension
  resolve(getMockResponse());
}, 5000);

function getMockResponse() {
  return {
    success: true,
    emails: [
      { id: 'mock-1', subject: 'Mock Email 1', ... }
    ],
    _mock: true // Indicates this is fallback data
  };
}
```

### Extension Error Handling
```javascript
async function handleMessageFromMCP(msg) {
  try {
    const result = await handler(msg.message);
    await fetch(`.../api/messages/${msg.id}`, {
      body: JSON.stringify(result)
    });
  } catch (error) {
    // Send error response
    await fetch(`.../api/messages/${msg.id}`, {
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    });
  }
}
```

## Port Configuration

**Both components must use the same port:**

- MCP Server: `MCP_SERVER_PORT = 8642` (src/index.ts line 18)
- Extension: `MCP_SERVER_URL = 'http://localhost:8642'` (extension/background.js line 7)

If these don't match, communication will fail.

## Installation & Testing

### For Development
1. **Start MCP Server**:
   ```bash
   bun run src/index.ts
   # HTTP bridge starts on http://localhost:8642
   # MCP protocol starts (stdio/stderr)
   ```

2. **Install Extension in Thunderbird**:
   - Open Thunderbird
   - Menu → Tools → Add-ons → Extensions
   - Click "Extensions for Developers"
   - "Load Temporary Add-on..." → Select `extension/` directory
   - Check console: "Thunderbird MCP Bridge extension loaded"

3. **Verify Connection**:
   ```bash
   curl http://localhost:8642/health
   # Should show: "thunderbirdConnected": true
   ```

4. **Run Integration Tests**:
   ```bash
   # Extension must be installed and running
   ENABLE_HTTP_SERVER=true bun test tests/integration.test.ts
   ```

### For Production
1. **Package Extension**:
   - Create `.xpi` file from `extension/` directory
   - Sign with AMO (if distributing publicly)

2. **Install Extension**:
   - Load `.xpi` file in Thunderbird
   - Extension auto-starts and connects to MCP server

3. **Configure OpenCode**:
   ```json
   {
     "thunderbird-mcp": {
       "command": ["bun", "run", "src/index.ts"],
       "enabled": true,
       "type": "local"
     }
   }
   ```

## Key Design Decisions

### Why HTTP Polling Instead of WebSockets?
- **Simpler setup** - No need for WebSocket server in MCP server
- **Extension limitations** - Thunderbird extensions can't easily maintain persistent WebSocket connections
- **Adequate for use case** - 2-second polling is acceptable for email operations

### Why Separate Processes?
- **Security** - Extension runs in Thunderbird sandbox, MCP server in user space
- **Modularity** - Can update MCP server without reinstalling extension
- **Flexibility** - Extension can connect to remote MCP server if needed

### Timeout Strategy
- **5-second timeout** - Balances responsiveness with Thunderbird API latency
- **Fallback to mocks** - Allows testing without Thunderbird installed
- **Connection state tracking** - Avoids queueing messages when extension disconnected

## Troubleshooting

### Extension Not Connecting
1. Check extension console for errors
2. Verify port matches (8642 in both files)
3. Ensure MCP server is running: `curl http://localhost:8642/health`
4. Check browser console: "Successfully connected to MCP server"

### Messages Not Processing
1. Check message queue: look at `pendingMessages` in health endpoint
2. Verify extension is polling: should see requests to `/api/messages` every 2s
3. Check extension handler: is action name in `getHandlerForAction` mapping?

### MCP Tools Not Working
1. Verify extension installed and connected
2. Check MCP server logs for "Extension status: CONNECTED"
3. Test via HTTP bridge directly: `curl http://localhost:8642/api/messages`

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8642

# Kill process if needed
taskkill /PID <pid> /F

# Or change port in both files
```

## Files Reference

| File | Purpose | Key Config |
|------|---------|-------------|
| `src/index.ts` | MCP Server + HTTP bridge | `MCP_SERVER_PORT = 8642` (line 18) |
| `extension/manifest.json` | Extension manifest | Permissions, background script (line 12) |
| `extension/background.js` | Extension logic | `MCP_SERVER_URL = 'http://localhost:8642'` (line 7) |
| `tests/integration.test.ts` | HTTP bridge tests | `MCP_SERVER_URL = 'http://localhost:8642'` (line 9) |

Both components are **required** - neither works independently for full functionality.
