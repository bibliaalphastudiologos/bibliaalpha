const BIBLE_API_BASE = 'https://bible.helloao.org/api';
// Usa por_onbv (Nova Bíblia Viva) para lista de livros e comentários
// por_blj retorna capítulos vazios — não usar para conteúdo
const BOOKS_TRANSLATION_ID = 'por_onbv';
const COMMENTARIES_IDS = ['adam-clarke', 'jamieson-fausset-brown', 'matthew-henry', 'john-gill', 'tyndale'];

export interface Book {
  id: string;
  name: string;
  commonName: string;
  numberOfChapters: number;
}

export async function getBooks(): Promise<Book[]> {
  const res = await fetch(`${BIBLE_API_BASE}/${BOOKS_TRANSLATION_ID}/books.json`);
  if (!res.ok) throw new Error('Failed to fetch books');
  const data = await res.json();
  return data.books;
}

export async function getChapter(bookId: string, chapter: number): Promise<any[]> {
  const res = await fetch(`${BIBLE_API_BASE}/${BOOKS_TRANSLATION_ID}/${bookId}/${chapter}.json`);
  if (!res.ok) throw new Error('Failed to fetch chapter');
  const data = await res.json();
  const content = data.chapter?.content ?? [];
  return content.filter((item: any) => item.type === 'verse').map((item: any) => ({
    type: 'verse',
    number: item.number,
    content: item.content.filter((c: any) => typeof c === 'string'),
  }));
}

/**
 * Safely fetches and parses JSON from the commentary API.
 * The API returns HTML for books/chapters that do not exist
 * instead of a proper 404 — calling .json() on HTML crashes the app.
 */
async function safeCommentaryFetch(url: string): Promise<any | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Splits a long commentary string into clean, readable paragraphs.
 */
function splitCommentaryText(rawText: string): string[] {
  const lines = rawText
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const paragraphs: string[] = [];
  let current = '';

  for (const line of lines) {
    if (current.length + line.length > 600 && current.length > 0) {
      paragraphs.push(current.trim());
      current = line;
    } else {
      current += (current ? ' ' : '') + line;
    }
    if (paragraphs.length >= 2) break;
  }

  if (current.trim() && paragraphs.length < 2) {
    paragraphs.push(current.trim());
  }

  return paragraphs.slice(0, 2);
}

/**
 * Fetches verse commentaries from multiple sources.
 * Uses Promise.allSettled + safeCommentaryFetch so any failure is silent.
 */
export async function getVerseCommentaries(bookId: string, chapter: number, verseNumber: number): Promise<any[]> {
  const promises = COMMENTARIES_IDS.map(async (commentaryId) => {
    try {
      const data = await safeCommentaryFetch(
        `${BIBLE_API_BASE}/c/${commentaryId}/${bookId}/${chapter}.json`
      );
      if (!data) return null;

      const verseContent = data?.chapter?.content?.find(
        (v: any) => v.type === 'verse' && v.number === verseNumber
      );
      if (!verseContent?.content?.length) return null;

      const rawTexts = verseContent.content.filter(
        (c: any) => typeof c === 'string' && c.trim().length > 0
      );
      if (rawTexts.length === 0) return null;

      const paragraphs = splitCommentaryText(rawTexts.join(' '));
      if (paragraphs.length === 0) return null;

      const names: Record<string, string> = {
        'adam-clarke': 'Adam Clarke',
        'jamieson-fausset-brown': 'Jamieson, Fausset & Brown',
        'matthew-henry': 'Matthew Henry',
        'john-gill': 'John Gill',
        'tyndale': 'Tyndale',
      };
      return { id: commentaryId, name: names[commentaryId] ?? commentaryId, paragraphs };
    } catch {
      return null;
    }
  });

  const results = await Promise.allSettled(promises);
  return results
    .filter((r) => r.status === 'fulfilled' && r.value !== null)
    .map((r) => (r as PromiseFulfilledResult<any>).value);
}
