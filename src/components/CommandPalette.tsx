import { useEffect, useState, useRef } from 'react';
import { Search, Book as BookIcon } from 'lucide-react';
import { Book } from '../services/bibleApi';
import { cn } from '../App';

const DEVOTIONAL_SHORTCUTS = [
  { id: 'ministerio', label: 'Ministério', color: 'text-indigo-600', keywords: ['ministerio', 'ministério', 'igreja'] },
  { id: 'homens',     label: 'Homens',         color: 'text-blue-700',   keywords: ['homens', 'homem'] },
  { id: 'mulheres',   label: 'Mulheres',       color: 'text-rose-600',   keywords: ['mulheres', 'mulher'] },
  { id: 'jovens',     label: 'Jovens',         color: 'text-orange-500', keywords: ['jovens', 'jovem'] },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  onSelectChapter: (book: Book, chapter: number) => void;
  onDevotionalOpen?: (audience: string) => void;
}

export default function CommandPalette({ isOpen, onClose, books, onSelectChapter, onDevotionalOpen }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setVisible(false);
      const t = setTimeout(() => {
        setVisible(true);
        inputRef.current?.focus();
      }, 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
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

  const q = search.toLowerCase();

  const filteredBooks = books.filter(b =>
    b.name.toLowerCase().includes(q) ||
    b.commonName.toLowerCase().includes(q)
  );

  const filteredDevotionals = DEVOTIONAL_SHORTCUTS.filter(d =>
    !q || q.includes('devoc') || d.keywords.some(k => k.includes(q) || q.includes(k)) || d.label.toLowerCase().includes(q)
  );

  const showDevotionals = !q || filteredDevotionals.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full max-w-xl bg-sleek-bg rounded-xl shadow-2xl border border-sleek-border overflow-hidden flex flex-col font-sans transition-all duration-200",
          visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2"
        )}
      >
        <div className="flex items-center px-4 py-3 border-b border-sleek-border">
          <Search size={18} className="text-sleek-text-muted mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-sleek-text-muted text-sleek-text-main"
            placeholder="Buscar livro ou devocional..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <kbd className="hidden sm:inline-block text-[10px] bg-sleek-avatar-bg px-2 py-1 rounded text-sleek-text-muted font-mono">ESC</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
          {showDevotionals && onDevotionalOpen && (
            <div className="mb-2">
              <div className="px-3 py-2 text-[11px] font-semibold text-sleek-text-muted uppercase tracking-wider">
                Devocionais
              </div>
              <div className="grid grid-cols-2 gap-1 px-1">
                {filteredDevotionals.map(d => (
                  <button
                    key={d.id}
                    onClick={() => { onDevotionalOpen(d.id); onClose(); }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-medium hover:bg-sleek-hover transition-colors text-left"
                  >
                    <span className={cn('font-semibold', d.color)}>{d.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredBooks.length === 0 && !showDevotionals ? (
            <div className="py-14 text-center text-[13px] text-sleek-text-muted">
              Nenhum resultado encontrado.
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-2 text-[11px] font-semibold text-sleek-text-muted uppercase tracking-wider">
                Livros
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
