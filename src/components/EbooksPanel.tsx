import { useState, useEffect, useMemo } from 'react';
import { X, Search, BookOpen, ExternalLink, Info, Sparkles, Library } from 'lucide-react';
import { cn } from '../App';
import { EBOOKS_INICIAIS, EBOOK_CATEGORIAS, Ebook } from '../data/ebooks';
import { expandirEbooks } from '../services/ebooksApi';
import EbookCover from './EbookCover';

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
    expandirEbooks(EBOOKS_INICIAIS)
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

  const contagemPorCategoria = useMemo(() => {
    const m: Record<string, number> = { Todas: todos.length };
    for (const e of todos) m[e.categoria] = (m[e.categoria] || 0) + 1;
    return m;
  }, [todos]);

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
      {/* Header compacto */}
      <header className="h-12 flex items-center justify-between px-5 sm:px-8 border-b border-sleek-border bg-sleek-bg shrink-0">
        <div className="flex items-center gap-2.5">
          <Library size={16} className="text-sleek-text-muted" />
          <h1 className="text-[14px] font-semibold text-sleek-text-main tracking-wide">Biblioteca Teológica</h1>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-sleek-text-muted ml-1 border border-sleek-border px-2 py-0.5 rounded-full">
            <Sparkles size={9} /> Domínio Público
          </span>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-sleek-hover rounded-md text-sleek-text-muted transition-colors" aria-label="Fechar">
          <X size={16} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5">
          
          {/* Cabeçalho elegante e compacto */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 pb-4 border-b border-sleek-border/50">
            <div>
              <h2 className="text-[22px] font-semibold tracking-wide" style={{ fontFamily: 'Georgia, serif', color: 'var(--color-sleek-text-main, #1f2937)' }}>
                Estante Virtual
              </h2>
              <p className="text-[12px] text-sleek-text-muted mt-0.5 italic">
                Pais da Igreja · Reformadores · Puritanos · Comentaristas
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-sleek-text-muted bg-sleek-hover/50 px-3 py-1.5 rounded-md border border-sleek-border/60">
              <Info size={12} className="shrink-0" />
              <span>Botão direito → <em>Traduzir página</em> para português</span>
            </div>
          </div>

          {/* Barra de busca + filtros sticky */}
          <div className="sticky top-0 z-10 -mx-1 px-1 pt-1 pb-3 bg-sleek-bg/90 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-2 mb-2.5">
              <div className="flex-1 relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-sleek-text-muted opacity-70" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar por título, autor ou categoria…"
                  className="w-full pl-8 pr-3 py-2 rounded-md border border-sleek-border bg-white text-[12px] text-sleek-text-main placeholder:text-sleek-text-muted focus:outline-none focus:border-sleek-text-muted transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Todas', ...EBOOK_CATEGORIAS].map(cat => {
                const n = contagemPorCategoria[cat] || 0;
                const ativo = categoria === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoria(cat)}
                    className={cn(
                      "group inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-full border transition-all",
                      ativo
                        ? "bg-sleek-text-main text-white border-sleek-text-main shadow-sm"
                        : "bg-white text-sleek-text-muted border-sleek-border hover:bg-sleek-hover hover:text-sleek-text-main"
                    )}
                  >
                    {cat}
                    <span className={cn(
                      "text-[9px] px-1 py-0.5 rounded-full font-medium",
                      ativo ? "bg-white/20 text-white" : "bg-sleek-hover text-sleek-text-muted group-hover:bg-white"
                    )}>{n}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid de ebooks — mais colunas, cards menores */}
          {filtrados.length === 0 ? (
            <div className="text-center py-20 text-sleek-text-muted text-[13px] italic">
              Nenhum ebook encontrado com esses filtros.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-3 gap-y-6 pt-4">
              {filtrados.map(ebook => (
                <EbookCard key={ebook.slug} ebook={ebook} />
              ))}
            </div>
          )}

          {carregandoDinamicos && (
            <div className="mt-8 text-center text-[11px] text-sleek-text-muted italic flex items-center justify-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full border border-sleek-border border-t-sleek-text-muted animate-spin" />
              Expandindo catálogo…
            </div>
          )}

          <div className="mt-10 pb-4 text-center text-[10px] text-sleek-text-muted tracking-wider uppercase">
            {filtrados.length} {filtrados.length === 1 ? 'título' : 'títulos'} · Bíblia Alpha
          </div>
        </div>
      </div>
    </div>
  );
}

function EbookCard({ ebook }: { ebook: Ebook }) {
  return (
    <a
      href={ebook.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      title={`${ebook.titulo} — ${ebook.autor}`}
      style={{ perspective: '1000px' }}
    >
      {/* Capa do livro — proporção 2:3, menor */}
      <div
        className="relative aspect-[2/3] w-full transition-transform duration-500 ease-out will-change-transform"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateY(-12deg) rotateX(2deg)',
        }}
      >
        {/* Lombada esquerda */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-[6px]"
          style={{
            transform: 'translateZ(-5px) translateX(-2px)',
            background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)',
            borderTopLeftRadius: 2,
            borderBottomLeftRadius: 2,
            filter: 'blur(0.5px)',
          }}
        />
        {/* Páginas direita */}
        <div
          aria-hidden
          className="absolute inset-y-1 right-0 w-[3px]"
          style={{
            background: 'repeating-linear-gradient(90deg, #f5ecd6 0 1px, #d8c99a 1px 2px)',
            transform: 'translateZ(-1px) translateX(2px)',
            borderRadius: 1,
            boxShadow: '0 0 0 0.5px rgba(0,0,0,0.25)',
          }}
        />

        <div
          className="absolute inset-0 rounded-[3px] overflow-hidden transition-all duration-500 ease-out group-hover:scale-[1.05]"
          style={{
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.05) inset, 0 12px 20px -10px rgba(0,0,0,0.45), 0 4px 8px -5px rgba(0,0,0,0.35)',
            transform: 'translateZ(0)',
          }}
        >
          <EbookCover ebook={ebook} />
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[8px]"
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0) 100%)' }} />
          <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-[4px]"
            style={{ background: 'linear-gradient(270deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 100%)' }} />
          <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 60%)' }} />
        </div>
      </div>

      {/* Metadados compactos */}
      <div className="mt-2.5 px-0.5">
        <div className="text-[11px] font-semibold text-sleek-text-main leading-snug line-clamp-2" style={{ fontFamily: 'Georgia, serif' }}>
          {ebook.titulo}
        </div>
        <div className="text-[10px] text-sleek-text-muted mt-0.5 line-clamp-1 italic">{ebook.autor}</div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          <span className="text-[8px] uppercase tracking-wider px-1 py-0.5 rounded bg-sleek-hover text-sleek-text-muted">{ebook.categoria}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sleek-text-main group-hover:underline underline-offset-2">
            Ler <ExternalLink size={9} />
          </span>
          <a
            href={`https://translate.google.com/translate?sl=en&tl=pt&u=${encodeURIComponent(ebook.url)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors font-medium"
            title="Ler em Português via Google Tradutor"
          >
            🌐 PT
          </a>
        </div>
      </div>
    </a>
  );
}
