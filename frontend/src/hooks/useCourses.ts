import { courseService } from '../services/courseService';
import { useFetch } from './useFetch';

export function useCourses() {
  return useFetch(courseService.getAll);
}
