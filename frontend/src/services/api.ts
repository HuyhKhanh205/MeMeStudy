import { API_URL } from '../utils/constants';
import type { ApiResponse } from '../types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.message ?? response.statusText, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json()) as ApiResponse<T>;
  return body.data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};
