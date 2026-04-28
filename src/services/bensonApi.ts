/**
 * bensonApi.ts
 *
 * Loads Joseph Benson's Commentary of the Old and New Testaments
 * (1818, public domain) — extracted from StudyLight.org.
 * Data served as static JSON from /data/benson_notes.json.
 *
 * Data format:
 *   { [bookKey: string]: { [chapter: string]: Array<{ k: string; t: string }> } }
 *   k = keyword/heading (phrase from the KJV verse being commented on)
 *   t = commentary body text
 *
 * Translation: translateToPortuguese() from knowledgeApi (Google Translate).
 */

import { translateToPortuguese } from './knowledgeApi';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BensonNote {
  keyword: string;
  keywordPt: string;
  text: string;
  textPt: string;
}

export interface BensonChapterNotes {
  bookKey: string;
  chapter: number;
  notes: BensonNote[];
}

// ── Cache ─────────────────────────────────────────────────────────────────────

let rawDataCache: Record<string, Record<string, Array<{ k: string; t: string }>>> | null = null;
const translatedCache = new Map<string, BensonChapterNotes>();

// ── Loader ────────────────────────────────────────────────────────────────────

async function loadRawData() {
  if (rawDataCache) return rawDataCache;
  const res = await fetch('/data/benson_notes.json');
  if (!res.ok) throw new Error('Failed to load Benson data');
  rawDataCache = await res.json();
  return rawDataCache!;
}

// ── Main API ──────────────────────────────────────────────────────────────────

export async function getBensonNotes(
  bookKey: string,
  chapter: number
): Promise<BensonChapterNotes> {
  const cacheKey = `${bookKey}_${chapter}`;
  if (translatedCache.has(cacheKey)) return translatedCache.get(cacheKey)!;

  const data = await loadRawData();
  const bookData = data[bookKey];

  if (!bookData) {
    const empty: BensonChapterNotes = { bookKey, chapter, notes: [] };
    translatedCache.set(cacheKey, empty);
    return empty;
  }

  const rawNotes = bookData[String(chapter)] ?? [];

  if (rawNotes.length === 0) {
    const empty: BensonChapterNotes = { bookKey, chapter, notes: [] };
    translatedCache.set(cacheKey, empty);
    return empty;
  }

  const notes: BensonNote[] = await Promise.all(
    rawNotes.map(async ({ k, t }) => {
      const [keywordPt, textPt] = await Promise.all([
        k ? translateToPortuguese(k) : Promise.resolve(''),
        translateToPortuguese(t),
      ]);
      return { keyword: k, keywordPt, text: t, textPt };
    })
  );

  const result: BensonChapterNotes = { bookKey, chapter, notes };
  translatedCache.set(cacheKey, result);
  return result;
}
