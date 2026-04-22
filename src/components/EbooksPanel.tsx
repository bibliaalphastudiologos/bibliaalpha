import { useState, useEffect, useMemo } from 'react';
    import { X, Search, BookOpen, ExternalLink, Info } from 'lucide-react';
    import { cn } from '../App';
    import { EBOOKS_INICIAIS, EBOOK_CATEGORIAS, Ebook } from '../data/ebooks';
    import { fetchDynamicEbooks } from '../services/ebooksApi';

    interface EbooksPanelProps {
      isOpen: boolean;
      onClose: () => void;
    }

    export default function EbooksPanel({ isOpen, onClose }: EbooksPanelProps) {
      const [query, setQuery] = useState('');
      const [categoria, setCategoria] = useState<string>('Todas');
      const [dinamicos, setDinamicos] = useState<Ebook[]>([]);
      const [carregandoDinamicos, setCarregandoDinamicos] = useState(false);

      useEffect(() => {
        if (!isOpen) return;
        let alive = true;
        setCarregandoDinamicos(true);
        fetchDynamicEbooks()
          .then(items => { if (alive) setDinamicos(items); })
          .catch(() => {})
          .finally(() => { if (alive) setCarregandoDinamicos(false); });
        return () => { alive = false; };
      }, [isOpen]);

      const todos = useMemo<Ebook[]>(() => {
        const seen = new Set<string>();
        const merged: Ebook[] = [];
        for (const e of [...EBOOKS_INICIAIS, ...dinamicos]) {
          const key = e.url || e.slug;
          if (seen.has(key)) continue;
          seen.add(key);
          merged.push(e);
        }
        return merged;
      }, [dinamicos]);

      const filtrados = useMemo(() => {
        const q = query.trim().toLowerCase();
        return todos.filter(e => {
          if (categoria !== 'Todas' && e.categoria !== categoria) return false;
          if (!q) return true;
          return (
            e.titulo.toLowerCase().includes(q) ||
            e.autor.toLowerCase().includes(q) ||
            e.categoria.toLowerCase().includes(q)
          );
        });
      }, [todos, query, categoria]);

      if (!isOpen) return null;

      return (
        <div className="fixed inset-0 z-50 bg-sleek-bg flex flex-col">
          <header className="h-14 flex items-center justify-between px-6 sm:px-10 border-b border-sleek-border bg-sleek-bg shrink-0">
            <div className="flex items-center gap-3">
              <BookOpen size={18} className="text-sleek-text-muted" />
              <h1 className="text-[15px] font-semibold text-sleek-text-main tracking-wide">Biblioteca Teológica</h1>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-sleek-hover rounded-md text-sleek-text-muted transition-colors" aria-label="Fechar">
              <X size={18} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto px-5 sm:px-10 py-8 sm:py-12">
              <div className="text-center mb-8">
                <h2 className="text-[32px] sm:text-[38px] font-semibold tracking-wide" style={{ fontFamily: 'Georgia, serif', color: 'var(--color-sleek-text-main, #1f2937)' }}>
                  Biblioteca Teológica
                </h2>
                <p className="text-[14px] text-sleek-text-muted mt-2 italic">
                  Clássicos da fé cristã em domínio público
                </p>
              </div>

              <div className="flex items-start gap-2 px-4 py-3 mb-6 rounded-md border border-sleek-border/60 bg-sleek-hover/40 text-[13px] text-sleek-text-muted">
                <Info size={14} className="mt-0.5 shrink-0" />
                <span>
                  Para ler em português, utilize a tradução automática do navegador (botão direito → "Traduzir página").
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sleek-text-muted opacity-70" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Buscar por título, autor ou categoria..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-md border border-sleek-border bg-white text-[13px] text-sleek-text-main placeholder:text-sleek-text-muted focus:outline-none focus:border-sleek-text-muted transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {['Todas', ...EBOOK_CATEGORIAS].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoria(cat)}
                    className={cn(
                      "px-3 py-1.5 text-[12px] rounded-full border transition-colors",
                      categoria === cat
                        ? "bg-sleek-text-main text-white border-sleek-text-main"
                        : "bg-white text-sleek-text-muted border-sleek-border hover:bg-sleek-hover"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {filtrados.length === 0 ? (
                <div className="text-center py-16 text-sleek-text-muted text-[13px] italic">
                  Nenhum ebook encontrado com esses filtros.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filtrados.map(ebook => (
                    <EbookCard key={ebook.slug} ebook={ebook} />
                  ))}
                </div>
              )}

              {carregandoDinamicos && (
                <div className="mt-10 text-center text-[12px] text-sleek-text-muted italic flex items-center justify-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full border border-sleek-border border-t-sleek-text-muted animate-spin" />
                  Expandindo catálogo automaticamente…
                </div>
              )}

              <div className="mt-12 pb-6 text-center text-[11px] text-sleek-text-muted tracking-wider uppercase">
                {filtrados.length} {filtrados.length === 1 ? 'título' : 'títulos'} · Bíblia Alpha
              </div>
            </div>
          </div>
        </div>
      );
    }

    function EbookCard({ ebook }: { ebook: Ebook }) {
      const [erroCapa, setErroCapa] = useState(false);
      const mostrarCapa = ebook.capa && !erroCapa;

      return (
        <div className="group flex flex-col rounded-lg overflow-hidden bg-white border border-sleek-border hover:border-sleek-text-muted shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition-all">
          <div className="aspect-[2/3] bg-gradient-to-br from-[#f5ecd6] to-[#c9a96e]/30 flex items-center justify-center overflow-hidden relative">
            {mostrarCapa ? (
              <img
                src={ebook.capa}
                alt={ebook.titulo}
                loading="lazy"
                onError={() => setErroCapa(true)}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center px-3">
                <BookOpen size={32} className="text-[#c9a96e] mb-2" />
                <div className="text-[12px] font-semibold text-sleek-text-main leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  {ebook.titulo}
                </div>
                <div className="text-[10px] text-sleek-text-muted mt-1 uppercase tracking-wider">
                  {ebook.autor}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col flex-1 p-3">
            <div className="text-[13px] font-semibold text-sleek-text-main leading-snug line-clamp-2" title={ebook.titulo}>
              {ebook.titulo}
            </div>
            <div className="text-[11px] text-sleek-text-muted mt-0.5 line-clamp-1">{ebook.autor}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-sleek-hover text-sleek-text-muted">{ebook.categoria}</span>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-sleek-hover text-sleek-text-muted">{ebook.idioma}</span>
            </div>
            <div className="text-[10px] text-sleek-text-muted mt-2 italic">Fonte: {ebook.fonte}</div>
            <a
              href={ebook.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md bg-sleek-text-main text-white hover:opacity-90 transition-opacity"
            >
              Ler agora <ExternalLink size={11} />
            </a>
          </div>
        </div>
      );
    }
    