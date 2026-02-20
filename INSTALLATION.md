# Thunderbird MCP Extension - Installation & Usage

## Quick Start

### Option 1: Using Simulator (Development)

**Terminal 1 - Start MCP Server:**
```bash
cd C:\Users\Tobias\git\thunderbird-agent
bun run src/index.ts
```

**Terminal 2 - Start Extension Simulator:**
```bash
cd C:\Users\Tobias\git\thunderbird-agent
bun run scripts/simulate-extension.ts
```

**Terminal 3 - Test the Connection:**
```bash
cd C:\Users\Tobias\git\thunderbird-agent
bun run scripts/test-full-flow.ts
```

✅ **Result:** Full MCP bridge working without needing Thunderbird installed!

### Option 2: Using Real Thunderbird Extension

#### Step 1: Install Extension in Thunderbird

1. **Open Thunderbird**
2. **Menu** → **Tools** → **Add-ons and Themes**
3. **Extensions** → **"Extensions for Developers"** (gear icon)
4. **"Load Temporary Add-on..."**
5. **Navigate to**: `C:\Users\Tobias\git\thunderbird-agent\extension\`
6. **Select the folder** (not individual files)
7. **Click "Select Folder"**
8. **Confirm** installation

#### Step 2: Verify Extension Loaded

Check Thunderbird **Browser Console**:
1. **Menu** → **Tools** → **Developer Tools** → **Error Console**
2. Look for: `Thunderbird MCP Bridge extension loaded`

#### Step 3: Start MCP Server

```bash
cd C:\Users\Tobias\git\thunderbird-agent
bun run src/index.ts
```

You should see:
```
[MCP Server] HTTP API listening on http://localhost:8642
[Extension] Successfully connected to MCP server
[MCP Server] Extension status: CONNECTED
```

#### Step 4: Verify Connection

**Check MCP Server Health:**
```bash
curl http://localhost:8642/health
```

Expected response:
```json
{
  "status": "ok",
  "thunderbirdConnected": true,
  "pendingMessages": 0,
  "timestamp": 17389234567
}
```

**Check Thunderbird Console:**
Look for: `[Extension] Successfully connected to MCP server`

## Usage with OpenCode

Once extension is installed and MCP server is running:

### Configure OpenCode

Add to `~/.config/opencode/opencode.json`:

```json
{
  "thunderbird-mcp": {
    "command": [
      "bun",
      "run",
      "C:/Users/Tobias/git/thunderbird-mcp/thunderbird-mcp-server/src/index.ts"
    ],
    "enabled": true,
    "type": "local"
  }
}
```

### Available Tools

#### Email Operations
```typescript
// Fetch all emails
const emails = await fetch_emails();

// Fetch from specific account/folder
const emails = await fetch_emails({
  accountId: 'account123',
  folderId: 'inbox'
});

// Send email
await send_email({
  to: 'recipient@example.com',
  subject: 'Hello',
  body: 'This is a test email'
});

// Delete email
await delete_email({ emailId: 'email-123' });

// Move email to folder
await move_email({
  emailId: 'email-123',
  targetFolder: 'Archive'
});

// Batch operations
await batch_delete_emails({ emailIds: ['email-1', 'email-2'] });
await batch_archive_emails({ emailIds: ['email-1', 'email-2'] });
```

#### Calendar Operations
```typescript
// Fetch events
const events = await fetch_events({
  calendarId: 'calendar-123',
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});

// Create event
await create_event({
  title: 'Team Meeting',
  start: '2024-01-15T10:00:00',
  end: '2024-01-15T11:00:00',
  location: 'Conference Room A'
});

// Delete event
await delete_event({ eventId: 'event-123' });
```

#### Contact Operations
```typescript
// Fetch contacts
const contacts = await fetch_contacts({
  addressBookId: 'addressbook-123',
  search: 'John'
});

// Create contact
await create_contact({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '555-123-4567',
  addressBookId: 'addressbook-123'
});

// Delete contact
await delete_contact({ contactId: 'contact-123' });
```

#### AI-Powered Email Sorting
```typescript
// Classify single email
const classification = await classify_email({ emailId: 'email-123' });
// Returns: { folder: 'Work', confidence: 0.85 }

// Auto-sort inbox
await auto_sort_inbox({
  executeMode: false,  // Preview only
  minConfidence: 0.7    // Only if 70%+ confident
});

// Learn from mistake
await learn_from_feedback({
  emailId: 'email-123',
  correctFolder: 'Personal'  // It was misclassified as Work
});

// Get training data
const data = await get_ai_training_data();
```

#### Automation Rules
```typescript
// List all rules
const rules = await list_automation_rules();

// Create/update rule
await upsert_automation_rule({
  name: 'Urgent Emails',
  conditions: {
    subjectContains: ['urgent', 'asap'],
    senderDomains: ['boss@company.com']
  },
  actions: {
    moveToFolder: 'Urgent',
    markAsRead: true
  }
});

// Delete rule
await delete_automation_rule({ ruleId: 'rule-123' });
```

## Troubleshooting

### Extension Not Connecting

**Symptom:** `thunderbirdConnected: false` in health check

**Solutions:**

1. **Check Thunderbird Console** (Tools → Developer Tools → Error Console)
   - Look for errors on startup
   - Check for: `Thunderbird MCP Bridge extension loaded`

2. **Verify Port** - Must be 8642 in both files:
   - `src/index.ts` line 18: `const MCP_SERVER_PORT = 8642;`
   - `extension/background.js` line 7: `const MCP_SERVER_URL = 'http://localhost:8642';`

3. **Restart Thunderbird** after changing extension code

4. **Check MCP Server Logs:**
   - Should see: `[MCP Server] Extension status: CONNECTED`

5. **Test HTTP Bridge:**
   ```bash
   curl http://localhost:8642/health
   ```

### Messages Not Processing

**Symptom:** Tools called but no response

**Solutions:**

1. **Check Extension is Polling:**
   - Thunderbird Console should show polling logs
   - Look for: `Processing message: msg-...`

2. **Verify Message Queue:**
   ```bash
   curl http://localhost:8642/health
   # Check "pendingMessages" count
   ```

3. **Check Handler Exists:**
   - Extension has `getHandlerForAction()` function
   - Should map all actions from MCP server

### Port Already in Use

**Symptom:** `EADDRINUSE` error when starting MCP server

**Solutions:**

**Windows:**
```bash
# Find process using port
netstat -ano | findstr :8642

# Kill the process (replace <PID> with actual PID)
taskkill /PID <PID> /F
```

**Or Change Port:**
1. Update `src/index.ts` line 18: `const MCP_SERVER_PORT = 8643;`
2. Update `extension/background.js` line 7: `const MCP_SERVER_URL = 'http://localhost:8643';`
3. Restart both

### Extension Permissions Issues

**Symptom:** Extension installed but doesn't work

**Solutions:**

1. **Check `manifest.json` permissions:**
   ```json
   "permissions": [
     "accountsRead",
     "messagesRead",
     "messagesWrite",
     "accountsFolders",
     "addressBooks",
     "contactsRead",
     "contactsWrite",
     "storage",
     "nativeMessaging"
   ]
   ```

2. **Reinstall Extension:**
   - Remove extension from Thunderbird
   - Close Thunderbird
   - Open Thunderbird
   - Reinstall extension from `extension/` directory

3. **Check Thunderbird Version:**
   - Minimum: Thunderbird 78.0 (see manifest.json)

## Development Workflow

### Quick Development Loop

```bash
# Terminal 1: MCP Server (auto-reloads on changes)
bun --watch run src/index.ts

# Terminal 2: Extension Simulator (for testing)
bun run scripts/simulate-extension.ts

# Terminal 3: Run tests
bun test
```

### Running Tests

```bash
# Unit tests (mock Thunderbird API)
bun test tests/emailService.test.ts
bun test tests/calendarService.test.ts
bun test tests/contactService.test.ts

# Integration tests (require real HTTP bridge)
ENABLE_HTTP_SERVER=true bun test tests/integration.test.ts

# All tests
bun test
```

### Testing Changes

1. **Make code changes**
2. **Stop MCP Server** (Ctrl+C in terminal)
3. **Restart MCP Server:** `bun run src/index.ts`
4. **Reload Extension:**
   - If using simulator: stop and restart
   - If real Thunderbird: restart Thunderbird

### Debugging

**Enable Debug Logging:**
```bash
# Set environment variable
MCP_DEBUG=true bun run src/index.ts
```

**View Extension Logs:**
- Thunderbird: Tools → Developer Tools → Error Console
- MCP Server: Look at terminal output

**Trace HTTP Traffic:**
```bash
# Use curl to manually test endpoints
curl http://localhost:8642/health
curl http://localhost:8642/api/messages
```

## Production Deployment

### Building Extension Package

```bash
# Create .xpi file (Thunderbird extension package)
cd extension
zip -r ../thunderbird-mcp-bridge.xpi *
cd ..
```

### Distributing Extension

1. **AMO (Add-ons.mozilla.org):**
   - Create developer account
   - Upload `.xpi` file
   - Set up automatic updates

2. **Manual Installation:**
   - Share `.xpi` file
   - Users install via: Thunderbird → Extensions → Gear → "Install Add-on From File..."

### MCP Server Deployment

1. **Bundle as executable:**
   ```bash
   bun build
   ```

2. **Run as system service:**
   - Windows: Create Windows Service
   - Linux: Create systemd service
   - macOS: Create launch daemon

3. **Configure to auto-start:**
   - Starts on boot
   - Logs to file
   - Auto-restart on crash

## Security Notes

### Local-Only Deployment

- HTTP bridge (`localhost:8642`) is not exposed to network
- No authentication required for local use
- Extension communicates only with local MCP server

### For Remote Deployment

1. **Add Authentication:**
   - API key in MCP server
   - Token in extension headers

2. **Use HTTPS:**
   - Configure MCP server with SSL certificate
   - Update `MCP_SERVER_URL` in extension

3. **Firewall:**
   - Block external access to MCP server port
   - Allow only localhost connections

## Performance Tips

### Optimize Polling

- Default: Every 2 seconds (good balance)
- Reduce latency: 1 second (more CPU usage)
- Reduce CPU: 5 seconds (slower response)

**Change in `extension/background.js`:**
```javascript
setInterval(pollForMessages, 1000);  // 1 second
setInterval(pollForMessages, 5000);  // 5 seconds
```

### Batch Operations

- Use `batch_delete_emails` instead of multiple `delete_email` calls
- Use `batch_archive_emails` instead of multiple moves
- Reduces API calls significantly

### Caching

Extension doesn't cache yet, but could add:
```javascript
// Cache emails for 30 seconds
let emailCache: Map<string, any[]> = new Map();
let cacheTime: number = Date.now();

if (Date.now() - cacheTime < 30000) {
  return emailCache.get(folderId);
}
```

## Additional Resources

- **Architecture:** See `ARCHITECTURE.md`
- **MCP Protocol:** See FastMCP documentation
- **Thunderbird API:** https://webextension-api.thunderbird.net/
- **MCP Server Tools:** See `src/index.ts` for all available tools
- **Extension Handlers:** See `extension/background.js` for implementation
