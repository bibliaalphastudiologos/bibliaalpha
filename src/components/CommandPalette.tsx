import { useEffect, useState, useRef } from 'react';
import { Search, Book as BookIcon } from 'lucide-react';
import { Book } from '../services/bibleApi';
import { cn } from '../App';
import { motion } from 'motion/react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  onSelectChapter: (book: Book, chapter: number) => void;
}

export default function CommandPalette({ isOpen, onClose, books, onSelectChapter }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredBooks = books.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.commonName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-sleek-border overflow-hidden flex flex-col font-sans"
      >
        <div className="flex items-center px-4 py-3 border-b border-sleek-border">
          <Search size={18} className="text-sleek-text-muted mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-sleek-text-muted text-sleek-text-main"
            placeholder="Qual livro você quer ler hoje?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <kbd className="hidden sm:inline-block text-[10px] bg-sleek-avatar-bg px-2 py-1 rounded text-sleek-text-muted font-mono">ESC</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
          {filteredBooks.length === 0 ? (
            <div className="py-14 text-center text-[13px] text-sleek-text-muted">
              Nenhum livro encontrado.
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-2 text-[11px] font-semibold text-sleek-text-muted uppercase tracking-wider">
                Resultados
              </div>
              {filteredBooks.map(book => (
                <div key={book.id} className="group">
                  <div className="px-3 py-2 text-[14px] font-medium text-sleek-text-main flex items-center gap-2">
                    <BookIcon size={14} className="text-sleek-text-muted" />
                    {book.name}
                  </div>
                  <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 px-3 pb-2">
                    {Array.from({ length: book.numberOfChapters }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          onSelectChapter(book, i + 1);
                          onClose();
                        }}
                        className="aspect-square flex items-center justify-center text-[12px] bg-sleek-avatar-bg hover:bg-sleek-text-main hover:text-white rounded text-sleek-text-main transition-colors"
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
