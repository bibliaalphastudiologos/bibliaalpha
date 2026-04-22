import { useState, useEffect, useMemo } from 'react';
import { X, Search, BookOpen, ExternalLink, Info, Sparkles } from 'lucide-react';
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
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-sleek-text-muted mb-3">
              <Sparkles size={12} /> Biblioteca Clássica · Domínio Público
            </div>
            <h2 className="text-[32px] sm:text-[40px] font-semibold tracking-wide" style={{ fontFamily: 'Georgia, serif', color: 'var(--color-sleek-text-main, #1f2937)' }}>
              Biblioteca Teológica
            </h2>
            <p className="text-[14px] text-sleek-text-muted mt-2 italic max-w-xl mx-auto">
              Uma coleção curada de obras cristãs — Pais da Igreja, Reformadores, Puritanos e comentaristas. Clique em qualquer volume para ler.
            </p>
          </div>

          <div className="flex items-start gap-2 px-4 py-3 mb-6 rounded-md border border-sleek-border/60 bg-sleek-hover/40 text-[13px] text-sleek-text-muted">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>
              Para ler em português, use a tradução automática do navegador (clique com o botão direito → <em>Traduzir página</em>).
            </span>
          </div>

          <div className="sticky top-0 z-10 -mx-2 px-2 pt-2 pb-3 bg-sleek-bg/85 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <div className="flex-1 relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sleek-text-muted opacity-70" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar por título, autor ou categoria…"
                  className="w-full pl-9 pr-3 py-2.5 rounded-md border border-sleek-border bg-white text-[13px] text-sleek-text-main placeholder:text-sleek-text-muted focus:outline-none focus:border-sleek-text-muted transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Todas', ...EBOOK_CATEGORIAS].map(cat => {
                const n = contagemPorCategoria[cat] || 0;
                const ativo = categoria === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoria(cat)}
                    className={cn(
                      "group inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-full border transition-all",
                      ativo
                        ? "bg-sleek-text-main text-white border-sleek-text-main shadow-sm"
                        : "bg-white text-sleek-text-muted border-sleek-border hover:bg-sleek-hover hover:text-sleek-text-main"
                    )}
                  >
                    {cat}
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                      ativo ? "bg-white/20 text-white" : "bg-sleek-hover text-sleek-text-muted group-hover:bg-white"
                    )}>{n}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {filtrados.length === 0 ? (
            <div className="text-center py-20 text-sleek-text-muted text-[13px] italic">
              Nenhum ebook encontrado com esses filtros.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 pt-6">
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
  return (
    <a
      href={ebook.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      title={`${ebook.titulo} — ${ebook.autor}`}
      style={{ perspective: '1200px' }}
    >
      <div
        className="relative aspect-[2/3] w-full transition-transform duration-500 ease-out will-change-transform"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateY(-14deg) rotateX(2deg)',
        }}
      >
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-[8px]"
          style={{
            transform: 'translateZ(-6px) translateX(-3px)',
            background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)',
            borderTopLeftRadius: 3,
            borderBottomLeftRadius: 3,
            filter: 'blur(0.5px)',
          }}
        />

        <div
          aria-hidden
          className="absolute inset-y-1 right-0 w-[4px]"
          style={{
            background: 'repeating-linear-gradient(90deg, #f5ecd6 0 1px, #d8c99a 1px 2px)',
            transform: 'translateZ(-1px) translateX(2px)',
            borderRadius: 1,
            boxShadow: '0 0 0 0.5px rgba(0,0,0,0.25)',
          }}
        />

        <div
          className="absolute inset-0 rounded-[4px] overflow-hidden transition-all duration-500 ease-out group-hover:rotate-0 group-hover:scale-[1.04]"
          style={{
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.05) inset, 0 18px 28px -12px rgba(0,0,0,0.45), 0 6px 10px -6px rgba(0,0,0,0.35)',
            transform: 'translateZ(0)',
          }}
        >
          <EbookCover ebook={ebook} />

          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-[10px]"
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.12) 55%, rgba(0,0,0,0) 100%)' }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-[6px]"
            style={{ background: 'linear-gradient(270deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 100%)' }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                'linear-gradient(115deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 60%)',
            }}
          />
        </div>
      </div>

      <div className="mt-4 px-1">
        <div className="text-[13px] font-semibold text-sleek-text-main leading-snug line-clamp-2" style={{ fontFamily: 'Georgia, serif' }}>
          {ebook.titulo}
        </div>
        <div className="text-[11px] text-sleek-text-muted mt-0.5 line-clamp-1 italic">{ebook.autor}</div>
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-sleek-hover text-sleek-text-muted">{ebook.categoria}</span>
          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-sleek-hover text-sleek-text-muted">{ebook.idioma}</span>
        </div>
        {ebook.descricao && (
          <div className="text-[11px] text-sleek-text-muted mt-2 line-clamp-2 leading-snug">{ebook.descricao}</div>
        )}
        <div className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-sleek-text-main group-hover:underline underline-offset-4">
          Ler agora <ExternalLink size={11} />
        </div>
      </div>
    </a>
  );
}
