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

/* ============================================================
 * KIỂU DỮ LIỆU ĐỢT THI - VÒNG THI - BÀI THI - CÂU HỎI
 * ============================================================ */

export type SeasonStatus = 'ACTIVE' | 'ARCHIVED';
export type RoundStatus = 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED';
export type ExamStatus = 'COMPLETED' | 'AVAILABLE' | 'LOCKED';
export type QuestionType = 'TEXT' | 'LISTENING' | 'IMAGE';

export interface Season {
  id: string;
  name: string;
  status: SeasonStatus;
  startDate: string;
  endDate: string;
  totalRoundsParticipated?: number;
  highestScore?: number;
  description?: string;
}

export interface SeasonRound extends Round {
  seasonId: string;
  order: number;
  roundNumber: string; // '01', '02', '03'
  status: RoundStatus;
  questionIds: number[];
}

export interface Exam {
  id: number;
  roundId: number;
  order: number; // 1, 2, 3
  title: string;
  questionCount: number;
  durationMinutes: number;
  questionIds: number[];
}

export interface MockQuestionItem {
  id: number;
  examId: number;
  type: QuestionType;
  content: string;
  options: string[];
  correctIndex: number;
  audioUrl?: string;
  imageUrl?: string;
  explanation: string;
  choices: { id: number; content: string }[];
  correctChoiceId: number;
}

export interface ExamAttempt {
  id: number;
  seasonId: string;
  roundId: number;
  examId: number;
  roundTitle: string;
  examTitle: string;
  examOrder: number;
  score: number; // 0-100 (mỗi câu đúng = 10 điểm)
  correctCount: number;
  totalQuestions: number;
  submittedAt: string;
  durationSeconds?: number;
  mode?: 'exam' | 'practice';
  review?: {
    questionId: number;
    choiceId: number | null;
    correct: boolean;
    explanation?: string;
    correctIndex?: number;
    userIndex?: number;
  }[];
}

export interface StudentInfo {
  name: string;
  role: string;
  coins: number;
  streakDays: number;
}

export interface TeacherAssignment {
  id: number;
  title: string;
  questionCount: number;
  durationMinutes: number;
  deadline: string;
  isCompleted: boolean;
  score?: number;
  examId: number;
  roundId: number;
}

export interface PracticeCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
}

/* ============================================================
 * DỮ LIỆU ĐỢT THI (SEASONS)
 * ============================================================ */
export const seasons: Season[] = [
  {
    id: '2026-2027',
    name: 'Đợt thi 2026–2027',
    status: 'ACTIVE',
    startDate: '01/09/2026',
    endDate: '31/05/2027',
    totalRoundsParticipated: 1,
    highestScore: 90,
    description: 'Hành trình khám phá tiếng Anh lớp học hoạt hình cùng Cú MeMe!',
  },
  {
    id: '2025-2026',
    name: 'Đợt thi 2025–2026',
    status: 'ARCHIVED',
    startDate: '01/09/2025',
    endDate: '31/05/2026',
    totalRoundsParticipated: 15,
    highestScore: 295,
    description: 'Đợt thi đã kết thúc. Toàn bộ kết quả đã được lưu trữ.',
  },
];

/* ============================================================
 * VÒNG THI (ROUNDS)
 * ============================================================ */
export const mockRounds: SeasonRound[] = [
  {
    id: 1,
    seasonId: '2026-2027',
    order: 1,
    roundNumber: '01',
    title: 'Vòng 01 — Khởi động',
    description: 'Khởi động năm học mới với từ vựng đồ dùng học tập và chào hỏi.',
    durationMinutes: 15,
    questionCount: 30, // 3 bài * 10
    isOpen: true,
    status: 'COMPLETED',
    questionIds: [101, 102, 103],
  },
  {
    id: 2,
    seasonId: '2026-2027',
    order: 2,
    roundNumber: '02',
    title: 'Vòng 02 — Khám phá',
    description: 'Khám phá thế giới sở thích, gia đình và trường lớp qua bài học vui nhộn.',
    durationMinutes: 15,
    questionCount: 30, // 3 bài * 10
    isOpen: true,
    status: 'IN_PROGRESS',
    questionIds: [201, 202, 203],
  },
  {
    id: 3,
    seasonId: '2026-2027',
    order: 3,
    roundNumber: '03',
    title: 'Vòng 03 — Chinh phục',
    description: 'Thử thách nâng cao các thì cơ bản và kỹ năng nghe hội thoại thực tế.',
    durationMinutes: 15,
    questionCount: 30,
    isOpen: false,
    status: 'LOCKED',
    questionIds: [301, 302, 303],
  },
];

/* ============================================================
 * BÀI THI (EXAMS - MỖI VÒNG ĐÚNG 3 BÀI, MỖI BÀI 10 CÂU)
 * ============================================================ */
export const mockExams: Exam[] = [
  // Vòng 01
  {
    id: 101,
    roundId: 1,
    order: 1,
    title: 'Bài 1: School Things',
    questionCount: 10,
    durationMinutes: 15,
    questionIds: Array.from({ length: 10 }, (_, i) => 1001 + i),
  },
  {
    id: 102,
    roundId: 1,
    order: 2,
    title: 'Bài 2: Daily Greetings',
    questionCount: 10,
    durationMinutes: 15,
    questionIds: Array.from({ length: 10 }, (_, i) => 1011 + i),
  },
  {
    id: 103,
    roundId: 1,
    order: 3,
    title: 'Bài 3: Classroom Rules',
    questionCount: 10,
    durationMinutes: 15,
    questionIds: Array.from({ length: 10 }, (_, i) => 1021 + i),
  },

  // Vòng 02
  {
    id: 201,
    roundId: 2,
    order: 1,
    title: 'Bài 1: Hobbies & Sports',
    questionCount: 10,
    durationMinutes: 15,
    questionIds: Array.from({ length: 10 }, (_, i) => 2001 + i),
  },
  {
    id: 202,
    roundId: 2,
    order: 2,
    title: 'Bài 2: Family & Friends',
    questionCount: 10,
    durationMinutes: 15,
    questionIds: Array.from({ length: 10 }, (_, i) => 2011 + i),
  },
  {
    id: 203,
    roundId: 2,
    order: 3,
    title: 'Bài 3: Animal World & Nature',
    questionCount: 10,
    durationMinutes: 15,
    questionIds: Array.from({ length: 10 }, (_, i) => 2021 + i),
  },

  // Vòng 03
  {
    id: 301,
    roundId: 3,
    order: 1,
    title: 'Bài 1: Around the Town',
    questionCount: 10,
    durationMinutes: 15,
    questionIds: Array.from({ length: 10 }, (_, i) => 3001 + i),
  },
  {
    id: 302,
    roundId: 3,
    order: 2,
    title: 'Bài 2: Future Dreams',
    questionCount: 10,
    durationMinutes: 15,
    questionIds: Array.from({ length: 10 }, (_, i) => 3011 + i),
  },
  {
    id: 303,
    roundId: 3,
    order: 3,
    title: 'Bài 3: Final Master Challenge',
    questionCount: 10,
    durationMinutes: 15,
    questionIds: Array.from({ length: 10 }, (_, i) => 3021 + i),
  },
];

/* ============================================================
 * CÂU HỎI CHI TIẾT (ĐỦ 10 CÂU CHO BÀI 1, 2, 3 CỦA VÒNG 02)
 * ============================================================ */
function createQuestionItem(
  id: number,
  examId: number,
  type: QuestionType,
  content: string,
  options: string[],
  correctIndex: number,
  explanation: string,
  extra?: { audioUrl?: string; imageUrl?: string }
): MockQuestionItem {
  const choices = options.map((opt, idx) => ({ id: id * 10 + (idx + 1), content: opt }));
  return {
    id,
    examId,
    type,
    content,
    options,
    correctIndex,
    explanation,
    choices,
    correctChoiceId: choices[correctIndex].id,
    audioUrl: extra?.audioUrl,
    imageUrl: extra?.imageUrl,
  };
}

export const mockQuestionsData: MockQuestionItem[] = [
  // --- VÒNG 02 · BÀI 1: Hobbies & Sports (10 câu: TEXT, LISTENING, IMAGE) ---
  createQuestionItem(
    2001,
    201,
    'TEXT',
    'Chọn từ thích hợp điền vào chỗ trống: "I like _____ football with my friends every Sunday."',
    ['play', 'playing', 'played', 'plays'],
    1,
    'Sau động từ "like" thường dùng danh động từ V-ing khi nói về sở thích (like playing football).'
  ),
  createQuestionItem(
    2002,
    201,
    'IMAGE',
    'Nhìn hình chú cú MeMe ôm quyển sách và chọn từ đúng:',
    ['Reading books', 'Playing piano', 'Swimming', 'Riding a bike'],
    0,
    '"Reading books" nghĩa là đọc sách. Hình ảnh minh họa việc đọc sách.',
    { imageUrl: 'books' }
  ),
  createQuestionItem(
    2003,
    201,
    'LISTENING',
    'Nghe đoạn băng và trả lời: "What is Tom\'s favorite hobby?"',
    ['Drawing pictures', 'Listening to music', 'Playing chess', 'Cooking'],
    1,
    'Trong đoạn băng, Tom nói: "I love listening to music after doing homework."',
    { audioUrl: 'listening_hobby_tom.mp3' }
  ),
  createQuestionItem(
    2004,
    201,
    'TEXT',
    '"She doesn\'t like swimming because she thinks it is _____."',
    ['fun', 'difficult', 'interesting', 'easy'],
    1,
    '"doesn\'t like" (không thích) phù hợp với tính từ mang nghĩa tiêu cực là "difficult" (khó khăn).'
  ),
  createQuestionItem(
    2005,
    201,
    'IMAGE',
    'Nhìn hình chú cá bơi dưới biển và chọn môn thể thao phù hợp:',
    ['Skiing', 'Swimming', 'Skating', 'Running'],
    1,
    'Hình chú cá bơi liên tưởng tới môn "Swimming" (bơi lội).',
    { imageUrl: 'fish' }
  ),
  createQuestionItem(
    2006,
    201,
    'LISTENING',
    'Nghe đoạn đối thoại: "How often does Anna play badminton?"',
    ['Once a week', 'Twice a week', 'Every day', 'Never'],
    1,
    'Anna nói: "I play badminton twice a week with my sister on Tuesdays and Thursdays."',
    { audioUrl: 'listening_badminton_anna.mp3' }
  ),
  createQuestionItem(
    2007,
    201,
    'TEXT',
    'Tìm từ có nghĩa trái ngược với "BORING" (chán nản):',
    ['Tired', 'Exciting', 'Sad', 'Difficult'],
    1,
    '"Exciting" (thú vị, hào hứng) là từ trái nghĩa trực tiếp với "Boring".'
  ),
  createQuestionItem(
    2008,
    201,
    'IMAGE',
    'Nhìn hình chiếc cúp vàng vinh quang và chọn từ vựng đúng:',
    ['Trophy / Champion', 'Medal / Silver', 'Ball / Football', 'Gloves / Boxing'],
    0,
    '"Trophy" nghĩa là chiếc cúp chiến thắng dành cho nhà vô địch.',
    { imageUrl: 'trophy' }
  ),
  createQuestionItem(
    2009,
    201,
    'LISTENING',
    'Nghe đoạn hội thoại: "Where are the students going this Saturday?"',
    ['To the cinema', 'To the swimming pool', 'To the zoo', 'To the library'],
    1,
    'Học sinh hẹn nhau: "Let\'s meet at the swimming pool this Saturday at 8 AM."',
    { audioUrl: 'listening_saturday_meet.mp3' }
  ),
  createQuestionItem(
    2010,
    201,
    'TEXT',
    'Sắp xếp câu đúng: "you / Do / video games / playing / like / ?"',
    [
      'Do you like playing video games?',
      'Do you playing like video games?',
      'You do like playing video games?',
      'Do like you playing video games?',
    ],
    0,
    'Cấu trúc câu hỏi thì hiện tại đơn với like: Do + S + like + V-ing...?'
  ),

  // --- VÒNG 02 · BÀI 2: Family & Friends (10 câu) ---
  createQuestionItem(
    2011,
    202,
    'TEXT',
    'Điền từ thích hợp: "This is my _____. She is my mother\'s sister."',
    ['uncle', 'aunt', 'cousin', 'grandmother'],
    1,
    '"Aunt" là cô, dì hoặc bác gái (chị/em gái của mẹ hoặc bố).'
  ),
  createQuestionItem(
    2012,
    202,
    'IMAGE',
    'Nhìn hình ngôi nhà ấm áp và chọn từ đúng:',
    ['School', 'House / Home', 'Hospital', 'Park'],
    1,
    '"Home / House" nghĩa là ngôi nhà thân thương của gia đình.',
    { imageUrl: 'house' }
  ),
  createQuestionItem(
    2013,
    202,
    'LISTENING',
    'Nghe và chọn nghề nghiệp của bố Nam: "What does Nam\'s father do?"',
    ['He is an engineer', 'He is a doctor', 'He is a teacher', 'He is a chef'],
    1,
    'Nam giới thiệu: "My dad works at the city hospital. He is a doctor."',
    { audioUrl: 'listening_father_job.mp3' }
  ),
  createQuestionItem(
    2014,
    202,
    'TEXT',
    '"My best friend Lan is very _____. She always helps everyone with their homework."',
    ['lazy', 'kind and helpful', 'selfish', 'angry'],
    1,
    '"Kind and helpful" (tốt bụng và hay giúp đỡ) phù hợp với người luôn giúp bạn bè làm bài.'
  ),
  createQuestionItem(
    2015,
    202,
    'IMAGE',
    'Nhìn biểu tượng pháo hoa chúc mừng và chọn dịp phù hợp:',
    ['Birthday Party', 'Bedtime', 'Test time', 'Cleaning time'],
    0,
    '"Party" (tiệc sinh nhật / liên hoan) gắn liền với biểu tượng pháo hoa rực rỡ.',
    { imageUrl: 'partyPopper' }
  ),
  createQuestionItem(
    2016,
    202,
    'LISTENING',
    'Nghe và xác định: "How many people are there in Mai\'s family?"',
    ['3 people', '4 people', '5 people', '6 people'],
    1,
    'Mai nói: "There are four people in my family: my parents, my brother, and me."',
    { audioUrl: 'listening_family_members.mp3' }
  ),
  createQuestionItem(
    2017,
    202,
    'TEXT',
    'Điền đại từ sở hữu đúng: "Peter has a cat. _____ cat is white and lovely."',
    ['His', 'Her', 'Their', 'My'],
    0,
    'Peter là con trai nên tính từ sở hữu tương ứng là "His".'
  ),
  createQuestionItem(
    2018,
    202,
    'TEXT',
    '"Who is your cousin?" - "He is my _____ son."',
    ['brother\'s', 'uncle\'s', 'sister\'s', 'father\'s'],
    1,
    'Con trai của chú/bác (uncle\'s son) gọi là anh/em họ (cousin).'
  ),
  createQuestionItem(
    2019,
    202,
    'LISTENING',
    'Nghe đoạn hội thoại: "What do Peter and his family do on Sundays?"',
    ['They stay at home', 'They visit their grandparents', 'They go shopping', 'They go to the zoo'],
    1,
    'Peter chia sẻ: "Every Sunday morning, we visit our grandparents in the countryside."',
    { audioUrl: 'listening_sunday_family.mp3' }
  ),
  createQuestionItem(
    2020,
    202,
    'TEXT',
    'Chọn câu đúng ngữ pháp:',
    [
      'They is my best friends.',
      'They are my best friends.',
      'They am my best friends.',
      'They be my best friends.',
    ],
    1,
    'Chủ ngữ "They" đi với động từ to-be là "are".'
  ),

  // --- VÒNG 02 · BÀI 3: Animal World & Nature (10 câu) ---
  createQuestionItem(
    2021,
    203,
    'IMAGE',
    'Nhìn hình chú cú thông thái và chọn loài động vật đúng:',
    ['Eagle', 'Owl', 'Parrot', 'Penguin'],
    1,
    '"Owl" nghĩa là loài cú mèo, mascot thân quen của MeMeStudy.',
    { imageUrl: 'owl' }
  ),
  createQuestionItem(
    2022,
    203,
    'TEXT',
    '"Which animal is known as the King of the Jungle?"',
    ['The Elephant', 'The Lion', 'The Monkey', 'The Tiger'],
    1,
    '"The Lion" (Sư tử) được biết đến là chúa tể rừng xanh (King of the Jungle).'
  ),
  createQuestionItem(
    2023,
    203,
    'LISTENING',
    'Nghe đoạn mô tả và đoán con vật: "Which animal are they talking about?"',
    ['Dolphin', 'Elephant', 'Giraffe', 'Kangaroo'],
    2,
    'Đoạn văn nói: "It has a very long neck and eats leaves from tall trees." → Giraffe (hươu cao cổ).',
    { audioUrl: 'listening_tall_giraffe.mp3' }
  ),
  createQuestionItem(
    2024,
    203,
    'IMAGE',
    'Nhìn hình chú bạch tuộc và chọn từ đúng:',
    ['Octopus', 'Shark', 'Crab', 'Whale'],
    0,
    '"Octopus" là con bạch tuộc thông minh dưới lòng đại dương.',
    { imageUrl: 'octopus' }
  ),
  createQuestionItem(
    2025,
    203,
    'TEXT',
    '"A baby dog is called a _____."',
    ['kitten', 'puppy', 'cub', 'calf'],
    1,
    'Chó con trong tiếng Anh gọi là "puppy", mèo con là "kitten".'
  ),
  createQuestionItem(
    2026,
    203,
    'LISTENING',
    'Nghe âm thanh và xác định: "What can penguins do?"',
    ['They can fly very high', 'They can swim very well', 'They can climb trees', 'They can sing'],
    1,
    'Đoạn băng: "Penguins cannot fly, but they are great swimmers in cold water."',
    { audioUrl: 'listening_penguin_swim.mp3' }
  ),
  createQuestionItem(
    2027,
    203,
    'TEXT',
    'Điền từ thích hợp: "Look at the sky! The birds are _____ to the south for winter."',
    ['flying', 'swimming', 'running', 'crawling'],
    0,
    'Chim bay dùng động từ "flying".'
  ),
  createQuestionItem(
    2028,
    203,
    'IMAGE',
    'Nhìn hình rạn san hô dưới biển và chọn từ đúng:',
    ['Forest', 'Coral reef', 'Mountain', 'Desert'],
    1,
    '"Coral reef" là rạn san hô rực rỡ sắc màu dưới biển.',
    { imageUrl: 'coral' }
  ),
  createQuestionItem(
    2029,
    203,
    'TEXT',
    '"Whales live in the _____."',
    ['forest', 'ocean', 'desert', 'cave'],
    1,
    'Cá voi (whales) sống ở đại dương (ocean).'
  ),
  createQuestionItem(
    2030,
    203,
    'LISTENING',
    'Nghe câu hỏi: "Why should we protect wild animals?"',
    [
      'Because they keep nature in balance',
      'Because they are noisy',
      'Because they live in houses',
      'Because they eat grass',
    ],
    0,
    'Đoạn văn kết luận: "Protecting wildlife keeps our mother nature healthy and balanced."',
    { audioUrl: 'listening_protect_nature.mp3' }
  ),
];

// Dữ liệu câu hỏi tương thích với type Question hiện tại
export const mockQuestions: Question[] = mockQuestionsData.map((q) => ({
  id: q.id,
  content: q.content,
  choices: q.choices,
  correctChoiceId: q.correctChoiceId,
}));

/* ============================================================
 * LỊCH SỬ LÀM BÀI (ATTEMPTS)
 * ============================================================ */
export const initialAttempts: ExamAttempt[] = [
  // Đợt 2026–2027: Vòng 01 đã làm xong cả 3 bài
  {
    id: 901,
    seasonId: '2026-2027',
    roundId: 1,
    examId: 101,
    roundTitle: 'Vòng 01 — Khởi động',
    examTitle: 'Bài 1: School Things',
    examOrder: 1,
    score: 90,
    correctCount: 9,
    totalQuestions: 10,
    submittedAt: '2026-10-15T08:30:00Z',
    durationSeconds: 420,
    mode: 'exam',
  },
  {
    id: 902,
    seasonId: '2026-2027',
    roundId: 1,
    examId: 102,
    roundTitle: 'Vòng 01 — Khởi động',
    examTitle: 'Bài 2: Daily Greetings',
    examOrder: 2,
    score: 100,
    correctCount: 10,
    totalQuestions: 10,
    submittedAt: '2026-10-16T14:15:00Z',
    durationSeconds: 380,
    mode: 'exam',
  },
  {
    id: 903,
    seasonId: '2026-2027',
    roundId: 1,
    examId: 103,
    roundTitle: 'Vòng 01 — Khởi động',
    examTitle: 'Bài 3: Classroom Rules',
    examOrder: 3,
    score: 80,
    correctCount: 8,
    totalQuestions: 10,
    submittedAt: '2026-10-18T10:00:00Z',
    durationSeconds: 510,
    mode: 'exam',
  },

  // Đợt 2025–2026 (Lưu trữ): 15 vòng đã hoàn thành, điểm cao nhất 295/300
  ...Array.from({ length: 15 }, (_, i) => {
    const roundNum = i + 1;
    const baseScore = roundNum === 15 ? 98 : 85 + (roundNum % 12);
    return [
      {
        id: 800 + i * 3 + 1,
        seasonId: '2025-2026',
        roundId: 50 + roundNum,
        examId: 500 + i * 3 + 1,
        roundTitle: `Vòng ${String(roundNum).padStart(2, '0')} — Niên khóa 2025–2026`,
        examTitle: `Bài 1: Tổng ôn tập ${roundNum}`,
        examOrder: 1,
        score: Math.min(100, baseScore),
        correctCount: Math.min(10, Math.floor(baseScore / 10)),
        totalQuestions: 10,
        submittedAt: `2026-03-${String((roundNum % 25) + 1).padStart(2, '0')}T09:00:00Z`,
        durationSeconds: 400,
        mode: 'exam' as const,
      },
      {
        id: 800 + i * 3 + 2,
        seasonId: '2025-2026',
        roundId: 50 + roundNum,
        examId: 500 + i * 3 + 2,
        roundTitle: `Vòng ${String(roundNum).padStart(2, '0')} — Niên khóa 2025–2026`,
        examTitle: `Bài 2: Kỹ năng nâng cao ${roundNum}`,
        examOrder: 2,
        score: Math.min(100, baseScore + 2),
        correctCount: Math.min(10, Math.floor((baseScore + 2) / 10)),
        totalQuestions: 10,
        submittedAt: `2026-03-${String((roundNum % 25) + 2).padStart(2, '0')}T10:00:00Z`,
        durationSeconds: 430,
        mode: 'exam' as const,
      },
      {
        id: 800 + i * 3 + 3,
        seasonId: '2025-2026',
        roundId: 50 + roundNum,
        examId: 500 + i * 3 + 3,
        roundTitle: `Vòng ${String(roundNum).padStart(2, '0')} — Niên khóa 2025–2026`,
        examTitle: `Bài 3: Đấu trường về đích ${roundNum}`,
        examOrder: 3,
        score: Math.min(100, baseScore - 1),
        correctCount: Math.min(10, Math.floor((baseScore - 1) / 10)),
        totalQuestions: 10,
        submittedAt: `2026-03-${String((roundNum % 25) + 3).padStart(2, '0')}T11:00:00Z`,
        durationSeconds: 460,
        mode: 'exam' as const,
      },
    ];
  }).flat(),
];

/* ============================================================
 * THÔNG TIN HỌC SINH & GIAO BÀI
 * ============================================================ */
export const studentInfo: StudentInfo = {
  name: 'Nguyễn Văn A',
  role: 'Học sinh',
  coins: 120,
  streakDays: 5,
};

export const teacherAssignments: TeacherAssignment[] = [
  {
    id: 1,
    title: 'Kiểm tra Unit 5 — My hobbies',
    questionCount: 10,
    durationMinutes: 15,
    deadline: '10/11',
    isCompleted: false,
    examId: 201,
    roundId: 2,
  },
  {
    id: 2,
    title: 'Listening Practice — Grade 5',
    questionCount: 10,
    durationMinutes: 15,
    deadline: '05/11',
    isCompleted: true,
    score: 90,
    examId: 202,
    roundId: 2,
  },
];

export const practiceCategories: PracticeCategory[] = [
  { id: 'vocab', title: 'Từ vựng', icon: 'books', color: '#16a34a', description: 'Từ vựng hình ảnh sinh động' },
  { id: 'grammar', title: 'Ngữ pháp', icon: 'memo', color: '#2563eb', description: 'Các thì & mẫu câu căn bản' },
  { id: 'listening', title: 'Listening', icon: 'partyPopper', color: '#9333ea', description: 'Luyện nghe giọng chuẩn' },
  { id: 'image', title: 'Hình ảnh', icon: 'star', color: '#ea580c', description: 'Nhận diện hình ảnh trực quan' },
];

export const learningProgress = {
  completed: 3,
  total: 10,
  quote: 'Cố gắng hoàn thành thêm bài học nhé!',
};

/* ============================================================
 * CÁC HÀM TIỆN ÍCH TÍNH TOÁN QUY TẮC MỞ KHÓA & ĐIỂM
 * ============================================================ */

/**
 * Trạng thái mở khóa của một bài thi trong vòng:
 * - Vòng bị khóa (status = LOCKED): tất cả bài khóa (LOCKED)
 * - Bài 1 luôn mở (AVAILABLE) nếu vòng không bị khóa
 * - Hoàn thành Bài 1 → mở Bài 2
 * - Hoàn thành Bài 2 → mở Bài 3
 */
export function getExamStatus(
  round: SeasonRound,
  exam: Exam,
  userAttempts: ExamAttempt[]
): ExamStatus {
  if (round.status === 'LOCKED') return 'LOCKED';

  // Kiểm tra xem bài thi này đã hoàn thành chưa
  const hasFinishedThis = userAttempts.some(
    (a) => a.roundId === round.id && a.examId === exam.id
  );
  if (hasFinishedThis) return 'COMPLETED';

  // Bài 1 luôn mở nếu vòng không bị khóa
  if (exam.order === 1) return 'AVAILABLE';

  // Với bài 2: cần Bài 1 hoàn thành
  if (exam.order === 2) {
    const exam1 = mockExams.find((e) => e.roundId === round.id && e.order === 1);
    const hasFinished1 = exam1
      ? userAttempts.some((a) => a.roundId === round.id && a.examId === exam1.id)
      : false;
    return hasFinished1 ? 'AVAILABLE' : 'LOCKED';
  }

  // Với bài 3: cần Bài 2 hoàn thành
  if (exam.order === 3) {
    const exam2 = mockExams.find((e) => e.roundId === round.id && e.order === 2);
    const hasFinished2 = exam2
      ? userAttempts.some((a) => a.roundId === round.id && a.examId === exam2.id)
      : false;
    return hasFinished2 ? 'AVAILABLE' : 'LOCKED';
  }

  return 'LOCKED';
}

/**
 * Tính điểm vòng (trung bình 3 bài, thang 100).
 * Trả về null nếu chưa làm đủ 3 bài.
 */
export function getRoundScore(roundId: number, userAttempts: ExamAttempt[]): number | null {
  const roundExams = mockExams.filter((e) => e.roundId === roundId);
  if (roundExams.length !== 3) return null;

  const exam1Attempt = userAttempts.find((a) => a.roundId === roundId && a.examOrder === 1);
  const exam2Attempt = userAttempts.find((a) => a.roundId === roundId && a.examOrder === 2);
  const exam3Attempt = userAttempts.find((a) => a.roundId === roundId && a.examOrder === 3);

  if (!exam1Attempt || !exam2Attempt || !exam3Attempt) return null;

  const avg = (exam1Attempt.score + exam2Attempt.score + exam3Attempt.score) / 3;
  return Math.round(avg);
}

/**
 * Tính tiến độ số bài đã xong trong vòng (x/3) và trạng thái hoàn thành.
 */
export function getRoundProgress(
  roundId: number,
  userAttempts: ExamAttempt[]
): { completedCount: number; total: number; score: number | null; isCompleted: boolean } {
  const roundExams = mockExams.filter((e) => e.roundId === roundId);
  const total = roundExams.length || 3;

  const completedCount = roundExams.filter((exam) =>
    userAttempts.some((a) => a.roundId === roundId && a.examId === exam.id)
  ).length;

  const score = getRoundScore(roundId, userAttempts);
  const isCompleted = completedCount === total;

  return { completedCount, total, score, isCompleted };
}

/* ============================================================
 * QUẢN LÝ DỮ LIỆU ĐỘNG TRONG RUNTIME (IN-MEMORY STORE)
 * ============================================================ */

// Lưu trữ runtime các attempt (giữ nguyên khi điều hướng các màn hình)
let runtimeAttempts: ExamAttempt[] = [...initialAttempts];
const listeners: Array<() => void> = [];

export function subscribeToStore(listener: () => void) {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyStore() {
  for (const listener of listeners) listener();
}

export function getRuntimeAttempts(): ExamAttempt[] {
  return runtimeAttempts;
}

export function saveRuntimeAttempt(newAttempt: ExamAttempt) {
  // Thay thế nếu đã có hoặc thêm mới vào đầu danh sách
  const existingIdx = runtimeAttempts.findIndex(
    (a) => a.roundId === newAttempt.roundId && a.examId === newAttempt.examId
  );
  if (existingIdx !== -1) {
    runtimeAttempts[existingIdx] = newAttempt;
  } else {
    runtimeAttempts.unshift(newAttempt);
  }

  // Cập nhật trạng thái vòng nếu cả 3 bài đã xong
  const round = mockRounds.find((r) => r.id === newAttempt.roundId);
  if (round && round.status === 'IN_PROGRESS') {
    const { isCompleted } = getRoundProgress(round.id, runtimeAttempts);
    if (isCompleted) {
      round.status = 'COMPLETED';
    }
  }

  notifyStore();
}
