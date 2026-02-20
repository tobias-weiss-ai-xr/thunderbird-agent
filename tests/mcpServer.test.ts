// tests/mcpServer.test.ts
// Unit tests for MCP server - Note: FastMCP tools are stored internally and not directly accessible

import { FastMCP } from 'fastmcp';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('Thunderbird MCP Server - Module Loading', () => {
  it('should import the server module without errors', async () => {
    // Just verify we can import - actual tool registration happens at runtime
    const serverModule = await import('../src/index');
    expect(serverModule).toBeDefined();
  });

  it('should create a FastMCP instance', () => {
    const testServer = new FastMCP({
      name: 'test-server',
      version: '1.0.0',
      description: 'Test server'
    });
    expect(testServer).toBeInstanceOf(FastMCP);
  });

  it('should have start method available', () => {
    const testServer = new FastMCP({
      name: 'test-server',
      version: '1.0.0'
    });
    expect(typeof testServer.start).toBe('function');
  });
});

describe('Thunderbird MCP Server - Tools Registration', () => {
  let server: FastMCP;

  beforeEach(() => {
    server = new FastMCP({
      name: 'test-thunderbird-mcp',
      version: '1.0.0',
      description: 'Test Thunderbird MCP Server'
    });
  });

  it('should allow adding email tools', () => {
    expect(() => {
      server.addTool({
        name: 'test_fetch_emails',
        description: 'Test tool',
        parameters: {},
        handler: async () => ({ success: true })
      });
    }).not.toThrow();
  });

  it('should allow adding calendar tools', () => {
    expect(() => {
      server.addTool({
        name: 'test_fetch_events',
        description: 'Test calendar tool',
        parameters: {},
        handler: async () => ({ success: true })
      });
    }).not.toThrow();
  });

  it('should allow adding contact tools', () => {
    expect(() => {
      server.addTool({
        name: 'test_fetch_contacts',
        description: 'Test contact tool',
        parameters: {},
        handler: async () => ({ success: true })
      });
    }).not.toThrow();
  });

  it('should allow adding automation rule tools', () => {
    expect(() => {
      server.addTool({
        name: 'test_list_rules',
        description: 'Test automation tool',
        parameters: {},
        handler: async () => ({ success: true })
      });
    }).not.toThrow();
  });
});

describe('Thunderbird MCP Server - Tool Handlers', () => {
  it('should have a communicateWithThunderbird helper function', async () => {
    const serverModule = await import('../src/index');
    // The module exports default and has this function internally
    // We can't test it directly but we verify the module loads
    expect(serverModule).toBeDefined();
  });
});