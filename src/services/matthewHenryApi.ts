import { translateToPortuguese } from './knowledgeApi';

const BIBLE_API_BASE = 'https://bible.helloao.org/api';

export interface MatthewHenryNote {
  verseNumber: number;
  text: string;
  textPt: string;
}

export interface MatthewHenryChapterNotes {
  bookId: string;
  chapter: number;
  notes: MatthewHenryNote[];
}

let translatedCache = new Map<string, MatthewHenryChapterNotes>();

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
    .substring(0, 1400);
}

export async function getMatthewHenryNotes(bookId: string, chapter: number): Promise<MatthewHenryChapterNotes> {
  const key = `${bookId}_${chapter}`;
  if (translatedCache.has(key)) return translatedCache.get(key)!;

  const data = await safeCommentaryFetch(`${BIBLE_API_BASE}/c/matthew-henry/${bookId}/${chapter}.json`);
  if (!data?.chapter?.content) {
    const empty: MatthewHenryChapterNotes = { bookId, chapter, notes: [] };
    translatedCache.set(key, empty);
    return empty;
  }

  const rawVerses = data.chapter.content.filter(
    (v: any) => v.type === 'verse' && v.content?.length > 0
  );

  const notes: MatthewHenryNote[] = await Promise.all(
    rawVerses.map(async (v: any) => {
      const raw = extractText(v.content);
      if (!raw) return null;
      let textPt = raw;
      try { textPt = await translateToPortuguese(raw); } catch { /* keep original */ }
      return { verseNumber: v.number, text: raw, textPt } as MatthewHenryNote;
    })
  ).then(arr => arr.filter(Boolean) as MatthewHenryNote[]);

  const result: MatthewHenryChapterNotes = { bookId, chapter, notes };
  translatedCache.set(key, result);
  return result;
}
