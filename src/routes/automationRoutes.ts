// src/routes/automationRoutes.ts
// API routes for automation rules (deprecated - now using FastMCP tools)

import { applyRules, upsertRule, deleteRule, loadRules } from '../utils/rulesEngine';

// NOTE: This file is deprecated. All functionality has been moved to FastMCP tools in index.ts.
// The MCP tools list_automation_rules, upsert_automation_rule, and delete_automation_rule
// replace these HTTP routes.

export default async (ctx: any) => {
  const { req } = ctx;
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  // GET /api/automation/rules - List all rules
  if (method === 'GET' && path === '/api/automation/rules') {
    const rules = loadRules();
    return new Response(JSON.stringify(rules), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // POST /api/automation/rules - Add/update a rule
  else if (method === 'POST' && path === '/api/automation/rules') {
    const body = await req.text();
    const rule = body ? JSON.parse(body) : {};
    upsertRule(rule);
    return new Response(JSON.stringify({ success: true, message: 'Rule updated' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // DELETE /api/automation/rules/:id - Delete a rule
  else if (method === 'DELETE' && path.startsWith('/api/automation/rules/')) {
    const ruleId = path.split('/').pop();
    deleteRule(ruleId);
    return new Response(JSON.stringify({ success: true, message: 'Rule deleted' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // Not Found
  else {
    return new Response('Not Found', { status: 404 });
  }
};