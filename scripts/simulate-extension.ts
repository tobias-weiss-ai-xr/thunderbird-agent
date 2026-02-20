#!/usr/bin/env bun
// scripts/simulate-extension.ts
// Script to simulate Thunderbird extension behavior for testing
//
// This script polls the MCP server and responds to messages,
// simulating what a real Thunderbird extension would do.

const MCP_SERVER_URL = 'http://localhost:3476';
const POLL_INTERVAL = 2000; // 2 seconds

interface QueuedMessage {
  id: string;
  message: any;
  timestamp: number;
}

/**
 * Simulate fetching emails from Thunderbird
 */
async function simulateFetchEmails(message: any) {
  console.log('📧 Simulating: fetchEmails', message);

  return {
    success: true,
    emails: [
      {
        id: 'sim-email-1',
        subject: 'Simulated Email: Thunderbird MCP Test',
        from: 'test@simulated.local',
        date: new Date().toISOString(),
        folderId: message.folderId || 'inbox',
        accountId: message.accountId || 'account1'
      },
      {
        id: 'sim-email-2',
        subject: 'Another Simulated Email',
        from: 'sender@simulated.local',
        date: new Date(Date.now() - 86400000).toISOString(),
        folderId: 'inbox',
        accountId: 'account1'
      }
    ]
  };
}

/**
 * Simulate sending an email
 */
async function simulateSendEmail(message: any) {
  console.log('📤 Simulating: sendEmail', message);

  return {
    success: true,
    message: 'Email sent successfully (simulated)',
    draftId: 'sim-draft-' + Date.now()
  };
}

/**
 * Simulate deleting an email
 */
async function simulateDeleteEmail(message: any) {
  console.log('🗑️ Simulating: deleteEmail', message);

  return {
    success: true,
    message: 'Email deleted successfully (simulated)'
  };
}

/**
 * Simulate batch deleting emails
 */
async function simulateBatchDeleteEmails(message: any) {
  console.log('🗑️ Simulating: batchDeleteEmails', message);

  return {
    success: true,
    message: `${message.ids.length} emails deleted successfully (simulated)`
  };
}

/**
 * Simulate batch archiving emails
 */
async function simulateBatchArchiveEmails(message: any) {
  console.log('📦 Simulating: batchArchiveEmails', message);

  return {
    success: true,
    message: `${message.ids.length} emails archived successfully (simulated)`
  };
}

/**
 * Simulate fetching events
 */
async function simulateFetchEvents(message: any) {
  console.log('📅 Simulating: fetchEvents', message);

  return {
    success: true,
    events: [
      {
        id: 'sim-event-1',
        title: 'Simulated Meeting',
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3600000).toISOString(),
        location: 'Simulated Location'
      }
    ]
  };
}

/**
 * Simulate creating an event
 */
async function simulateCreateEvent(message: any) {
  console.log('➕ Simulating: createEvent', message);

  return {
    success: true,
    message: 'Event created successfully (simulated)',
    event: {
      id: 'sim-event-' + Date.now(),
      ...message
    }
  };
}

/**
 * Simulate deleting an event
 */
async function simulateDeleteEvent(message: any) {
  console.log('🗑️ Simulating: deleteEvent', message);

  return {
    success: true,
    message: 'Event deleted successfully (simulated)'
  };
}

/**
 * Simulate fetching contacts
 */
async function simulateFetchContacts(message: any) {
  console.log('👤 Simulating: fetchContacts', message);

  return {
    success: true,
    contacts: [
      {
        id: 'sim-contact-1',
        name: 'Simulated Contact',
        email: 'sim@example.com',
        phone: '555-0101'
      }
    ]
  };
}

/**
 * Simulate creating a contact
 */
async function simulateCreateContact(message: any) {
  console.log('➕ Simulating: createContact', message);

  return {
    success: true,
    message: 'Contact created successfully (simulated)',
    contact: {
      id: 'sim-contact-' + Date.now(),
      ...message
    }
  };
}

/**
 * Simulate deleting a contact
 */
async function simulateDeleteContact(message: any) {
  console.log('🗑️ Simulating: deleteContact', message);

  return {
    success: true,
    message: 'Contact deleted successfully (simulated)'
  };
}

/**
 * Map actions to their simulated handlers
 */
const actionHandlers: Record<string, (message: any) => Promise<any>> = {
  fetchEmails: simulateFetchEmails,
  sendEmail: simulateSendEmail,
  deleteEmail: simulateDeleteEmail,
  batchDeleteEmails: simulateBatchDeleteEmails,
  batchArchiveEmails: simulateBatchArchiveEmails,
  fetchEvents: simulateFetchEvents,
  createEvent: simulateCreateEvent,
  deleteEvent: simulateDeleteEvent,
  fetchContacts: simulateFetchContacts,
  createContact: simulateCreateContact,
  deleteContact: simulateDeleteContact
};

/**
 * Announce that extension is connected
 */
async function announceConnection() {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/api/extension-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'connected',
        timestamp: Date.now(),
        extensionId: 'simulated-extension',
        version: '1.0.0-simulated'
      })
    });

    if (response.ok) {
      console.log('✓ Announced connection to MCP server');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to announce connection:', error);
    return false;
  }
}

/**
 * Poll for pending messages from MCP server
 */
async function pollForMessages(): Promise<QueuedMessage[]> {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/api/messages`);

    if (!response.ok) {
      console.error('Failed to poll for messages:', response.status);
      return [];
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error('Error polling for messages:', error);
    return [];
  }
}

/**
 * Send response to MCP server
 */
async function sendResponse(messageId: string, response: any) {
  try {
    const res = await fetch(`${MCP_SERVER_URL}/api/messages/${messageId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    });

    if (res.ok) {
      console.log(`✓ Response sent for message: ${messageId}`);
      return true;
    }

    console.error(`Failed to send response for message: ${messageId}`, await res.text());
    return false;
  } catch (error) {
    console.error(`Error sending response for message: ${messageId}`, error);
    return false;
  }
}

/**
 * Process a message from the queue
 */
async function processMessage(queuedMessage: QueuedMessage) {
  const { id, message } = queuedMessage;
  const action = message.action;

  console.log(`\n📨 Processing message: ${id}`);
  console.log(`   Action: ${action}`);

  const handler = actionHandlers[action];

  if (!handler) {
    console.error(`No handler for action: ${action}`);
    await sendResponse(id, {
      success: false,
      error: `Unknown action: ${action}`
    });
    return;
  }

  try {
    const response = await handler(message);
    await sendResponse(id, response);
  } catch (error) {
    console.error(`Error handling message:`, error);
    await sendResponse(id, {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Main simulation loop
 */
async function simulateExtension() {
  console.log('=== Thunderbird MCP Extension Simulator ===');
  console.log(`MCP Server: ${MCP_SERVER_URL}`);
  console.log(`Poll Interval: ${POLL_INTERVAL}ms`);
  console.log('');

  // Announce connection
  const connected = await announceConnection();

  if (!connected) {
    console.error('Failed to connect to MCP server. Make sure the server is running:');
    console.error('  bun run src/index.ts');
    process.exit(1);
  }

  console.log('Starting message polling...');
  console.log('Press Ctrl+C to stop\n');

  // Main polling loop
  while (true) {
    try {
      const messages = await pollForMessages();

      if (messages.length > 0) {
        console.log(`\n🔔 Found ${messages.length} pending message(s)`);

        for (const msg of messages) {
          await processMessage(msg);
        }
      }
    } catch (error) {
      console.error('Error in polling loop:', error);
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping extension simulator...');
  process.exit(0);
});

// Run the simulation
simulateExtension().catch(error => {
  console.error('Fatal error in extension simulator:', error);
  process.exit(1);
});