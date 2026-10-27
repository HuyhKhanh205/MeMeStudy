// Domain types for the admin app. Keep in sync with backend/src/models.

export type ExerciseType = 'multiple_choice'

export interface Exercise {
  id: string
  type: ExerciseType
  question: string
  options: string[]
  answerIndex: number
}

export interface Lesson {
  id: string
  title: string
  xp: number
  exercises: Exercise[]
}

export interface Unit {
  id: string
  title: string
  lessons: Lesson[]
}

export interface Course {
  id: string
  title: string
  description: string
  units: Unit[]
}

export interface Flashcard {
  front: string
  back: string
}

export interface StudyFile {
  id: string
  title: string
  content: string
  flashcards: Flashcard[]
  createdAt: string
}

export interface ApiResponse<T> {
  data: T
}
