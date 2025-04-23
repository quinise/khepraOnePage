export interface Event {
  id?: number;
  name: string;
  clientName?: string;
  startDate: Date;
  endDate: Date;
  location: string;
  description: string;
  isVirtual: boolean;
}