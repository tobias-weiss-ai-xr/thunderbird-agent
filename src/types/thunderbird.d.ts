// src/types/thunderbird.d.ts
// Type definitions for Thunderbird WebExtension API

declare namespace Browser {
  interface EmailAccount {
    id: string;
    name: string;
    type: 'imap' | 'pop3' | 'nntp';
    identities: EmailIdentity[];
  }

  interface EmailIdentity {
    id: string;
    email: string;
    label: string;
  }

  interface Message {
    id: string;
    folderId: string;
    subject: string;
    author: string;
    date?: Date | string;
    body?: string;
    read: boolean;
    flagged: boolean;
  }

  interface Folder {
    id: string;
    accountId: string;
    name: string;
    type: string;
  }

  interface AddressBook {
    id: string;
    name: string;
    type: string;
  }

  interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
  }

  interface Calendar {
    id: string;
    name: string;
    type: string;
  }

  interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    location?: string;
    description?: string;
  }

  namespace accounts {
    export function list(): Promise<EmailAccount[]>;
    export function get(accountId: string): Promise<EmailAccount>;
    export function getDefaultAccount(): Promise<EmailAccount>;
  }

  namespace folders {
    export function list(accountId: string): Promise<Folder[]>;
    export function get(folderId: string): Promise<Folder>;
  }

  namespace messages {
    export function list(folderId: string): Promise<Message[]>;
    export function get(messageId: string): Promise<Message>;
    export function getFull(messageId: string): Promise<Message>;
    export function createDraft(options: { to: string[]; subject: string; body: string }): Promise<Message>;
    export function send(draftId: string): Promise<void>;
    export function remove(messageId: string): Promise<void>;
    export function move(messageIds: string[], targetFolderId: string): Promise<void>;
    export function update(messageId: string, properties: Partial<Message>): Promise<void>;
  }

  namespace addressBooks {
    export function list(): Promise<AddressBook[]>;
    export function get(addressBookId: string): Promise<AddressBook>;
  }

  namespace contacts {
    export function list(addressBookId: string): Promise<Contact[]>;
    export function create(contact: Partial<Contact>): Promise<Contact>;
    export function update(contactId: string, properties: Partial<Contact>): Promise<Contact>;
    export function remove(contactId: string): Promise<void>;
    export function search(query: string, addressBookId?: string): Promise<Contact[]>;
  }

  namespace calendars {
    export function list(): Promise<Calendar[]>;
    export function get(calendarId: string): Promise<Calendar>;
    namespace events {
      export function list(calendarId: string): Promise<CalendarEvent[]>;
      export function get(eventId: string): Promise<CalendarEvent>;
      export function create(event: Partial<CalendarEvent>, calendarId?: string): Promise<CalendarEvent>;
      export function update(eventId: string, properties: Partial<CalendarEvent>): Promise<CalendarEvent>;
      export function remove(eventId: string): Promise<void>;
    }
  }

  namespace runtime {
    export function sendNativeMessage(application: string, message: any): Promise<any>;
    interface RuntimeMessageEvent {
      addListener(listener: (message: any, sender: any, sendResponse: (response?: any) => void) => void | boolean): void;
      removeListener(listener: (message: any, sender: any, sendResponse: (response?: any) => void) => void): void;
    }
    export const onMessage: RuntimeMessageEvent;
    export const onMessageExternal: RuntimeMessageEvent;
  }
}

// Global browser variable
declare const browser: typeof Browser;
declare const chrome: typeof Browser;

export default Browser;