import { randomUUID } from 'node:crypto';
import { db } from '../models/store.js';
import type { Flashcard, StudyFile } from '../models/studyFile.model.js';
import type { CreateStudyFileInput } from '../validators/studyFile.validator.js';

/** Turns lines like "question - answer" into flashcards. */
function parseFlashcards(content: string): Flashcard[] {
  return content
    .split('\n')
    .map((line) => line.split(' - '))
    .filter((parts) => parts.length >= 2 && parts[0].trim() && parts[1].trim())
    .map(([front, ...back]) => ({ front: front.trim(), back: back.join(' - ').trim() }));
}

export const studyFileService = {
  findAll(): StudyFile[] {
    return db.studyFiles;
  },

  create(input: CreateStudyFileInput): StudyFile {
    const studyFile: StudyFile = {
      id: randomUUID(),
      title: input.title,
      content: input.content,
      flashcards: parseFlashcards(input.content),
      createdAt: new Date().toISOString(),
    };
    db.studyFiles.unshift(studyFile);
    return studyFile;
  },

  remove(id: string): boolean {
    const index = db.studyFiles.findIndex((file) => file.id === id);
    if (index === -1) return false;
    db.studyFiles.splice(index, 1);
    return true;
  },
};
