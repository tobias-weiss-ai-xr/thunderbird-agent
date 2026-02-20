# thunderbird-mcp-server/src/modules/

## OVERVIEW
Business logic services for Thunderbird email, calendar, and contact operations via browser API bridge.

## STRUCTURE
```
modules/
├── emailService.ts    # Email management with automation rules
├── calendarService.ts # Calendar event operations  
└── contactService.ts  # Contact CRUD operations
```

## WHERE TO LOOK
| Module | Purpose | Key Functions |
|--------|---------|---------------|
| emailService | Email CRUD + automation | fetchEmails(), sendEmail(), deleteEmail(), batchDeleteEmails(), batchArchiveEmails() |
| calendarService | Calendar management | fetchEvents(), createEvent(), deleteEvent() |
| contactService | Contact operations | fetchContacts(), createContact(), deleteContact() |

## CONVENTIONS
- All functions are async with try/catch error handling
- Use browser.* APIs (Thunderbird WebExtension context only)
- Return structured objects: `{ success: boolean, message?: string, data?: any }`
- Import rulesEngine for email automation
- Console.error for logging, throw Error for failures

## ANTI-PATTERNS
**NEVER** call browser APIs directly from MCP server - requires HTTP bridge via communicateWithThunderbird()
**NEVER** assume Thunderbird connection exists - always check thunderbirdConnected flag
**ALWAYS** use 5-second HTTP timeout for extension communication
**AVOID** direct module imports in production - use MCP tool layer instead