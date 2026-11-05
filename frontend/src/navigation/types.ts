export type RootStackParamList = {
  Home: undefined;
  PracticeList: undefined;
  Exam: { roundId: string; roundTitle?: string };
  Result: {
    score: number;
    totalQuestions: number;
    starsEarned: number;
    timeTaken: string;
    roundTitle?: string;
  };
  ParentZone: undefined;
  Profile: undefined;
};
