# thunderbird-mcp-server/src/

## OVERVIEW
Core MCP server implementation (733 lines) with FastMCP tools, HTTP bridge to Thunderbird extension, modular service layer, and AI-powered email analysis, categorization, and draft generation.

## STRUCTURE
```
src/
├── index.ts              # Main FastMCP server + HTTP bridge (733 lines)
├── modules/             # Business logic services (email, calendar, contact)
├── routes/              # Legacy HTTP API routes (deprecated, unused)
├── utils/               # Shared utilities
│   ├── errors.ts        # Error types and handlers
│   ├── logger.ts        # Logging utility for HTTP bridge
│   ├── rulesEngine.ts   # Automation rule evaluation
│   └── aiService.ts     # AI service (rule-based + web API integration)
└── types/               # TypeScript type definitions
```

## WHERE TO LOOK

| File | Purpose | Key Functions |
|------|---------|---------------|
| index.ts | MCP server + HTTP bridge | communicateWithThunderbird, startHTTPServer, sendToThunderbirdHTTP |
| modules/emailService.ts | Email operations | fetchEmails, sendEmail, deleteEmail, batch operations |
| modules/calendarService.ts | Calendar management | fetchEvents, createEvent, deleteEvent |
| modules/contactService.ts | Contact operations | fetchContacts, createContact, deleteContact |
| utils/errors.ts | Error types | ThunderbirdError, extension error factories |
| utils/logger.ts | Logging utility | logMessage for HTTP bridge debugging |
| utils/rulesEngine.ts | Automation rules | applyRules, upsertRule, deleteRule |
| utils/aiService.ts | AI features | analyzeEmail, categorizeEmail, generateDraftReply |
| types/thunderbird.d.ts | TypeScript types | Thunderbird API interfaces |

## CONVENTIONS

**Communication:** All MCP tools use `communicateWithThunderbird()` dispatcher which queues messages via HTTP bridge and handles 5-second timeout + fallback to mock responses.

**AI Integration:** Email analysis, categorization, and draft generation use `utils/aiService.ts` with pluggable backends (rule-based default, extensible to web APIs).

**HTTP Bridge (index.ts:644-720):** Runs on port 3476, handles /api/messages polling, POST responses, extension status announcements.

**Mocking:** `getMockResponse()` (line 775) returns sample data when `thunderbirdConnected` is false - enables testing without Thunderbird.

**Module Services:** Functions in modules/ use `browser.*` APIs - these FAIL if called directly from MCP server. They're reference implementations for HTTP bridge integration.

**Error Handling:** All MCP tool handlers use try/catch returning `{ success: boolean, error?: string }`.

**AI Configuration:** Environment-driven via `.env.example`: AI_PROVIDER, AI_API_KEY, AI_MODEL, AI_ENDPOINT. Default: rule-based (free, no dependencies).

## ANTI-PATTERNS

**NEVER** call browser APIs directly from MCP server - use `communicateWithThunderbird()` which handles HTTP bridge.

**NEVER** assume Thunderbird is connected - always handle both connected and disconnected states via `thunderbirdConnected` flag.

**NEVER** import service modules directly in MCP tools - they require Thunderbird extension context.

**ALWAYS** use 5-second timeout for HTTP requests (implemented in `sendToThunderbirdHTTP`).

**DEPRECATED** routes in `routes/` directory - legacy HTTP API, use MCP tools instead.
