import { studyFileService } from '../services/studyFileService';
import { useFetch } from './useFetch';

export function useStudyFiles() {
  return useFetch(studyFileService.getAll);
}
