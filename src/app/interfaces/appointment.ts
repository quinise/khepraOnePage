export interface Appointment {
  id?:number,
  userId:string,
  type:string,
  name:string,
  email:string,
  phoneNumber:number,
  date:Date,
  isVirtual:boolean
}
