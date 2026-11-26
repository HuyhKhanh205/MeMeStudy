/** Tải đề lên (giáo viên): Gemini đọc file → bản nháp → giáo viên xem lại → tạo bài kiểm tra. */

/** File gửi lên backend dưới dạng base64 (POST /exams/import). */
export interface ExamImportRequest {
  fileName: string;
  mimeType: string;
  dataBase64: string;
}

/** Một câu hỏi trong bản nháp. `answerFromDocument = false` nghĩa là Gemini tự giải — cần kiểm tra. */
export interface DraftQuestion {
  content: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  answerFromDocument?: boolean;
}

export interface ExamDraft {
  title: string;
  questions: DraftQuestion[];
  warnings: string[];
  provider?: 'gemini' | 'mock';
}

/** POST /exams */
export interface CreateExamRequest {
  roundId: number;
  title: string;
  durationMinutes: number;
  deadline?: string;
  questions: DraftQuestion[];
}

export interface CreatedExam {
  examId: number;
  assignmentId: number;
  roundId: number;
  title: string;
  questionCount: number;
  durationMinutes: number;
  deadline: string;
}

/** GET /exams — `source = 'TEACHER'` là đề giáo viên tải lên (xoá được). */
export interface ExamSummary {
  id: number;
  roundId: number;
  roundTitle: string;
  order: number;
  title: string;
  questionCount: number;
  durationMinutes: number;
  deadline?: string | null;
  source: 'ROUND' | 'TEACHER';
}
