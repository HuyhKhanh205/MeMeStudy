import type { Question, Round, User } from '../../types';

export interface MockAccount {
  password: string;
  user: User;
}

/** Tài khoản demo khi EXPO_PUBLIC_USE_MOCK=true. */
export const mockAccounts: MockAccount[] = [
  { password: '123456', user: { id: 1, username: 'user', fullName: 'Nguyễn Văn A', role: 'USER' } },
  { password: '123456', user: { id: 2, username: 'admin', fullName: 'Quản trị viên', role: 'ADMIN' } },
];

export const mockQuestions: Question[] = [
  {
    id: 1,
    content: 'Thủ đô của Việt Nam là gì?',
    choices: [
      { id: 11, content: 'TP. Hồ Chí Minh' },
      { id: 12, content: 'Hà Nội' },
      { id: 13, content: 'Đà Nẵng' },
      { id: 14, content: 'Huế' },
    ],
    correctChoiceId: 12,
  },
  {
    id: 2,
    content: '2 + 2 × 2 = ?',
    choices: [
      { id: 21, content: '8' },
      { id: 22, content: '6' },
      { id: 23, content: '4' },
      { id: 24, content: '10' },
    ],
    correctChoiceId: 22,
  },
  {
    id: 3,
    content: 'HTTP status code nào nghĩa là Unauthorized?',
    choices: [
      { id: 31, content: '400' },
      { id: 32, content: '403' },
      { id: 33, content: '401' },
      { id: 34, content: '404' },
    ],
    correctChoiceId: 33,
  },
  {
    id: 4,
    content: 'Java chạy trên nền tảng nào?',
    choices: [
      { id: 41, content: 'JVM' },
      { id: 42, content: 'CLR' },
      { id: 43, content: 'V8' },
      { id: 44, content: 'Hermes' },
    ],
    correctChoiceId: 41,
  },
  {
    id: 5,
    content: 'Từ khóa nào khai báo hằng số trong TypeScript?',
    choices: [
      { id: 51, content: 'var' },
      { id: 52, content: 'let' },
      { id: 53, content: 'const' },
      { id: 54, content: 'static' },
    ],
    correctChoiceId: 53,
  },
];

export type MockRound = Round & { questionIds: number[] };

export const mockRounds: MockRound[] = [
  {
    id: 1,
    title: 'Vòng 1 — Khởi động',
    description: 'Kiến thức chung, 3 câu hỏi.',
    durationMinutes: 5,
    questionCount: 3,
    isOpen: true,
    questionIds: [1, 2, 3],
  },
  {
    id: 2,
    title: 'Vòng 2 — Lập trình',
    description: 'Java và TypeScript cơ bản.',
    durationMinutes: 10,
    questionCount: 2,
    isOpen: true,
    questionIds: [4, 5],
  },
  {
    id: 3,
    title: 'Vòng 3 — Chung kết',
    description: 'Chưa mở.',
    durationMinutes: 15,
    questionCount: 5,
    isOpen: false,
    questionIds: [1, 2, 3, 4, 5],
  },
];
