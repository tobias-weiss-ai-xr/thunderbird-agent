#!/bin/bash
# verify-opencode-config.sh
# Verifies thunderbird-mcp configuration for OpenCode

echo "=== Thunderbird MCP - OpenCode Configuration Verification ==="
echo ""

WINDOIZE_PATH="$1"

echo "Checking configuration..."

# 1. Check if opencode config exists
CONFIG_FILE="$HOME/.config/opencode/opencode.json"
if [[ -f "$CONFIG_FILE" ]]; then
    echo "✅ OpenCode config exists at: $CONFIG_FILE"
else
    echo "❌ OpenCode config not found at: $CONFIG_FILE"
    echo "   This is expected if OpenCode is not installed yet."
fi

# 2. Check if thunderbird-mcp is configured
if [[ -f "$CONFIG_FILE" ]]; then
    if grep -q '"thunderbird-mcp"' "$CONFIG_FILE"; then
        echo "✅ thunderbird-mcp found in config"
    else
        echo "❌ thunderbird-mcp NOT found in config"
    fi
fi

# 3. Check Bun installation
if command -v bun &> /dev/null; then
    BUN_VERSION=$(bun --version)
    echo "✅ Bun is installed (version: $BUN_VERSION)"
else
    echo "❌ Bun is NOT installed"
    echo "   Install with: curl -fsSL https://bun.sh/install | bash"
fi

# 4. Check project path
PROJECT_PATH="/c/Users/Tobias/git/thunderbird-mcp/thunderbird-mcp-server"
if [[ -d "$PROJECT_PATH" ]]; then
    echo "✅ Project directory exists: $PROJECT_PATH"
else
    echo "❌ Project directory NOT found: $PROJECT_PATH"
    echo "   Please verify the path or clone the repository"
fi

# 5. Check main entry point
ENTRY_POINT="$PROJECT_PATH/src/index.ts"
if [[ -f "$ENTRY_POINT" ]]; then
    echo "✅ Entry point exists: $ENTRY_POINT"
else
    echo "❌ Entry point NOT found: $ENTRY_POINT"
fi

# 6. Check dependencies
if [[ -d "$PROJECT_PATH/node_modules" ]]; then
    echo "✅ Dependencies installed (node_modules exists)"
else
    echo "❌ Dependencies NOT installed"
    echo "   Run: cd $PROJECT_PATH && bun install"
fi

# 7. Run tests
if [[ -d "$PROJECT_PATH" ]]; then
    echo ""
    echo "Running tests..."
    cd "$PROJECT_PATH"
    if bun test &> /dev/null; then
        echo "✅ All tests pass"
    else
        echo "⚠️  Some tests may have failed. Run 'bun test' to see details."
    fi
fi

echo ""
echo "=== Configuration Complete ==="
echo ""
echo "Next steps:"
echo "1. Restart OpenCode to load the new MCP server"
echo "2. Check MCP tools panel for thunderbird-mcp availability"
echo "3. See OPENCODE_INTEGRATION.md for usage examples"