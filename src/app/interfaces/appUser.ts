export interface AppUser {
  uid: string;
  email: string;
  role: 'admin' | 'user' | string;
}