import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Lesson } from '../types';

export type MainTabParamList = {
  Home: undefined;
  Review: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Lesson: { lesson: Lesson };
};
