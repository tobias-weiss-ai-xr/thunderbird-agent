# AGENTS.md

## OVERVIEW
Thunderbird MCP server providing email, calendar, contact, automation, and AI features (analysis, categorization, draft generation) through FastMCP framework with HTTP polling bridge to native Thunderbird extension.

## STRUCTURE
```
thunderbird-mcp-server/src/
├── modules/              # Business logic services for Thunderbird APIs
│   ├── emailService.ts  # Email operations (fetch, send, delete, batch)
│   ├── calendarService.ts  # Calendar event management
│   └── contactService.ts  # Contact CRUD operations
├── routes/              # Legacy HTTP API routes (deprecated)
├── utils/               # Shared utilities and helpers
├── types/               # TypeScript type definitions
└── index.ts             # Main FastMCP server implementation
```

## WHERE TO LOOK
 
| Module | Purpose | Key Functions |
|--------|---------|---------------|
| index.ts | FastMCP server & HTTP bridge | communicateWithThunderbird, startHTTPServer, getMockResponse |
| emailService.ts | Email management | fetchEmails, sendEmail, deleteEmail, batch operations |
| calendarService.ts | Calendar management | fetchEvents, createEvent, deleteEvent |
| contactService.ts | Contact management | fetchContacts, createContact, deleteContact |
| utils/rulesEngine.ts | Automation logic | applyRules, upsertRule, deleteRule |

### AI-Powered Tools (index.ts)
| Tool | Purpose | Parameters |
|------|---------|------------|
| analyze_email | Extract insights, sentiment, entities | emailId, options (includeSentiment, extractEntities, generateSummary) |
| categorize_emails | Auto-label emails | emailIds, categories (optional) |
| generate_draft_reply | Create AI draft responses | emailId, tone, includeQuotes, instructions |

## CONVENTIONS

**Communication Pattern:** All MCP tools route through `communicateWithThunderbird()` which handles HTTP polling to Thunderbird extension with 5-second timeout and automatic fallback to mock responses.

**Error Handling:** Consistent try/catch wrapper returning `{ success: boolean, error?: string }` format across all tools.

**Modular Design:** Business logic separated into service modules using Thunderbird WebExtension APIs (`browser.*`), though MCP server uses HTTP bridge for actual communication.

**Environment:** Bun runtime with TypeScript strict mode. HTTP server toggled via `ENABLE_HTTP_SERVER` environment variable for testing.

## ANTI-PATTERNS

**Never** call browser APIs directly from MCP server context - use `communicateWithThunderbird()` instead.
**Never** assume Thunderbird connection status - always handle both connected and disconnected states.
**Always** use 5-second timeouts for HTTP requests with proper Promise cleanup.
**Avoid** direct imports of service modules from MCP tools - they're reference implementations for extension context only.
