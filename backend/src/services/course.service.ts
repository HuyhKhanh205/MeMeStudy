import { db } from '../models/store.js';
import type { Course } from '../models/course.model.js';

export const courseService = {
  findAll(): Course[] {
    return db.courses;
  },

  findById(id: string): Course | undefined {
    return db.courses.find((course) => course.id === id);
  },
};
