#!/usr/bin/env bun
// Start HTTP server only for testing
import { serve } from 'bun';

console.log('Starting HTTP bridge only (no MCP protocol)...');

const httpServer = serve({
  port: 8642,
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method;
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] ${method} ${url.pathname}`);

    // Extension status endpoint
    if (url.pathname === '/api/extension-status' && method === 'POST') {
      try {
        const body = await req.json();
        console.log(`[HTTP Server] Extension status received: ${body.status}`);
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Extension polls for pending messages
    if (url.pathname === '/api/messages' && method === 'GET') {
      const messages = [];
      return new Response(JSON.stringify({ messages }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extension sends response
    if (url.pathname.startsWith('/api/messages/') && method === 'POST') {
      const messageId = url.pathname.split('/').pop();
      console.log(`[HTTP Server] Response received for message: ${messageId}`);
      try {
        const body = await req.json();
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Health check
    if (url.pathname === '/health' && method === 'GET') {
      return new Response(JSON.stringify({
        status: 'ok',
        thunderbirdConnected: false,
        pendingMessages: 0,
        timestamp: Date.now()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`[${timestamp}] 404 Not Found: ${method} ${url.pathname}`);
    return new Response('Not Found', { status: 404 });
  },
});

console.log('[HTTP Server] Listening on http://localhost:8642');
console.log('[HTTP Server] Test with: curl http://localhost:8642/health');
console.log('[HTTP Server] Press Ctrl+C to stop');
