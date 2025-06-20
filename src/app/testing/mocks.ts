import { Appointment } from 'src/app/interfaces/appointment';
import { Event } from 'src/app/interfaces/event';

export function createMockAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 1,
    userId: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    phoneNumber: '555-555-5555',
    type: 'READING',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    isVirtual: true,
    streetAddress: '123 Main St',
    city: 'Seattle',
    state: 'WA',
    zipCode: 98101,
    createdByAdmin: true,
    ...overrides
  };
}

export function createMockEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 1,
    eventName: 'Mock Event',
    eventType: 'WORKSHOP',
    description: 'Test event description',
    startDate: new Date(),
    startTime: new Date(),
    endDate: new Date(),
    endTime: new Date(),
    isVirtual: false,
    streetAddress: '456 Event Blvd',
    city: 'Seattle',
    state: 'WA',
    zipCode: 98101,
    ...overrides
  };
}