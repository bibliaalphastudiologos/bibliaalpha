import { translateToPortuguese } from './knowledgeApi';

const BIBLE_API_BASE = 'https://bible.helloao.org/api';

export interface GillNote {
  verseNumber: number;
  text: string;
  textPt: string;
}

export interface GillChapterNotes {
  bookId: string;
  chapter: number;
  notes: GillNote[];
}

let translatedCache = new Map<string, GillChapterNotes>();

async function safeCommentaryFetch(url: string): Promise<any | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return null;
    return await res.json();
  } catch { return null; }
}

function extractText(content: any[]): string {
  return content
    .filter((c: any) => typeof c === 'string' && c.trim().length > 0)
    .join(' ')
    .substring(0, 1200);
}

export async function getGillNotes(bookId: string, chapter: number): Promise<GillChapterNotes> {
  const key = `${bookId}_${chapter}`;
  if (translatedCache.has(key)) return translatedCache.get(key)!;

  const data = await safeCommentaryFetch(`${BIBLE_API_BASE}/c/john-gill/${bookId}/${chapter}.json`);
  if (!data?.chapter?.content) {
    const empty: GillChapterNotes = { bookId, chapter, notes: [] };
    translatedCache.set(key, empty);
    return empty;
  }

  const rawVerses = data.chapter.content.filter((v: any) => v.type === 'verse' && v.content?.length > 0);

  const notes: GillNote[] = await Promise.all(
    rawVerses.map(async (v: any) => {
      const rawText = extractText(v.content);
      if (!rawText) return null;
      const textPt = await translateToPortuguese(rawText);
      return { verseNumber: v.number, text: rawText, textPt } as GillNote;
    })
  ).then(r => r.filter(Boolean) as GillNote[]);

  const result: GillChapterNotes = { bookId, chapter, notes };
  translatedCache.set(key, result);
  return result;
}
