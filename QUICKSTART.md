# Quick Start - Thunderbird MCP with OpenCode

## Prerequisites

- ✅ Bun installed (`bun --version`)
- ✅ OpenCode installed and configured
- ✅ Project cloned to `C:/Users/Tobias/git/thunderbird-mcp/`

## Setup (Already Done)

The configuration has been completed:
- ✅ Added to `~/.config/opencode/opencode.json`
- ✅ Path verified: `C:/Users/Tobias/git/thunderbird-mcp/thunderbird-mcp-server/src/index.ts`
- ✅ Dependencies installed
- ✅ All tests passing

## Start Using

1. **Restart OpenCode**
   - This loads the new thunderbird-mcp server

2. **Open MCP Tools Panel**
   - Find the MCP tools section in OpenCode sidebar
   - Look for "thunderbird-mcp" in the server list

3. **Start Asking Questions**
   Try these queries:
   ```
   "Show me my recent emails"
   > Uses: fetch_emails

   "Create a calendar event for team meeting tomorrow"
   > Uses: create_event

   "Find contacts with 'alex' in the name"
   > Uses: fetch_contacts

   "Delete these unread emails from spam folder"
   > Uses: batch_delete_emails
   ```

## Available Tools

### Email Management (5 tools)
- `fetch_emails` - Get emails from accounts/folders
- `send_email` - Compose and send email
- `delete_email` - Remove single email
- `batch_delete_emails` - Remove multiple emails
- `batch_archive_emails` - Archive multiple emails

### Calendar Management (3 tools)
- `fetch_events` - Get calendar events
- `create_event` - Add new event
- `delete_event` - Remove event

### Contact Management (3 tools)
- `fetch_contacts` - Get contacts
- `create_contact` - Add new contact
- `delete_contact` - Remove contact

### Automation (3 tools)
- `list_automation_rules` - Show email automation rules
- `upsert_automation_rule` - Create/update rule
- `delete_automation_rule` - Remove rule

## Troubleshooting

### Thunderbird-mcp not showing in OpenCode?

1. Restart OpenCode completely
2. Check OpenCode settings → MCP servers
3. Verify thunderbird-mcp is enabled
4. Check OpenCode logs for errors

### Server gives connection errors?

The server will show a warning "could not infer client capabilities" on startup - this is normal. It connects when prompted.

### Tools not working with actual Thunderbird?

This is expected - the Thunderbird extension communication layer is not yet implemented. The MCP tools currently return simulated responses.

## Next Steps

For detailed information:
- 📖 [README.md](./README.md) - Full documentation
- 🔧 [OPENCODE_INTEGRATION.md](./OPENCODE_INTEGRATION.md) - Integration guide
- 📋 [REFACTORING.md](./REFACTORING.md) - Recent changes

## What Works Now

✅ OpenCode integration
✅ All 14 MCP tools defined
✅ Tool parameter validation
✅ Error handling
✅ Type safety

## What Needs Implementation

⏳ Thunderbird extension communication
⏳ Actual email/calendar/contact operations
⏳ User authentication
⏳ Real-time updates

## Resources

- [OpenCode Documentation](https://opencode.ai)
- [FastMCP Framework](https://github.com/modelcontextprotocol/typescript-sdk)
- [Thunderbird MailExtension API](https://webextension-api.thunderbird.net/)