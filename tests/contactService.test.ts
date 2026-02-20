// tests/contactService.test.ts
// Unit tests for contactService.ts

import { fetchContacts, createContact, deleteContact } from '../src/modules/contactService';

describe('Contact Service', () => {
  // Mock Thunderbird API
  beforeEach(() => {
    globalThis.browser = {
      addressBooks: {
        list: jest.fn().mockResolvedValue([{ id: 'addressBook1' }])
      },
      contacts: {
        list: jest.fn().mockResolvedValue([
          { id: '1', name: 'Test Contact', email: 'contact@example.com', phone: '1234567890' }
        ]),
        create: jest.fn().mockResolvedValue({ id: 'contact1' }),
        remove: jest.fn().mockResolvedValue(undefined)
      }
    } as any;
  });

  test('fetchContacts should return contacts', async () => {
    const contacts = await fetchContacts();
    expect(contacts.length).toBe(1);
    expect(contacts[0].name).toBe('Test Contact');
  });

  test('createContact should create a contact', async () => {
    const result = await createContact('New Contact', 'new@example.com', '9876543210');
    expect(result.success).toBe(true);
    expect(browser.contacts.create).toHaveBeenCalled();
  });

  test('deleteContact should delete a contact', async () => {
    const result = await deleteContact('1');
    expect(result.success).toBe(true);
    expect(browser.contacts.remove).toHaveBeenCalledWith('1');
  });
});