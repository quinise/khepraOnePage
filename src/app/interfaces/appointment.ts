export interface Appointment {
  id?:number;
  userId:string;
  type:string;
  name:string;
  email:string;
  phoneNumber:string;
  date:Date;
  startTime: Date;
  endTime: Date;
  city?: string;
  isVirtual:boolean;
  createdByAdmin: boolean;
}
