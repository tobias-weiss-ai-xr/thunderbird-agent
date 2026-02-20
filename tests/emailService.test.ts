// tests/emailService.test.ts
// Unit tests for emailService.ts

import { fetchEmails, sendEmail, deleteEmail, batchDeleteEmails, batchArchiveEmails } from '../src/modules/emailService';

describe('Email Service', () => {
  // Mock Thunderbird API
  beforeEach(() => {
    globalThis.browser = {
      accounts: {
        list: jest.fn().mockResolvedValue([{ id: 'account1' }])
      },
      folders: {
        list: jest.fn().mockResolvedValue([{ id: 'folder1' }])
      },
      messages: {
        list: jest.fn().mockResolvedValue([
          { id: '1', subject: 'Test Email 1', author: 'sender@example.com', date: '2024-01-01', body: 'Test body' }
        ]),
        createDraft: jest.fn().mockResolvedValue({ id: 'draft1' }),
        send: jest.fn().mockResolvedValue(undefined),
        remove: jest.fn().mockResolvedValue(undefined)
      }
    } as any;
  });

  test('fetchEmails should return emails', async () => {
    const emails = await fetchEmails();
    expect(emails.length).toBe(1);
    expect(emails[0].subject).toBe('Test Email 1');
  });

  test('sendEmail should send an email', async () => {
    const result = await sendEmail('recipient@example.com', 'Test Subject', 'Test Body');
    expect(result.success).toBe(true);
    expect(browser.messages.createDraft).toHaveBeenCalled();
  });

  test('deleteEmail should delete an email', async () => {
    const result = await deleteEmail('1');
    expect(result.success).toBe(true);
    expect(browser.messages.remove).toHaveBeenCalledWith('1');
  });

  test('batchDeleteEmails should delete multiple emails', async () => {
    const result = await batchDeleteEmails(['1', '2']);
    expect(result.success).toBe(true);
    expect(browser.messages.remove).toHaveBeenCalledWith('1');
    expect(browser.messages.remove).toHaveBeenCalledWith('2');
  });

  test('batchArchiveEmails should archive multiple emails', async () => {
    browser.messages.get = jest.fn().mockResolvedValue({ folder: { id: 'archive' } });
    browser.messages.move = jest.fn().mockResolvedValue(undefined);
    
    const result = await batchArchiveEmails(['1', '2']);
    expect(result.success).toBe(true);
    expect(browser.messages.move).toHaveBeenCalledWith(['1'], 'archive');
    expect(browser.messages.move).toHaveBeenCalledWith(['2'], 'archive');
  });
});