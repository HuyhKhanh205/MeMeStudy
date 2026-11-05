import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { ApiError, type ApiErrorBody } from '../types/api';
import { config } from '../utils/config';
import { tokenStorage } from '../utils/tokenStorage';

const client = axios.create({
  baseURL: config.apiUrl,
  timeout: config.requestTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(async (req) => {
  const token = await tokenStorage.get();
  if (token) req.headers.set('Authorization', `Bearer ${token}`);
  return req;
});

let unauthorizedHandler: (() => void) | null = null;

/** AuthProvider đăng ký hàm này để tự đăng xuất khi token hết hạn (401). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function fallbackMessage(status: number): string {
  if (status === 401) return 'Phiên đăng nhập đã hết hạn.';
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
  if (status === 404) return 'Không tìm thấy dữ liệu.';
  if (status >= 500) return 'Máy chủ gặp lỗi, vui lòng thử lại sau.';
  return 'Yêu cầu không hợp lệ.';
}

/** Chuẩn hóa mọi lỗi (axios, mạng, lỗi JS) thành ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      const message =
        error.code === AxiosError.ECONNABORTED
          ? 'Máy chủ phản hồi quá lâu, vui lòng thử lại.'
          : 'Không kết nối được máy chủ. Kiểm tra mạng hoặc EXPO_PUBLIC_API_URL.';
      return new ApiError(message, 0);
    }
    const { status, data } = error.response;
    return new ApiError(data?.message || fallbackMessage(status), status, data?.details);
  }
  return new ApiError(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.', 0);
}

client.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    const apiError = toApiError(error);
    if (apiError.status === 401) unauthorizedHandler?.();
    return Promise.reject(apiError);
  },
);

/** Bóc envelope `{ data }` nếu backend có bọc; nếu không thì trả nguyên body. */
function unwrap<T>(body: unknown): T {
  if (body && typeof body === 'object' && !Array.isArray(body) && 'data' in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

async function request<T>(cfg: AxiosRequestConfig): Promise<T> {
  const res = await client.request(cfg);
  return unwrap<T>(res.data);
}

export const http = {
  get: <T>(url: string, cfg?: AxiosRequestConfig) => request<T>({ ...cfg, method: 'GET', url }),
  post: <T>(url: string, data?: unknown, cfg?: AxiosRequestConfig) =>
    request<T>({ ...cfg, method: 'POST', url, data }),
  put: <T>(url: string, data?: unknown, cfg?: AxiosRequestConfig) =>
    request<T>({ ...cfg, method: 'PUT', url, data }),
  delete: <T = void>(url: string, cfg?: AxiosRequestConfig) =>
    request<T>({ ...cfg, method: 'DELETE', url }),
};

/** Chuỗi lỗi hiển thị cho người dùng. */
export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}
