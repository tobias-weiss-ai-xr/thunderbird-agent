@echo off
REM run-full-tests.bat
REM Start both MCP server and extension simulator, then run all tests

echo === Running Full Test Suite ===
echo.

echo [1/3] Starting MCP server with HTTP bridge...
start cmd /c bun run src/index.ts
timeout /t 3 >nul

echo [2/3] Starting extension simulator...
start cmd /c bun run scripts/simulate-extension.ts
timeout /t 2 >nul

echo [3/3] Running all tests...
bun test

echo.
echo === Test Complete ===
pause
