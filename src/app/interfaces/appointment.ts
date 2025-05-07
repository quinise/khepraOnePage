export interface Appointment {
  id?:number,
  userId:string,
  type:string,
  name:string,
  email:string,
  phoneNumber:string,
  date:Date,
  isVirtual:boolean
}
