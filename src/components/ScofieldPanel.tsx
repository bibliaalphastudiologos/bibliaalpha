import { useState, useEffect, useRef } from 'react';
import { X, BookOpen, ChevronLeft, ChevronRight, Loader2, BookMarked } from 'lucide-react';
import { cn } from '../App';
import { getScofieldChapter, ScofieldVerse } from '../services/scofieldApi';

interface ScofieldPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookName: string;
  chapter: number;
  totalChapters: number;
  onPrevChapter: () => void;
  onNextChapter: () => void;
}

export default function ScofieldPanel({
  isOpen,
  onClose,
  bookId,
  bookName,
  chapter,
  totalChapters,
  onPrevChapter,
  onNextChapter,
}: ScofieldPanelProps) {
  const [verses, setVerses] = useState<ScofieldVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFootnotes, setExpandedFootnotes] = useState<Set<number>>(new Set());
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isOpen || !bookId) return;
    setVerses([]);
    setError(null);
    setExpandedFootnotes(new Set());

    let alive = true;
    setLoading(true);

    getScofieldChapter(bookId, bookName, chapter)
      .then((data) => {
        if (alive) setVerses(data.verses);
      })
      .catch((err) => {
        if (alive) setError('Não foi possível carregar este capítulo. Verifique sua conexão.');
        console.error('[Scofield]', err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [isOpen, bookId, bookName, chapter]);

  const toggleFootnote = (verse: number) => {
    setExpandedFootnotes((prev) => {
      const next = new Set(prev);
      if (next.has(verse)) next.delete(verse);
      else next.add(verse);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-sleek-bg">
      {/* ── Header ── */}
      <header className="h-12 flex items-center justify-between px-4 sm:px-8 border-b border-sleek-border bg-sleek-bg shrink-0">
        <div className="flex items-center gap-2.5">
          <BookMarked size={15} className="text-indigo-500 shrink-0" />
          <div className="flex flex-col leading-none">
            <h1 className="text-[13px] sm:text-[14px] font-semibold text-sleek-text-main">
              Bíblia de Estudo Scofield
            </h1>
            <span className="text-[10px] text-sleek-text-muted mt-0.5">
              King James Version · traduzido para o português
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-sleek-hover rounded-lg text-sleek-text-muted transition-colors"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </header>

      {/* ── Chapter nav bar ── */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-2 border-b border-sleek-border/60 bg-sleek-sidebar-bg shrink-0">
        <button
          onClick={onPrevChapter}
          disabled={chapter <= 1}
          className="flex items-center gap-1 text-[12px] text-sleek-text-muted hover:text-sleek-text-main disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded-md hover:bg-sleek-hover"
        >
          <ChevronLeft size={14} />
          Anterior
        </button>

        <div className="text-center">
          <span className="text-[13px] font-semibold text-sleek-text-main">
            {bookName} {chapter}
          </span>
          <span className="text-[10px] text-sleek-text-muted ml-1.5">
            / {totalChapters}
          </span>
        </div>

        <button
          onClick={onNextChapter}
          disabled={chapter >= totalChapters}
          className="flex items-center gap-1 text-[12px] text-sleek-text-muted hover:text-sleek-text-main disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded-md hover:bg-sleek-hover"
        >
          Próximo
          <ChevronRight size={14} />
        </button>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-10">

          {/* Chapter heading */}
          <div className="mb-8 pb-4 border-b border-sleek-border/60">
            <h2 className="text-[22px] sm:text-[26px] font-bold text-sleek-text-main leading-tight">
              {bookName} — Capítulo {chapter}
            </h2>
            <p className="text-[11px] text-sleek-text-muted mt-1.5 flex items-center gap-1.5">
              <BookOpen size={11} />
              Versão King James (KJV) · Notas marginais Scofield
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 size={22} className="text-indigo-400 animate-spin" />
              <p className="text-[12px] text-sleek-text-muted">
                Carregando e traduzindo capítulo…
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <BookOpen size={28} className="text-sleek-text-muted opacity-40" />
              <p className="text-[13px] text-sleek-text-muted">{error}</p>
            </div>
          )}

          {/* Verses */}
          {!loading && !error && verses.length > 0 && (
            <div className="space-y-4">
              {verses.map((v) => (
                <div key={v.verse} className="group">
                  {/* Verse row */}
                  <div className="flex gap-3">
                    {/* Verse number */}
                    <span className="text-[11px] font-bold text-indigo-400 w-7 shrink-0 pt-0.5 text-right select-none">
                      {v.verse}
                    </span>

                    {/* Verse content */}
                    <div className="flex-1 min-w-0">
                      {/* Portuguese translation */}
                      <p className="text-[14px] sm:text-[15px] leading-relaxed text-sleek-text-main">
                        {v.textPt}
                      </p>
                      {/* KJV original (subtle) */}
                      <p className="text-[11px] leading-relaxed text-sleek-text-muted mt-1 italic">
                        {v.text}
                      </p>

                      {/* Footnote toggle button */}
                      {v.footnotePt && (
                        <button
                          onClick={() => toggleFootnote(v.verse)}
                          className={cn(
                            "mt-2 flex items-center gap-1.5 text-[11px] font-medium transition-colors rounded px-1.5 py-0.5 -ml-1.5",
                            expandedFootnotes.has(v.verse)
                              ? "text-indigo-600 bg-indigo-50"
                              : "text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50"
                          )}
                        >
                          <BookMarked size={10} />
                          {expandedFootnotes.has(v.verse) ? 'Ocultar nota' : 'Nota Scofield'}
                        </button>
                      )}

                      {/* Footnote content */}
                      {v.footnotePt && expandedFootnotes.has(v.verse) && (
                        <div className="mt-2 pl-3 border-l-2 border-indigo-200 bg-indigo-50/40 rounded-r-md py-2 pr-3">
                          <p className="text-[12px] text-indigo-700 leading-relaxed">
                            {v.footnotePt}
                          </p>
                          {v.footnote && v.footnote !== v.footnotePt && (
                            <p className="text-[10px] text-indigo-400 mt-1 italic">
                              {v.footnote}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom spacer */}
          <div className="h-16" />
        </div>
      </div>
    </div>
  );
}
