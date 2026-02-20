#!/usr/bin/env bun
// Test Bun serve function
import { serve } from 'bun';

const server = serve({
  port: 8642,
  async fetch(req) {
    const url = new URL(req.url);

    console.log(`Received request: ${req.method} ${url.pathname}`);

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        message: 'Test server is working',
        timestamp: Date.now()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log('Test HTTP server listening on http://localhost:8642');
console.log('Press Ctrl+C to stop');
