import { useState, useEffect, useCallback } from 'react';
import { X, Languages, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { getChapterWords, decodeGreekMorph, decodeHebrewMorph, isNT, type BibleWord, type ChapterWordMap } from '../services/greekHebrewApi';
import { cn } from '../App';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookName: string;
  chapter: number;
  totalChapters: number;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  onNavigate?: (bookId: string, chapter: number) => void;
}

// Part-of-speech color coding
const posColor = (morph: string) => {
  const m = morph.toUpperCase();
  if (m.startsWith('V')) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (m.startsWith('N')) return 'bg-amber-100 text-amber-800 border-amber-200';
  if (m.startsWith('PREP') || m.startsWith('R')) return 'bg-rose-100 text-rose-800 border-rose-200';
  if (m.startsWith('CONJ') || m.startsWith('C')) return 'bg-green-100 text-green-800 border-green-200';
  if (m.startsWith('PRON') || m.startsWith('P')) return 'bg-cyan-100 text-cyan-800 border-cyan-200';
  if (m.startsWith('ADJ') || m.startsWith('A')) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (m.startsWith('DET') || m.startsWith('T')) return 'bg-purple-100 text-purple-800 border-purple-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const posLabel = (morph: string) => {
  const m = morph.toUpperCase();
  if (m.startsWith('V')) return 'V';
  if (m.startsWith('N')) return 'S';
  if (m.startsWith('PREP') || m.startsWith('R')) return 'Pr';
  if (m.startsWith('CONJ') || m.startsWith('C')) return 'Cj';
  if (m.startsWith('PRON') || m.startsWith('P')) return 'Pn';
  if (m.startsWith('ADJ') || m.startsWith('A')) return 'Aj';
  if (m.startsWith('DET') || m.startsWith('T')) return 'Ar';
  return '·';
};

interface WordChipProps {
  word: BibleWord;
  isSelected: boolean;
  onClick: () => void;
  rtl: boolean;
}

function WordChip({ word, isSelected, onClick, rtl }: WordChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex flex-col items-center px-2 py-1 rounded-lg border text-center transition-all cursor-pointer select-none',
        isSelected
          ? 'ring-2 ring-offset-1 ring-indigo-400 shadow-md scale-105 bg-indigo-50 border-indigo-300'
          : 'hover:scale-105 hover:shadow-sm',
        posColor(word.m)
      )}
      style={{ minWidth: 44 }}
    >
      <span
        className="text-[16px] font-semibold leading-tight"
        dir={rtl ? 'rtl' : 'ltr'}
      >{word.w}</span>
      <span className="text-[9px] opacity-60 leading-tight mt-0.5">{word.t}</span>
      <span className="text-[8px] font-bold uppercase opacity-50">{posLabel(word.m)}</span>
    </button>
  );
}

interface WordDetailProps {
  word: BibleWord;
  nt: boolean;
  onClose: () => void;
}

function WordDetail({ word, nt, onClose }: WordDetailProps) {
  const morph = nt ? decodeGreekMorph(word.m) : decodeHebrewMorph(word.m);
  return (
    <div className="my-2 mx-1 bg-white border border-indigo-200 rounded-xl shadow-lg p-4 relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
      >
        <X size={12} />
      </button>

      {/* Large word */}
      <div className="text-center mb-3">
        <div
          className="text-4xl font-bold text-indigo-700 mb-1"
          dir={nt ? 'ltr' : 'rtl'}
        >{word.w}</div>
        <div className="text-sm text-gray-500 italic">{word.t}</div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {/* Strong */}
        <div className="bg-indigo-50 rounded-lg p-2">
          <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wide mb-0.5">Strong</div>
          <div className="font-mono font-bold text-indigo-700">{word.s}</div>
        </div>
        {/* Lemma */}
        <div className="bg-amber-50 rounded-lg p-2">
          <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wide mb-0.5">Lema</div>
          <div className="font-semibold text-amber-700" dir={nt ? 'ltr' : 'rtl'}>{word.l}</div>
        </div>
        {/* Morphology */}
        <div className="bg-emerald-50 rounded-lg p-2 col-span-2">
          <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wide mb-0.5">Morfologia</div>
          <div className="text-emerald-700 text-xs font-medium">{morph || word.m}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">{word.m}</div>
        </div>
        {/* Definition */}
        <div className="bg-gray-50 rounded-lg p-2 col-span-2">
          <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Definição (EN)</div>
          <div className="text-gray-700 text-xs">{word.lg || word.g}</div>
        </div>
        {/* Gloss */}
        {word.g !== word.lg && (
          <div className="bg-gray-50 rounded-lg p-2 col-span-2">
            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Ocorrência</div>
            <div className="text-gray-600 text-xs italic">"{word.g}"</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GreekHebrewPanel({
  isOpen, onClose, bookId, bookName, chapter, totalChapters,
  onPrevChapter, onNextChapter,
}: Props) {
  const [wordMap, setWordMap]         = useState<ChapterWordMap>({});
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [selected, setSelected]       = useState<{ verse: string; idx: number } | null>(null);

  const nt  = isNT(bookId);
  const rtl = !nt; // Hebrew is RTL

  const loadWords = useCallback(async () => {
    if (!bookId) return;
    setLoading(true);
    setError('');
    setSelected(null);
    try {
      const data = await getChapterWords(bookId, chapter);
      setWordMap(data);
      if (Object.keys(data).length === 0) {
        setError('Dados não disponíveis para este capítulo.');
      }
    } catch {
      setError('Erro ao carregar dados linguísticos.');
    } finally {
      setLoading(false);
    }
  }, [bookId, chapter]);

  useEffect(() => {
    if (isOpen) loadWords();
  }, [isOpen, loadWords]);

  if (!isOpen) return null;

  const progressPct = Math.round((chapter / totalChapters) * 100);
  const lang = nt ? 'Grego' : 'Hebraico';
  const accentColor = nt ? 'indigo' : 'amber';

  const verseEntries = Object.entries(wordMap).sort(
    ([a], [b]) => parseInt(a) - parseInt(b)
  );

  const LEGEND = [
    { cls: 'bg-blue-100 text-blue-800 border-blue-200',   label: 'Verbo' },
    { cls: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Subst.' },
    { cls: 'bg-rose-100 text-rose-800 border-rose-200',   label: 'Prep.' },
    { cls: 'bg-green-100 text-green-800 border-green-200', label: 'Conj.' },
    { cls: 'bg-cyan-100 text-cyan-800 border-cyan-200',   label: 'Pron.' },
    { cls: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Adj.' },
    { cls: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Art.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end pointer-events-none">
      <div
        className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col pointer-events-auto"
        style={{ borderLeft: '1px solid #e5e7eb' }}
      >
        {/* Progress bar */}
        <div className="h-0.5 bg-gray-100">
          <div
            className={cn('h-full transition-all', nt ? 'bg-indigo-500' : 'bg-amber-500')}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Header */}
        <div className={cn(
          'flex items-center gap-3 px-4 py-3 border-b border-gray-100',
          nt ? 'bg-indigo-50' : 'bg-amber-50'
        )}>
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm',
            nt ? 'bg-indigo-600' : 'bg-amber-500'
          )}>
            <Languages size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <h2 className={cn('font-bold text-base', nt ? 'text-indigo-900' : 'text-amber-900')}>
                Estudo {lang}
              </h2>
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full',
                nt ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
              )}>
                {nt ? 'NT' : 'AT'}
              </span>
            </div>
            <p className={cn('text-xs truncate', nt ? 'text-indigo-600' : 'text-amber-600')}>
              {bookName} · cap. {chapter} de {totalChapters}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/70 text-gray-500 hover:text-gray-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Chapter navigation */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
          <button
            onClick={onPrevChapter}
            disabled={chapter <= 1}
            className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft size={14} /> Anterior
          </button>
          <span className="text-xs text-gray-500 font-medium">cap. {chapter} / {totalChapters}</span>
          <button
            onClick={onNextChapter}
            disabled={chapter >= totalChapters}
            className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-200 transition-colors"
          >
            Próximo <ChevronRight size={14} />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50">
          {LEGEND.map(l => (
            <span key={l.label} className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded border', l.cls)}>
              {l.label}
            </span>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className={cn('w-8 h-8 border-2 border-t-transparent rounded-full animate-spin',
                nt ? 'border-indigo-500' : 'border-amber-500')} />
              <p className="text-sm text-gray-400">Carregando palavras…</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
              <BookOpen size={32} className="text-gray-300" />
              <p className="text-sm text-gray-500">{error}</p>
              <button onClick={loadWords}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && verseEntries.length > 0 && (
            <div className="divide-y divide-gray-50">
              {verseEntries.map(([verseNum, words]) => {
                const isSelectedVerse = selected?.verse === verseNum;
                return (
                  <div key={verseNum} className="px-4 py-3">
                    {/* Verse number */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        'text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0',
                        nt ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
                      )}>{verseNum}</span>
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>

                    {/* Word chips */}
                    <div
                      className="flex flex-wrap gap-1.5"
                      dir={rtl ? 'rtl' : 'ltr'}
                    >
                      {words.map((word, idx) => (
                        <WordChip
                          key={`${verseNum}-${idx}`}
                          word={word}
                          rtl={rtl}
                          isSelected={isSelectedVerse && selected?.idx === idx}
                          onClick={() =>
                            setSelected(
                              isSelectedVerse && selected?.idx === idx
                                ? null
                                : { verse: verseNum, idx }
                            )
                          }
                        />
                      ))}
                    </div>

                    {/* Word detail (inline, after verse) */}
                    {isSelectedVerse && selected !== null && (
                      <WordDetail
                        word={words[selected.idx]}
                        nt={nt}
                        onClose={() => setSelected(null)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            TAGNT/TAHOT · STEPBible Data, Tyndale House Cambridge · CC BY 4.0
          </p>
        </div>
      </div>
    </div>
  );
}
