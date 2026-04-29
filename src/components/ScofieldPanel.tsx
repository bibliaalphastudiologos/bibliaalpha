import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, BookMarked, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { cn } from '../App';
import { getScofieldNotes, ScofieldNote } from '../services/scofieldApi';
import { ReferenceText } from '../utils/bibleRefParser';

// ── NoteCard ─────────────────────────────────────────────────────────────────

interface NoteCardProps {
  note: ScofieldNote;
  index: number;
  defaultOpen?: boolean;
  onNavigate?: (bookId: string, chapter: number) => void;
}

function NoteCard({ note, index, defaultOpen = false, onNavigate }: NoteCardProps) {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'border rounded-xl overflow-hidden transition-all duration-200',
        expanded
          ? 'border-indigo-200 shadow-sm shadow-indigo-100/60'
          : 'border-sleek-border hover:border-indigo-200/60'
      )}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors',
          expanded ? 'bg-indigo-50/80 border-b border-indigo-100' : 'hover:bg-sleek-hover/60'
        )}
      >
        <div className="flex items-start gap-3 min-w-0">
          {/* Keyword badge */}
          <div className={cn(
            'flex-shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center',
            expanded ? 'bg-indigo-100' : 'bg-sleek-hover'
          )}>
            <BookMarked size={11} className={cn(expanded ? 'text-indigo-500' : 'text-sleek-text-muted')} />
          </div>
          <div className="min-w-0">
            {note.keywordPt ? (
              <span className={cn('text-[13px] font-semibold leading-snug block', expanded ? 'text-indigo-700' : 'text-sleek-text-main')}>
                {note.keywordPt}
              </span>
            ) : (
              <span className={cn('text-[13px] font-semibold leading-snug block', expanded ? 'text-indigo-700' : 'text-sleek-text-main')}>
                Nota {index + 1}
              </span>
            )}
            {note.keyword && note.keyword !== note.keywordPt && (
              <span className="text-[10px] text-sleek-text-muted italic mt-0.5 block">
                {note.keyword}
              </span>
            )}
          </div>
        </div>
        {expanded
          ? <ChevronUp size={13} className="text-indigo-400 shrink-0" />
          : <ChevronDown size={13} className="text-sleek-text-muted shrink-0" />
        }
      </button>

      {/* Card body */}
      {expanded && (
        <div className="px-4 pt-4 pb-5 bg-white space-y-3">
          <p className="text-[13.5px] sm:text-[14px] leading-[1.75] text-sleek-text-main">
            <ReferenceText text={note.textPt} onNavigate={onNavigate} />
          </p>
          {note.text && note.text !== note.textPt && (
            <details className="group">
              <summary className="text-[10px] text-indigo-400 cursor-pointer select-none list-none flex items-center gap-1.5 hover:text-indigo-600 transition-colors mt-1">
                <span className="group-open:hidden">▶ ver original em inglês</span>
                <span className="hidden group-open:inline">▼ original em inglês</span>
              </summary>
              <p className="mt-2 text-[11.5px] italic leading-relaxed text-sleek-text-muted border-l-2 border-indigo-100 pl-3">
                <ReferenceText text={note.text} onNavigate={onNavigate} />
              </p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

interface ScofieldPanelProps {
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

export default function ScofieldPanel({
  isOpen, onClose, bookId, bookName, chapter, totalChapters,
  onPrevChapter, onNextChapter, onNavigate,
}: ScofieldPanelProps) {
  const [notes, setNotes]     = useState<ScofieldNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!bookId || !isOpen) return;
    setNotes([]); setError(null);
    let alive = true;
    setLoading(true);
    getScofieldNotes(bookId, chapter)
      .then(data => { if (alive) setNotes(data.notes); })
      .catch(err => {
        if (alive) setError('Não foi possível carregar as notas.');
        console.error('[Scofield]', err);
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [bookId, chapter, isOpen]);

  const handleNavigate = useCallback((targetBookId: string, targetChapter: number) => {
    onNavigate?.(targetBookId, targetChapter);
    onClose();
  }, [onNavigate, onClose]);

  if (!isOpen) return null;

  const progress = totalChapters > 1 ? (chapter / totalChapters) * 100 : 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-sleek-bg">

      {/* ── Progress bar ── */}
      <div className="h-[2px] bg-sleek-border/40 shrink-0">
        <div
          className="h-full bg-indigo-400 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Header ── */}
      <header className="shrink-0 border-b border-sleek-border bg-sleek-bg">
        {/* Top row: branding + close */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-4 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon */}
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 shadow-sm">
              <BookMarked size={17} className="text-indigo-600" />
            </div>
            {/* Title block */}
            <div className="min-w-0">
              <h1 className="text-[14px] sm:text-[15px] font-bold text-sleek-text-main leading-tight">
                Notas de Estudo Scofield
              </h1>
              <p className="text-[10px] text-sleek-text-muted mt-0.5 leading-tight">
                Bíblia de Referência Scofield, 1917 · referências clicáveis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-sleek-hover rounded-lg text-sleek-text-muted hover:text-sleek-text-main transition-colors flex-shrink-0"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Chapter navigation row */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-sleek-sidebar-bg border-t border-sleek-border/60">
          <button
            onClick={onPrevChapter}
            disabled={chapter <= 1}
            className="flex items-center gap-1.5 text-[12px] font-medium text-sleek-text-muted hover:text-sleek-text-main disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg hover:bg-sleek-hover transition-colors"
          >
            <ChevronLeft size={14} />
            <span>Anterior</span>
          </button>

          <div className="text-center">
            <div className="text-[13px] font-semibold text-sleek-text-main leading-tight">
              {bookName} {chapter}
            </div>
            <div className="text-[10px] text-sleek-text-muted mt-0.5 leading-none">
              capítulo {chapter} de {totalChapters}
            </div>
          </div>

          <button
            onClick={onNextChapter}
            disabled={chapter >= totalChapters}
            className="flex items-center gap-1.5 text-[12px] font-medium text-sleek-text-muted hover:text-sleek-text-main disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg hover:bg-sleek-hover transition-colors"
          >
            <span>Próximo</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6">

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Loader2 size={22} className="text-indigo-400 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-medium text-sleek-text-main">Carregando notas…</p>
                <p className="text-[11px] text-sleek-text-muted mt-1">Traduzindo para português</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                <BookMarked size={22} className="text-red-300" />
              </div>
              <p className="text-[13px] text-sleek-text-muted">{error}</p>
              <button
                onClick={() => { setError(null); setLoading(true); getScofieldNotes(bookId, chapter).then(d => setNotes(d.notes)).catch(() => setError('Erro ao recarregar.')).finally(() => setLoading(false)); }}
                className="mt-1 px-4 py-2 text-[12px] font-medium rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && notes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <BookOpen size={22} className="text-indigo-200" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-sleek-text-main">
                  Sem notas para {bookName} {chapter}
                </p>
                <p className="text-[11px] text-sleek-text-muted mt-1">
                  Tente navegar para outro capítulo.
                </p>
              </div>
            </div>
          )}

          {/* Notes list */}
          {!loading && !error && notes.length > 0 && (
            <>
              {/* Count badge */}
              <div className="flex items-center gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-semibold text-indigo-600">
                  <BookMarked size={10} />
                  {notes.length} nota{notes.length !== 1 ? 's' : ''} — {bookName} {chapter}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {notes.map((note, i) => (
                  <NoteCard
                    key={`${bookId}-${chapter}-${i}`}
                    note={note}
                    index={i}
                    defaultOpen={i === 0}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>

              {/* Footer info */}
              <div className="mt-8 pt-6 border-t border-sleek-border/60 text-center">
                <p className="text-[11px] text-sleek-text-muted leading-relaxed">
                  As notas de Scofield são da{' '}
                  <span className="font-medium text-sleek-text-main">
                    Bíblia de Referência Scofield (1917)
                  </span>
                  , traduzidas automaticamente para o português.
                  <br />
                  Referências bíblicas são clicáveis e navegam para o trecho correspondente.
                </p>
              </div>
            </>
          )}

          <div className="h-12" />
        </div>
      </div>
    </div>
  );
}
