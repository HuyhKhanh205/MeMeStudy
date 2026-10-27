export interface Flashcard {
  front: string;
  back: string;
}

/** A file/note uploaded by a learner to review later. */
export interface StudyFile {
  id: string;
  title: string;
  content: string;
  flashcards: Flashcard[];
  createdAt: string;
}
