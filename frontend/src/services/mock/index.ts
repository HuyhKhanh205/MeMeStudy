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
import { mockAccounts, mockQuestions, mockRounds, type MockRound } from './data';

/** Mock backend trong bộ nhớ, dùng khi EXPO_PUBLIC_USE_MOCK=true (dữ liệu mất khi reload app). */

type Owned<T> = T & { userId: number };

const delay = (ms = 300) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const tokenFor = (user: User) => `mock-token-${user.id}`;

const attempts = new Map<number, Owned<Attempt>>();
const results: Owned<AttemptResult>[] = [];
let nextAttemptId = 1;
let nextUserId = 100;

async function currentUser(): Promise<User> {
  const token = await tokenStorage.get();
  const account = mockAccounts.find((a) => token === tokenFor(a.user));
  if (!account) throw new ApiError('Phiên đăng nhập đã hết hạn.', 401);
  return account.user;
}

function stripOwner<T>({ userId: _userId, ...rest }: Owned<T>): T {
  return rest as T;
}

const stripAnswer = ({ correctChoiceId: _answer, ...q }: Question): Question => q;
const toRound = ({ questionIds: _ids, ...r }: MockRound): Round => r;

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
    await delay(150);
    return currentUser();
  },

  async listRounds(): Promise<Round[]> {
    await delay();
    await currentUser();
    return mockRounds.map(toRound);
  },

  async startAttempt(roundId: number): Promise<Attempt> {
    await delay();
    const user = await currentUser();
    const round = mockRounds.find((r) => r.id === roundId);
    if (!round) throw new ApiError('Không tìm thấy vòng thi.', 404);
    if (!round.isOpen) throw new ApiError('Vòng thi chưa mở.', 400);
    const now = Date.now();
    const attempt: Owned<Attempt> = {
      id: nextAttemptId++,
      userId: user.id,
      roundId: round.id,
      roundTitle: round.title,
      status: 'IN_PROGRESS',
      startedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + round.durationMinutes * 60_000).toISOString(),
      questions: mockQuestions.filter((q) => round.questionIds.includes(q.id)).map(stripAnswer),
    };
    attempts.set(attempt.id, attempt);
    return stripOwner(attempt);
  },

  async submitAttempt(attemptId: number, body: SubmitRequest): Promise<AttemptResult> {
    await delay();
    const user = await currentUser();
    const attempt = attempts.get(attemptId);
    if (!attempt || attempt.userId !== user.id) throw new ApiError('Không tìm thấy lượt thi.', 404);
    if (attempt.status === 'SUBMITTED') throw new ApiError('Bài thi đã được nộp.', 409);
    attempt.status = 'SUBMITTED';

    const review = attempt.questions.map((q) => {
      const answer = body.answers.find((a) => a.questionId === q.id);
      const correct = mockQuestions.find((m) => m.id === q.id)?.correctChoiceId;
      return { questionId: q.id, correct: answer?.choiceId != null && answer.choiceId === correct };
    });
    const correctCount = review.filter((r) => r.correct).length;
    const total = attempt.questions.length;
    const result: Owned<AttemptResult> = {
      userId: user.id,
      attemptId,
      roundId: attempt.roundId,
      roundTitle: attempt.roundTitle,
      correctCount,
      totalQuestions: total,
      score: total ? Math.round((correctCount / total) * 100) / 10 : 0,
      submittedAt: new Date().toISOString(),
      review,
    };
    results.unshift(result);
    return stripOwner(result);
  },

  async myResults(): Promise<AttemptResult[]> {
    await delay();
    const user = await currentUser();
    return results.filter((r) => r.userId === user.id).map((r) => stripOwner(r));
  },

  async listQuestions(): Promise<Question[]> {
    await delay();
    const user = await currentUser();
    if (user.role !== 'ADMIN') {
      throw new ApiError('Bạn không có quyền thực hiện thao tác này.', 403);
    }
    return mockQuestions;
  },
};
