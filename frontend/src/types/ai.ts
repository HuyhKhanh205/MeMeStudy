/** Body của POST /ai/explain. Server tự lấy câu hỏi + đáp án đúng, app chỉ gửi mã. */
export interface AiExplainRequest {
  questionId: number;
  /** null khi học sinh bỏ trống câu đó. */
  selectedChoiceId: number | null;
}

/**
 * Nguồn của lời giải:
 * - `ai`: AI vừa giải thích (backend có GOOGLE_API_KEY → Gemini, hoặc ANTHROPIC_API_KEY → Claude).
 * - `fallback`: backend chưa bật AI / AI lỗi → lời giải có sẵn trong database.
 * - `mock`: chế độ EXPO_PUBLIC_USE_MOCK=true, câu trả lời mẫu tạo ở app.
 */
export type AiExplainSource = 'ai' | 'fallback' | 'mock';

/** Nhà cung cấp AI backend đang dùng (chọn theo API key đặt ở backend). */
export type AiProvider = 'gemini' | 'claude';

export interface AiExplainResult {
  explanation: string;
  source: AiExplainSource;
  /** Chỉ có khi source = 'ai'. */
  provider?: AiProvider;
  /** Ghi chú cho người dùng khi không phải câu trả lời của AI. */
  notice?: string;
}
