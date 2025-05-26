export interface Event {
  id?: number;
  eventName: string;
  eventType: string;
  clientName?: string | null;
  startDate: Date;
  startTime: Date;
  endDate: Date;
  endTime: Date;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: number | null;
  description: string;
  isVirtual: boolean;
}