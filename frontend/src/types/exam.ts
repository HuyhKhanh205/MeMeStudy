export interface Choice {
  id: number;
  content: string;
}

export interface Question {
  id: number;
  content: string;
  choices: Choice[];
  /** Chỉ có trong API admin, không trả về khi user làm bài. */
  correctChoiceId?: number;
}

/** Một vòng thi (bộ đề). */
export interface Round {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  questionCount: number;
  isOpen: boolean;
}

export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED';

/** Một lượt làm bài của user cho một vòng thi. */
export interface Attempt {
  id: number;
  roundId: number;
  roundTitle: string;
  status: AttemptStatus;
  startedAt: string;
  /** Hạn nộp (ISO) = startedAt + durationMinutes. */
  expiresAt: string;
  questions: Question[];
}

export interface SubmitAnswer {
  questionId: number;
  choiceId: number | null;
}

export interface SubmitRequest {
  answers: SubmitAnswer[];
}

/** Đúng/sai của từng câu, theo thứ tự câu trong lượt thi. */
export interface QuestionReview {
  questionId: number;
  correct: boolean;
}

export interface AttemptResult {
  attemptId: number;
  roundId: number;
  roundTitle: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  submittedAt: string;
  /** Tuỳ chọn: backend trả về thì màn kết quả hiện mục "Câu cần ôn lại". */
  review?: QuestionReview[];
}
