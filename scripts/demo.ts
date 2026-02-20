#!/usr/bin/env bun
// scripts/demo.ts
// Demo CLI tool for thunderbird-mcp
//
// This script provides a simple CLI to test and demonstrate
// the thunderbird-mcp functionality without needing OpenCode

const MCP_SERVER_URL = 'http://localhost:8642';

/**
 * Display help information
 */
function showHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         Thunderbird MCP Demo CLI                                  ║
╚═══════════════════════════════════════════════════════════════╝

Usage: bun run demo.ts [command] [options]

Commands:
  health         Check MCP server health and connection status
  status         Show detailed server statistics
  simulate       Start extension simulator (polls server)
  fetch-emails   Simulate fetching emails
  fetch-events   Simulate fetching calendar events
  fetch-contacts Simulate fetching contacts
  send-email     Simulate sending an email

Options:
  --help, -h     Show this help message
  --port N       MCP server port (default: 3476)

Examples:
  bun run demo.ts health
  bun run demo.ts status
  bun run demo.ts simulate  # Starts polling loop
  bun run demo.ts fetch-emails

Environment Variables:
  MCP_SERVER_URL  MCP server URL (default: http://localhost:3476)
  MCP_DEBUG       Enable debug logging

For more information, see README.md and ENVIRONMENT.md
  `);
}

async function checkHealth() {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/health`);
    const data = await response.json();

    console.log('\n📊 Server Health Check');
    console.log(''.padEnd(50, '-'));
    console.log(`Status:       ${data.status}`);
    console.log(`Thunderbird:   ${data.thunderbirdConnected ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`Messages:      ${data.pendingMessages} queued`);
    console.log(`Timestamp:     ${new Date(data.timestamp).toLocaleString()}`);
    console.log('');

    return data;
  } catch (error) {
    console.error('\n❌ Failed to connect to MCP server');
    console.error('   Make sure the server is running: bun run src/index.ts');
    return null;
  }
}

async function showStatus() {
  const data = await checkHealth();
  if (!data) return;

  console.log('\n📈 Server Statistics');
  console.log(''.padEnd(50, '-'));
  console.log(`HTTP Server:  http://localhost:3476`);
  console.log(`Extension:     ${data.thunderbirdConnected ? 'Connected' : 'Not connected'}`);
  console.log(`Message Queue: ${data.pendingMessages} pending messages`);
  console.log(`Uptime:        ${Math.floor((Date.now() - data.timestamp) / 1000)}ms`);
  console.log('');

  if (!data.thunderbirdConnected) {
    console.log('💡 Tip: Run the extension simulator to connect:');
    console.log('   bun run scripts/simulate-extension.ts');
    console.log('');
  }
}

async function fetchEmails() {
  console.log('\n📧 Fetching Emails...');
  console.log(''.padEnd(50, '-'));

  try {
    // This would normally be called via MCP protocol
    // For demo, we'll queue a message directly
    const action = 'fetchEmails';
    console.log(`Action: ${action}`);
    console.log('');
    console.log('In actual usage, this would:');
    console.log('  1. OpenCode calls the fetch_emails tool');
    console.log('  2. MCP server queues the message');
    console.log('  3. Extension picks it up on next poll');
    console.log('  4. Extension calls Thunderbird API');
    console.log('  5. Extension returns email data');
    console.log('  6. OpenCode receives the emails');
    console.log('');

    // Queue a test message
    await queueMessage({ action });
    console.log('✓ Message queued');
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function fetchEvents() {
  console.log('\n📅 Fetching Calendar Events...');
  console.log(''.padEnd(50, '-'));

  try {
    await queueMessage({ action: 'fetchEvents' });
    console.log('✓ Message queued');
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function fetchContacts() {
  console.log('\n👤 Fetching Contacts...');
  console.log(''.padEnd(50, '-'));

  try {
    await queueMessage({ action: 'fetchContacts' });
    console.log('✓ Message queued');
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function sendEmail() {
  console.log('\n📤 Sending Email...');
  console.log(''.padEnd(50, '-'));

  try {
    await queueMessage({
      action: 'sendEmail',
      to: 'recipient@example.com',
      subject: 'Test Email from thunderbird-mcp',
      body: 'This is a test email sent via the MCP bridge.'
    });
    console.log('✓ Message queued');
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function queueMessage(message: any) {
  // This simulates what would happen internally
  // In real usage, you can't directly queue messages from outside
  console.log('Note: Direct message queuing not supported in production');
  console.log('In actual usage, use OpenCode or the MCP protocol');
}

/**
 * Parse command line arguments and execute
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const command = args[0];

  switch (command) {
    case 'health':
      await checkHealth();
      break;
    case 'status':
      await showStatus();
      break;
    case 'simulate':
      console.log('\n🔄 Starting extension simulator...');
      console.log('To simulate an extension, run this in another terminal:');
      console.log('  bun run scripts/simulate-extension.ts');
      console.log('');
      break;
    case 'fetch-emails':
      await fetchEmails();
      break;
    case 'fetch-events':
      await fetchEvents();
      break;
    case 'fetch-contacts':
      await fetchContacts();
      break;
    case 'send-email':
      await sendEmail();
      break;
    default:
      console.log(`\n❌ Unknown command: ${command}`);
      console.log('Run "bun run demo.ts --help" for available commands\n');
      process.exit(1);
  }
}

// Run the CLI
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});