import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, BookMarked, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../App';
import { getScofieldNotes, ScofieldNote } from '../services/scofieldApi';

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

function NoteCard({ note, index }: { note: ScofieldNote; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div className="border border-sleek-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors",
          expanded ? "bg-indigo-50 border-b border-indigo-100" : "hover:bg-sleek-hover"
        )}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <BookMarked size={13} className={cn("mt-0.5 shrink-0", expanded ? "text-indigo-500" : "text-sleek-text-muted")} />
          <div className="min-w-0">
            {note.keywordPt ? (
              <span className={cn("text-[13px] font-semibold leading-snug", expanded ? "text-indigo-700" : "text-sleek-text-main")}>
                {note.keywordPt}
              </span>
            ) : null}
            {note.keyword && note.keyword !== note.keywordPt && (
              <span className="text-[10px] text-sleek-text-muted ml-2 italic">({note.keyword})</span>
            )}
          </div>
        </div>
        {expanded
          ? <ChevronUp size={13} className="text-indigo-400 shrink-0" />
          : <ChevronDown size={13} className="text-sleek-text-muted shrink-0" />
        }
      </button>

      {expanded && (
        <div className="px-4 py-4 bg-white space-y-3">
          {/* Portuguese translation */}
          <p className="text-[13px] sm:text-[14px] leading-relaxed text-sleek-text-main">
            {note.textPt}
          </p>
          {/* English original (collapsed by default, show via subtle label) */}
          {note.text && note.text !== note.textPt && (
            <details className="group">
              <summary className="text-[10px] text-indigo-400 cursor-pointer select-none list-none flex items-center gap-1 hover:text-indigo-600">
                <span className="group-open:hidden">▶ ver original em inglês</span>
                <span className="hidden group-open:inline">▼ original em inglês</span>
              </summary>
              <p className="mt-2 text-[11px] italic leading-relaxed text-sleek-text-muted border-l-2 border-indigo-100 pl-3">
                {note.text}
              </p>
            </details>
          )}
        </div>
      )}
    </div>
  );
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
  const [notes, setNotes] = useState<ScofieldNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !bookId) return;
    setNotes([]);
    setError(null);
    let alive = true;
    setLoading(true);

    getScofieldNotes(bookId, chapter)
      .then((data) => {
        if (alive) setNotes(data.notes);
      })
      .catch((err) => {
        if (alive) setError('Não foi possível carregar as notas. Verifique sua conexão.');
        console.error('[Scofield]', err);
      })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [isOpen, bookId, chapter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-sleek-bg">

      {/* ── Header ── */}
      <header className="h-12 flex items-center justify-between px-4 sm:px-8 border-b border-sleek-border bg-sleek-bg shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <BookMarked size={15} className="text-indigo-500 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-[13px] sm:text-[14px] font-semibold text-sleek-text-main leading-none">
              Notas Scofield
            </h1>
            <p className="text-[10px] text-sleek-text-muted mt-0.5 leading-none truncate">
              Bíblia de Referência Scofield, 1917 · traduzido pelo Google
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-sleek-hover rounded-lg text-sleek-text-muted transition-colors" aria-label="Fechar">
          <X size={16} />
        </button>
      </header>

      {/* ── Chapter nav ── */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-2 border-b border-sleek-border/60 bg-sleek-sidebar-bg shrink-0">
        <button
          onClick={onPrevChapter}
          disabled={chapter <= 1}
          className="flex items-center gap-1 text-[12px] text-sleek-text-muted hover:text-sleek-text-main disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded-md hover:bg-sleek-hover transition-colors"
        >
          <ChevronLeft size={14} /> Anterior
        </button>

        <span className="text-[13px] font-semibold text-sleek-text-main">
          {bookName} {chapter}
          <span className="text-sleek-text-muted font-normal text-[11px] ml-1">/ {totalChapters}</span>
        </span>

        <button
          onClick={onNextChapter}
          disabled={chapter >= totalChapters}
          className="flex items-center gap-1 text-[12px] text-sleek-text-muted hover:text-sleek-text-main disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded-md hover:bg-sleek-hover transition-colors"
        >
          Próximo <ChevronRight size={14} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6">

          {loading && (
            <div className="flex flex-col items-center justify-center py-28 gap-3">
              <Loader2 size={22} className="text-indigo-400 animate-spin" />
              <p className="text-[12px] text-sleek-text-muted">Carregando e traduzindo notas Scofield…</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-28 gap-3 text-center">
              <BookMarked size={28} className="text-sleek-text-muted opacity-30" />
              <p className="text-[13px] text-sleek-text-muted">{error}</p>
            </div>
          )}

          {!loading && !error && notes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 gap-3 text-center">
              <BookMarked size={28} className="text-sleek-text-muted opacity-30" />
              <p className="text-[13px] text-sleek-text-muted">
                Não há notas Scofield para {bookName} {chapter}.
              </p>
              <p className="text-[11px] text-sleek-text-muted opacity-60">
                Tente outro capítulo ou livro.
              </p>
            </div>
          )}

          {!loading && !error && notes.length > 0 && (
            <>
              <div className="mb-5 flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-sleek-text-muted">
                  {notes.length} nota{notes.length !== 1 ? 's' : ''} · {bookName} capítulo {chapter}
                </span>
              </div>
              <div className="space-y-3">
                {notes.map((note, i) => (
                  <NoteCard key={i} note={note} index={i} />
                ))}
              </div>
            </>
          )}

          <div className="h-16" />
        </div>
      </div>
    </div>
  );
}
