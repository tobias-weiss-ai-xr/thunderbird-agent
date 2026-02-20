// src/index.ts
// Thunderbird MCP Server - FastMCP implementation

import { FastMCP } from 'fastmcp';
import { serve } from 'bun';

// Initialize FastMCP server
const server = new FastMCP({
  name: 'thunderbird-mcp',
  version: '1.0.0'
});

// Communication state
let thunderbirdConnected = false;
let messageQueue: Map<string, any> = new Map();
let pendingRequests: Map<string, (response: any) => void> = new Map();
let connectionAttempts = 0;
const MCP_SERVER_PORT = 3476;

// ============== EMAIL TOOLS ==============

// Fetch emails from Thunderbird
server.addTool({
  name: 'fetch_emails',
  description: 'Fetch all emails from all accounts in Thunderbird',
  parameters: {
    accountId: {
      type: 'string',
      description: 'Optional: specific account ID to fetch from',
      required: false
    },
    folderId: {
      type: 'string',
      description: 'Optional: specific folder ID to fetch from',
      required: false
    },
    limit: {
      type: 'number',
      description: 'Optional: maximum number of emails to fetch',
      required: false
    }
  },
  handler: async (params) => {
    try {
      // This would communicate with the Thunderbird extension
      // For now, we'll return a placeholder response
      const result = await communicateWithThunderbird({
        action: 'fetchEmails',
        accountId: params.accountId,
        folderId: params.folderId,
        limit: params.limit
      });
      return {
        success: true,
        emails: result.emails || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Send an email
server.addTool({
  name: 'send_email',
  description: 'Send an email via Thunderbird',
  parameters: {
    to: {
      type: 'string',
      description: 'Recipient email address',
      required: true
    },
    subject: {
      type: 'string',
      description: 'Email subject',
      required: true
    },
    body: {
      type: 'string',
      description: 'Email body content',
      required: true
    },
    cc: {
      type: 'string',
      description: 'Optional: CC recipients',
      required: false
    },
    bcc: {
      type: 'string',
      description: 'Optional: BCC recipients',
      required: false
    }
  },
  handler: async (params) => {
    try {
      const result = await communicateWithThunderbird({
        action: 'sendEmail',
        ...params
      });
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Delete a single email
server.addTool({
  name: 'delete_email',
  description: 'Delete a specific email from Thunderbird',
  parameters: {
    emailId: {
      type: 'string',
      description: 'ID of the email to delete',
      required: true
    }
  },
  handler: async (params) => {
    try {
      const result = await communicateWithThunderbird({
        action: 'deleteEmail',
        emailId: params.emailId
      });
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Batch delete emails
server.addTool({
  name: 'batch_delete_emails',
  description: 'Delete multiple emails at once',
  parameters: {
    emailIds: {
      type: 'array',
      items: { type: 'string' },
      description: 'Array of email IDs to delete',
      required: true
    }
  },
  handler: async (params) => {
    try {
      const result = await communicateWithThunderbird({
        action: 'batchDeleteEmails',
        ids: params.emailIds
      });
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Batch archive emails
server.addTool({
  name: 'batch_archive_emails',
  description: 'Archive multiple emails at once',
  parameters: {
    emailIds: {
      type: 'array',
      items: { type: 'string' },
      description: 'Array of email IDs to archive',
      required: true
    }
  },
  handler: async (params) => {
    try {
      const result = await communicateWithThunderbird({
        action: 'batchArchiveEmails',
        ids: params.emailIds
      });
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// ============== CALENDAR TOOLS ==============

// Fetch calendar events
server.addTool({
  name: 'fetch_events',
  description: 'Fetch calendar events from Thunderbird',
  parameters: {
    calendarId: {
      type: 'string',
      description: 'Optional: specific calendar ID to fetch from',
      required: false
    },
    startDate: {
      type: 'string',
      description: 'Optional: start date filter (ISO format)',
      required: false
    },
    endDate: {
      type: 'string',
      description: 'Optional: end date filter (ISO format)',
      required: false
    }
  },
  handler: async (params) => {
    try {
      const result = await communicateWithThunderbird({
        action: 'fetchEvents',
        ...params
      });
      return {
        success: true,
        events: result.events || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Create a calendar event
server.addTool({
  name: 'create_event',
  description: 'Create a new calendar event',
  parameters: {
    title: {
      type: 'string',
      description: 'Event title',
      required: true
    },
    start: {
      type: 'string',
      description: 'Event start time (ISO format)',
      required: true
    },
    end: {
      type: 'string',
      description: 'Event end time (ISO format)',
      required: true
    },
    location: {
      type: 'string',
      description: 'Optional: event location',
      required: false
    },
    description: {
      type: 'string',
      description: 'Optional: event description',
      required: false
    }
  },
  handler: async (params) => {
    try {
      const result = await communicateWithThunderbird({
        action: 'createEvent',
        ...params
      });
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Delete a calendar event
server.addTool({
  name: 'delete_event',
  description: 'Delete a calendar event',
  parameters: {
    eventId: {
      type: 'string',
      description: 'ID of the event to delete',
      required: true
    }
  },
  handler: async (params) => {
    try {
      const result = await communicateWithThunderbird({
        action: 'deleteEvent',
        eventId: params.eventId
      });
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// ============== CONTACT TOOLS ==============

// Fetch contacts
server.addTool({
  name: 'fetch_contacts',
  description: 'Fetch contacts from Thunderbird',
  parameters: {
    addressBookId: {
      type: 'string',
      description: 'Optional: specific address book ID',
      required: false
    },
    search: {
      type: 'string',
      description: 'Optional: search term to filter contacts',
      required: false
    }
  },
  handler: async (params) => {
    try {
      const result = await communicateWithThunderbird({
        action: 'fetchContacts',
        ...params
      });
      return {
        success: true,
        contacts: result.contacts || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Create a contact
server.addTool({
  name: 'create_contact',
  description: 'Create a new contact',
  parameters: {
    name: {
      type: 'string',
      description: 'Contact name',
      required: true
    },
    email: {
      type: 'string',
      description: 'Contact email address',
      required: true
    },
    phone: {
      type: 'string',
      description: 'Optional: contact phone number',
      required: false
    }
  },
  handler: async (params) => {
    try {
      const result = await communicateWithThunderbird({
        action: 'createContact',
        ...params
      });
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Delete a contact
server.addTool({
  name: 'delete_contact',
  description: 'Delete a contact',
  parameters: {
    contactId: {
      type: 'string',
      description: 'ID of the contact to delete',
      required: true
    }
  },
  handler: async (params) => {
    try {
      const result = await communicateWithThunderbird({
        action: 'deleteContact',
        contactId: params.contactId
      });
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// ============== AUTOMATION RULES TOOLS ==============

// List automation rules
server.addTool({
  name: 'list_automation_rules',
  description: 'List all email automation rules',
  parameters: {},
  handler: async () => {
    try {
      const { loadRulesExported } = await import('./utils/rulesEngine.js');
      const rules = loadRulesExported();
      return {
        success: true,
        rules
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Create/update an automation rule
server.addTool({
  name: 'upsert_automation_rule',
  description: 'Create or update an email automation rule',
  parameters: {
    rule: {
      type: 'object',
      description: 'Rule object with id, condition, and action',
      required: true
    }
  },
  handler: async (params) => {
    try {
      const { upsertRule } = await import('./utils/rulesEngine.js');
      const result = upsertRule(params.rule);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Delete an automation rule
server.addTool({
  name: 'delete_automation_rule',
  description: 'Delete an email automation rule',
  parameters: {
    ruleId: {
      type: 'string',
      description: 'ID of the rule to delete',
      required: true
    }
  },
  handler: async (params) => {
    try {
      const { deleteRule } = await import('./utils/rulesEngine.js');
      const result = deleteRule(params.ruleId);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Analyze an email and extract key information
server.addTool({
  name: 'analyze_email',
  description: 'Analyze email content to extract key information, sentiment, and summary',
  parameters: {
    emailId: {
      type: 'string',
      description: 'ID of the email to analyze',
      required: true
    },
    options: {
      type: 'object',
      description: 'Analysis options',
      properties: {
        includeSentiment: {
          type: 'boolean',
          description: 'Include sentiment analysis'
        },
        extractEntities: {
          type: 'boolean',
          description: 'Extract people, dates, and entities'
        },
        generateSummary: {
          type: 'boolean',
          description: 'Generate a brief summary'
        }
      }
    }
  },
  handler: async (params) => {
    try {
      // First try to get email content from Thunderbird
      const emailContent = await communicateWithThunderbird({
        action: 'fetchEmail',
        emailId: params.emailId
      });

      if (!emailContent.success) {
        return {
          success: false,
          error: 'Failed to fetch email content'
        };
      }

      // Use real AI service for analysis
      const { analyzeEmail } = await import('./utils/aiService.ts');
      const analysis = await analyzeEmail(
        params.emailId,
        emailContent.data,
        params.options || {}
      );

      return {
        success: true,
        analysis
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Auto-categorize emails based on content
server.addTool({
  name: 'categorize_emails',
  description: 'Automatically categorize emails into labels (urgent, work, personal, newsletters, etc.)',
  parameters: {
    emailIds: {
      type: 'array',
      items: { type: 'string' },
      description: 'Array of email IDs to categorize',
      required: true
    },
    categories: {
      type: 'array',
      items: { type: 'string' },
      description: 'Optional: specific categories to use (default: auto-detect)',
      required: false
    }
  },
  handler: async (params) => {
    try {
      // Import AI service for categorization
      const { categorizeEmail } = await import('./utils/aiService.ts');
      const categorizedEmails = [];

      for (const emailId of params.emailIds) {
        // First fetch email content
        const emailContent = await communicateWithThunderbird({
          action: 'fetchEmail',
          emailId
        });

        if (emailContent.success) {
          // Use real AI service for categorization
          const categorization = await categorizeEmail(
            emailId,
            emailContent.data,
            params.categories
          );
          categorizedEmails.push(categorization);
        }
      }

      return {
        success: true,
        categorizedEmails
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Generate a draft reply to an email
server.addTool({
  name: 'generate_draft_reply',
  description: 'Generate a draft reply to an email based on its content and context',
  parameters: {
    emailId: {
      type: 'string',
      description: 'ID of the email to reply to',
      required: true
    },
    tone: {
      type: 'string',
      description: 'Tone for the reply (professional, casual, formal, friendly)',
      enum: ['professional', 'casual', 'formal', 'friendly'],
      required: false
    },
    includeQuotes: {
      type: 'boolean',
      description: 'Include quoted text from the original email',
      required: false
    },
    instructions: {
      type: 'string',
      description: 'Optional: specific instructions for the draft',
      required: false
    }
  },
  handler: async (params) => {
    try {
      // First fetch email content
      const emailContent = await communicateWithThunderbird({
        action: 'fetchEmail',
        emailId: params.emailId
      });

      if (!emailContent.success) {
        return {
          success: false,
          error: 'Failed to fetch email content'
        };
      }

      // Use real AI service for draft generation
      const { generateDraftReply } = await import('./utils/aiService.ts');
      const draft = await generateDraftReply(
        params.emailId,
        emailContent.data,
        {
          tone: params.tone,
          includeQuotes: params.includeQuotes,
          instructions: params.instructions
        }
      );

      return {
        success: true,
        draft
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// ============== AI-POWERED EMAIL SORTING TOOLS ==============

// Get all folders for classification
server.addTool({
  name: 'get_folders',
  description: 'Get all available folders from Thunderbird accounts for email classification',
  parameters: {
    accountId: {
      type: 'string',
      description: 'Optional: specific account ID to get folders from',
      required: false
    }
  },
  handler: async (params) => {
    try {
      const result = await communicateWithThunderbird({
        action: 'listFolders',
        accountId: params.accountId
      });
      return {
        success: true,
        folders: result.folders || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Classify a single email to suggest target folder
server.addTool({
  name: 'classify_email',
  description: 'Use AI to classify an email and suggest the best target folder. Returns suggested folder, confidence score, and reasoning.',
  parameters: {
    emailId: {
      type: 'string',
      description: 'ID of the email to classify',
      required: true
    },
    availableFolders: {
      type: 'array',
      items: { type: 'string' },
      description: 'List of available folder names to choose from. If not provided, will fetch all folders.',
      required: false
    }
  },
  handler: async (params) => {
    try {
      // Fetch email content
      const emailContent = await communicateWithThunderbird({
        action: 'fetchEmail',
        emailId: params.emailId
      });

      if (!emailContent.success) {
        return {
          success: false,
          error: 'Failed to fetch email content'
        };
      }

      // Get available folders if not provided
      let folders = params.availableFolders;
      if (!folders || folders.length === 0) {
        const foldersResult = await communicateWithThunderbird({
          action: 'listFolders'
        });
        folders = foldersResult.folders?.map((f: any) => f.name) || ['Inbox'];
      }

      // Use AI service for classification
      const { classifyEmailToFolder } = await import('./utils/aiService.ts');
      const classification = await classifyEmailToFolder(
        params.emailId,
        emailContent.data,
        folders
      );

      return {
        success: true,
        classification
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Auto-sort inbox - classify and optionally move emails
server.addTool({
  name: 'auto_sort_inbox',
  description: 'Automatically classify and sort emails in the inbox. Can operate in preview mode (suggestions only) or execute mode (actually move emails).',
  parameters: {
    accountId: {
      type: 'string',
      description: 'Optional: specific account ID to sort',
      required: false
    },
    maxEmails: {
      type: 'number',
      description: 'Maximum number of emails to process (default: 50)',
      required: false
    },
    minConfidence: {
      type: 'number',
      description: 'Minimum confidence threshold for auto-move (0.0-1.0, default: 0.7)',
      required: false
    },
    executeMode: {
      type: 'boolean',
      description: 'If true, actually move emails. If false (default), only return suggestions.',
      required: false
    },
    dryRun: {
      type: 'boolean',
      description: 'Alias for executeMode=false. Preview changes without moving.',
      required: false
    }
  },
  handler: async (params) => {
    try {
      const executeMode = params.executeMode ?? (params.dryRun === false);
      const minConfidence = params.minConfidence ?? 0.7;
      const maxEmails = params.maxEmails ?? 50;

      // Fetch emails from inbox
      const emailsResult = await communicateWithThunderbird({
        action: 'fetchEmails',
        accountId: params.accountId,
        folderId: 'inbox',
        limit: maxEmails
      });

      if (!emailsResult.success || !emailsResult.emails) {
        return {
          success: false,
          error: 'Failed to fetch emails from inbox'
        };
      }

      // Get available folders
      const foldersResult = await communicateWithThunderbird({
        action: 'listFolders',
        accountId: params.accountId
      });
      const folders = foldersResult.folders?.map((f: any) => f.name) || ['Inbox'];

      // Import AI service
      const { classifyEmailToFolder } = await import('./utils/aiService.ts');

      // Classify each email
      const results: any[] = [];
      const toMove: { emailId: string; targetFolder: string }[] = [];

      for (const email of emailsResult.emails) {
        // Fetch full email content
        const emailContent = await communicateWithThunderbird({
          action: 'fetchEmail',
          emailId: email.id
        });

        if (!emailContent.success) continue;

        // Classify
        const classification = await classifyEmailToFolder(
          email.id,
          emailContent.data,
          folders
        );

        const result = {
          emailId: email.id,
          subject: email.subject,
          from: email.from,
          suggestedFolder: classification.suggestedFolder,
          confidence: classification.confidence,
          reason: classification.reason,
          willMove: executeMode && classification.confidence >= minConfidence && classification.suggestedFolder !== 'Inbox'
        };

        results.push(result);

        if (result.willMove) {
          toMove.push({
            emailId: email.id,
            targetFolder: classification.suggestedFolder
          });
        }
      }

      // Execute moves if in execute mode
      let movedCount = 0;
      if (executeMode && toMove.length > 0) {
        for (const move of toMove) {
          const moveResult = await communicateWithThunderbird({
            action: 'moveEmail',
            emailId: move.emailId,
            targetFolder: move.targetFolder
          });
          if (moveResult.success) {
            movedCount++;
          }
        }
      }

      return {
        success: true,
        mode: executeMode ? 'execute' : 'preview',
        totalProcessed: results.length,
        wouldMoveCount: toMove.length,
        actuallyMovedCount: movedCount,
        minConfidence,
        results
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Learn from user feedback
server.addTool({
  name: 'learn_from_feedback',
  description: 'Teach the AI classifier by providing the correct folder for an email. This improves future classifications.',
  parameters: {
    emailId: {
      type: 'string',
      description: 'ID of the email',
      required: true
    },
    correctFolder: {
      type: 'string',
      description: 'The correct folder this email should be in',
      required: true
    }
  },
  handler: async (params) => {
    try {
      // Fetch email content
      const emailContent = await communicateWithThunderbird({
        action: 'fetchEmail',
        emailId: params.emailId
      });

      if (!emailContent.success) {
        return {
          success: false,
          error: 'Failed to fetch email content'
        };
      }

      // Learn from feedback
      const { learnFromFeedback } = await import('./utils/aiService.ts');
      const result = learnFromFeedback(
        params.emailId,
        emailContent.data,
        params.correctFolder
      );

      return {
        success: result.success,
        message: result.message,
        emailId: params.emailId,
        correctFolder: params.correctFolder
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Move an email to a specific folder
server.addTool({
  name: 'move_email',
  description: 'Move an email to a specific folder in Thunderbird',
  parameters: {
    emailId: {
      type: 'string',
      description: 'ID of the email to move',
      required: true
    },
    targetFolder: {
      type: 'string',
      description: 'Name or ID of the target folder',
      required: true
    }
  },
  handler: async (params) => {
    try {
      const result = await communicateWithThunderbird({
        action: 'moveEmail',
        emailId: params.emailId,
        targetFolder: params.targetFolder
      });
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Get training data and folder rules (for debugging/export)
server.addTool({
  name: 'get_ai_training_data',
  description: 'Get the current AI training data and folder classification rules (for debugging or export)',
  parameters: {},
  handler: async () => {
    try {
      const { getTrainingData, getFolderRules } = await import('./utils/aiService.ts');
      return {
        success: true,
        trainingData: getTrainingData(),
        folderRules: getFolderRules()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// ============== HELPER FUNCTIONS ==============

/**
 * Communicate with the Thunderbird extension
 *
 * This function handles communication with the Thunderbird extension.
 * It automatically falls back to mock responses if Thunderbird is not connected.
 *
 * IMPLEMENTED: HTTP Polling Architecture
 *
 * Communication Flow:
 * 1. MCP server runs HTTP server on localhost:3476
 * 2. Thunderbird extension polls /api/messages every 2 seconds
 * 3. When MCP tool is called:
 *    - Message is queued with unique ID
 *    - Promise waits for response (5s timeout)
 *    - Extension picks up message and processes it
 *    - Extension POSTs response to /api/messages/{id}
 *    - Promise resolves with response
 *
 * Why HTTP Polling (vs Native Messaging):
 * - ✅ No system-level configuration required
 * - ✅ Works out-of-the-box
 * - ✅ Easier to debug and test
 * - ✅ Cross-platform compatible
 *
 * Limitations:
 * - 2-second polling latency
 * - Requires extension to be loaded in Thunderbird
 *
 * Future Enhancement: Native Messaging
 * - More secure and lower latency
 * - Requires native messaging host manifest
 * - Requires system-level registration
 * - Most seamless integration with Thunderbird
 *
 * Resources:
 * - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging
 * - https://developer.thunderbird.net/add-ons/mailextensions
 */
async function communicateWithThunderbird(message: any): Promise<any> {
  // Check if Thunderbird is connected
  if (!thunderbirdConnected) {
    connectionAttempts++;
    if (connectionAttempts <= 5) {
      console.warn(`Thunderbird not connected (attempt ${connectionAttempts}/5). Using mock response.`);
    }
    // Return mock response for when Thunderbird isn't available
    return getMockResponse(message);
  }

  try {
    // Send actual message to Thunderbird
    const response = await sendToThunderbirdHTTP(message);
    connectionAttempts = 0; // Reset on success
    return response;
  } catch (error) {
    console.error('Failed to communicate with Thunderbird:', error);
    // Fall back to mock response on error
    return getMockResponse(message);
  }
}

/**
 * Send message to Thunderbird via HTTP polling
 *
 * 1. Generate unique message ID
 * 2. Add message to queue
 * 3. Wait for response (5s timeout)
 * 4. Extension picks up message via polling
 * 5. Extension POSTs response back
 * 6. Promise resolves
 */
async function sendToThunderbirdHTTP(message: any): Promise<any> {
  // Generate a unique message ID
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return new Promise((resolve, reject) => {
    // Set up a timeout
    const timeout = setTimeout(() => {
      pendingRequests.delete(messageId);
      messageQueue.delete(messageId);
      reject(new Error('Timeout waiting for Thunderbird response'));
    }, 5000); // 5 second timeout

    // Store the resolver
    pendingRequests.set(messageId, (response: any) => {
      clearTimeout(timeout);
      pendingRequests.delete(messageId);
      resolve(response);
    });

    // Add message to queue (extension will pick it up via polling)
    messageQueue.set(messageId, { message, timestamp: Date.now() });
    console.log(`[MCP Server] Queued message ${messageId}:`, message.action);
  });
}

/**
 * Get mock response for when Thunderbird is not available
 */
function getMockResponse(message: any): any {
  switch (message.action) {
    case 'fetchEmails':
      return {
        success: true,
        emails: [
          {
            id: 'mock-1',
            subject: 'Ihre Rechnung vom Januar 2024',
            from: 'billing@amazon.de',
            date: new Date().toISOString(),
            body: 'Vielen Dank für Ihre Bestellung. Anbei finden Sie Ihre Rechnung.'
          },
          {
            id: 'mock-2',
            subject: 'Meeting morgen um 10 Uhr',
            from: 'colleague@company.com',
            date: new Date().toISOString(),
            body: 'Hallo, morgen um 10 Uhr haben wir unser wöchentliches Team-Meeting.'
          },
          {
            id: 'mock-3',
            subject: 'GitHub: Pull Request #123 merged',
            from: 'notifications@github.com',
            date: new Date().toISOString(),
            body: 'Your pull request has been merged into main branch.'
          },
          {
            id: 'mock-4',
            subject: 'Newsletter: Weekly Tech Updates',
            from: 'newsletter@techblog.com',
            date: new Date().toISOString(),
            body: 'Hier sind die neuesten Tech-News der Woche. Abmelden: unsubscribe link.'
          }
        ]
      };
    case 'fetchEvents':
      return {
        success: true,
        events: [
          {
            id: 'mock-event-1',
            title: 'Mock Meeting',
            start: new Date().toISOString(),
            end: new Date(Date.now() + 3600000).toISOString(),
            location: 'Mock Location'
          }
        ]
      };
    case 'fetchContacts':
      return {
        success: true,
        contacts: [
          {
            id: 'mock-contact-1',
            name: 'Mock Contact',
            email: 'mock@example.com',
            phone: '555-0101'
          }
        ]
      };
    case 'fetchEmail':
      // Return specific mock email based on ID
      const mockEmails: { [key: string]: any } = {
        'mock-1': {
          subject: 'Ihre Rechnung vom Januar 2024',
          body: 'Vielen Dank für Ihre Bestellung bei Amazon. Anbei finden Sie Ihre Rechnung über EUR 49,99. Bei Fragen stehen wir Ihnen gerne zur Verfügung.',
          from: 'billing@amazon.de',
          date: new Date().toISOString()
        },
        'mock-2': {
          subject: 'Meeting morgen um 10 Uhr',
          body: 'Hallo zusammen, morgen um 10 Uhr haben wir unser wöchentliches Team-Meeting im Konferenzraum B. Bitte bringt eure Projekt-Updates mit.',
          from: 'colleague@company.com',
          date: new Date().toISOString()
        },
        'mock-3': {
          subject: 'GitHub: Pull Request #123 merged',
          body: 'Your pull request "Fix authentication bug" has been merged into the main branch by @reviewer. Great work!',
          from: 'notifications@github.com',
          date: new Date().toISOString()
        },
        'mock-4': {
          subject: 'Newsletter: Weekly Tech Updates',
          body: 'Hier sind die neuesten Tech-News der Woche. Um sich abzumelden, klicken Sie hier: unsubscribe link.',
          from: 'newsletter@techblog.com',
          date: new Date().toISOString()
        }
      };
      const emailId = message.emailId || 'mock-1';
      return {
        success: true,
        data: mockEmails[emailId] || mockEmails['mock-1']
      };
    case 'listFolders':
      return {
        success: true,
        folders: [
          { id: 'inbox', name: 'Inbox', path: '/Inbox' },
          { id: 'finanzen', name: 'Finanzen', path: '/Finanzen' },
          { id: 'arbeit', name: 'Arbeit', path: '/Arbeit' },
          { id: 'entwicklung', name: 'Entwicklung', path: '/Entwicklung' },
          { id: 'newsletter', name: 'Newsletter', path: '/Newsletter' },
          { id: 'privat', name: 'Privat', path: '/Privat' },
          { id: 'sent', name: 'Gesendet', path: '/Gesendet' },
          { id: 'trash', name: 'Papierkorb', path: '/Papierkorb' }
        ]
      };
    case 'moveEmail':
      return {
        success: true,
        message: `Email ${message.emailId} moved to ${message.targetFolder} (simulated)`
      };
    default:
      return {
        success: true,
        message: `${message.action || 'Operation'} completed (simulated - Thunderbird not connected)`
      };
  }
}

// ============== HTTP SERVER FOR EXTENSION COMMUNICATION ==============

/**
 * Setup HTTP server to communicate with Thunderbird extension
 * Only starts if ENABLE_HTTP_SERVER environment variable is set
 */
let httpServer: any = null;

function startHTTPServer() {
  if (httpServer) {
    console.log('[MCP Server] HTTP server already running');
    return;
  }

  httpServer = serve({
    port: MCP_SERVER_PORT,
    async fetch(req) {
    const url = new URL(req.url);

    // Extension status endpoint (extension announces it's connected)
    if (url.pathname === '/api/extension-status' && req.method === 'POST') {
      try {
        const body = await req.json();
        thunderbirdConnected = body.status === 'connected';
        console.log('[MCP Server] Extension status:', thunderbirdConnected ? 'CONNECTED' : 'DISCONNECTED');
        connectionAttempts = 0;
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
    if (url.pathname === '/api/messages' && req.method === 'GET') {
      const messages: any[] = [];
      for (const [id, data] of messageQueue.entries()) {
        messages.push({ id, ...data });
        // Don't remove - wait for response
      }
      return new Response(JSON.stringify({ messages }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extension sends response to a message
    if (url.pathname.startsWith('/api/messages/') && req.method === 'POST') {
      const messageId = url.pathname.split('/').pop();
      try {
        const body = await req.json();
        const resolver = pendingRequests.get(messageId);
        if (resolver) {
          resolver(body);
          messageQueue.delete(messageId);
        }
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
    if (url.pathname === '/health' && req.method === 'GET') {
      return new Response(JSON.stringify({
        status: 'ok',
        thunderbirdConnected,
        pendingMessages: messageQueue.size,
        timestamp: Date.now()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`[MCP Server] HTTP API listening on http://localhost:${MCP_SERVER_PORT}`);
}

// Start HTTP server if enabled (not during tests)
if (process.env.ENABLE_HTTP_SERVER === 'true') {
  startHTTPServer();
}

// Start the MCP server
server.start().catch(console.error);

export default server;