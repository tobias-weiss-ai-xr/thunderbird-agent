#!/usr/bin/env bun
// run-all-tests.ts
// Run all tests with proper server setup

import { spawn } from 'child_process';

console.log('=== Running Full Test Suite ===\n');

// Start MCP server with HTTP bridge
console.log('1. Starting MCP server with HTTP bridge...');
const mcpServer = spawn('bun', ['run', 'src/index.ts'], {
  env: { ...process.env, ENABLE_HTTP_SERVER: 'true' },
  stdio: 'pipe'
});

// Wait for server to start
await new Promise(resolve => setTimeout(resolve, 3000));

// Check if server is running
try {
  const health = await fetch('http://localhost:8642/health');
  const healthData = await health.json();
  if (healthData.status === 'ok') {
    console.log('✅ MCP server running on port 8642');
  }
} catch (error) {
  console.error('❌ MCP server failed to start:', error);
  process.exit(1);
}

// Start extension simulator
console.log('\n2. Starting extension simulator...');
const extension = spawn('bun', ['run', 'scripts/simulate-extension.ts'], {
  stdio: 'pipe'
});

// Wait for extension to connect
await new Promise(resolve => setTimeout(resolve, 3000));

// Check if extension is connected
try {
  const health = await fetch('http://localhost:8642/health');
  const healthData = await health.json();
  if (healthData.thunderbirdConnected) {
    console.log('✅ Extension connected to MCP server');
  }
} catch (error) {
  console.error('❌ Extension failed to connect:', error);
  process.exit(1);
}

// Run all tests
console.log('\n3. Running all tests...\n');

try {
  const testProcess = spawn('bun', ['test'], {
    stdio: 'inherit'
  });

  await new Promise((resolve, reject) => {
    testProcess.on('close', resolve);
    testProcess.on('error', reject);
  });
  console.log('\n✅ All tests completed');
} catch (error) {
  console.error('\n❌ Tests failed:', error);
  process.exit(1);
}

// Cleanup
console.log('\n4. Cleaning up...');
mcpServer.kill();
extension.kill();
console.log('✅ Cleanup complete');
