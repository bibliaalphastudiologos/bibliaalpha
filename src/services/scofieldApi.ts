/**
 * scofieldApi.ts
 * 
 * Fetches KJV text from bolls.life (free, no key required) and provides
 * Scofield-style study notes. The KJV marginal notes inside <sup>...</sup>
 * are extracted as footnotes and translated via Google Translate.
 */

import { translateToPortuguese } from './knowledgeApi';

const BOLLS_API = 'https://bolls.life';

// ── Book ID mapping: OSIS ID → bolls.life bookid ─────────────────────────────
const OSIS_TO_BOLLS: Record<string, number> = {
  GEN: 1,  EXO: 2,  LEV: 3,  NUM: 4,  DEU: 5,
  JOS: 6,  JDG: 7,  RUT: 8,  '1SA': 9, '2SA': 10,
  '1KI': 11, '2KI': 12, '1CH': 13, '2CH': 14,
  EZR: 15, NEH: 16, EST: 17, JOB: 18, PSA: 19,
  PRO: 20, ECC: 21, SNG: 22, ISA: 23, JER: 24,
  LAM: 25, EZK: 26, DAN: 27, HOS: 28, JOL: 29,
  AMO: 30, OBA: 31, JON: 32, MIC: 33, NAH: 34,
  HAB: 35, ZEP: 36, HAG: 37, ZEC: 38, MAL: 39,
  MAT: 40, MRK: 41, LUK: 42, JHN: 43, ACT: 44,
  ROM: 45, '1CO': 46, '2CO': 47, GAL: 48, EPH: 49,
  PHP: 50, COL: 51, '1TH': 52, '2TH': 53, '1TI': 54,
  '2TI': 55, TIT: 56, PHM: 57, HEB: 58, JAS: 59,
  '1PE': 60, '2PE': 61, '1JN': 62, '2JN': 63,
  '3JN': 64, JUD: 65, REV: 66,
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ScofieldVerse {
  verse: number;
  text: string;          // clean KJV text (Strong's stripped)
  textPt: string;        // translated to PT
  footnote?: string;     // KJV marginal note (English)
  footnotePt?: string;   // translated footnote
}

export interface ScofieldChapter {
  bookId: string;
  bookName: string;
  chapter: number;
  verses: ScofieldVerse[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Remove Strong's numbers: <S>1234</S> */
function stripStrongs(raw: string): string {
  return raw.replace(/<S>\d+<\/S>/g, '').replace(/\s{2,}/g, ' ').trim();
}

/** Extract <sup>...</sup> content as a footnote */
function extractFootnote(raw: string): { text: string; footnote: string | undefined } {
  const match = raw.match(/<sup>([\s\S]*?)<\/sup>/);
  const footnote = match ? match[1].trim() : undefined;
  const text = raw.replace(/<sup>[\s\S]*?<\/sup>/g, '').trim();
  return { text, footnote };
}

// ── Cache ─────────────────────────────────────────────────────────────────────

const chapterCache = new Map<string, ScofieldChapter>();

// ── Main function ─────────────────────────────────────────────────────────────

export async function getScofieldChapter(
  bookId: string,
  bookName: string,
  chapter: number
): Promise<ScofieldChapter> {
  const cacheKey = `${bookId}_${chapter}`;
  if (chapterCache.has(cacheKey)) return chapterCache.get(cacheKey)!;

  const bollsId = OSIS_TO_BOLLS[bookId];
  if (!bollsId) {
    throw new Error(`Livro não encontrado no mapeamento: ${bookId}`);
  }

  const res = await fetch(`${BOLLS_API}/get-chapter/KJV/${bollsId}/${chapter}/`);
  if (!res.ok) throw new Error(`Erro ao buscar KJV ${bookId} ${chapter}`);

  const raw: Array<{ pk: number; verse: number; text: string }> = await res.json();

  // Process verses in parallel — translate text + footnotes
  const verses: ScofieldVerse[] = await Promise.all(
    raw.map(async (v) => {
      const withoutStrongs = stripStrongs(v.text);
      const { text: cleanText, footnote } = extractFootnote(withoutStrongs);

      const [textPt, footnotePt] = await Promise.all([
        translateToPortuguese(cleanText),
        footnote ? translateToPortuguese(footnote) : Promise.resolve(undefined),
      ]);

      return {
        verse: v.verse,
        text: cleanText,
        textPt,
        footnote,
        footnotePt,
      };
    })
  );

  const result: ScofieldChapter = { bookId, bookName, chapter, verses };
  chapterCache.set(cacheKey, result);
  return result;
}
