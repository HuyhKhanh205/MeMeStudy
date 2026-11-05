import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';
import { config } from '../utils/config';
import { http } from './http';
import { mockApi } from './mock';

export const authService = {
  login(body: LoginRequest): Promise<AuthResponse> {
    return config.useMock ? mockApi.login(body) : http.post<AuthResponse>('/auth/login', body);
  },
  /** Backend chưa chốt endpoint đăng ký — tạm dùng POST /auth/register. */
  register(body: RegisterRequest): Promise<AuthResponse> {
    return config.useMock
      ? mockApi.register(body)
      : http.post<AuthResponse>('/auth/register', body);
  },
  me(): Promise<User> {
    return config.useMock ? mockApi.me() : http.get<User>('/auth/me');
  },
};
