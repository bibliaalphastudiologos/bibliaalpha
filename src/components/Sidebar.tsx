import { Book } from '../services/bibleApi';
import { ChevronDown, ChevronRight, Search, LogOut, BookOpen, Globe } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '../App';
import { useAuth } from './AuthProvider';
import { DevotionalAudience } from '../data/devotionals';

interface SidebarProps {
  isOpen: boolean;
  books: Book[];
  activeBook: Book | null;
  activeChapter: number;
  onSelectBook: (book: Book) => void;
  onSelectChapter: (chapter: number) => void;
  onSearchClick?: () => void;
  onEbooksOpen?: () => void;
  onDevotionalOpen?: (audience: DevotionalAudience) => void;
}

const DEVOTIONAL_ITEMS: { id: DevotionalAudience; label: string; color: string }[] = [
  { id: 'ministerio', label: 'Ministério', color: 'text-indigo-600' },
  { id: 'homens',     label: 'Homens',         color: 'text-blue-700'  },
  { id: 'mulheres',   label: 'Mulheres',       color: 'text-rose-600'  },
  { id: 'jovens',     label: 'Jovens',         color: 'text-orange-500'},
];

export default function Sidebar({ isOpen, books, activeBook, activeChapter, onSelectBook, onSelectChapter, onSearchClick, onEbooksOpen, onDevotionalOpen }: SidebarProps) {
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const [expandedTestament, setExpandedTestament] = useState<'old' | 'new' | null>(null);
  const { logout } = useAuth();

  const oldTestament = useMemo(() => books.slice(0, 39), [books]);
  const newTestament = useMemo(() => books.slice(39), [books]);

  const toggleBook = (book: Book) => {
    if (expandedBookId === book.id) {
      setExpandedBookId(null);
    } else {
      setExpandedBookId(book.id);
      onSelectBook(book);
    }
  };

  const renderBookList = (list: Book[], title: string, id: 'old' | 'new') => {
    const isTestamentExpanded = expandedTestament === id;
    return (
      <div className="mb-3 px-2">
        <button
          onClick={() => setExpandedTestament(isTestamentExpanded ? null : id)}
          className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.05em] text-sleek-text-main px-3 py-2.5 rounded-lg bg-sleek-hover/50 hover:bg-sleek-hover border border-sleek-border/50 shadow-sm transition-all"
        >
          <span>{title}</span>
          {isTestamentExpanded ? <ChevronDown size={15} className="text-sleek-text-muted" /> : <ChevronRight size={15} className="text-sleek-text-muted" />}
        </button>
        {isTestamentExpanded && (
          <div className="space-y-0.5 px-1 mt-2 mb-4">
            {list.map(book => {
              const isExpanded = expandedBookId === book.id;
              const isActive = activeBook?.id === book.id;
              return (
                <div key={book.id}>
                  <button
                    onClick={() => toggleBook(book)}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-1.5 text-[14px] rounded-md transition-colors cursor-pointer",
                      isActive ? "bg-sleek-hover font-semibold text-sleek-text-main" : "text-sleek-text-main hover:bg-sleek-hover"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="truncate">{book.name}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={14} className="text-sleek-text-muted shrink-0" /> : <ChevronRight size={14} className="text-sleek-text-muted shrink-0" />}
                  </button>
                  {isExpanded && (
                    <div className="pl-6 py-2 grid grid-cols-4 gap-1">
                      {Array.from({ length: book.numberOfChapters }).map((_, i) => {
                        const chapterNum = i + 1;
                        const isChapterActive = isActive && activeChapter === chapterNum;
                        return (
                          <button
                            key={chapterNum}
                            onClick={() => { onSelectBook(book); onSelectChapter(chapterNum); }}
                            className={cn(
                              "aspect-square flex items-center justify-center text-[13px] rounded-md transition-colors font-medium",
                              isChapterActive
                                ? "font-semibold bg-sleek-accent/20 text-sleek-accent ring-1 ring-sleek-accent/40"
                                : "hover:bg-sleek-hover text-sleek-chapter-num hover:text-sleek-text-main"
                            )}
                          >
                            {chapterNum}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const handleAction = (type: string) => {
    if (type === 'notion') {
      window.open('https://www.notion.so/', '_blank', 'noopener,noreferrer');
    } else if (type === 'gmail') {
      const subject = encodeURIComponent("Meus Estudos da Bíblia Alpha");
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}`, '_blank', 'popup=yes,width=800,height=600');
    } else if (type === 'drive') {
      window.open('https://drive.google.com/', '_blank', 'noopener,noreferrer');
    } else if (type === 'calendar') {
      const title = encodeURIComponent("Tempo de Estudo: Bíblia Alpha");
      const details = encodeURIComponent("Momento diário de meditação e estudo na Bíblia Alpha.");
      window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`, '_blank', 'popup=yes,width=800,height=600');
    }
  };

  return (
    <div
      className={cn(
        "flex-shrink-0 bg-sleek-sidebar-bg border-r border-sleek-border h-full flex flex-col flex-nowrap overflow-hidden transition-all duration-300 z-20 absolute lg:static left-0 inset-y-0",
        isOpen ? "w-[85vw] sm:w-[240px]" : "w-0 border-none"
      )}
    >
      <div className={cn("flex-1 overflow-y-auto py-4 custom-scrollbar w-[85vw] sm:w-[240px]", !isOpen && "hidden")}>
        {/* Logo */}
        <div className="flex items-center justify-center px-1 pt-3 pb-4">
          <img
            src="/icon.svg"
            alt="Bíblia de Estudo Alpha"
            className="w-full h-auto object-contain"
            style={{ maxHeight: '72px' }}
            draggable={false}
          />
        </div>

        {/* Search */}
        <button
          onClick={onSearchClick}
          className="mx-3 mb-4 px-2.5 py-1.5 w-[calc(100%-24px)] bg-sleek-input-bg border border-sleek-border hover:bg-sleek-hover rounded-md text-[12px] text-sleek-text-muted flex items-center justify-between transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer"
        >
          <span className="flex items-center gap-1.5"><Search size={14} className="opacity-70" /> Buscar livro...</span>
          <span className="font-mono text-[9px] bg-sleek-avatar-bg px-1 rounded text-sleek-text-muted">⌘K</span>
        </button>

        {/* Testament lists */}
        {renderBookList(oldTestament, "Antigo Testamento", 'old')}
        {renderBookList(newTestament, "Novo Testamento", 'new')}

        {/* Ebooks */}
        <div className="mb-3 px-2">
          <button
            onClick={() => onEbooksOpen && onEbooksOpen()}
            className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.05em] text-sleek-text-main px-3 py-2.5 rounded-lg bg-sleek-hover/50 hover:bg-sleek-hover border border-sleek-border/50 shadow-sm transition-all"
            title="Abrir biblioteca teológica"
          >
            <span className="flex items-center gap-2"><BookOpen size={13} className="text-sleek-text-muted" /> Ebooks</span>
            <ChevronRight size={15} className="text-sleek-text-muted" />
          </button>
        </div>

        {/* Blog button */}
        <div className="mb-3 px-2">
          <button
            onClick={() => window.open('https://blog.bibliaalpha.org', '_blank', 'noopener,noreferrer')}
            className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.05em] text-sleek-text-main px-3 py-2.5 rounded-lg bg-sleek-hover/50 hover:bg-sleek-hover border border-sleek-border/50 shadow-sm transition-all"
            title="Abrir o Blog Bíblia Alpha"
          >
            <span className="flex items-center gap-2">
              <Globe size={13} className="text-sleek-text-muted" />
              Blog
            </span>
            <ChevronRight size={15} className="text-sleek-text-muted" />
          </button>
        </div>

        {/* Devocionais section */}
        <div className="mb-3 px-2">
          <div className="text-[10px] uppercase tracking-[0.05em] text-sleek-text-muted px-1 mb-1.5 font-semibold">
            Devocionais
          </div>
          <div className="space-y-1.5">
            {DEVOTIONAL_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => onDevotionalOpen && onDevotionalOpen(item.id)}
                className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.05em] text-sleek-text-main px-3 py-2.5 rounded-lg bg-sleek-hover/50 hover:bg-sleek-hover border border-sleek-border/50 shadow-sm transition-all"
              >
                <span>{item.label}</span>
                <ChevronRight size={15} className="text-sleek-text-muted" />
              </button>
            ))}
          </div>
        </div>

        {/* Extensões */}
        <div className="mt-8 mb-2">
          <div className="text-[11px] uppercase tracking-[0.05em] text-sleek-text-muted px-5 mb-2 font-semibold">
            Extensões e Conexões
          </div>
          <div className="pl-4 pr-3 space-y-1">
            <button onClick={() => handleAction('notion')} className="w-full flex items-center justify-between px-2 py-1.5 text-[13px] rounded-md transition-colors text-sleek-text-main hover:bg-sleek-hover">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center bg-[#F1F1F1] text-black">N</div>
                Abrir no Notion
              </div>
            </button>
            <button onClick={() => handleAction('gmail')} className="w-full flex items-center justify-between px-2 py-1.5 text-[13px] rounded-md transition-colors text-sleek-text-main hover:bg-sleek-hover">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center bg-[#EA4335] text-white font-bold text-[10px]">M</div>
                Escrever no Gmail
              </div>
            </button>
            <button onClick={() => handleAction('drive')} className="w-full flex items-center justify-between px-2 py-1.5 text-[13px] rounded-md transition-colors text-sleek-text-main hover:bg-sleek-hover">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center bg-[#4285F4] text-white text-[10px] font-bold">D</div>
                Abrir Google Drive
              </div>
            </button>
            <button onClick={() => handleAction('calendar')} className="w-full flex items-center justify-between px-2 py-1.5 text-[13px] rounded-md transition-colors text-sleek-text-main hover:bg-sleek-hover">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center bg-[#1B73E8] text-white text-[10px]">C</div>
                Agendar Estudo
              </div>
            </button>
          </div>
        </div>

        {/* WhatsApp Grupo */}
        <div className="px-3 pb-3">
          <a
            href="https://chat.whatsapp.com/Gt78A68duMBADzzuwnGmbb?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] rounded-xl transition-all text-white font-semibold bg-[#25D366] hover:bg-[#20c45e] shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Grupo Bíblia Alpha</span>
          </a>
          <p className="text-[10px] text-sleek-text-muted mt-1.5 px-1 leading-relaxed">
            Novidades, suporte e comunidade em tempo real
          </p>
        </div>

        {/* Logout */}
        <div className="px-3 pt-2 pb-6 border-t border-sleek-border">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-md transition-colors text-red-500 hover:bg-red-50 hover:text-red-600 font-medium"
          >
            <LogOut size={14} />
            Sair do aplicativo
          </button>
        </div>
      </div>
    </div>
  );
}
