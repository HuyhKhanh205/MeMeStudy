import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '../services/authService';
import { setUnauthorizedHandler } from '../services/http';
import { useAppDispatch } from '../store';
import { api } from '../store/api';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';
import { tokenStorage } from '../utils/tokenStorage';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  const dispatch = useAppDispatch();

  const clearSession = useCallback(async () => {
    await tokenStorage.clear();
    // Xoá cache RTK Query để tài khoản đăng nhập sau không thấy dữ liệu của tài khoản trước.
    dispatch(api.util.resetApiState());
    setUser(null);
    setStatus('unauthenticated');
  }, [dispatch]);

  const startSession = useCallback(async ({ token, user: nextUser }: AuthResponse) => {
    await tokenStorage.set(token);
    setUser(nextUser);
    setStatus('authenticated');
  }, []);

  // Khôi phục phiên từ token đã lưu khi mở app.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await tokenStorage.get();
      if (!token) {
        if (!cancelled) setStatus('unauthenticated');
        return;
      }
      try {
        const me = await authService.me();
        if (!cancelled) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        if (!cancelled) await clearSession();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  // Token hết hạn ở bất kỳ request nào -> về màn đăng nhập.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      login: async (body) => startSession(await authService.login(body)),
      register: async (body) => startSession(await authService.register(body)),
      logout: clearSession,
    }),
    [status, user, startSession, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  return ctx;
}
