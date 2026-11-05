import type { NavigatorScreenParams } from '@react-navigation/native';
import type { AttemptResult } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type UserTabParamList = {
  Home: undefined;
  RoundList: undefined;
  History: undefined;
};

/** Stack của user: tab chính + các màn làm bài đè lên tab. */
export type UserStackParamList = {
  Tabs: NavigatorScreenParams<UserTabParamList>;
  Exam: { roundId: number; roundTitle: string };
  /** durationSeconds: thời gian làm bài tính ở client (chip đồng hồ ở màn kết quả). */
  Result: { result: AttemptResult; durationSeconds?: number };
};

export type AdminStackParamList = {
  Dashboard: undefined;
  QuestionList: undefined;
  ExamList: undefined;
};
