// background.js
// Thunderbird extension background script for MCP communication

console.log('Thunderbird MCP Bridge extension loaded');

// MCP Server configuration
const MCP_SERVER_URL = 'http://localhost:8642';
let mcpServerConnected = false;

// Notify MCP server that extension is loaded
async function notifyExtensionLoaded() {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/api/extension-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'connected', timestamp: Date.now() })
    });
    if (response.ok) {
      mcpServerConnected = true;
      console.log('[Extension] Successfully connected to MCP server');
    }
  } catch (error) {
    console.log('[Extension] Could not connect to MCP server (this is OK - may start later)');
  }
}

// Notify on startup
notifyExtensionLoaded();

// ============== MESSAGE POLLING ==============

// Poll for messages from MCP server
setInterval(pollForMessages, 2000); // Poll every 2 seconds

/**
 * Poll for pending messages from MCP server
 */
async function pollForMessages() {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/api/messages`);
    if (!response.ok) return;

    const data = await response.json();

    if (data.messages && data.messages.length > 0) {
      // Process each pending message
      for (const msg of data.messages) {
        await handleMessageFromMCP(msg);
      }
    }
  } catch (error) {
    // Silently ignore connection errors - server may not be running yet
  }
}

/**
 * Handle a message from MCP server
 */
async function handleMessageFromMCP(msg) {
  const { id, message } = msg;
  console.log('[Extension] Processing message:', id, message.action);

  try {
    // Get the appropriate handler
    const handler = getHandlerForAction(message.action);
    if (!handler) {
      throw new Error(`Unknown action: ${message.action}`);
    }

    // Execute the handler
    const result = await handler(message);

    // Send response back to MCP server
    await fetch(`${MCP_SERVER_URL}/api/messages/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });

    console.log('[Extension] Response sent for:', id);
  } catch (error) {
    console.error('[Extension] Error handling message:', error);
    // Send error response
    await fetch(`${MCP_SERVER_URL}/api/messages/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    });
  }
}

/**
 * Get handler function for given action
 */
function getHandlerForAction(action) {
  const handlers = {
    'fetchEmails': handleFetchEmails,
    'fetchEmail': handleFetchEmail,
    'sendEmail': handleSendEmail,
    'deleteEmail': handleDeleteEmail,
    'batchDeleteEmails': handleBatchDeleteEmails,
    'batchArchiveEmails': handleBatchArchiveEmails,
    'moveEmail': handleMoveEmail,
    'listFolders': handleListFolders,
    'fetchEvents': handleFetchEvents,
    'createEvent': handleCreateEvent,
    'deleteEvent': handleDeleteEvent,
    'fetchContacts': handleFetchContacts,
    'createContact': handleCreateContact,
    'deleteContact': handleDeleteContact
  };
  return handlers[action];
}

// ============== AI SORTING HANDLERS ==============

// Fetch a single email with full content
async function handleFetchEmail(request) {
  try {
    const message = await browser.messages.get(request.emailId);
    const fullMessage = await browser.messages.getFull(message.id);
    
    return {
      success: true,
      data: {
        id: message.id,
        subject: message.subject,
        from: message.author,
        to: message.recipients,
        date: message.date,
        body: fullMessage.body || fullMessage.parts?.[0]?.body || '',
        folderId: message.folder?.id,
        accountId: message.folder?.accountId
      }
    };
  } catch (error) {
    console.error('[Extension] Failed to fetch email:', error);
    throw error;
  }
}

// Move an email to a specific folder
async function handleMoveEmail(request) {
  try {
    const { emailId, targetFolder } = request;
    
    // First, get the email to find its account
    const message = await browser.messages.get(emailId);
    const accountId = message.folder?.accountId;
    
    if (!accountId) {
      throw new Error('Could not determine account for email');
    }
    
    // Find the target folder
    const folders = await browser.folders.list(accountId);
    let targetFolderObj = folders.find(f => 
      f.name.toLowerCase() === targetFolder.toLowerCase() ||
      f.id === targetFolder
    );
    
    // If folder doesn't exist, we could create it, but for now return error
    if (!targetFolderObj) {
      // Try to find by path match
      targetFolderObj = folders.find(f => 
        f.path.toLowerCase().includes(targetFolder.toLowerCase())
      );
    }
    
    if (!targetFolderObj) {
      return {
        success: false,
        error: `Folder "${targetFolder}" not found. Available folders: ${folders.map(f => f.name).join(', ')}`
      };
    }
    
    // Move the message
    await browser.messages.move([emailId], targetFolderObj.id);
    
    return {
      success: true,
      message: `Email moved to ${targetFolderObj.name}`,
      folderId: targetFolderObj.id
    };
  } catch (error) {
    console.error('[Extension] Failed to move email:', error);
    throw error;
  }
}

// List all folders for classification
async function handleListFolders(request) {
  try {
    const accounts = await browser.accounts.list();
    const allFolders = [];
    
    for (const account of accounts) {
      if (request.accountId && account.id !== request.accountId) continue;
      
      const folders = await browser.folders.list(account.id);
      
      // Recursively get subfolders
      async function getSubfolders(folder, depth = 0) {
        const result = [{
          id: folder.id,
          name: folder.name,
          path: folder.path,
          accountId: account.id,
          depth
        }];
        
        if (folder.subFolders && folder.subFolders.length > 0) {
          for (const sub of folder.subFolders) {
            const subFolders = await getSubfolders(sub, depth + 1);
            result.push(...subFolders);
          }
        }
        
        return result;
      }
      
      for (const folder of folders) {
        const folderList = await getSubfolders(folder);
        allFolders.push(...folderList);
      }
    }
    
    return {
      success: true,
      folders: allFolders
    };
  } catch (error) {
    console.error('[Extension] Failed to list folders:', error);
    throw error;
  }
}

// Batch archive emails in Thunderbird
async function batchArchiveEmails(ids) {
  try {
    for (const id of ids) {
      const message = await browser.messages.get(id);
      await browser.messages.move([id], message.folder.id); // Move to archive folder
    }
    return { success: true, message: 'Emails archived successfully' };
  } catch (error) {
    console.error('Failed to batch archive emails:', error);
    return { success: false, error: error.message };
  }
}

// ============== EMAIL HANDLERS (continued) ==============

async function handleFetchEmails(request) {
  try {
    const accounts = await browser.accounts.list();
    const emails = [];

    // Filter by account/folder if specified
    const targetAccountId = request.accountId;
    const targetFolderId = request.folderId;
    const limit = request.limit || 100;

    for (const account of accounts) {
      if (targetAccountId && account.id !== targetAccountId) continue;

      const folders = await browser.folders.list(account.id);
      for (const folder of folders) {
        if (targetFolderId && folder.id !== targetFolderId) continue;

        const messages = await browser.messages.list(folder.id);
        for (const message of messages) {
          if (emails.length >= limit) break;

          emails.push({
            id: message.id,
            subject: message.subject,
            from: message.author,
            date: message.date,
            folderId: folder.id,
            accountId: account.id
          });
        }
      }
    }

    return { success: true, emails };
  } catch (error) {
    console.error('[Extension] Failed to fetch emails:', error);
    throw error;
  }
}

async function handleSendEmail(request) {
  try {
    const draft = await browser.messages.createDraft({
      to: [request.to],
      subject: request.subject,
      body: request.body,
      cc: request.cc ? [request.cc] : [],
      bcc: request.bcc ? [request.bcc] : []
    });
    await browser.messages.send(draft.id);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('[Extension] Failed to send email:', error);
    throw error;
  }
}

async function handleDeleteEmail(request) {
  try {
    await browser.messages.remove(request.emailId);
    return { success: true, message: 'Email deleted successfully' };
  } catch (error) {
    console.error('[Extension] Failed to delete email:', error);
    throw error;
  }
}

// Batch delete emails in Thunderbird
async function handleBatchDeleteEmails(request) {
  try {
    for (const id of request.ids) {
      await browser.messages.remove(id);
    }
    return { success: true, message: 'Emails deleted successfully' };
  } catch (error) {
    console.error('[Extension] Failed to batch delete emails:', error);
    throw error;
  }
}

// Batch archive emails in Thunderbird
async function handleBatchArchiveEmails(request) {
  try {
    for (const id of request.ids) {
      const message = await browser.messages.get(id);
      // Try to move to Archive folder or recycle folder
      await browser.messages.move([id], message.folder.id);
    }
    return { success: true, message: 'Emails archived successfully' };
  } catch (error) {
    console.error('[Extension] Failed to batch archive emails:', error);
    throw error;
  }
}

// ============== CALENDAR HANDLERS ==============

async function handleFetchEvents(request) {
  try {
    const calendars = await browser.calendars.list();
    const events = [];

    for (const calendar of calendars) {
      if (request.calendarId && calendar.id !== request.calendarId) continue;

      const calendarEvents = await browser.calendar.events.list(calendar.id);
      for (const event of calendarEvents) {
        // Filter by date range if specified
        if (request.startDate && new Date(event.start) < new Date(request.startDate)) continue;
        if (request.endDate && new Date(event.end) > new Date(request.endDate)) continue;

        events.push({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          location: event.location || '',
          calendarId: calendar.id
        });
      }
    }

    return { success: true, events };
  } catch (error) {
    console.error('[Extension] Failed to fetch events:', error);
    throw error;
  }
}

async function handleCreateEvent(request) {
  try {
    const event = await browser.calendar.events.create({
      calendarId: request.calendarId,
      title: request.title,
      start: request.start,
      end: request.end,
      location: request.location,
      description: request.description
    });
    return { success: true, message: 'Event created successfully', event };
  } catch (error) {
    console.error('[Extension] Failed to create event:', error);
    throw error;
  }
}

async function handleDeleteEvent(request) {
  try {
    await browser.calendar.events.remove(request.eventId);
    return { success: true, message: 'Event deleted successfully' };
  } catch (error) {
    console.error('[Extension] Failed to delete event:', error);
    throw error;
  }
}

// ============== CONTACT HANDLERS ==============

async function handleFetchContacts(request) {
  try {
    const addressBooks = await browser.addressBooks.list();
    const contacts = [];

    for (const addressBook of addressBooks) {
      if (request.addressBookId && addressBook.id !== request.addressBookId) continue;

      const addressBookContacts = await browser.contacts.list(addressBook.id);
      for (const contact of addressBookContacts) {
        // Filter by search term if specified
        if (request.search) {
          const searchLower = request.search.toLowerCase();
          const matchName = contact.name && contact.name.toLowerCase().includes(searchLower);
          const matchEmail = contact.email && contact.email.toLowerCase().includes(searchLower);
          if (!matchName && !matchEmail) continue;
        }

        contacts.push({
          id: contact.id,
          name: contact.name || '',
          email: contact.email || '',
          phone: contact.phone || '',
          addressBookId: addressBook.id
        });
      }
    }

    return { success: true, contacts };
  } catch (error) {
    console.error('[Extension] Failed to fetch contacts:', error);
    throw error;
  }
}

async function handleCreateContact(request) {
  try {
    const contact = await browser.contacts.create({
      addressBookId: request.addressBookId,
      name: request.name,
      email: request.email,
      phone: request.phone
    });
    return { success: true, message: 'Contact created successfully', contact };
  } catch (error) {
    console.error('[Extension] Failed to create contact:', error);
    throw error;
  }
}

async function handleDeleteContact(request) {
  try {
    await browser.contacts.remove(request.contactId);
    return { success: true, message: 'Contact deleted successfully' };
  } catch (error) {
    console.error('[Extension] Failed to delete contact:', error);
    throw error;
  }
}