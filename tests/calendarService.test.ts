// tests/calendarService.test.ts
// Unit tests for calendarService.ts

import { fetchEvents, createEvent, deleteEvent } from '../src/modules/calendarService';

describe('Calendar Service', () => {
  // Mock Thunderbird API
  beforeEach(() => {
    globalThis.browser = {
      calendars: {
        list: jest.fn().mockResolvedValue([{ id: 'calendar1' }])
      },
      calendar: {
        events: {
          list: jest.fn().mockResolvedValue([
            { id: '1', title: 'Test Event', start: '2024-01-01', end: '2024-01-02', location: 'Online' }
          ]),
          create: jest.fn().mockResolvedValue({ id: 'event1' }),
          remove: jest.fn().mockResolvedValue(undefined)
        }
      }
    } as any;
  });

  test('fetchEvents should return events', async () => {
    const events = await fetchEvents();
    expect(events.length).toBe(1);
    expect(events[0].title).toBe('Test Event');
  });

  test('createEvent should create an event', async () => {
    const result = await createEvent('Test Event', '2024-01-01', '2024-01-02', 'Online');
    expect(result.success).toBe(true);
    expect(browser.calendar.events.create).toHaveBeenCalled();
  });

  test('deleteEvent should delete an event', async () => {
    const result = await deleteEvent('1');
    expect(result.success).toBe(true);
    expect(browser.calendar.events.remove).toHaveBeenCalledWith('1');
  });
});