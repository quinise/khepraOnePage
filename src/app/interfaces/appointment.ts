export interface Appointment {
  id?:number,
  type:string,
  name:string,
  email:string,
  phone_number:number,
  date:Date,
  isVirtual:boolean
}
