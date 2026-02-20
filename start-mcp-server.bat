@echo off
REM start-mcp-server.bat
REM Start MCP server with HTTP bridge enabled on Windows

echo Starting MCP server with HTTP bridge...
set ENABLE_HTTP_SERVER=true
bun run src/index.ts
