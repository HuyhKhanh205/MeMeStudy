import type { Course } from './course.model.js';
import type { StudyFile } from './studyFile.model.js';

// In-memory data store used until a real database is connected.
export const db: { courses: Course[]; studyFiles: StudyFile[] } = {
  courses: [
    {
      id: 'english-basic',
      title: 'Tiếng Anh cơ bản',
      description: 'Làm quen với từ vựng tiếng Anh hằng ngày',
      units: [
        {
          id: 'unit-1',
          title: 'Chào hỏi',
          lessons: [
            {
              id: 'lesson-1',
              title: 'Xin chào',
              xp: 10,
              exercises: [
                {
                  id: 'ex-1',
                  type: 'multiple_choice',
                  question: '"Xin chào" trong tiếng Anh là gì?',
                  options: ['Goodbye', 'Hello', 'Thanks', 'Sorry'],
                  answerIndex: 1,
                },
                {
                  id: 'ex-2',
                  type: 'multiple_choice',
                  question: '"Thank you" nghĩa là gì?',
                  options: ['Cảm ơn', 'Xin lỗi', 'Tạm biệt', 'Chào buổi sáng'],
                  answerIndex: 0,
                },
              ],
            },
            {
              id: 'lesson-2',
              title: 'Giới thiệu bản thân',
              xp: 10,
              exercises: [
                {
                  id: 'ex-3',
                  type: 'multiple_choice',
                  question: 'Chọn câu đúng để giới thiệu tên:',
                  options: ['My name is Lan', 'I name Lan', 'Name my Lan', 'Lan is name'],
                  answerIndex: 0,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  studyFiles: [],
};
