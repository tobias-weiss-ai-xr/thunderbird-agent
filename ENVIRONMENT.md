# Environment Variables Reference

This document describes all environment variables that can be used to configure the thunderbird-mcp MCP server and extension.

## Core MCP Server Variables

### `ENABLE_HTTP_SERVER`

Controls whether the HTTP server for extension communication is started.

- **Values**: `true`, `false`, or unset (defaults to `true`)
- **Default**: `true` (HTTP server enabled)
- **Usage**:
  ```bash
  # Enable HTTP server (default)
  bun run src/index.ts

  # Disable HTTP server (e.g., for testing)
  ENABLE_HTTP_SERVER=false bun run src/index.ts
  ```
- **When to disable**: During unit tests to avoid port conflicts
- **When to enable**: Production use and integration testing

### `MCP_DEBUG`

Enable debug logging for the MCP server.

- **Values**: `true`, `false`
- **Default**: `false` (disabled)
- **Usage**:
  ```bash
  MCP_DEBUG=true bun run src/index.ts
  ```
- **Effect**: Enables detailed logging of all operations

### `MCP_SERVER_PORT`

Port number for the HTTP server.

- **Values**: Any valid port number (1024-65535)
- **Default**: `3476`
- **Usage**:
  ```bash
  MCP_SERVER_PORT=3000 bun run src/index.ts
  ```
- **Note**: Must match the port configured in the extension

## Development Variables

### `DEBUG`

Standard Node.js/Bun debug logging (affects all dependencies).

- **Values**: Debug namespaces separated by commas
- **Default**: unset
- **Examples**:
  ```bash
  # Enable all debug logging
  DEBUG=* bun run src/index.ts

  # Enable only thunderbird-related debug
  DEBUG=thunderbird* bun run src/index.ts

  # Enable fastmcp debug
  DEBUG=fastmcp* bun run src/index.ts
  ```

### `NODE_ENV`

Node.js environment mode.

- **Values**: `development`, `production`, `test`
- **Default**: `development`
- **Usage**:
  ```bash
  NODE_ENV=production bun run src/index.ts
  ```

## Extension Configuration Variables

### `MCP_SERVER_URL`

The URL of the MCP server HTTP API.

- **Default**: `http://localhost:3476`
- **Usage in Extension**: Set in `extension/background.js`
  ```javascript
  const MCP_SERVER_URL = 'http://localhost:3476';
  ```
- **When to change**: If MCP server runs on different host/port

### `EXTENSION_POLL_INTERVAL`

How often the extension polls for messages (milliseconds).

- **Default**: `2000` (2 seconds)
- **Usage in Extension**: Set in `extension/background.js`
  ```javascript
  const POLL_INTERVAL = 2000; // milliseconds
  ```
- **Trade-off**: Lower interval = lower latency but higher CPU usage

## Testing Variables

### `TEST_TIMEOUT`

Timeout for integration tests (milliseconds).

- **Default**: `5000` (5 seconds)
- **Usage**:
  ```bash
  TEST_TIMEOUT=10000 bun test
  ```

## Security Variables (Future)

### `API_KEY`

API key for securing HTTP server (not yet implemented).

- **Planned**: For production deployments
- **Usage**:
  ```bash
  API_KEY=your-secret-key bun run src/index.ts
  ```

### `TLS_CERTIFICATE`

Path to TLS certificate for HTTPS (not yet implemented).

- **Planned**: For secure communication
- **Usage**:
  ```bash
  TLS_CERTIFICATE=/path/to/cert.pem bun run src/index.ts
  ```

### `TLS_PRIVATE_KEY`

Path to TLS private key (not yet implemented).

- **Planned**: For secure communication
- **Usage**:
  ```bash
  TLS_PRIVATE_KEY=/path/to/key.pem bun run src/index.ts
  ```

## Configuration Files

### `.env`

Project root environment file (not currently used, but recommended for local dev).

Example `.env` file:
```env
# MCP Server Configuration
ENABLE_HTTP_SERVER=true
MCP_SERVER_PORT=3476
MCP_DEBUG=true

# Extension Configuration
MCP_SERVER_URL=http://localhost:3476
EXTENSION_POLL_INTERVAL=2000

# Testing
TEST_TIMEOUT=5000
```

### `~/.config/opencode/opencode.json`

OpenCode MCP server configuration.

Example:
```json
{
  "thunderbird-mcp": {
    "command": [
      "bun",
      "run",
      "C:/Users/Tobias/git/thunderbird-mcp/thunderbird-mcp-server/src/index.ts"
    ],
    "enabled": true,
    "type": "local",
    "env": {
      "MCP_DEBUG": "true"
    }
  }
}
```

## Quick Reference

| Variable | Purpose | Default | Notes |
|----------|---------|---------|-------|
| `ENABLE_HTTP_SERVER` | Start HTTP bridge | `true` | Set to `false` for unit tests |
| `MCP_SERVER_PORT` | HTTP server port | `3476` | Must match extension config |
| `MCP_DEBUG` | Enable logging | `false` | Detailed operation logs |
| `DEBUG` | Bun debug mode | unset | Standard debug logging |
| `MCP_SERVER_URL` | Extension server URL | `http://localhost:3476` | Extension config |
| `EXTENSION_POLL_INTERVAL` | Polling interval | `2000` | Milliseconds |

## Priority Levels

### Required for Operation
- None (all have sensible defaults)

### Recommended for Development
- `MCP_DEBUG=true` - Helps with troubleshooting
- `DEBUG=thunderbird*` - Filters debug output

### Recommended for Testing
- `ENABLE_HTTP_SERVER=false` - Prevents port conflicts in unit tests
- `TEST_TIMEOUT=10000` - Gives more time for slow tests

### Planned for Production
- `API_KEY` - Security
- `TLS_CERTIFICATE`, `TLS_PRIVATE_KEY` - HTTPS

## Troubleshooting

### Port Already in Use

If you see `EADDRINUSE` error:
```bash
# Check what's using the port
netstat -ano | findstr :3476  # Windows
lsof -i :3476              # Linux/Mac

# Use a different port
MCP_SERVER_PORT=3000 bun run src/index.ts
```

### Extension Not Connecting

1. Check server is running:
   ```bash
   curl http://localhost:3476/health
   ```

2. Check extension debug logs in Thunderbird:
   - Tools → Developer Tools → Error Console

3. Verify port matches:
   ```bash
   # Server config
   MCP_SERVER_PORT=3476

   # Extension config
   const MCP_SERVER_URL = 'http://localhost:3476';
   ```

### Too Much Debug Output

Reduce logging:
```bash
# Disable all debug
# (unset DEBUG and MCP_DEBUG)

# Enable only critical logs
DEBUG=fastmcp MCP_DEBUG=false

# Or disable specific loggers
DEBUG=*,-thunderbird* MCP_DEBUG=false
```