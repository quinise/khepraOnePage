export interface Appointment {
  id?:number;
  userId:string;
  type:string;
  name:string;
  email:string;
  phoneNumber:string;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: number | null;
  date:Date;
  startTime: Date;
  endTime: Date;
  isVirtual:boolean;
  createdByAdmin: boolean;
}
