import React, { useState, useEffect, Component } from 'react';
import { getVerseCommentaries } from '../services/bibleApi';
import { translateCommentaries } from '../services/aiTranslation';
import { cn } from '../App';

interface InlineCommentsProps {
  bookId: string;
  chapter: number;
  verseNumber: number;
  onClose?: (e: React.MouseEvent) => void;
}

// Cache em memória por sessão — evita chamar a API repetidamente para o mesmo versículo
const commentCache = new Map<string, any[]>();

function getCacheKey(bookId: string, chapter: number, verse: number) {
  return `${bookId}:${chapter}:${verse}`;
}

// Error boundary — impede que um crash nos comentários derrube a tela inteira
class CommentErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: any) { console.error('[InlineComments] crash capturado:', err); }
  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="my-3 px-4 py-3 bg-red-500/10 border-l-2 border-red-500/40 rounded-r-lg text-[13px] text-red-500 font-sans">
          Não foi possível carregar o comentário. Tente novamente.
        </div>
      );
    }
    return this.props.children;
  }
}

function InlineCommentsInner({ bookId, chapter, verseNumber, onClose }: InlineCommentsProps) {
  const cacheKey = getCacheKey(bookId, chapter, verseNumber);
  const cached   = commentCache.get(cacheKey);

  const [comments, setComments] = useState<any[]>(cached ?? []);
  const [isLoading, setIsLoading] = useState(!cached);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Se já existe no cache, não faz nova requisição
    if (commentCache.has(cacheKey)) {
      setComments(commentCache.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    async function loadComments() {
      setIsLoading(true);
      setComments([]);
      try {
        const rawComments = await getVerseCommentaries(bookId, chapter, verseNumber);
        if (!isMounted) return;
        const ptComments = await translateCommentaries(bookId, chapter, verseNumber, rawComments);
        if (!isMounted) return;
        const result = (ptComments ?? []).slice(0, 3);
        commentCache.set(cacheKey, result);
        setComments(result);
      } catch (e) {
        console.error('[InlineComments] erro ao carregar:', e);
        if (isMounted) setComments([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadComments();
    return () => { isMounted = false; };
  }, [bookId, chapter, verseNumber, cacheKey]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'my-4 block w-full bg-sleek-surface border border-sleek-border rounded-xl overflow-hidden shadow-sm transition-all duration-300 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
      )}
    >
      <div
        className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-sleek-border cursor-pointer hover:bg-sleek-hover transition-colors"
        onClick={onClose}
        title="Fechar comentários"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-sleek-accent" />
          <span className="font-sans text-[11px] font-bold tracking-wider text-sleek-text-muted uppercase">
            Comentários · v. {verseNumber}
          </span>
        </div>
        <span className="text-[11px] text-sleek-text-muted hover:text-sleek-text-main transition-colors font-sans">
          Fechar ×
        </span>
      </div>

      <div className="px-4 sm:px-5 pb-5">
        {isLoading ? (
          <div className="space-y-4 pt-2">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-sleek-avatar-bg" />
                  <div className="h-3 bg-sleek-avatar-bg rounded w-32" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-sleek-avatar-bg rounded w-full" />
                  <div className="h-3 bg-sleek-avatar-bg rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-6 pt-2">
            {comments.map((comment, idx) => (
              <div key={comment.id ?? idx} className="font-sans text-[13px] sm:text-[14px]">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 uppercase text-white"
                    style={{ background: ['#6366F1','#3B82F6','#F43F5E','#F97316','#10B981'][idx % 5] }}
                  >
                    {(comment.author ?? '??').substring(0, 2)}
                  </div>
                  <span className="font-semibold text-[12px] text-sleek-text-main">{comment.author ?? 'Comentarista'}</span>
                </div>
                <div lang="en" className="text-sleek-comment-text leading-relaxed pl-8 border-l-2 border-sleek-border">
                  {(comment.texts ?? []).map((text: string, tIdx: number) => (
                    <p key={tIdx} className={tIdx > 0 ? 'mt-2' : ''}>{text}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[13px] text-sleek-text-muted italic pt-2">
            Nenhum comentário disponível para este versículo.
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
