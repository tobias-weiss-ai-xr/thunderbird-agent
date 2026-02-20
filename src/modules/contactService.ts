// src/modules/contactService.ts
// Module for Thunderbird contact management
//
// NOTE: These functions use the browser API which is only available in the
// context of a Thunderbird WebExtension. When called from the MCP server
// (src/index.ts), they will fail unless the communicateWithThunderbird()
// function is properly implemented to proxy requests to the Thunderbird
// extension.
//
// Current status: PLACEHOLDER IMPLEMENTATION
// These modules are for reference/documentation purposes only. The MCP server
// tools in src/index.ts use communicateWithThunderbird() which currently
// returns mock responses.

// Fetch contacts from Thunderbird
export const fetchContacts = async () => {
  try {
    const addressBooks = await browser.addressBooks.list();
    const contacts = [];

    for (const addressBook of addressBooks) {
      const addressBookContacts = await browser.contacts.list(addressBook.id);
      for (const contact of addressBookContacts) {
        contacts.push({
          id: contact.id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone
        });
      }
    }
    return contacts;
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    throw new Error('Failed to fetch contacts');
  }
};

// Create a contact in Thunderbird
export const createContact = async (name: string, email: string, phone?: string) => {
  try {
    const contact = await browser.contacts.create({
      name,
      email,
      phone
    });
    return { success: true, message: 'Contact created successfully', contact };
  } catch (error) {
    console.error('Failed to create contact:', error);
    throw new Error('Failed to create contact');
  }
};

// Delete a contact from Thunderbird
export const deleteContact = async (contactId: string) => {
  try {
    await browser.contacts.remove(contactId);
    return { success: true, message: 'Contact deleted successfully' };
  } catch (error) {
    console.error('Failed to delete contact:', error);
    throw new Error('Failed to delete contact');
  }
};