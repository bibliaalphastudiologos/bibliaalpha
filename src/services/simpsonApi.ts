/**
 * simpsonApi.ts
 *
 * Loads A.B. Simpson devotional notes (public domain) extracted from
 * "Days of Heaven Upon Earth" (1897). Data served as static JSON from
 * /data/simpson_notes.json.
 *
 * Data format:
 *   { [bookKey: string]: { [chapter: string]: Array<{ k: string; t: string }> } }
 *   k = verse text (heading)
 *   t = devotional commentary body
 */

import { translateToPortuguese } from './knowledgeApi';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SimpsonNote {
  keyword: string;
  keywordPt: string;
  text: string;
  textPt: string;
}

export interface SimpsonChapterNotes {
  bookKey: string;
  chapter: number;
  notes: SimpsonNote[];
}

// ── Cache ─────────────────────────────────────────────────────────────────────

let rawDataCache: Record<string, Record<string, Array<{ k: string; t: string }>>> | null = null;
const translatedCache = new Map<string, SimpsonChapterNotes>();

// ── Loader ────────────────────────────────────────────────────────────────────

async function loadRawData() {
  if (rawDataCache) return rawDataCache;
  const res = await fetch('/data/simpson_notes.json');
  if (!res.ok) throw new Error('Failed to load A.B. Simpson data');
  rawDataCache = await res.json();
  return rawDataCache!;
}

// ── Main API ──────────────────────────────────────────────────────────────────

export async function getSimpsonNotes(
  bookKey: string,
  chapter: number
): Promise<SimpsonChapterNotes> {
  const cacheKey = `${bookKey}_${chapter}`;
  if (translatedCache.has(cacheKey)) return translatedCache.get(cacheKey)!;

  const data = await loadRawData();
  const bookData = data[bookKey];

  if (!bookData) {
    const empty: SimpsonChapterNotes = { bookKey, chapter, notes: [] };
    translatedCache.set(cacheKey, empty);
    return empty;
  }

  const rawNotes = bookData[String(chapter)] ?? [];

  if (rawNotes.length === 0) {
    const empty: SimpsonChapterNotes = { bookKey, chapter, notes: [] };
    translatedCache.set(cacheKey, empty);
    return empty;
  }

  const notes: SimpsonNote[] = await Promise.all(
    rawNotes.map(async ({ k, t }) => {
      const [keywordPt, textPt] = await Promise.all([
        k ? translateToPortuguese(k) : Promise.resolve(''),
        translateToPortuguese(t),
      ]);
      return { keyword: k, keywordPt, text: t, textPt };
    })
  );

  const result: SimpsonChapterNotes = { bookKey, chapter, notes };
  translatedCache.set(cacheKey, result);
  return result;
}
