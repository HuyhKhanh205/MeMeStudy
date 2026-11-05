/** Envelope thành công của backend: `{ data: ... }`. */
export interface ApiResponse<T> {
  data: T;
}

/** Body lỗi của backend: `{ message, details? }`. */
export interface ApiErrorBody {
  message?: string;
  details?: unknown;
}

/** Lỗi đã chuẩn hóa mà mọi service ném ra. `status` = 0 khi lỗi mạng. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
