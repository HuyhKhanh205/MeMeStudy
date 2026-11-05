import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { attemptService } from '../services/attemptService';
import { toApiError } from '../services/http';
import { questionService } from '../services/questionService';
import { roundService } from '../services/roundService';
import type { Attempt, AttemptResult, Question, Round, SubmitRequest } from '../types';

/** Lỗi lưu trong Redux phải là object thường (serializable), không phải instance ApiError. */
export interface ApiErrorShape {
  status: number;
  message: string;
}

/**
 * Bọc một hàm service (axios thật hoặc mock khi EXPO_PUBLIC_USE_MOCK=true)
 * thành kết quả { data } | { error } mà RTK Query yêu cầu.
 */
async function run<T>(fn: () => Promise<T>): Promise<{ data: T } | { error: ApiErrorShape }> {
  try {
    return { data: await fn() };
  } catch (e) {
    const err = toApiError(e);
    return { error: { status: err.status, message: err.message } };
  }
}

/**
 * RTK Query API slice.
 * Không dùng baseQuery riêng: mọi request vẫn đi qua src/services (axios + interceptor Bearer
 * + chuẩn hoá lỗi), RTK Query lo phần cache, loading, refetch và invalidation.
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery<ApiErrorShape>(),
  tagTypes: ['Round', 'Result', 'Question'],
  // Quay lại màn hình sau 30s thì tự tải lại dữ liệu.
  refetchOnMountOrArgChange: 30,
  endpoints: (build) => ({
    getRounds: build.query<Round[], void>({
      queryFn: () => run(roundService.list),
      providesTags: (rounds) => [
        { type: 'Round', id: 'LIST' },
        ...(rounds ?? []).map((r) => ({ type: 'Round' as const, id: r.id })),
      ],
    }),

    getMyResults: build.query<AttemptResult[], void>({
      queryFn: () => run(attemptService.myResults),
      providesTags: [{ type: 'Result', id: 'LIST' }],
    }),

    getQuestions: build.query<Question[], void>({
      queryFn: () => run(questionService.list),
      providesTags: [{ type: 'Question', id: 'LIST' }],
    }),

    /** Tạo lượt thi mới — là mutation vì mỗi lần gọi tạo một attempt trên server. */
    startAttempt: build.mutation<Attempt, number>({
      queryFn: (roundId) => run(() => attemptService.start(roundId)),
    }),

    submitAttempt: build.mutation<AttemptResult, { attemptId: number; body: SubmitRequest }>({
      queryFn: ({ attemptId, body }) => run(() => attemptService.submit(attemptId, body)),
      // Nộp bài xong thì màn Lịch sử tự tải lại.
      invalidatesTags: [{ type: 'Result', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetRoundsQuery,
  useGetMyResultsQuery,
  useGetQuestionsQuery,
  useStartAttemptMutation,
  useSubmitAttemptMutation,
} = api;

/** Lấy chuỗi lỗi hiển thị từ `error` của hook RTK Query. */
export function queryErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Đã xảy ra lỗi không xác định.';
}
