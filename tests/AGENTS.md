# AGENTS.md

## OVERVIEW
Test suite for Thunderbird MCP server using Bun test framework with globalThis.browser mocking and integration testing via HTTP bridge.

## STRUCTURE
```
thunderbird-mcp-server/tests/
├── calendarService.test.ts    # Calendar service unit tests
├── contactService.test.ts    # Contact service unit tests  
├── emailService.test.ts      # Email service unit tests
├── integration.test.ts         # HTTP bridge integration tests
├── mcpServer.test.ts          # MCP server functionality tests
└── server.test.ts             # HTTP server tests
```

## WHERE TO LOOK

| Test Type | Focus | Key Patterns |
|-----------|--------|-------------|
| Unit Tests | Service modules | `globalThis.browser` mocking with jest.fn(), beforeEach setup |
| Integration | HTTP bridge | Server polling, extension simulation, real HTTP requests |
| MCP Tests | Protocol validation | FastMCP tool registration, message handling |

## CONVENTIONS

**Test Framework:** Bun's built-in `@bun:test` with Jest-compatible API (describe, test, expect, beforeEach, afterEach).

**Mocking Pattern:** `globalThis.browser` objects mocked in beforeEach with jest.fn().mockResolvedValue() for API responses.

**Integration Testing:** Real HTTP requests to `localhost:3476` with server startup/shutdown coordination and extension simulation.

**Environment Control:** `ENABLE_HTTP_SERVER=false` for unit tests (isolated), true for integration tests (full stack).

## ANTI-PATTERNS

**Never** test real Thunderbird APIs directly - always use mocked `globalThis.browser` objects.
**Never** assume server is running - integration tests verify startup, unit tests assume mock environment.
**Never** mix async/await patterns inconsistently - Bun test framework expects proper promise handling.
**Avoid** direct file I/O in tests - prefer HTTP endpoints and in-memory mocks for faster execution.