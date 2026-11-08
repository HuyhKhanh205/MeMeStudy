import { ApiError } from '../../types/api';
import type {
  Attempt,
  AttemptResult,
  AuthResponse,
  LoginRequest,
  Question,
  RegisterRequest,
  Round,
  SubmitRequest,
  User,
} from '../../types';
import { tokenStorage } from '../../utils/tokenStorage';
import {
  getRuntimeAttempts,
  mockAccounts,
  mockExams,
  mockQuestions,
  mockQuestionsData,
  mockRounds,
  saveRuntimeAttempt,
  type ExamAttempt,
  type MockQuestionItem,
  type SeasonRound,
} from './data';

type Owned<T> = T & { userId: number };

const delay = (ms = 250) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const tokenFor = (user: User) => `mock-token-${user.id}`;

// Lưu attempt đang làm dở
const activeAttempts = new Map<
  number,
  Owned<Attempt> & { examId: number; examOrder: number; seasonId: string }
>();
let nextAttemptId = 2000;
let nextUserId = 100;

async function currentUser(): Promise<User> {
  const token = await tokenStorage.get();
  const account = mockAccounts.find((a) => token === tokenFor(a.user));
  if (!account) {
    // Mặc định fallback về tài khoản học sinh user
    return mockAccounts[0].user;
  }
  return account.user;
}

function stripOwner<T>({ userId: _userId, ...rest }: Owned<T>): T {
  return rest as T;
}

const stripAnswer = ({ correctChoiceId: _answer, ...q }: Question): Question => q;
const toRound = (r: SeasonRound): Round => ({
  id: r.id,
  title: r.title,
  description: r.description,
  durationMinutes: r.durationMinutes,
  questionCount: r.questionCount,
  isOpen: r.isOpen,
});

export const mockApi = {
  async login({ username, password }: LoginRequest): Promise<AuthResponse> {
    await delay();
    const account = mockAccounts.find((a) => a.user.username === username.trim());
    if (!account || account.password !== password) {
      throw new ApiError('Sai tên đăng nhập hoặc mật khẩu.', 401);
    }
    return { token: tokenFor(account.user), user: account.user };
  },

  async register({ username, password, fullName }: RegisterRequest): Promise<AuthResponse> {
    await delay();
    if (mockAccounts.some((a) => a.user.username === username.trim())) {
      throw new ApiError('Tên đăng nhập đã tồn tại.', 409);
    }
    const user: User = { id: nextUserId++, username: username.trim(), fullName, role: 'USER' };
    mockAccounts.push({ password, user });
    return { token: tokenFor(user), user };
  },

  async me(): Promise<User> {
    await delay(100);
    return currentUser();
  },

  async listRounds(): Promise<Round[]> {
    await delay();
    return mockRounds.map(toRound);
  },

  /**
   * Bắt đầu một lượt làm bài thi (hỗ trợ truyền examId cụ thể trong vòng)
   */
  async startAttempt(roundId: number, targetExamId?: number): Promise<Attempt> {
    await delay(200);
    const user = await currentUser();
    const round = mockRounds.find((r) => r.id === roundId);
    if (!round) throw new ApiError('Không tìm thấy vòng thi.', 404);
    if (!round.isOpen || round.status === 'LOCKED') {
      throw new ApiError('Vòng thi này chưa mở.', 400);
    }

    // Xác định bài thi: nếu không chỉ định, lấy bài đầu tiên chưa làm hoặc bài 1
    const roundExams = mockExams.filter((e) => e.roundId === roundId);
    let chosenExam = targetExamId
      ? roundExams.find((e) => e.id === targetExamId)
      : undefined;

    if (!chosenExam) {
      const attempts = getRuntimeAttempts();
      chosenExam =
        roundExams.find(
          (e) => !attempts.some((a) => a.roundId === roundId && a.examId === e.id)
        ) ?? roundExams[0];
    }

    // Lấy danh sách câu hỏi cho bài thi
    let questionsForExam = mockQuestionsData.filter((q) => q.examId === chosenExam?.id);
    if (questionsForExam.length === 0) {
      // Nếu bài thi chưa có câu hỏi riêng, tạo 10 câu mẫu
      questionsForExam = mockQuestionsData.slice(0, 10);
    }

    const now = Date.now();
    const attemptId = nextAttemptId++;
    const duration = chosenExam?.durationMinutes || round.durationMinutes || 15;

    const attempt = {
      id: attemptId,
      userId: user.id,
      roundId: round.id,
      roundTitle: round.title,
      examId: chosenExam?.id || roundId * 100 + 1,
      examOrder: chosenExam?.order || 1,
      seasonId: round.seasonId,
      status: 'IN_PROGRESS' as const,
      startedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + duration * 60_000).toISOString(),
      questions: questionsForExam.map((q) => ({
        id: q.id,
        content: q.content,
        choices: q.choices,
      })),
    };

    activeAttempts.set(attemptId, attempt);
    return stripOwner(attempt);
  },

  /**
   * Nộp bài thi: chấm điểm (thang 100, mỗi câu đúng = 10đ), lưu vào store và trả về AttemptResult
   */
  async submitAttempt(
    attemptId: number,
    body: SubmitRequest,
    meta?: { durationSeconds?: number; mode?: 'exam' | 'practice' }
  ): Promise<AttemptResult> {
    await delay(300);
    const user = await currentUser();
    const attempt = activeAttempts.get(attemptId);
    if (!attempt || attempt.userId !== user.id) {
      throw new ApiError('Không tìm thấy lượt thi.', 404);
    }
    if (attempt.status === 'SUBMITTED') {
      throw new ApiError('Bài thi đã được nộp trước đó.', 409);
    }
    attempt.status = 'SUBMITTED';

    // Chấm điểm từng câu
    const review = attempt.questions.map((q) => {
      const answer = body.answers.find((a) => a.questionId === q.id);
      const questionDetail = mockQuestionsData.find((m) => m.id === q.id);
      const isCorrect =
        answer?.choiceId != null &&
        questionDetail?.correctChoiceId != null &&
        answer.choiceId === questionDetail.correctChoiceId;

      return {
        questionId: q.id,
        choiceId: answer?.choiceId ?? null,
        correct: isCorrect,
        explanation: questionDetail?.explanation,
        correctIndex: questionDetail?.correctIndex,
        userIndex: questionDetail?.choices.findIndex((c) => c.id === answer?.choiceId),
      };
    });

    const correctCount = review.filter((r) => r.correct).length;
    const total = attempt.questions.length || 10;
    // Thang điểm 100 (mỗi câu đúng = 10 điểm)
    const score = correctCount * 10;
    const nowIso = new Date().toISOString();

    const round = mockRounds.find((r) => r.id === attempt.roundId);
    const exam = mockExams.find((e) => e.id === attempt.examId);

    // Lưu vào lịch sử runtime
    const examAttempt: ExamAttempt = {
      id: attemptId,
      seasonId: attempt.seasonId || round?.seasonId || '2026-2027',
      roundId: attempt.roundId,
      examId: attempt.examId,
      roundTitle: attempt.roundTitle,
      examTitle: exam?.title || `Bài ${attempt.examOrder}`,
      examOrder: attempt.examOrder,
      score,
      correctCount,
      totalQuestions: total,
      submittedAt: nowIso,
      durationSeconds: meta?.durationSeconds,
      mode: meta?.mode || 'exam',
      review,
    };
    saveRuntimeAttempt(examAttempt);

    const result: AttemptResult = {
      attemptId,
      roundId: attempt.roundId,
      roundTitle: attempt.roundTitle,
      correctCount,
      totalQuestions: total,
      score,
      submittedAt: nowIso,
      review: review.map((r) => ({ questionId: r.questionId, correct: r.correct })),
    };

    return result;
  },

  /**
   * Lấy lịch sử kết quả của user hiện tại
   */
  async myResults(): Promise<AttemptResult[]> {
    await delay(150);
    const userAttempts = getRuntimeAttempts();
    return userAttempts.map((a) => ({
      attemptId: a.id,
      roundId: a.roundId,
      roundTitle: a.roundTitle,
      score: a.score,
      correctCount: a.correctCount,
      totalQuestions: a.totalQuestions,
      submittedAt: a.submittedAt,
      review: a.review?.map((r) => ({ questionId: r.questionId, correct: r.correct })),
    }));
  },

  async listQuestions(): Promise<Question[]> {
    await delay(100);
    return mockQuestions;
  },

  /** Lấy danh sách câu hỏi chi tiết theo bài thi */
  getQuestionsForExam(examId: number): MockQuestionItem[] {
    const questions = mockQuestionsData.filter((q) => q.examId === examId);
    return questions.length > 0 ? questions : mockQuestionsData.slice(0, 10);
  },
};
