import type { Round } from '../types';
import { config } from '../utils/config';
import { http } from './http';
import { mockApi } from './mock';

export const roundService = {
  list(): Promise<Round[]> {
    return config.useMock ? mockApi.listRounds() : http.get<Round[]>('/rounds');
  },
};
