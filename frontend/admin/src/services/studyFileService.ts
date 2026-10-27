import { api } from './api'
import type { StudyFile } from '../types'

export const studyFileService = {
  getAll: () => api.get<StudyFile[]>('/study-files'),
  remove: (id: string) => api.delete(`/study-files/${id}`),
}
