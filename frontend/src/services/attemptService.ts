import type { Attempt, AttemptResult, SubmitRequest } from '../types';
import { config } from '../utils/config';
import { http } from './http';
import { mockApi } from './mock';

export const attemptService = {
  /** Bắt đầu một lượt thi mới cho vòng `roundId`. */
  start(roundId: number): Promise<Attempt> {
    return config.useMock
      ? mockApi.startAttempt(roundId)
      : http.post<Attempt>(`/rounds/${roundId}/attempts`);
  },
  submit(attemptId: number, body: SubmitRequest): Promise<AttemptResult> {
    return config.useMock
      ? mockApi.submitAttempt(attemptId, body)
      : http.post<AttemptResult>(`/attempts/${attemptId}/submit`, body);
  },
  /** Lịch sử kết quả của user hiện tại. Backend chưa chốt endpoint — tạm dùng GET /attempts. */
  myResults(): Promise<AttemptResult[]> {
    return config.useMock ? mockApi.myResults() : http.get<AttemptResult[]>('/attempts');
  },
};
