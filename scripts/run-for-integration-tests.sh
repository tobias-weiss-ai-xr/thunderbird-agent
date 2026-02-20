// scripts/run-for-integration-tests.sh
# Script to start MCP server for integration testing

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${YELLOW}Starting MCP Server for Integration Tests...${NC}"

# Kill any existing server
pkill -f "bun.*index.ts" 2>/dev/null
sleep 1

# Start server in background with environment variables
cd "$PROJECT_DIR" && bun run src/index.ts > /tmp/mcp-server-integration.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
for i in {1..10}; do
  if curl -s http://localhost:3476/health > /dev/null 2>&1; then
    echo -e "${GREEN}Server started successfully (PID: $SERVER_PID)${NC}"
    break
  fi
  if [ $i -eq 10 ]; then
    echo -e "${RED}Server failed to start${NC}"
    exit 1
  fi
  sleep 1
done

# Store PID for cleanup
echo $SERVER_PID > /tmp/mcp-server.pid

echo "Server log: /tmp/mcp-server-integration.log"
echo "Server PID: $SERVER_PID"
echo ""
echo -e "${GREEN}Server is ready for integration testing${NC}"
echo ""
echo "To stop the server later, run:"
echo "  kill \$(cat /tmp/mcp-server.pid)"
echo "  or:"
echo "  pkill -f 'bun.*index.ts'"