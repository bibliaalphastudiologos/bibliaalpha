import { WomenNote, getWomenVerseNotes, getWomenChapterNotes } from '../data/womenCommentaries';

export type { WomenNote };

const chapterCache = new Map<string, Record<number, WomenNote[]>>();

export function getWomenChapterNotesApi(bookId: string, chapter: number): Record<number, WomenNote[]> {
  const key = `${bookId}:${chapter}`;
  if (!chapterCache.has(key)) {
    chapterCache.set(key, getWomenChapterNotes(bookId, chapter));
  }
  return chapterCache.get(key)!;
}

export function getWomenVerseNotesApi(bookId: string, chapter: number, verse: number): WomenNote[] {
  return getWomenVerseNotes(bookId, chapter, verse);
}
