// types/User.ts
export interface UserPayload {
  id: string;
  name: string;
  role: 'user' | 'admin';
}