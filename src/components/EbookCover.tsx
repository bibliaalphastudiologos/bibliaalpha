import { Ebook } from '../data/ebooks';

const PALETAS: Record<string, { bg: string; accent: string; ink: string; ornament: string }> = {
  'Patrística':           { bg: 'linear-gradient(160deg,#4a0e0e 0%,#7a1f1f 55%,#3a0a0a 100%)', accent: '#e8c988', ink: '#fff8e7', ornament: '#c9a96e' },
  'Reforma':              { bg: 'linear-gradient(160deg,#0c2a4a 0%,#183e6b 55%,#081d35 100%)', accent: '#e8c988', ink: '#f5ecd6', ornament: '#c9a96e' },
  'Puritanos':            { bg: 'linear-gradient(160deg,#1e3a2a 0%,#2f5a3f 55%,#142a1e 100%)', accent: '#e0c88a', ink: '#f2ecd4', ornament: '#b9996a' },
  'Comentários Bíblicos': { bg: 'linear-gradient(160deg,#1a2540 0%,#2b3a60 55%,#111827 100%)', accent: '#d9b36a', ink: '#f5ecd6', ornament: '#c9a96e' },
  'Teologia Sistemática': { bg: 'linear-gradient(160deg,#2a2a2a 0%,#454545 55%,#1a1a1a 100%)', accent: '#d9c38a', ink: '#f2ecd4', ornament: '#b8a06a' },
  'Filosofia Cristã':     { bg: 'linear-gradient(160deg,#3a1e4a 0%,#5a3a75 55%,#22122e 100%)', accent: '#e8c988', ink: '#f5ecd6', ornament: '#c9a96e' },
};

const PALETA_PADRAO = PALETAS['Teologia Sistemática'];

interface Props { ebook: Ebook; }

export default function EbookCover({ ebook }: Props) {
  const p = PALETAS[ebook.categoria] || PALETA_PADRAO;
  const titulo = ebook.titulo;
  const tamanhoTitulo = titulo.length > 60 ? 13 : titulo.length > 40 ? 15 : titulo.length > 24 ? 17 : 20;

  return (
    <div
      className="absolute inset-0 flex flex-col justify-between p-4 overflow-hidden"
      style={{ background: p.bg, fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      <div
        className="absolute inset-2 pointer-events-none rounded-[2px]"
        style={{ border: `1px solid ${p.ornament}55`, boxShadow: `inset 0 0 0 2px ${p.ornament}22` }}
      />
      <div className="relative flex flex-col items-center text-center pt-1">
        <div
          className="text-[8px] tracking-[0.3em] uppercase font-semibold"
          style={{ color: p.accent, opacity: 0.85 }}
        >
          {ebook.categoria}
        </div>
        <div
          className="mt-1 w-10 h-[1px]"
          style={{ background: p.accent, opacity: 0.6 }}
        />
      </div>

      <div className="relative flex flex-col items-center justify-center text-center flex-1 px-2">
        <svg width="28" height="28" viewBox="0 0 24 24" className="mb-2 opacity-80" fill="none" stroke={p.accent} strokeWidth="1.2">
          <path d="M12 2v20M4 8c3-2 5-2 8 0s5 2 8 0M4 16c3-2 5-2 8 0s5 2 8 0" strokeLinecap="round" />
        </svg>
        <div
          className="font-semibold leading-tight"
          style={{ color: p.ink, fontSize: `${tamanhoTitulo}px`, letterSpacing: '0.01em', textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}
        >
          {titulo}
        </div>
        <div
          className="mt-3 flex items-center gap-2 w-full justify-center"
          style={{ color: p.accent }}
        >
          <span style={{ flex: 1, height: 1, background: `${p.accent}66` }} />
          <span className="text-[9px]">✦</span>
          <span style={{ flex: 1, height: 1, background: `${p.accent}66` }} />
        </div>
      </div>

      <div className="relative flex flex-col items-center text-center pb-1">
        <div
          className="text-[10px] italic"
          style={{ color: p.ink, opacity: 0.9, fontFamily: 'Georgia, serif' }}
        >
          {ebook.autor}
        </div>
        <div
          className="mt-2 text-[7px] tracking-[0.25em] uppercase"
          style={{ color: p.accent, opacity: 0.7 }}
        >
          Biblia Alpha · {ebook.idioma}
        </div>
      </div>
    </div>
  );
}
