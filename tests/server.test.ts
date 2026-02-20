// tests/server.test.ts
// Integration test for the MCP server

import { serve } from 'bun';
import emailRoutes from '../src/routes/emailRoutes';

describe('MCP Server', () => {
  let server: any;

  beforeAll(() => {
    server = serve({
      port: 3003, // Use a different port for testing to avoid conflicts
      fetch(req) {
        const url = new URL(req.url);
        if (url.pathname.startsWith('/api/emails')) {
          return emailRoutes({ req, body: {} });
        }
        return new Response('Not Found', { status: 404 });
      },
    });
  });

  afterAll(() => {
    server.stop();
  });

  test('Server should start and respond to /api/emails', async () => {
    const response = await fetch('http://localhost:3003/api/emails');
    expect(response.status).toBe(200);
    const emails = await response.json();
    expect(emails.length).toBeGreaterThan(0);
  });
});