export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  role: 'admin' | 'user' | string;
}