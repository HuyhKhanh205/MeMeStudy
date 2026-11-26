import { ApiError } from '../types/api';
import type {
  CreateExamRequest,
  CreatedExam,
  ExamDraft,
  ExamImportRequest,
  ExamSummary,
} from '../types';
import { config } from '../utils/config';
import { http } from './http';
import { mockExams, mockQuestionsData, mockRounds, teacherAssignments } from './mock/data';

/** Gemini đọc cả file PDF có thể mất tới ~1 phút → timeout riêng. */
const IMPORT_TIMEOUT_MS = 120_000;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Dữ liệu mẫu cho chế độ mock (không gọi Gemini). */
const MOCK_DRAFT: ExamDraft = {
  title: 'Đề mẫu — Unit 6: Our School',
  provider: 'mock',
  warnings: ['Chế độ mock: đây là bản nháp mẫu, chưa gọi Gemini thật.'],
  questions: [
    {
      content: 'Where do you have lunch at school?',
      choices: ['In the canteen', 'In the library', 'In the gym', 'In the music room'],
      correctIndex: 0,
      explanation: '"Canteen" là căng-tin, nơi học sinh ăn trưa ở trường.',
      answerFromDocument: true,
    },
    {
      content: 'Choose the odd one out:',
      choices: ['ruler', 'pencil', 'banana', 'eraser'],
      correctIndex: 2,
      explanation: '"Banana" là trái cây, các từ còn lại là đồ dùng học tập.',
      answerFromDocument: true,
    },
    {
      content: 'We ____ English on Monday and Wednesday.',
      choices: ['has', 'have', 'having'],
      correctIndex: 1,
      explanation: 'Chủ ngữ "We" đi với động từ nguyên mẫu "have".',
      answerFromDocument: false,
    },
  ],
};

let nextMockExamId = 9001;

/** Quản lý đề cho giáo viên: Gemini đọc file đề, tạo / xoá đề tải lên. */
export const examService = {
  /** Gửi file (base64) cho backend → Gemini tách câu hỏi → bản nháp, chưa lưu gì. */
  async importFile(body: ExamImportRequest): Promise<ExamDraft> {
    if (config.useMock) {
      await delay(1500);
      return structuredClone(MOCK_DRAFT);
    }
    return http.post<ExamDraft>('/exams/import', body, {
      timeout: IMPORT_TIMEOUT_MS,
    });
  },

  /** Lưu đề + giao cho học sinh (hiện ở mục "Đề kiểm tra giáo viên giao"). */
  async create(body: CreateExamRequest): Promise<CreatedExam> {
    if (!config.useMock) return http.post<CreatedExam>('/exams', body);

    await delay(400);
    const round = mockRounds.find((r) => r.id === body.roundId);
    if (!round) throw new ApiError('Hãy chọn vòng thi cho đề.', 400);
    const examId = nextMockExamId++;
    const deadline = body.deadline || 'Tuần sau';
    mockExams.push({
      id: examId,
      roundId: body.roundId,
      order: 0,
      title: body.title,
      questionCount: body.questions.length,
      durationMinutes: body.durationMinutes,
      questionIds: [],
    });
    body.questions.forEach((q, i) => {
      const questionId = examId * 100 + i + 1;
      const choices = q.choices.map((content, idx) => ({
        id: questionId * 10 + idx + 1,
        content,
      }));
      mockQuestionsData.push({
        id: questionId,
        examId,
        type: 'TEXT',
        content: q.content,
        options: q.choices,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        choices,
        correctChoiceId: choices[q.correctIndex].id,
      });
    });
    const assignmentId = Math.max(0, ...teacherAssignments.map((a) => a.id)) + 1;
    teacherAssignments.push({
      id: assignmentId,
      title: body.title,
      questionCount: body.questions.length,
      durationMinutes: body.durationMinutes,
      deadline,
      isCompleted: false,
      examId,
      roundId: body.roundId,
    });
    return {
      examId,
      assignmentId,
      roundId: body.roundId,
      title: body.title,
      questionCount: body.questions.length,
      durationMinutes: body.durationMinutes,
      deadline,
    };
  },

  async list(): Promise<ExamSummary[]> {
    if (!config.useMock) return http.get<ExamSummary[]>('/exams');
    await delay(200);
    return [...mockExams]
      .sort((a, b) => Number(a.order !== 0) - Number(b.order !== 0) || b.id - a.id)
      .map((e) => ({
        id: e.id,
        roundId: e.roundId,
        roundTitle: mockRounds.find((r) => r.id === e.roundId)?.title ?? '',
        order: e.order,
        title: e.title,
        questionCount: mockQuestionsData.filter((q) => q.examId === e.id).length || e.questionCount,
        durationMinutes: e.durationMinutes,
        deadline: teacherAssignments.find((a) => a.examId === e.id)?.deadline ?? null,
        source: e.order === 0 ? 'TEACHER' : 'ROUND',
      }));
  },

  async remove(examId: number): Promise<void> {
    if (!config.useMock) {
      await http.delete<unknown>(`/exams/${examId}`);
      return;
    }
    await delay(200);
    const idx = mockExams.findIndex((e) => e.id === examId && e.order === 0);
    if (idx === -1) throw new ApiError('Không tìm thấy đề tải lên này.', 404);
    mockExams.splice(idx, 1);
    for (let i = mockQuestionsData.length - 1; i >= 0; i--) {
      if (mockQuestionsData[i].examId === examId) mockQuestionsData.splice(i, 1);
    }
    for (let i = teacherAssignments.length - 1; i >= 0; i--) {
      if (teacherAssignments[i].examId === examId) teacherAssignments.splice(i, 1);
    }
  },
};
