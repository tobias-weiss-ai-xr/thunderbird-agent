// src/modules/calendarService.ts
// Module for Thunderbird calendar management
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

// Fetch calendar events from Thunderbird
export const fetchEvents = async () => {
  try {
    const calendars = await browser.calendars.list();
    const events = [];

    for (const calendar of calendars) {
      const calendarEvents = await browser.calendar.events.list(calendar.id);
      for (const event of calendarEvents) {
        events.push({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          location: event.location
        });
      }
    }
    return events;
  } catch (error) {
    console.error('Failed to fetch events:', error);
    throw new Error('Failed to fetch events');
  }
};

// Create a calendar event in Thunderbird
export const createEvent = async (title: string, start: string, end: string, location?: string) => {
  try {
    const event = await browser.calendar.events.create({
      title,
      start,
      end,
      location
    });
    return { success: true, message: 'Event created successfully', event };
  } catch (error) {
    console.error('Failed to create event:', error);
    throw new Error('Failed to create event');
  }
};

// Delete a calendar event from Thunderbird
export const deleteEvent = async (eventId: string) => {
  try {
    await browser.calendar.events.remove(eventId);
    return { success: true, message: 'Event deleted successfully' };
  } catch (error) {
    console.error('Failed to delete event:', error);
    throw new Error('Failed to delete event');
  }
};