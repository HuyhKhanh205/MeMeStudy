import { api } from './api';
import type { CreateStudyFileInput, StudyFile } from '../types';

export const studyFileService = {
  getAll: () => api.get<StudyFile[]>('/study-files'),
  create: (input: CreateStudyFileInput) => api.post<StudyFile>('/study-files', input),
  remove: (id: string) => api.delete(`/study-files/${id}`),
};
