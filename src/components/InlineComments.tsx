import * as React from 'react';
import { useState, useEffect } from 'react';
import { getVerseCommentaries } from '../services/bibleApi';
import { translateCommentaries } from '../services/aiTranslation';
import * as motion from 'motion/react-client';

interface InlineCommentsProps {
  bookId: string;
  chapter: number;
  verseNumber: number;
  onClose?: (e: React.MouseEvent) => void;
}

export default function InlineComments({ bookId, chapter, verseNumber, onClose }: InlineCommentsProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function loadComments() {
      setIsLoading(true);
      setComments([]);
      
      try {
        const rawComments = await getVerseCommentaries(bookId, chapter, verseNumber);
        if (!isMounted) return;
        
        const ptComments = await translateCommentaries(bookId, chapter, verseNumber, rawComments);
        if (!isMounted) return;
        
        // Ensure max 3 comments (the api limits to 3 authors, but just to be safe)
        setComments(ptComments.slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    loadComments();
    return () => { isMounted = false; };
  }, [bookId, chapter, verseNumber]);

  return (
    <motion.div 
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the comment body (except header)
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      className="my-4 block w-full bg-sleek-sidebar-bg border-l-2 border-sleek-text-muted rounded-r-xl overflow-hidden shadow-sm"
    >
      <div 
        className="font-sans text-[11px] font-bold tracking-widest text-sleek-text-muted uppercase px-4 sm:px-5 pt-4 pb-2 flex items-center justify-between cursor-pointer hover:bg-sleek-hover transition-colors"
        onClick={onClose}
        title="Clique para fechar o comentário"
      >
        <span>Comentários – Versículo {verseNumber}</span>
        <span className="opacity-50 text-[10px]">Fechar ×</span>
      </div>

      <div className="px-4 sm:px-5 pb-5">
        {isLoading ? (
          <div className="space-y-4 pt-2">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-sleek-avatar-bg"></div>
                  <div className="h-3 bg-sleek-avatar-bg rounded w-32"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-sleek-avatar-bg rounded w-full"></div>
                  <div className="h-3 bg-sleek-avatar-bg rounded w-4/5"></div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-6 pt-2">
            {comments.map((comment, idx) => (
              <div key={idx} className="font-sans text-[13px] sm:text-[14px]">
                <div className="flex items-center gap-2 mb-1.5 opacity-80">
                  <div className="w-5 h-5 rounded-full bg-sleek-avatar-bg text-[9px] flex items-center justify-center font-bold text-sleek-text-main shrink-0 uppercase">
                    {comment.author.substring(0, 2)}
                  </div>
                  <span className="font-semibold text-sleek-text-main">
                    {comment.author}
                  </span>
                </div>
                <div className="text-sleek-comment-text leading-relaxed pl-7">
                  {comment.texts.map((text: string, tIdx: number) => (
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
    </motion.div>
  );
}
