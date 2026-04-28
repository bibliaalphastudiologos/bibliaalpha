import { Book } from '../services/bibleApi';
import { ChevronDown, ChevronRight, Search, LogOut, BookOpen, Globe, BookMarked } from 'lucide-react';
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
  onScofieldOpen?: () => void;
  onDevotionalOpen?: (audience: DevotionalAudience) => void;
}

const DEVOTIONAL_ITEMS: { id: DevotionalAudience; label: string; dot: string }[] = [
  { id: 'ministerio', label: 'Ministério', dot: '#6366F1' },
  { id: 'homens',     label: 'Homens',     dot: '#3B82F6' },
  { id: 'mulheres',   label: 'Mulheres',   dot: '#F43F5E' },
  { id: 'jovens',     label: 'Jovens',     dot: '#F97316' },
];

export default function Sidebar({ isOpen, books, activeBook, activeChapter, onSelectBook, onSelectChapter, onSearchClick, onEbooksOpen, onScofieldOpen, onDevotionalOpen }: SidebarProps) {
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const [expandedTestament, setExpandedTestament] = useState<'old' | 'new' | null>(null);
  const { logout, profile, user } = useAuth();

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
      <div className="mb-2 px-2">
        <button
          onClick={() => setExpandedTestament(isTestamentExpanded ? null : id)}
          className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.06em] text-sleek-text-muted px-3 py-2 rounded-lg hover:bg-sleek-hover transition-all"
        >
          <span className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: id === 'old' ? '#F59E0B' : '#3B82F6' }}
            />
            {title}
          </span>
          {isTestamentExpanded
            ? <ChevronDown size={13} className="text-sleek-text-muted" />
            : <ChevronRight size={13} className="text-sleek-text-muted" />}
        </button>
        {isTestamentExpanded && (
          <div className="space-y-0.5 px-1 mt-1 mb-3">
            {list.map(book => {
              const isExpanded = expandedBookId === book.id;
              const isActive = activeBook?.id === book.id;
              return (
                <div key={book.id}>
                  <button
                    onClick={() => toggleBook(book)}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 text-[13px] rounded-md transition-colors cursor-pointer",
                      isActive
                        ? "bg-sleek-hover font-semibold text-sleek-text-main"
                        : "text-sleek-text-main hover:bg-sleek-hover/70"
                    )}
                  >
                    <span className="truncate flex items-center gap-2">
                      {isActive && (
                        <span className="w-1 h-1 rounded-full bg-sleek-accent flex-shrink-0" />
                      )}
                      {book.name}
                    </span>
                    {isExpanded
                      ? <ChevronDown size={12} className="text-sleek-text-muted shrink-0" />
                      : <ChevronRight size={12} className="text-sleek-text-muted shrink-0" />}
                  </button>
                  {isExpanded && (
                    <div className="pl-5 py-2 grid grid-cols-5 gap-1">
                      {Array.from({ length: book.numberOfChapters }).map((_, i) => {
                        const chapterNum = i + 1;
                        const isChapterActive = isActive && activeChapter === chapterNum;
                        return (
                          <button
                            key={chapterNum}
                            onClick={() => { onSelectBook(book); onSelectChapter(chapterNum); }}
                            className={cn(
                              "aspect-square flex items-center justify-center text-[12px] rounded-md transition-all font-medium",
                              isChapterActive
                                ? "bg-sleek-text-main text-sleek-bg font-bold shadow-sm"
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
    if (type === 'notion') window.open('https://www.notion.so/', '_blank', 'noopener,noreferrer');
    else if (type === 'gmail') {
      const subject = encodeURIComponent("Meus Estudos da Bíblia Alpha");
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}`, '_blank', 'popup=yes,width=800,height=600');
    } else if (type === 'drive') window.open('https://drive.google.com/', '_blank', 'noopener,noreferrer');
    else if (type === 'calendar') {
      const title = encodeURIComponent("Tempo de Estudo: Bíblia Alpha");
      const details = encodeURIComponent("Momento diário de meditação e estudo na Bíblia Alpha.");
      window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`, '_blank', 'popup=yes,width=800,height=600');
    }
  };

  const avatarInitial = (profile?.nome || user?.displayName || 'U').charAt(0).toUpperCase();
  const avatarUrl = profile?.foto || user?.photoURL;

  return (
    <div
      className={cn(
        "flex-shrink-0 bg-sleek-sidebar-bg border-r border-sleek-border h-full flex flex-col flex-nowrap overflow-hidden transition-all duration-300 z-20 absolute lg:static left-0 inset-y-0",
        isOpen ? "w-[85vw] sm:w-[240px]" : "w-0 border-none"
      )}
    >
      <div className={cn("flex-1 overflow-y-auto py-3 custom-scrollbar w-[85vw] sm:w-[240px]", !isOpen && "hidden")}>

        {/* ── Logo ── */}
        <div className="flex items-center justify-center px-1 pt-2 pb-3">
          <img
            src="/icon.svg"
            alt="Bíblia de Estudo Alpha"
            className="w-full h-auto object-contain"
            style={{ maxHeight: '64px' }}
            draggable={false}
          />
        </div>

        {/* ── User card ── */}
        {(profile || user) && (
          <div className="sidebar-user-card mx-1 mb-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="sidebar-user-avatar" />
            ) : (
              <div className="sidebar-user-avatar-fallback">{avatarInitial}</div>
            )}
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-sleek-text-main truncate leading-tight">
                {profile?.nome || user?.displayName || 'Usuário'}
              </div>
              <div className="text-[10px] text-sleek-text-muted truncate leading-tight mt-0.5">
                {profile?.status === 'approved' ? 'Membro aprovado' : profile?.status === 'pending' ? 'Aguardando aprovação' : 'Membro'}
              </div>
            </div>
          </div>
        )}

        {/* ── Search ── */}
        <button
          onClick={onSearchClick}
          className="mx-3 mb-4 px-3 py-2 w-[calc(100%-24px)] bg-sleek-input-bg border border-sleek-border hover:border-sleek-text-muted/40 hover:bg-sleek-hover rounded-lg text-[12px] text-sleek-text-muted flex items-center justify-between transition-all shadow-sm cursor-pointer group"
        >
          <span className="flex items-center gap-2">
            <Search size={13} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            Buscar livro...
          </span>
          <span className="font-mono text-[9px] bg-sleek-hover px-1.5 py-0.5 rounded text-sleek-text-muted border border-sleek-border">⌘K</span>
        </button>

        {/* ── Bíblia section label ── */}
        <div className="sidebar-section-label mb-1">Bíblia</div>

        {/* ── Testament lists ── */}
        {renderBookList(oldTestament, "Antigo Testamento", 'old')}
        {renderBookList(newTestament, "Novo Testamento", 'new')}

        {/* ── Divider ── */}
        <div className="mx-4 my-3 border-t border-sleek-border/60" />

        {/* ── Recursos section label ── */}
        <div className="sidebar-section-label mb-1">Recursos</div>

        {/* ── Ebooks ── */}
        <div className="mb-1 px-2">
          <button
            onClick={() => onEbooksOpen && onEbooksOpen()}
            className="w-full flex items-center justify-between text-[13px] font-medium text-sleek-text-main px-3 py-2 rounded-lg hover:bg-sleek-hover transition-all group"
          >
            <span className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                <BookOpen size={13} />
              </span>
              Ebooks
            </span>
            <ChevronRight size={13} className="text-sleek-text-muted group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>


        {/* ── Scofield ── */}
        <div className="mb-1 px-2">
          <button
            onClick={() => onScofieldOpen && onScofieldOpen()}
            className="w-full flex items-center justify-between text-[13px] font-medium text-sleek-text-main px-3 py-2 rounded-lg hover:bg-sleek-hover transition-all group"
          >
            <span className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <BookMarked size={13} />
              </span>
              Scofield
            </span>
            <ChevronRight size={13} className="text-sleek-text-muted group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        {/* ── Blog ── */}
        <div className="mb-1 px-2">
          <button
            onClick={() => window.open('https://blog.bibliaalpha.org', '_blank', 'noopener,noreferrer')}
            className="w-full flex items-center justify-between text-[13px] font-medium text-sleek-text-main px-3 py-2 rounded-lg hover:bg-sleek-hover transition-all group"
          >
            <span className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                <Globe size={13} />
              </span>
              Blog
            </span>
            <ChevronRight size={13} className="text-sleek-text-muted group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* ── Divider ── */}
        <div className="mx-4 my-3 border-t border-sleek-border/60" />

        {/* ── Devocionais section label ── */}
        <div className="sidebar-section-label mb-1">Devocionais</div>

        <div className="px-2 mb-2 space-y-0.5">
          {DEVOTIONAL_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onDevotionalOpen && onDevotionalOpen(item.id)}
              className="w-full flex items-center justify-between text-[13px] font-medium text-sleek-text-main px-3 py-2 rounded-lg hover:bg-sleek-hover transition-all group"
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: item.dot }}
                />
                {item.label}
              </span>
              <ChevronRight size={13} className="text-sleek-text-muted group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>

        {/* ── Divider ── */}
        <div className="mx-4 my-3 border-t border-sleek-border/60" />

        {/* ── Extensões section label ── */}
        <div className="sidebar-section-label mb-1">Extensões</div>

        <div className="px-2 mb-3 space-y-0.5">
          {[
            { key: 'notion', label: 'Abrir no Notion', bg: '#F1F1F1', color: '#000', letter: 'N' },
            { key: 'gmail',  label: 'Escrever no Gmail', bg: '#EA4335', color: '#fff', letter: 'M' },
            { key: 'drive',  label: 'Google Drive',       bg: '#4285F4', color: '#fff', letter: 'D' },
            { key: 'calendar',label:'Agendar Estudo',     bg: '#1B73E8', color: '#fff', letter: 'C' },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => handleAction(item.key)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] rounded-lg text-sleek-text-main hover:bg-sleek-hover transition-colors"
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] flex-shrink-0"
                style={{ background: item.bg, color: item.color }}
              >
                {item.letter}
              </div>
              {item.label}
            </button>
          ))}
        </div>

        {/* ── WhatsApp ── */}
        <div className="px-3 pb-3">
          <a
            href="https://chat.whatsapp.com/Gt78A68duMBADzzuwnGmbb?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] rounded-xl text-white font-semibold bg-[#25D366] hover:bg-[#20c45e] shadow-sm transition-all"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Grupo Bíblia Alpha
          </a>
          <p className="text-[10px] text-sleek-text-muted mt-1.5 px-1 leading-relaxed">
            Novidades, suporte e comunidade
          </p>
        </div>

        {/* ── Logout ── */}
        <div className="px-3 pt-2 pb-6 border-t border-sleek-border">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg transition-colors text-red-500 hover:bg-red-50 hover:text-red-600 font-medium"
          >
            <LogOut size={14} />
            Sair do aplicativo
          </button>
        </div>
      </div>
    </div>
  );
}

