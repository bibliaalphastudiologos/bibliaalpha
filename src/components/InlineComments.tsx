import React, { useState, useEffect, Component } from 'react';
import { cn } from '../App';
import { getScofieldNotes, ScofieldNote } from '../services/scofieldApi';
import { getMatthewHenryNotes, MatthewHenryNote } from '../services/matthewHenryApi';
import { BookMarked, ChevronDown, ChevronUp } from 'lucide-react';
import { ReferenceText } from '../utils/bibleRefParser';

interface InlineCommentsProps {
  bookId: string;
  chapter: number;
  verseNumber: number;
  onClose?: (e: React.MouseEvent) => void;
  scofieldBookKey?: string;
  onNavigate?: (bookId: string, chapter: number) => void;
}

// Book ID → Scofield book key
const BOOK_ID_TO_SCOFIELD: Record<string, string> = {
  GEN:'GEN',EXO:'EXO',LEV:'LEV',NUM:'NUM',DEU:'DEU',JOS:'JOS',JDG:'JDG',RUT:'RUT',
  '1SA':'1SA','2SA':'2SA','1KI':'1KI','2KI':'2KI','1CH':'1CH','2CH':'2CH',
  EZR:'EZR',NEH:'NEH',EST:'EST',JOB:'JOB',PSA:'PSA',PRO:'PRO',ECC:'ECC',SNG:'SNG',
  ISA:'ISA',JER:'JER',LAM:'LAM',EZK:'EZK',DAN:'DAN',HOS:'HOS',JOL:'JOL',AMO:'AMO',
  OBA:'OBA',JON:'JON',MIC:'MIC',NAH:'NAH',HAB:'HAB',ZEP:'ZEP',HAG:'HAG',ZEC:'ZEC',MAL:'MAL',
  MAT:'MAT',MRK:'MRK',LUK:'LUK',JHN:'JHN',ACT:'ACT',ROM:'ROM',
  '1CO':'1CO','2CO':'2CO',GAL:'GAL',EPH:'EPH',PHP:'PHP',COL:'COL',
  '1TH':'1TH','2TH':'2TH','1TI':'1TI','2TI':'2TI',TIT:'TIT',PHM:'PHM',
  HEB:'HEB',JAS:'JAS','1PE':'1PE','2PE':'2PE','1JN':'1JN','2JN':'2JN',
  '3JN':'3JN',JUD:'JUD',REV:'REV',
};

const noteCache = new Map<string, ScofieldNote[]>();

function getCacheKey(bookId: string, chapter: number, verse: number) {
  return `${bookId}:${chapter}:${verse}`;
}

// ── Error Boundary ─────────────────────────────────────────────────────────
class CommentErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: any) { console.error('[ScofieldInline] crash:', err); }
  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="my-3 px-4 py-3 bg-red-500/10 border-l-2 border-red-500/40 rounded-r-lg text-[13px] text-red-500 font-sans">
          Não foi possível carregar as notas. Tente novamente.
        </div>
      );
    }
    return this.props.children;
  }
}

// ── KJV verse fetcher (cached) ─────────────────────────────────────────────
const kjvCache = new Map<string, Record<number, string>>();
async function fetchKjvVerses(bookId: string, chapter: number): Promise<Record<number, string>> {
  const key = `${bookId}:${chapter}`;
  if (kjvCache.has(key)) return kjvCache.get(key)!;
  try {
    const res = await fetch(`https://bible.helloao.org/api/eng_kjv/${bookId}/${chapter}.json`);
    if (!res.ok) return {};
    const data = await res.json();
    const map: Record<number, string> = {};
    (data?.chapter?.content ?? []).forEach((v: any) => {
      if (v.type === 'verse' && v.number) {
        map[v.number] = (v.content ?? []).filter((c: any) => typeof c === 'string').join(' ').toLowerCase();
      }
    });
    kjvCache.set(key, map);
    return map;
  } catch { return {}; }
}

// ── Match Scofield notes to a verse via KJV keyword matching ──────────────
async function getNotesForVerse(bookId: string, chapter: number, verseNumber: number): Promise<ScofieldNote[]> {
  const cacheKey = getCacheKey(bookId, chapter, verseNumber);
  if (noteCache.has(cacheKey)) return noteCache.get(cacheKey)!;

  const scofieldKey = BOOK_ID_TO_SCOFIELD[bookId] ?? bookId.toUpperCase();
  const [chapterNotes, kjvMap] = await Promise.all([
    getScofieldNotes(scofieldKey, chapter),
    fetchKjvVerses(bookId, chapter),
  ]);

  const allNotes = chapterNotes.notes;
  if (allNotes.length === 0) {
    noteCache.set(cacheKey, []);
    return [];
  }

  const verseText = kjvMap[verseNumber] ?? '';
  let matched: ScofieldNote[] = [];

  if (verseText) {
    matched = allNotes.filter(note =>
      note.keyword && verseText.includes(note.keyword.toLowerCase().trim())
    );
  }

  // Fallback: divide notes proportionally across verses
  if (matched.length === 0) {
    const verseNumbers = Object.keys(kjvMap).map(Number).sort((a, b) => a - b);
    const verseIdx = verseNumbers.indexOf(verseNumber);
    if (verseIdx >= 0 && verseNumbers.length > 0) {
      const notesPerVerse = allNotes.length / verseNumbers.length;
      const startNote = Math.floor(verseIdx * notesPerVerse);
      const endNote = Math.ceil((verseIdx + 1) * notesPerVerse);
      matched = allNotes.slice(startNote, endNote);
    }
  }

  const result = matched.slice(0, 3);
  noteCache.set(cacheKey, result);
  return result;
}

// ── Inner component ────────────────────────────────────────────────────────
function InlineCommentsInner({ bookId, chapter, verseNumber, onClose, onNavigate }: InlineCommentsProps) {
  const [notes, setNotes]     = useState<ScofieldNote[]>([]);
  const [mhNotes, setMhNotes] = useState<MatthewHenryNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: true });
  const [mhExpanded, setMhExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setNotes([]);
    setMhNotes([]);
    setExpanded({ 0: true });
    setMhExpanded({});

    Promise.all([
      getNotesForVerse(bookId, chapter, verseNumber),
      getMatthewHenryNotes(bookId, chapter),
    ]).then(([scof, mh]) => {
      if (!alive) return;
      setNotes(scof);
      const verseNotes = mh.notes.filter(n => n.verseNumber === verseNumber);
      setMhNotes(verseNotes);
      setIsLoading(false);
    }).catch(() => { if (alive) setIsLoading(false); });

    return () => { alive = false; };
  }, [bookId, chapter, verseNumber]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'my-4 block w-full bg-sleek-surface border border-sleek-border rounded-xl overflow-hidden shadow-sm transition-all duration-300 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-sleek-border cursor-pointer hover:bg-sleek-hover transition-colors"
        onClick={onClose}
        title="Fechar notas"
      >
        <div className="flex items-center gap-2">
          <BookMarked size={13} className="text-amber-500 shrink-0" />
          <span className="font-sans text-[11px] font-bold tracking-wider text-sleek-text-muted uppercase">
            Notas de Estudo · Scofield · v.{verseNumber}
          </span>
        </div>
        <span className="text-[11px] text-sleek-text-muted hover:text-sleek-text-main transition-colors font-sans">
          Fechar ×
        </span>
      </div>

      {/* Body */}
      <div className="px-4 sm:px-5 pb-5">
        {isLoading ? (
          <div className="space-y-4 pt-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-sleek-avatar-bg rounded w-40 mb-2" />
                <div className="space-y-2">
                  <div className="h-3 bg-sleek-avatar-bg rounded w-full" />
                  <div className="h-3 bg-sleek-avatar-bg rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : notes.length > 0 ? (
          <div className="space-y-3 pt-3">
            {notes.map((note, idx) => (
              <div key={idx} className="border border-sleek-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors',
                    expanded[idx] ? 'bg-amber-50 border-b border-amber-100' : 'hover:bg-sleek-hover'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <BookMarked size={11} className={cn('shrink-0', expanded[idx] ? 'text-amber-500' : 'text-sleek-text-muted')} />
                    <span className={cn('text-[12px] font-semibold truncate', expanded[idx] ? 'text-amber-700' : 'text-sleek-text-main')}>
                      {note.keywordPt || note.keyword}
                    </span>
                    {note.keyword && note.keyword !== note.keywordPt && (
                      <span className="text-[10px] text-sleek-text-muted italic hidden sm:inline">({note.keyword})</span>
                    )}
                  </div>
                  {expanded[idx]
                    ? <ChevronUp size={12} className="text-amber-400 shrink-0" />
                    : <ChevronDown size={12} className="text-sleek-text-muted shrink-0" />}
                </button>

                {expanded[idx] && (
                  <div className="px-3 py-3 space-y-2">
                    <p className="text-[13px] sm:text-[14px] leading-relaxed text-sleek-text-main">
                      <ReferenceText text={note.textPt} onNavigate={onNavigate} />
                    </p>
                    {note.text && note.text !== note.textPt && (
                      <details className="group">
                        <summary className="text-[10px] text-amber-400 cursor-pointer select-none list-none hover:text-amber-600">
                          <span className="group-open:hidden">▶ original em inglês</span>
                          <span className="hidden group-open:inline">▼ original em inglês</span>
                        </summary>
                        <p className="mt-1 text-[11px] italic leading-relaxed text-sleek-text-muted border-l-2 border-amber-100 pl-3">
                          <ReferenceText text={note.text} onNavigate={onNavigate} />
                        </p>
                      </details>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}

        {/* Matthew Henry notes */}
        {!isLoading && mhNotes.length > 0 && (
          <div className="space-y-3 pt-3 mt-3 border-t border-sleek-border">
            <div className="flex items-center gap-1.5 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Matthew Henry</span>
            </div>
            {mhNotes.map((note, idx) => (
              <div key={idx} className="border border-emerald-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => setMhExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors',
                    mhExpanded[idx] ? 'bg-emerald-50 border-b border-emerald-100' : 'hover:bg-sleek-hover'
                  )}
                >
                  <span className={cn('text-[12px] font-semibold', mhExpanded[idx] ? 'text-emerald-700' : 'text-sleek-text-main')}>
                    Versículo {note.verseNumber}
                  </span>
                  {mhExpanded[idx]
                    ? <ChevronUp size={12} className="text-emerald-400 shrink-0" />
                    : <ChevronDown size={12} className="text-sleek-text-muted shrink-0" />}
                </button>
                {mhExpanded[idx] && (
                  <div className="px-3 py-3">
                    <p className="text-[13px] leading-relaxed text-sleek-text-main">
                      <ReferenceText text={note.textPt} onNavigate={onNavigate} />
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!isLoading && notes.length === 0 && mhNotes.length === 0 && (
          <div className="text-[13px] text-sleek-text-muted italic pt-3">
            Sem notas disponíveis para este versículo.
          </div>
        )}
      </div>
    </div>
  );
}

export default function InlineComments(props: InlineCommentsProps) {
  return (
    <CommentErrorBoundary>
      <InlineCommentsInner {...props} />
    </CommentErrorBoundary>
  );
}
