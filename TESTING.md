# Testing Guide

## Quick Test (Unit Tests)

Unit tests don't require MCP server or extension to run:

```bash
bun test tests/emailService.test.ts
bun test tests/calendarService.test.ts
bun test tests/contactService.test.ts
bun test tests/mcpServer.test.ts
```

Or run all unit tests:
```bash
bun test
```

## Integration Tests (End-to-End)

Integration tests require both MCP server AND Thunderbird extension to be running.

### Option 1: Manual Setup (Recommended)

**Terminal 1 - Start MCP Server:**
```bash
ENABLE_HTTP_SERVER=true bun run src/index.ts
```

You should see:
```
[MCP Server] HTTP API listening on http://localhost:8642
```

**Terminal 2 - Start Extension Simulator:**
```bash
bun run scripts/simulate-extension.ts
```

You should see:
```
✓ Announced connection to MCP server
Starting message polling...
```

**Terminal 3 - Run Integration Tests:**
```bash
ENABLE_HTTP_SERVER=true bun test tests/integration.test.ts
```

All 9 tests should pass:
```
 9 pass
  0 fail
  Ran 9 tests across 1 file.
```

### Option 2: Quick Start Script

The `scripts/test-full-flow.ts` script does a quick verification:

```bash
bun run scripts/test-full-flow.ts
```

This checks:
- MCP server health
- Extension connection status
- HTTP bridge endpoints

## All Tests Together

Run complete test suite (unit + integration):

```bash
# Note: Integration tests require manual setup (see above)
bun test tests/emailService.test.ts
bun test tests/calendarService.test.ts
bun test tests/contactService.test.ts
bun test tests/mcpServer.test.ts
```

## Test Results Reference

### Unit Tests (No Server Required)
```
✅ tests/emailService.test.ts     - 6 pass
✅ tests/calendarService.test.ts  - 3 pass
✅ tests/contactService.test.ts     - 4 pass
✅ tests/mcpServer.test.ts         - 5 pass
---
Total: 18/18 pass (100%)
```

### Integration Tests (Require Server Running)
```
✅ Health endpoint                  - PASS
✅ GET /api/messages              - PASS
✅ Extension status announcement    - PASS
✅ Message processing              - PASS
✅ Health after connection          - PASS
✅ Extension polling cycle         - PASS
✅ Multiple poll cycles           - PASS
✅ Invalid endpoints (404)          - PASS
✅ Invalid JSON error (400)        - PASS
---
Total: 9/9 pass (100%)
```

## Common Issues

### Port Already in Use

If you see `EADDRINUSE` error:

```bash
# Windows
netstat -ano | findstr :8642
taskkill //PID <PID> //F

# Or use different port
export MCP_SERVER_PORT=8643 ENABLE_HTTP_SERVER=true bun run src/index.ts
```

### Integration Tests Fail

If integration tests fail with "ConnectionRefused":

1. **Check MCP server is running:**
   ```bash
   curl http://localhost:8642/health
   ```

2. **Start extension simulator:**
   ```bash
   bun run scripts/simulate-extension.ts
   ```

3. **Wait 2-3 seconds** for servers to connect, then run tests.

### LSP Errors in Test Files

You may see LSP errors in test files. These are **expected and harmless**:
- Type errors on `globalThis.browser` - This is intentional for mocking
- `Cannot find name 'browser'` - Expected in test files

These errors don't affect test execution.

## Automated Testing CI

For CI/CD pipelines, use unit tests only:

```bash
bun test
```

Integration tests should be run separately with proper server setup.
