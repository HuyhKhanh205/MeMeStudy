export type Role = 'USER' | 'TEACHER' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: Role;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  role?: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}
