import type { AiExplainRequest, AiExplainResult } from '../types';
import { config } from '../utils/config';
import { http } from './http';
import { mockApi } from './mock';

/** Gọi AI có thể mất vài chục giây → timeout riêng dài hơn mặc định (15s). */
const AI_TIMEOUT_MS = 45000;

/** AI basic: Cú MeMe giải thích vì sao học sinh chọn sai (backend gọi Claude, key chỉ ở backend). */
export const aiService = {
  explain(body: AiExplainRequest): Promise<AiExplainResult> {
    return config.useMock
      ? mockApi.aiExplain(body)
      : http.post<AiExplainResult>('/ai/explain', body, { timeout: AI_TIMEOUT_MS });
  },
};
