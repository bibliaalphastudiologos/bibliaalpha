import { Ebook } from '../data/ebooks';

type Paleta = { bg: string; bgSolid: string; accent: string; ink: string; ornament: string; shadow: string };

const PALETAS: Record<string, Paleta> = {
  'Patrística':           { bg: 'linear-gradient(155deg,#3a0a0a 0%,#6d1a1a 50%,#2a0606 100%)', bgSolid: '#3a0a0a', accent: '#e8c988', ink: '#fbf1d6', ornament: '#c9a96e', shadow: 'rgba(60,10,10,0.55)' },
  'Reforma':              { bg: 'linear-gradient(155deg,#07223f 0%,#123c66 50%,#041628 100%)', bgSolid: '#07223f', accent: '#e8c988', ink: '#f5ecd6', ornament: '#c9a96e', shadow: 'rgba(8,30,55,0.55)' },
  'Puritanos':            { bg: 'linear-gradient(155deg,#0f2a1d 0%,#1f4a33 50%,#081a11 100%)', bgSolid: '#0f2a1d', accent: '#e0c88a', ink: '#f2ecd4', ornament: '#b9996a', shadow: 'rgba(10,30,20,0.55)' },
  'Comentários Bíblicos': { bg: 'linear-gradient(155deg,#111c36 0%,#233458 50%,#0a1122 100%)', bgSolid: '#111c36', accent: '#d9b36a', ink: '#f5ecd6', ornament: '#c9a96e', shadow: 'rgba(12,20,40,0.55)' },
  'Teologia Sistemática': { bg: 'linear-gradient(155deg,#1a1a1a 0%,#353535 50%,#0e0e0e 100%)', bgSolid: '#1a1a1a', accent: '#d9c38a', ink: '#f2ecd4', ornament: '#b8a06a', shadow: 'rgba(0,0,0,0.55)' },
  'Filosofia Cristã':     { bg: 'linear-gradient(155deg,#2a1440 0%,#4a2c6a 50%,#170a24 100%)', bgSolid: '#2a1440', accent: '#e8c988', ink: '#f5ecd6', ornament: '#c9a96e', shadow: 'rgba(30,15,50,0.55)' },
};

const PALETA_PADRAO: Paleta = { bg: 'linear-gradient(155deg,#14281e 0%,#22402f 50%,#0a1812 100%)', bgSolid: '#14281e', accent: '#e8c988', ink: '#f5ecd6', ornament: '#c9a96e', shadow: 'rgba(10,22,15,0.55)' };

interface Props { ebook: Ebook; }

export default function EbookCover({ ebook }: Props) {
  const p = PALETAS[ebook.categoria] || PALETA_PADRAO;
  const titulo = ebook.titulo;
  const tamanhoTitulo = titulo.length > 70 ? 13 : titulo.length > 48 ? 15 : titulo.length > 28 ? 18 : titulo.length > 16 ? 22 : 26;

  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden select-none"
      style={{
        background: p.bg,
        fontFamily: 'Georgia, "Times New Roman", serif',
        boxShadow: `inset 0 0 80px ${p.shadow}, inset 0 0 0 1px ${p.ornament}22`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.75  0 0 0 0.5 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%), radial-gradient(ellipse at 80% 90%, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 60%)',
        }}
      />

      <div
        className="pointer-events-none absolute inset-[6px] rounded-[3px]"
        style={{ border: `1px solid ${p.ornament}77` }}
      />
      <div
        className="pointer-events-none absolute inset-[11px] rounded-[2px]"
        style={{ border: `1px solid ${p.ornament}44` }}
      />
      <div
        className="pointer-events-none absolute"
        style={{ left: 10, right: 10, top: 10, height: 6, borderTop: `1px solid ${p.ornament}55` }}
      />

      {[[6,6],[6,-6],[-6,6],[-6,-6]].map(([x,y],i)=>(
        <span key={i} className="pointer-events-none absolute w-[5px] h-[5px] rounded-full"
          style={{
            top: y>0?y+6:undefined, bottom: y<0?-y+6:undefined,
            left: x>0?x+6:undefined, right: x<0?-x+6:undefined,
            background: p.accent, opacity: 0.8, boxShadow: `0 0 4px ${p.accent}99`,
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center text-center pt-6 px-5">
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 46, height: 46,
            border: `1.4px solid ${p.accent}`,
            boxShadow: `inset 0 0 0 3px ${p.bgSolid}, 0 0 0 1px ${p.accent}55`,
            color: p.accent,
            fontFamily: 'Georgia, serif',
            fontSize: 18, fontWeight: 600, letterSpacing: '0.05em',
          }}
        >
          BA
        </div>
        <div
          className="mt-2 text-[8px] font-semibold uppercase"
          style={{ color: p.accent, letterSpacing: '0.34em' }}
        >
          Bíblia Alpha
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[7px]" style={{ color: p.accent, opacity: 0.8, letterSpacing: '0.22em' }}>
          <span style={{ flex: 1, height: 1, background: `${p.accent}66`, width: 22 }} />
          <span>BIBLIOTECA TEOLÓGICA</span>
          <span style={{ flex: 1, height: 1, background: `${p.accent}66`, width: 22 }} />
        </div>
        <span className="mt-2 inline-block w-1 h-1 rounded-full" style={{ background: p.accent, opacity: 0.7 }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center flex-1 px-4">
        <div
          className="font-semibold leading-[1.12]"
          style={{
            color: p.ink,
            fontSize: tamanhoTitulo,
            letterSpacing: '0.005em',
            textShadow: '0 1px 2px rgba(0,0,0,0.45), 0 0 1px rgba(255,255,255,0.08)',
          }}
        >
          {titulo}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center pb-5 px-5">
        <div className="w-full flex items-center gap-2 mb-2" style={{ color: p.accent }}>
          <span style={{ flex: 1, height: 1, background: `${p.accent}55` }} />
          <span className="text-[9px]" style={{ opacity: 0.85 }}>✦</span>
          <span style={{ flex: 1, height: 1, background: `${p.accent}55` }} />
        </div>
        <div className="text-[11px] italic" style={{ color: p.ink, opacity: 0.95 }}>
          {ebook.autor}
        </div>
        <div className="mt-2 text-[7px] uppercase" style={{ color: p.accent, opacity: 0.8, letterSpacing: '0.3em' }}>
          {ebook.categoria}
        </div>
        <div className="mt-1 text-[7px] uppercase" style={{ color: p.accent, opacity: 0.55, letterSpacing: '0.28em' }}>
          bibliaalpha · {ebook.idioma}
        </div>
      </div>
    </div>
  );
}
