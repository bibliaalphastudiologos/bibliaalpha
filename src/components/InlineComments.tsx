import React, { useState, useEffect, Component } from 'react';
import { cn } from '../App';
import { getMatthewHenryNotes, MatthewHenryNote } from '../services/matthewHenryApi';
import { BookOpen, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { ReferenceText } from '../utils/bibleRefParser';

interface InlineCommentsProps {
  bookId: string;
  chapter: number;
  verseNumber: number;
  onClose?: (e: React.MouseEvent) => void;
  onNavigate?: (bookId: string, chapter: number) => void;
  onPopup?: (bookId: string, chapter: number, verse: number, refText: string) => void;
}

// ── Error Boundary ──────────────────────────────────────────────────────────
class CommentErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: any) { console.error('[InlineComments] crash:', err); }
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

// ── Inner component ─────────────────────────────────────────────────────────
function InlineCommentsInner({ bookId, chapter, verseNumber, onClose, onNavigate, onPopup }: InlineCommentsProps) {
  const [mhNotes, setMhNotes]         = useState<MatthewHenryNote[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [visible, setVisible]         = useState(false);
  const [mhExpanded, setMhExpanded]   = useState<Record<number, boolean>>({ 0: true });

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setMhNotes([]);
    setMhExpanded({ 0: true });

    getMatthewHenryNotes(bookId, chapter)
      .then((mh) => {
        if (!alive) return;
        const verseNotes = mh.notes.filter(n => n.verseNumber === verseNumber);
        setMhNotes(verseNotes);
        setIsLoading(false);
      })
      .catch(() => { if (alive) setIsLoading(false); });

    return () => { alive = false; };
  }, [bookId, chapter, verseNumber]);

  const hasContent = mhNotes.length > 0;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'my-4 block w-full bg-sleek-surface border border-emerald-200/60 rounded-xl overflow-hidden shadow-sm transition-all duration-300 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
      )}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-emerald-100/80 bg-emerald-50/60 cursor-pointer hover:bg-emerald-50 transition-colors"
        onClick={onClose}
        title="Fechar notas"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <BookOpen size={12} />
          </div>
          <div>
            <span className="font-sans text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
              Matthew Henry
            </span>
            <span className="font-sans text-[10px] text-emerald-500 ml-2">
              · versículo {verseNumber}
            </span>
          </div>
        </div>
        <span className="text-[11px] text-emerald-400 hover:text-emerald-600 transition-colors font-sans select-none">
          Fechar ×
        </span>
      </div>

      {/* ── Body ── */}
      <div className="px-4 sm:px-5 pb-5">
        {isLoading ? (
          <div className="flex items-center gap-3 pt-5 pb-2">
            <Loader2 size={14} className="text-emerald-400 animate-spin flex-shrink-0" />
            <span className="text-[12px] text-sleek-text-muted font-sans">Carregando comentário…</span>
          </div>
        ) : hasContent ? (
          <div className="space-y-3 pt-3">
            {mhNotes.map((note, idx) => (
              <div key={idx} className="border border-emerald-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setMhExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors',
                    mhExpanded[idx]
                      ? 'bg-emerald-50 border-b border-emerald-100'
                      : 'hover:bg-sleek-hover'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BookOpen size={12} className={cn('shrink-0', mhExpanded[idx] ? 'text-emerald-500' : 'text-sleek-text-muted')} />
                    <span className={cn(
                      'text-[12px] font-semibold leading-snug',
                      mhExpanded[idx] ? 'text-emerald-700' : 'text-sleek-text-main'
                    )}>
                      Comentário de Matthew Henry
                    </span>
                  </div>
                  {mhExpanded[idx]
                    ? <ChevronUp size={12} className="text-emerald-400 shrink-0" />
                    : <ChevronDown size={12} className="text-sleek-text-muted shrink-0" />}
                </button>

                {mhExpanded[idx] && (
                  <div className="px-4 py-4 bg-white">
                    <p className="text-[13px] sm:text-[14px] leading-relaxed text-sleek-text-main">
                      <ReferenceText text={note.textPt} onPopup={onPopup} />
                    </p>
                    {note.text && note.text !== note.textPt && (
                      <details className="group mt-3">
                        <summary className="text-[10px] text-emerald-400 cursor-pointer select-none list-none flex items-center gap-1 hover:text-emerald-600">
                          <span className="group-open:hidden">▶ ver original em inglês</span>
                          <span className="hidden group-open:inline">▼ original em inglês</span>
                        </summary>
                        <p className="mt-2 text-[11px] italic leading-relaxed text-sleek-text-muted border-l-2 border-emerald-100 pl-3">
                          <ReferenceText text={note.text} onPopup={onPopup} />
                        </p>
                      </details>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-4 pb-2 text-[13px] text-sleek-text-muted italic font-sans">
            <BookOpen size={13} className="opacity-40 flex-shrink-0" />
            Sem comentários disponíveis para este versículo.
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
