// src/routes/emailRoutes.ts
// API routes for email management

import { fetchEmails, batchDeleteEmails, batchArchiveEmails } from '../modules/emailService';

export default async (ctx: any) => {
  const { req } = ctx;
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;
  
  // GET /api/emails - Fetch emails
  if (method === 'GET' && path === '/api/emails') {
    const emails = await fetchEmails();
    return new Response(JSON.stringify(emails), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // POST /api/emails/batch-delete - Batch delete emails (simulated)
  else if (method === 'POST' && path === '/api/emails/batch-delete') {
    const { ids } = await req.json();
    console.log(`Received batch delete request for IDs: ${ids.join(', ')}`);
    return new Response(JSON.stringify({ success: true, message: 'Batch delete simulated. Trigger extension to complete.' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // POST /api/emails/batch-archive - Batch archive emails
  else if (method === 'POST' && path === '/api/emails/batch-archive') {
    const { ids } = await req.json();
    console.log(`Received batch archive request for IDs: ${ids.join(', ')}`);
    const result = await batchArchiveEmails(ids || []);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // Not Found
  else {
    return new Response('Not Found', { status: 404 });
  }
};