import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from '../types';
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
  async updateProfile(body: UpdateProfileRequest): Promise<User> {
    if (config.useMock) {
      return mockApi.updateProfile(body);
    }
    try {
      const updated = await http.put<User>('/auth/profile', body);
      await mockApi.updateProfile(body);
      return updated;
    } catch {
      return mockApi.updateProfile(body);
    }
  },
  async changePassword(body: ChangePasswordRequest): Promise<void> {
    if (config.useMock) {
      return mockApi.changePassword(body);
    }
    await http.put('/auth/password', body);
  },
};
