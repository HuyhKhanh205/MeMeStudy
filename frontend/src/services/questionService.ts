import type { Question } from '../types';
import { config } from '../utils/config';
import { http } from './http';
import { mockApi } from './mock';

/** API quản trị câu hỏi (role ADMIN). Backend chưa chốt endpoint — tạm dùng GET /questions. */
export const questionService = {
  list(): Promise<Question[]> {
    return config.useMock ? mockApi.listQuestions() : http.get<Question[]>('/questions');
  },
};
