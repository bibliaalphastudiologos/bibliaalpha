import { cn } from '../App';
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { X, Search, BookOpen, Globe, Star, ExternalLink, Loader2, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import {
  searchWikipedia, getWikipediaSummary, getWikipediaSections, getWikipediaRelated,
  searchGoogleBooks, searchKnowledgeGraph,
  type WikiSummary, type WikiSection, type WikiRelated,
  type WikiSearchResult, type GoogleBook, type KnowledgeGraphEntity,
} from '../services/knowledgeApi';

interface ResearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function ResearchPanel({ isOpen, onClose, initialQuery = '' }: ResearchPanelProps) {
  const [inputValue, setInputValue]     = useState(initialQuery);
  const [isLoading, setIsLoading]       = useState(false);
  const [wikiSuggestions, setWikiSuggestions] = useState<WikiSearchResult[]>([]);
  const [wikiSummary, setWikiSummary]   = useState<WikiSummary | null>(null);
  const [wikiSections, setWikiSections] = useState<WikiSection[]>([]);
  const [wikiRelated, setWikiRelated]   = useState<WikiRelated[]>([]);
  const [books, setBooks]               = useState<GoogleBook[]>([]);
  const [kgEntities, setKgEntities]     = useState<KnowledgeGraphEntity[]>([]);
  const [hasSearched, setHasSearched]   = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true); setHasSearched(true);
    setWikiSummary(null); setWikiSuggestions([]); setWikiSections([]);
    setWikiRelated([]); setBooks([]); setKgEntities([]);
    setExpandedSections(new Set([0]));
    try {
      const [suggestions, booksRes, kgRes] = await Promise.all([
        searchWikipedia(q), searchGoogleBooks(q), searchKnowledgeGraph(q),
      ]);
      setWikiSuggestions(suggestions); setBooks(booksRes); setKgEntities(kgRes);

      if (suggestions.length > 0) {
        const summary = await getWikipediaSummary(suggestions[0].title);
        setWikiSummary(summary);
        if (summary) {
          const [sections, related] = await Promise.all([
            getWikipediaSections(summary.title, summary.lang),
            getWikipediaRelated(summary.title, summary.lang),
          ]);
          setWikiSections(sections);
          setWikiRelated(related);
        }
      }
    } finally { setIsLoading(false); }
  }, []);

  const loadArticle = async (title: string) => {
    setIsLoading(true);
    setWikiSections([]); setWikiRelated([]);
    const summary = await getWikipediaSummary(title);
    setWikiSummary(summary);
    if (summary) {
      const [sections, related] = await Promise.all([
        getWikipediaSections(summary.title, summary.lang),
        getWikipediaRelated(summary.title, summary.lang),
      ]);
      setWikiSections(sections);
      setWikiRelated(related);
    }
    setIsLoading(false);
    setExpandedSections(new Set([0]));
  };

  useEffect(() => {
    if (isOpen && initialQuery) { setInputValue(initialQuery); doSearch(initialQuery); }
  }, [isOpen, initialQuery]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); doSearch(inputValue); };

  const toggleSection = (i: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/10 z-40 lg:hidden" onClick={onClose} />}
      <div className={cn(
        "fixed inset-y-0 right-0 w-[90vw] sm:w-[500px] bg-white shadow-2xl border-l border-sleek-border z-50 transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <header className="h-14 shrink-0 border-b border-sleek-border flex items-center justify-between px-4 bg-sleek-bg">
          <div className="flex items-center gap-2 font-semibold text-[13px] text-sleek-text-main">
            <Globe size={16} /> Pesquisa Bíblica
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-sleek-hover rounded-md text-sleek-text-muted">
            <X size={18} />
          </button>
        </header>

        {/* Search */}
        <form onSubmit={handleSubmit} className="shrink-0 p-3 border-b border-sleek-border bg-white">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sleek-text-muted" />
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Pesquisar termo bíblico, pessoa, lugar..."
              className="w-full pl-9 pr-4 py-2 text-[13px] bg-sleek-bg border border-sleek-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sleek-text-main placeholder:text-sleek-text-muted"
            />
          </div>
        </form>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-12 text-sleek-text-muted">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-[13px]">Pesquisando...</span>
            </div>
          )}

          {!isLoading && !hasSearched && (
            <div className="flex flex-col items-center justify-center py-16 text-sleek-text-muted gap-3">
              <Globe size={32} className="opacity-30" />
              <p className="text-[13px]">Digite um termo para pesquisar na Wikipedia,<br/>Google Books e outras fontes.</p>
            </div>
          )}

          {!isLoading && hasSearched && (
            <div className="divide-y divide-sleek-border/50">

              {/* Wikipedia — Artigo Principal */}
              {wikiSummary && (
                <section className="p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Globe size={13} className="text-blue-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Wikipedia</span>
                    {wikiSummary.lang === 'en' && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">EN</span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {wikiSummary.thumbnail && (
                      <img
                        src={wikiSummary.thumbnail.source}
                        alt={wikiSummary.title}
                        className="w-20 h-20 object-cover rounded-lg shrink-0 border border-sleek-border"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[14px] text-sleek-text-main leading-tight mb-1"
                          dangerouslySetInnerHTML={{ __html: wikiSummary.displayTitle }} />
                      <p className="text-[12px] text-sleek-text-muted leading-relaxed line-clamp-4">
                        {wikiSummary.extract}
                      </p>
                    </div>
                  </div>

                  {/* Seções do artigo */}
                  {wikiSections.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {wikiSections.map((sec, i) => (
                        <div key={i} className="border border-sleek-border/60 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleSection(i)}
                            className="w-full flex items-center justify-between px-3 py-2 text-[12px] font-medium text-sleek-text-main hover:bg-sleek-hover/50 transition-colors"
                          >
                            <span className={sec.level > 1 ? 'pl-2 text-sleek-text-muted' : ''}>{sec.title}</span>
                            {expandedSections.has(i)
                              ? <ChevronUp size={13} className="text-sleek-text-muted shrink-0" />
                              : <ChevronDown size={13} className="text-sleek-text-muted shrink-0" />}
                          </button>
                          {expandedSections.has(i) && (
                            <p className="px-3 pb-3 text-[12px] text-sleek-text-muted leading-relaxed bg-sleek-bg/50">
                              {sec.content}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <a
                    href={wikiSummary.pageUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver artigo completo <ExternalLink size={12} />
                  </a>
                </section>
              )}

              {/* Wikipedia — Artigos Relacionados */}
              {wikiRelated.length > 0 && (
                <section className="p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <ArrowRight size={13} className="text-purple-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Artigos Relacionados</span>
                  </div>
                  <div className="space-y-2">
                    {wikiRelated.map((rel, i) => (
                      <button
                        key={i}
                        onClick={() => loadArticle(rel.title)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-sleek-hover/60 transition-colors text-left group"
                      >
                        {rel.thumbnail
                          ? <img src={rel.thumbnail} alt={rel.title} className="w-9 h-9 rounded-md object-cover shrink-0 border border-sleek-border" />
                          : <div className="w-9 h-9 rounded-md bg-sleek-hover flex items-center justify-center shrink-0"><Globe size={14} className="text-sleek-text-muted" /></div>
                        }
                        <div className="min-w-0">
                          <p className="text-[12px] font-medium text-sleek-text-main truncate group-hover:text-blue-600">{rel.title}</p>
                          {rel.description && <p className="text-[11px] text-sleek-text-muted truncate">{rel.description}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Sugestões da Wikipedia */}
              {wikiSuggestions.length > 1 && (
                <section className="p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Search size={13} className="text-sleek-text-muted" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sleek-text-muted">Mais resultados</span>
                  </div>
                  <div className="space-y-1">
                    {wikiSuggestions.slice(1).map((s, i) => (
                      <button
                        key={i}
                        onClick={() => loadArticle(s.title)}
                        className="w-full flex items-start gap-2 px-2.5 py-2 rounded-lg hover:bg-sleek-hover/60 transition-colors text-left"
                      >
                        <Globe size={13} className="text-sleek-text-muted mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[12px] font-medium text-sleek-text-main">{s.title}</p>
                          {s.description && <p className="text-[11px] text-sleek-text-muted">{s.description}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Google Books */}
              {books.length > 0 && (
                <section className="p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <BookOpen size={13} className="text-green-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-green-700">Livros</span>
                  </div>
                  <div className="space-y-3">
                    {books.map(book => (
                      <a key={book.id} href={book.previewLink} target="_blank" rel="noopener noreferrer"
                         className="flex gap-2.5 group hover:bg-sleek-hover/40 p-2 rounded-lg transition-colors">
                        {book.thumbnail
                          ? <img src={book.thumbnail} alt={book.title} className="w-10 h-14 object-cover rounded shrink-0 border border-sleek-border" />
                          : <div className="w-10 h-14 bg-sleek-hover rounded shrink-0 flex items-center justify-center"><BookOpen size={14} className="text-sleek-text-muted" /></div>
                        }
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-sleek-text-main leading-tight group-hover:text-blue-600 line-clamp-2">{book.title}</p>
                          {book.authors.length > 0 && <p className="text-[11px] text-sleek-text-muted mt-0.5">{book.authors.join(', ')}</p>}
                          {book.publishedDate && <p className="text-[10px] text-sleek-text-muted">{book.publishedDate.slice(0, 4)}</p>}
                          {book.description && <p className="text-[11px] text-sleek-text-muted mt-1 line-clamp-2">{book.description}</p>}
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Knowledge Graph (se configurado) */}
              {kgEntities.length > 0 && (
                <section className="p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Star size={13} className="text-amber-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Entidades</span>
                  </div>
                  <div className="space-y-2">
                    {kgEntities.map((e, i) => (
                      <div key={i} className="flex gap-2.5">
                        {e.imageUrl && <img src={e.imageUrl} alt={e.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-sleek-border" />}
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-sleek-text-main">{e.name}</p>
                          {e.description && <p className="text-[11px] text-sleek-text-muted">{e.description}</p>}
                          {e.detailedDescription && <p className="text-[11px] text-sleek-text-muted mt-0.5 line-clamp-2">{e.detailedDescription}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Sem resultados */}
              {!wikiSummary && wikiSuggestions.length === 0 && books.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-sleek-text-muted gap-2">
                  <Search size={24} className="opacity-30" />
                  <p className="text-[13px]">Nenhum resultado encontrado.</p>
                  <p className="text-[11px]">Tente outro termo ou verifique a ortografia.</p>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </>
  );
}
