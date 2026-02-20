# Mocking External Dependencies in Tests

## Learnings from mcpServer.test.ts HTTP Server Mock Implementation

### Problem
When importing a module that starts an HTTP server during tests, `EADDRINUSE` errors occur because the server tries to bind to a port already in use.

### Solution Pattern
Use Jest's module mocking to intercept the external dependency before module import:

```typescript
// 1. Create mock function
const mockServe = jest.fn();

// 2. Mock the module at the top level
jest.mock('bun', () => {
  const originalBun = jest.requireActual('bun') as any;
  return {
    ...originalBun,
    serve: mockServe
  };
});

// 3. Optional: Control environment
const originalEnv = process.env.ENABLE_HTTP_SERVER;
process.env.ENABLE_HTTP_SERVER = 'false';

// 4. Import the module (will use mocked serve)
const serverModule = await import('../src/index');

// 5. Clean up
process.env.ENABLE_HTTP_SERVER = originalEnv;
jest.resetAllMocks();
```

### Key Principles
1. **Mock before import**: Module mocking must happen before `import()` call
2. **Preserve original behavior**: Use `jest.requireActual()` to keep other exports intact
3. **Type assertions**: Use `as any` for complex type compatibility in test context
4. **Environment control**: Combine mocking with env vars for dual-layer protection
5. **Cleanup**: Always reset mocks to prevent test pollution

### Why This Works
- Jest replaces module exports at runtime before the import happens
- The imported module receives the mocked `serve` function instead of the real one
- HTTP server initialization is prevented while all other functionality remains intact
- MCP server can still initialize correctly without starting the HTTP bridge

### When to Use This Pattern
- Modules that start background services on import
- File system operations in module initialization  
- Network connections during module loading
- Database connections in constructor functions

### Alternative Considered
- Using global overrides (less reliable)
- Simply catching and ignoring errors (hides real issues)
- Disabling the test (loses test coverage)
- Changing production code (violates test isolation)

This approach provides proper test isolation while maintaining full test coverage.