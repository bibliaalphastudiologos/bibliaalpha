import { cn } from '../App';
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { X, Search, BookOpen, Globe, Star, ExternalLink, Loader2 } from 'lucide-react';
import {
  searchWikipedia, getWikipediaSummary, searchGoogleBooks, searchKnowledgeGraph,
  type WikiSummary, type WikiSearchResult, type GoogleBook, type KnowledgeGraphEntity,
} from '../services/knowledgeApi';

interface ResearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function ResearchPanel({ isOpen, onClose, initialQuery = '' }: ResearchPanelProps) {
  const [inputValue, setInputValue] = useState(initialQuery);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wikiSuggestions, setWikiSuggestions] = useState<WikiSearchResult[]>([]);
  const [wikiSummary, setWikiSummary] = useState<WikiSummary | null>(null);
  const [books, setBooks] = useState<GoogleBook[]>([]);
  const [kgEntities, setKgEntities] = useState<KnowledgeGraphEntity[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true); setHasSearched(true);
    setWikiSummary(null); setWikiSuggestions([]); setBooks([]); setKgEntities([]);
    try {
      const [suggestions, booksRes, kgRes] = await Promise.all([
        searchWikipedia(q), searchGoogleBooks(q), searchKnowledgeGraph(q),
      ]);
      setWikiSuggestions(suggestions); setBooks(booksRes); setKgEntities(kgRes);
      if (suggestions.length > 0) {
        const summary = await getWikipediaSummary(suggestions[0].title);
        setWikiSummary(summary);
      }
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    if (isOpen && initialQuery) { setInputValue(initialQuery); doSearch(initialQuery); }
  }, [isOpen, initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setQuery(inputValue); doSearch(inputValue);
  };

  const handleSuggestionClick = async (title: string) => {
    setIsLoading(true);
    setWikiSummary(await getWikipediaSummary(title));
    setIsLoading(false);
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/10 z-40 lg:hidden" onClick={onClose} />}
      <div className={cn(
        "fixed inset-y-0 right-0 w-[90vw] sm:w-[480px] bg-white shadow-2xl border-l border-sleek-border z-50 transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <header className="h-14 shrink-0 border-b border-sleek-border flex items-center justify-between px-4 bg-sleek-bg">
          <div className="flex items-center gap-2 font-semibold text-[13px] text-sleek-text-main">
            <Globe size={16} /> Pesquisa Biblica
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-sleek-hover rounded-md text-sleek-text-muted"><X size={18} /></button>
        </header>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-b border-sleek-border bg-[#F9F9F9]">
          <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
            placeholder="Ex: Salomao, Monte Sinai, Apocalipse..."
            className="flex-1 text-[14px] bg-white border border-sleek-border rounded-md px-3 py-1.5 outline-none focus:border-blue-400 text-sleek-text-main placeholder:text-sleek-text-muted/60"
          />
          <button type="submit" disabled={isLoading}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-[13px] font-medium flex items-center gap-1.5 hover:bg-blue-700 transition-colors disabled:opacity-50">
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          </button>
        </form>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
          {!hasSearched && (
            <div className="text-center py-12 text-sleek-text-muted">
              <Globe size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-[13px]">Pesquise pessoas, lugares e temas biblicos</p>
              <p className="text-[11px] mt-1 opacity-60">Wikipedia · Google Books · Knowledge Graph</p>
            </div>
          )}
          {isLoading && <div className="flex items-center justify-center py-10"><Loader2 size={24} className="animate-spin text-blue-500" /></div>}
          {!isLoading && hasSearched && (
            <>
              {kgEntities.length > 0 && (
                <section>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sleek-text-muted mb-2 flex items-center gap-1.5"><Star size={11} /> Google Knowledge Graph</h3>
                  {kgEntities.map((e, i) => (
                    <div key={i} className="border border-sleek-border rounded-lg p-3 bg-[#FAFEFF] flex gap-3">
                      {e.imageUrl && <img src={e.imageUrl} alt={e.name} className="w-14 h-14 rounded object-cover shrink-0" />}
                      <div>
                        <p className="font-semibold text-[13px] text-sleek-text-main">{e.name}</p>
                        <p className="text-[11px] text-blue-600">{e.description}</p>
                        {e.detailedDescription && <p className="text-[12px] text-sleek-text-muted mt-1 line-clamp-3">{e.detailedDescription}</p>}
                        {e.url && <a href={e.url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-500 flex items-center gap-0.5 mt-1 hover:underline"><ExternalLink size={10} /> Ver no Google</a>}
                      </div>
                    </div>
                  ))}
                </section>
              )}
              {wikiSummary && (
                <section>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sleek-text-muted mb-2 flex items-center gap-1.5"><Globe size={11} /> Wikipedia {wikiSummary.lang === 'en' ? '(EN)' : '(PT)'}</h3>
                  <div className="border border-sleek-border rounded-lg overflow-hidden">
                    {wikiSummary.thumbnail && <img src={wikiSummary.thumbnail.source} alt={wikiSummary.title} className="w-full h-36 object-cover" />}
                    <div className="p-3">
                      <p className="font-semibold text-[14px] text-sleek-text-main mb-1">{wikiSummary.displayTitle}</p>
                      <p className="text-[13px] text-sleek-text-muted leading-relaxed">{wikiSummary.extract.slice(0, 400)}{wikiSummary.extract.length > 400 ? '...' : ''}</p>
                      <a href={wikiSummary.pageUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12px] text-blue-600 hover:underline"><ExternalLink size={11} /> Ler artigo completo</a>
                    </div>
                  </div>
                </section>
              )}
              {wikiSuggestions.length > 1 && (
                <section>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sleek-text-muted mb-2">Outros artigos relacionados</h3>
                  <div className="space-y-1">
                    {wikiSuggestions.slice(1).map((s, i) => (
                      <button key={i} onClick={() => handleSuggestionClick(s.title)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-sleek-hover text-[13px] text-sleek-text-main flex items-center justify-between group">
                        <span>{s.title}</span><ExternalLink size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </section>
              )}
              {books.length > 0 && (
                <section>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sleek-text-muted mb-2 flex items-center gap-1.5"><BookOpen size={11} /> Google Books — Comentarios Biblicos</h3>
                  <div className="space-y-2">
                    {books.map((book) => (
                      <a key={book.id} href={book.previewLink} target="_blank" rel="noreferrer"
                        className="flex gap-3 p-2 rounded-lg border border-sleek-border hover:bg-sleek-hover transition-colors">
                        {book.thumbnail
                          ? <img src={book.thumbnail} alt={book.title} className="w-10 h-14 object-cover rounded shrink-0" />
                          : <div className="w-10 h-14 bg-slate-100 rounded shrink-0 flex items-center justify-center"><BookOpen size={14} className="text-slate-400" /></div>}
                        <div className="min-w-0">
                          <p className="font-medium text-[12px] text-sleek-text-main line-clamp-2">{book.title}</p>
                          {book.authors.length > 0 && <p className="text-[11px] text-blue-600">{book.authors.join(', ')}</p>}
                          {book.publishedDate && <p className="text-[10px] text-sleek-text-muted">{book.publishedDate.slice(0, 4)}</p>}
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}
              {!wikiSummary && wikiSuggestions.length === 0 && books.length === 0 && kgEntities.length === 0 && (
                <div className="text-center py-8 text-sleek-text-muted">
                  <p className="text-[13px]">Nenhum resultado encontrado para "{query}"</p>
                  <p className="text-[11px] mt-1 opacity-60">Tente outro termo ou verifique a ortografia</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
                          }
