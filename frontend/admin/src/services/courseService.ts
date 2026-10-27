import { api } from './api'
import type { Course } from '../types'

export const courseService = {
  getAll: () => api.get<Course[]>('/courses'),
  getById: (id: string) => api.get<Course>(`/courses/${id}`),
}
