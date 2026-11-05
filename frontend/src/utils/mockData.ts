import { AssignmentItem } from '../components/AssignmentCard';

export interface QuestionData {
  id: string;
  type: 'true_false' | 'choice';
  instruction: string;
  sentence?: string; // Cho câu nghe
  content: string;
  options?: { key: string; text: string }[];
  correctAnswer: string;
  topic?: string;
}

export const mockUserData = {
  name: 'Minh Anh',
  avatarInitial: 'MA',
  stars: 120,
  streakDays: 5,
  maxStars: 500,
  notificationCount: 2,
};

export const mockAssignmentsTeacher: AssignmentItem[] = [
  {
    id: 'as-1',
    title: 'Đề ôn Unit 5 – My hobbies',
    authorOrScope: 'Cô Lan',
    questionCount: 20,
    durationMinutes: 15,
    deadline: '30/10',
    fileType: 'pdf',
    buttonLabel: 'Ôn ngay',
    buttonVariant: 'green',
  },
  {
    id: 'as-2',
    title: 'Kiểm tra giữa kì – Toán 5',
    authorOrScope: 'Trường Tiểu học',
    questionCount: 25,
    durationMinutes: 30,
    deadline: '02/11',
    fileType: 'docx',
    buttonLabel: 'Làm bài',
    buttonVariant: 'green',
  },
];

export const mockAssignmentsParent: AssignmentItem[] = [
  {
    id: 'as-3',
    title: 'Luyện nghe: Daily routines',
    authorOrScope: 'Mẹ Hoa',
    durationMinutes: 10,
    statusText: '8 audio • 10 phút',
    fileType: 'mp3',
    buttonLabel: 'Nghe',
    buttonVariant: 'teal',
  },
  {
    id: 'as-4',
    title: 'Phiếu từ vựng tuần 8',
    authorOrScope: 'Mẹ Hoa',
    statusText: '2 ảnh • Tự ôn',
    fileType: 'image',
    buttonLabel: 'Xem',
    buttonVariant: 'teal',
  },
];

export const mockUploadedParentFiles: AssignmentItem[] = [
  {
    id: 'up-1',
    title: 'Luyện nghe: Daily routines',
    statusText: 'Đã tải xong • 8 audio',
    fileType: 'mp3',
    buttonLabel: 'Sửa',
    buttonVariant: 'teal',
  },
  {
    id: 'up-2',
    title: 'Phiếu từ vựng tuần 8',
    statusText: 'Đang tải lên... 64%',
    fileType: 'image',
    buttonLabel: 'Huỷ',
    buttonVariant: 'red',
  },
];

export const mockExamQuestions: QuestionData[] = [
  {
    id: 'q1',
    type: 'choice',
    instruction: 'Choose the best answer to complete the sentence.',
    content: 'My brother enjoys _____ soccer after school.',
    options: [
      { key: 'A', text: 'play' },
      { key: 'B', text: 'playing' },
      { key: 'C', text: 'played' },
      { key: 'D', text: 'plays' },
    ],
    correctAnswer: 'B',
    topic: 'Grammar',
  },
  {
    id: 'q2',
    type: 'choice',
    instruction: 'Find the odd one out.',
    content: 'Which word does NOT belong to the hobbies group?',
    options: [
      { key: 'A', text: 'Swimming' },
      { key: 'B', text: 'Dancing' },
      { key: 'C', text: 'Homework' },
      { key: 'D', text: 'Singing' },
    ],
    correctAnswer: 'C',
    topic: 'Vocabulary',
  },
  {
    id: 'q3',
    type: 'true_false',
    instruction: 'Listen to the audio and choose True or False.',
    sentence: 'The cat is sleeping.',
    content: 'The cat is playing in the garden.',
    correctAnswer: 'False',
    topic: 'Listening',
  },
  {
    id: 'q4',
    type: 'choice',
    instruction: 'Choose the correct preposition.',
    content: 'I am good _____ drawing cartoon characters.',
    options: [
      { key: 'A', text: 'at' },
      { key: 'B', text: 'in' },
      { key: 'C', text: 'on' },
      { key: 'D', text: 'with' },
    ],
    correctAnswer: 'A',
    topic: 'Grammar',
  },
  {
    id: 'q5',
    type: 'true_false',
    instruction: 'Listen to the audio and choose True or False.',
    sentence: 'He likes reading comic books.',
    content: 'He likes reading comic books.',
    correctAnswer: 'True',
    topic: 'Listening',
  },
];

