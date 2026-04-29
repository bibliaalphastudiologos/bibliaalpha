import { translateToPortuguese } from './knowledgeApi';

const BIBLE_API_BASE = 'https://bible.helloao.org/api';

export interface ClarkeNote {
  verseNumber: number;
  text: string;
  textPt: string;
}

export interface ClarkeChapterNotes {
  bookId: string;
  chapter: number;
  notes: ClarkeNote[];
}

let translatedCache = new Map<string, ClarkeChapterNotes>();

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

export async function getClarkeNotes(bookId: string, chapter: number): Promise<ClarkeChapterNotes> {
  const key = `${bookId}_${chapter}`;
  if (translatedCache.has(key)) return translatedCache.get(key)!;

  const data = await safeCommentaryFetch(`${BIBLE_API_BASE}/c/adam-clarke/${bookId}/${chapter}.json`);
  if (!data?.chapter?.content) {
    const empty: ClarkeChapterNotes = { bookId, chapter, notes: [] };
    translatedCache.set(key, empty);
    return empty;
  }

  const rawVerses = data.chapter.content.filter((v: any) => v.type === 'verse' && v.content?.length > 0);

  const notes: ClarkeNote[] = await Promise.all(
    rawVerses.map(async (v: any) => {
      const rawText = extractText(v.content);
      if (!rawText) return null;
      const textPt = await translateToPortuguese(rawText);
      return { verseNumber: v.number, text: rawText, textPt } as ClarkeNote;
    })
  ).then(r => r.filter(Boolean) as ClarkeNote[]);

  const result: ClarkeChapterNotes = { bookId, chapter, notes };
  translatedCache.set(key, result);
  return result;
}
