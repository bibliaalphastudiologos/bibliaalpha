import { useState, useEffect } from 'react';
import * as React from 'react';
import { Quote } from 'lucide-react';
import { getVerseCommentaries } from '../services/bibleApi';
import { translateCommentaries } from '../services/aiTranslation';
import { cn } from '../App';

interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookId?: string;
  chapter?: number;
  verseNumber?: number | null;
}

export default function CommentsPanel({ isOpen, onClose, bookId, chapter, verseNumber }: CommentsPanelProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!bookId || !chapter || !verseNumber) {
      setNote('');
      return;
    }
    const noteKey = `note_${bookId}_${chapter}_${verseNumber}`;
    setNote(localStorage.getItem(noteKey) || '');
  }, [bookId, chapter, verseNumber]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNote(val);
    if (!bookId || !chapter || !verseNumber) return;
    const noteKey = `note_${bookId}_${chapter}_${verseNumber}`;
    localStorage.setItem(noteKey, val);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadComments() {
      if (!bookId || !chapter || !verseNumber || !isOpen) {
        setComments([]);
        return;
      }

      setIsLoading(true);
      setComments([]);

      try {
        const rawComments = await getVerseCommentaries(bookId, chapter, verseNumber);
        if (!isMounted) return;

        const ptComments = await translateCommentaries(bookId, chapter, verseNumber, rawComments);
        if (isMounted) setComments(ptComments);
      } catch (e) {
        console.error('CommentsPanel error:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadComments();
    return () => { isMounted = false; };
  }, [bookId, chapter, verseNumber, isOpen]);

  return (
    <div
      className={cn(
        'bg-sleek-bg border-l border-sleek-border flex flex-col shrink-0 transition-all duration-300 ease-in-out absolute lg:static right-0 inset-y-0 z-30',
        isOpen ? 'w-[85vw] sm:w-[320px] translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 overflow-hidden border-none'
      )}
    >
      <div className={cn('h-14 shrink-0 border-b border-sleek-border flex items-center justify-between px-4 w-[85vw] sm:w-[320px] bg-sleek-bg', !isOpen && 'hidden')}>
        <div className="flex items-center gap-2 font-semibold text-[13px] text-sleek-text-main">
          <Quote size={14} className="text-sleek-text-muted" />
          Comentários{verseNumber ? <span className="text-sleek-text-muted font-normal text-[12px]">· v. {verseNumber}</span> : ''}
        </div>
        <button onClick={onClose} className="panel-close-btn">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>

      <div className={cn('flex-1 overflow-y-auto px-4 custom-scrollbar w-[85vw] sm:w-[320px]', !isOpen && 'hidden')}>
        {!verseNumber ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-sleek-text-muted p-6">
            <Quote size={24} className="mb-3 opacity-50" />
            <p className="text-[13px]">Selecione um versículo para ler as notas e comentários dos autores.</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-sleek-surface p-3 rounded-lg border border-sleek-border">
                <div className="h-4 bg-sleek-avatar-bg rounded w-1/3 mb-3" />
                <div className="space-y-2">
                  <div className="h-3 bg-sleek-avatar-bg rounded w-full" />
                  <div className="h-3 bg-sleek-avatar-bg rounded w-full" />
                  <div className="h-3 bg-sleek-avatar-bg rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-0 pb-20">
            <span className="block text-[10px] text-sleek-text-muted uppercase tracking-widest mb-1.5 font-sans mt-2">
              Versículo {verseNumber}
            </span>
            {comments.map((comment, idx) => (
              <div
                key={comment.id || idx}
                className="mb-3 font-sans"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-full text-[11px] flex items-center justify-center font-bold shrink-0 uppercase text-white"
                    style={{ background: ['#6366F1','#3B82F6','#F43F5E','#F97316','#10B981'][idx % 5] }}
                  >
                    {comment.author.substring(0, 2)}
                  </div>
                  <span className="text-[12px] font-semibold text-sleek-text-main truncate">{comment.author}</span>
                </div>
                <div className="ml-9 text-[13px] text-sleek-comment-text leading-relaxed space-y-2 border-l-2 border-sleek-border pl-3">
                  {comment.texts.map((text: string, tIdx: number) => (
                    <p key={tIdx}>{text}</p>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-6 pt-5 border-t border-sleek-border pb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold tracking-wider text-sleek-text-muted uppercase font-sans">Minha Nota</span>
                <span className="text-[9px] bg-sleek-hover text-sleek-text-muted px-2 py-0.5 rounded-full border border-sleek-border">Privado</span>
              </div>
              <textarea
                value={note}
                onChange={handleNoteChange}
                placeholder="Escreva seus insights sobre este versículo…"
                className="w-full bg-sleek-input-bg border border-sleek-border rounded-xl p-3 text-[13px] text-sleek-text-main focus:outline-none focus:border-sleek-accent resize-none min-h-[100px] transition-colors leading-relaxed font-sans placeholder:text-sleek-text-muted"
              />
            </div>
          </div>
        ) : (
          <div className="text-center text-sleek-text-muted p-6 mt-10 text-[13px]">
            Nenhum comentário disponível para este versículo.
          </div>
        )}
      </div>
    </div>
  );
}
