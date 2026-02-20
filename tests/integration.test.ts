// tests/integration.test.ts
// Integration tests for Thunderbird MCP server HTTP bridge
//
// These tests verify the HTTP polling bridge works correctly
// by simulating the Thunderbird extension behavior

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

const MCP_SERVER_URL = 'http://localhost:8642';

describe('Thunderbird MCP Integration Tests', () => {
  let server: any;
  let serverProcess: any;

  beforeEach(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterEach(async () => {
    // Server continues running for next test
  });

  test('health endpoint should return server status', async () => {
    const response = await fetch(`${MCP_SERVER_URL}/health`);
    const data = await response.json();

    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('thunderbirdConnected');
    expect(data).toHaveProperty('pendingMessages');
    expect(data).toHaveProperty('timestamp');
    expect(typeof data.timestamp).toBe('number');
  });

  test('GET /api/messages should return queued messages', async () => {
    // First poll should return empty array
    const response = await fetch(`${MCP_SERVER_URL}/api/messages`);
    const data = await response.json();

    expect(data).toHaveProperty('messages');
    expect(Array.isArray(data.messages)).toBe(true);
  });

  test('Extension can announce connection status', async () => {
    const response = await fetch(`${MCP_SERVER_URL}/api/extension-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'connected',
        timestamp: Date.now()
      })
    });

    const data = await response.json();
    expect(data).toHaveProperty('success', true);

    // Verify connection status updated
    await new Promise(resolve => setTimeout(resolve, 100));
    const healthResponse = await fetch(`${MCP_SERVER_URL}/health`);
    const healthData = await healthResponse.json();
    expect(healthData.thunderbirdConnected).toBe(true);
  });

  test('Extension can process and respond to messages', async () => {
    const messageId = `test-msg-${Date.now()}`;

    // Extension announces connection
    await fetch(`${MCP_SERVER_URL}/api/extension-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'connected', timestamp: Date.now() })
    });

    // Don't actually queue a message - we can't because the MCP
    // server only queues messages from communicateWithThunderbird()
    // which we can't call directly in this test

    // Instead, verify the response endpoint accepts data
    const response = await fetch(`${MCP_SERVER_URL}/api/messages/${messageId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        test: 'integration-test-response'
      })
    });

    const data = await response.json();
    expect(data).toHaveProperty('success', true);
  });

  test('health check after extension connection should show connected', async () => {
    // Announce connection
    await fetch(`${MCP_SERVER_URL}/api/extension-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'connected', timestamp: Date.now() })
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Check health
    const response = await fetch(`${MCP_SERVER_URL}/health`);
    const data = await response.json();

    expect(data.thunderbirdConnected).toBe(true);
  });
});

describe('Extension Simulation Tests', () => {
  let messageId: string;

  test('Extension polling cycle works: announce → poll → process → respond', async () => {
    // Step 1: Extension announces connection
    const announceResponse = await fetch(`${MCP_SERVER_URL}/api/extension-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'connected',
        timestamp: Date.now(),
        extensionId: 'test-simulated-extension'
      })
    });
    expect(announceResponse.ok).toBe(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    // Step 2: Extension polls for messages
    const pollResponse = await fetch(`${MCP_SERVER_URL}/api/messages`);
    expect(pollResponse.ok).toBe(true);

    const pollData = await pollResponse.json();
    expect(pollData).toHaveProperty('messages');
    expect(Array.isArray(pollData.messages)).toBe(true);

    // Step 3: Extension responds to a test message
    messageId = `sim-msg-${Date.now()}`;
    const respondResponse = await fetch(`${MCP_SERVER_URL}/api/messages/${messageId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        simulated: true,
        action: 'test'
      })
    });
    expect(respondResponse.ok).toBe(true);
  });

  test('Multiple poll cycles work correctly', async () => {
    // Announce connection
    await fetch(`${MCP_SERVER_URL}/api/extension-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'connected', timestamp: Date.now() })
    });

    // Poll multiple times
    const polls = [];
    for (let i = 0; i < 3; i++) {
      const response = await fetch(`${MCP_SERVER_URL}/api/messages`);
      polls.push(await response.json());
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // All polls should return array format
    polls.forEach(poll => {
      expect(poll).toHaveProperty('messages');
      expect(Array.isArray(poll.messages)).toBe(true);
    });
  });

  test('Invalid endpoints return 404', async () => {
    const response = await fetch(`${MCP_SERVER_URL}/api/invalid-endpoint`);
    expect(response.status).toBe(404);
  });

  test('POST with invalid JSON returns error', async () => {
    const response = await fetch(`${MCP_SERVER_URL}/api/extension-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json{'
    });
    expect(response.status).toBe(400);
  });
});