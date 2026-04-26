import { useEffect, useState, useCallback } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

// Frases que rotacionam — ritmo de campanha publicitária
const HEADLINES = [
  { main: 'A Palavra.\nSem distrações.',        sub: 'Uma plataforma criada para quem leva o estudo bíblico a sério.' },
  { main: 'Estude.\nCreça.\nTransforme.',        sub: 'Comentários clássicos, devocionais e planos de leitura num só lugar.' },
  { main: 'Profundidade\nque edifica.',          sub: 'Calvino, Spurgeon e Matthew Henry integrados versículo a versículo.' },
  { main: 'Sua Bíblia.\nEm qualquer lugar.',     sub: 'Notas, destaques e progresso sincronizados entre todos os seus dispositivos.' },
];

const VERSE = { text: 'A tua palavra é lâmpada para os meus pés e luz para o meu caminho.', ref: 'Salmos 119:105' };

// Linhas de recurso — sem emojis, ícones em SVG inline
const PILLARS = [
  { label: '+20 traduções',        desc: 'ARC, NVI, ACF, KJV e mais' },
  { label: 'Notas na nuvem',       desc: 'Sincronizadas em tempo real' },
  { label: 'Biblioteca teológica', desc: 'Centenas de eBooks clássicos' },
  { label: 'Comentários por verso', desc: 'Grandes teólogos da história' },
  { label: 'Devocionais diários',  desc: 'Ministério, Homens, Mulheres, Jovens' },
  { label: 'Pesquisa & Strong',    desc: 'Dicionário, concordância, enciclopédia' },
];

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase]         = useState<'enter' | 'visible' | 'exit'>('enter');
  const [hlIdx, setHlIdx]         = useState(0);
  const [hlFade, setHlFade]       = useState(true);
  const [pillarsIn, setPillarsIn] = useState(false);

  const finish = useCallback(() => {
    setPhase('exit');
    setTimeout(onFinish, 700);
  }, [onFinish]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 150);
    const t2 = setTimeout(() => setPillarsIn(true), 2200);
    const t3 = setTimeout(finish, 16000);          // auto-dismiss 16s
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [finish]);

  // Rotação das headlines a cada 3.8s
  useEffect(() => {
    if (phase !== 'visible') return;
    const iv = setInterval(() => {
      setHlFade(false);
      setTimeout(() => {
        setHlIdx(i => (i + 1) % HEADLINES.length);
        setHlFade(true);
      }, 380);
    }, 3800);
    return () => clearInterval(iv);
  }, [phase]);

  const hl = HEADLINES[hlIdx];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #08090d 0%, #0b1308 38%, #0d1019 68%, #07080f 100%)',
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 0.7s ease',
      }}
    >
      {/* ── Grão de ruído atmosférico ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
        opacity: 0.35,
      }} />

      {/* ── Gradiente radial dourado central ── */}
      <div style={{
        position: 'absolute', top: '38%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '700px', height: '700px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,169,110,0.08) 0%, rgba(160,120,60,0.03) 45%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none',
        transition: 'opacity 2s ease',
        opacity: phase === 'enter' ? 0 : 1,
      }} />

      {/* ── Linha de luz horizontal ── */}
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0,
        height: '1px', pointerEvents: 'none',
        background: 'linear-gradient(90deg, transparent 0%, rgba(201,169,110,0.12) 30%, rgba(201,169,110,0.22) 50%, rgba(201,169,110,0.12) 70%, transparent 100%)',
        transition: 'opacity 2s ease 0.8s',
        opacity: phase === 'enter' ? 0 : 1,
      }} />

      {/* ── Grade perspectiva de chão ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', opacity: 0.04 }}>
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-15%', right: '-15%', height: '55%',
          backgroundImage: 'linear-gradient(rgba(201,169,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,1) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          transform: 'perspective(500px) rotateX(65deg)',
          transformOrigin: 'bottom center',
        }} />
      </div>

      {/* ── Partículas ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {Array.from({ length: 45 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            width:  (i % 4 === 0 ? 2.5 : i % 3 === 0 ? 1.8 : 1.1) + 'px',
            height: (i % 4 === 0 ? 2.5 : i % 3 === 0 ? 1.8 : 1.1) + 'px',
            top:  ((i * 19 + 11) % 100) + '%',
            left: ((i * 31 +  7) % 100) + '%',
            background: i % 4 === 0
              ? 'rgba(201,169,110,0.60)'
              : i % 3 === 0
              ? 'rgba(201,169,110,0.25)'
              : 'rgba(255,255,255,0.10)',
            animation: `spl-twk ${(2.2 + (i % 5) * 0.6).toFixed(1)}s ease-in-out ${((i % 7) * 0.4).toFixed(1)}s infinite`,
          }} />
        ))}
      </div>

      {/* ══════════════════════════════════
          CONTEÚDO PRINCIPAL
      ══════════════════════════════════ */}
      <div style={{
        position: 'relative', zIndex: 2,
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
        gap: 0,
      }}>

        {/* Badge */}
        <div style={{
          marginBottom: '36px',
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'translateY(-10px)' : 'translateY(0)',
          transition: 'all 1s ease 0.2s',
        }}>
          <span style={{
            fontSize: '8px', letterSpacing: '0.44em', textTransform: 'uppercase',
            color: 'rgba(201,169,110,0.75)',
            border: '1px solid rgba(201,169,110,0.22)',
            borderRadius: '100px', padding: '5px 22px',
            background: 'rgba(201,169,110,0.05)',
            fontWeight: 500,
          }}>
            Plataforma Bíblia Alpha
          </span>
        </div>

        {/* Logo */}
        <div style={{
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '36px',
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'scale(0.82) translateY(20px)' : 'scale(1) translateY(0)',
          transition: 'all 1.1s cubic-bezier(0.16,1,0.3,1) 0.05s',
        }}>
          {/* Anéis */}
          {[96, 120, 148].map((sz, ri) => (
            <div key={ri} style={{
              position: 'absolute',
              width: sz + 'px', height: sz + 'px', borderRadius: '50%',
              border: `1px solid rgba(201,169,110,${ri === 0 ? 0.28 : ri === 1 ? 0.14 : 0.07})`,
              animation: `spl-spin ${10 + ri * 6}s linear infinite ${ri % 2 ? 'reverse' : ''}`,
            }} />
          ))}
          {/* Ícone */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'linear-gradient(145deg, #1c1400, #090b11)',
            border: '1px solid rgba(201,169,110,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 56px rgba(201,169,110,0.22), 0 0 16px rgba(201,169,110,0.12), inset 0 1px 0 rgba(201,169,110,0.10)',
            position: 'relative', zIndex: 1,
          }}>
            <img
              src="/icon.svg" alt="Bíblia Alpha"
              style={{ width: '46px', height: '46px', filter: 'drop-shadow(0 0 18px rgba(201,169,110,0.85))' }}
              draggable={false}
            />
          </div>
        </div>

        {/* Divisor dourado */}
        <div style={{
          width: phase === 'enter' ? '0' : '160px', height: '1px',
          background: 'linear-gradient(90deg, transparent, #c9a96e 35%, #f0d878 50%, #c9a96e 65%, transparent)',
          transition: 'width 1.4s ease 0.5s',
          boxShadow: '0 0 10px rgba(201,169,110,0.30)',
          marginBottom: '36px',
        }} />

        {/* Headline rotativa — coração da propaganda */}
        <div style={{
          textAlign: 'center', minHeight: '130px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          maxWidth: '520px', width: '100%', padding: '0 16px',
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'translateY(16px)' : 'translateY(0)',
          transition: 'opacity 1.2s ease 0.6s, transform 1.2s ease 0.6s',
        }}>
          <h1 style={{
            fontSize: 'clamp(28px, 5.5vw, 44px)',
            fontWeight: 700,
            color: '#e8e4d8',
            fontFamily: 'Georgia, serif',
            letterSpacing: '-0.01em',
            lineHeight: 1.18,
            whiteSpace: 'pre-line',
            marginBottom: '14px',
            textShadow: '0 2px 24px rgba(0,0,0,0.6)',
            opacity: hlFade ? 1 : 0,
            transform: hlFade ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.38s ease, transform 0.38s ease',
          }}>
            {hl.main}
          </h1>
          <p style={{
            fontSize: 'clamp(12px, 2vw, 14.5px)',
            color: 'rgba(180,178,195,0.68)',
            lineHeight: 1.65,
            maxWidth: '400px',
            opacity: hlFade ? 1 : 0,
            transition: 'opacity 0.38s ease 0.05s',
          }}>
            {hl.sub}
          </p>
        </div>

        {/* Indicadores de headline */}
        <div style={{
          display: 'flex', gap: '6px', marginTop: '22px', marginBottom: '32px',
          opacity: phase === 'enter' ? 0 : 0.7, transition: 'opacity 1s ease 1s',
        }}>
          {HEADLINES.map((_, i) => (
            <div key={i} style={{
              height: '2px', borderRadius: '2px',
              width: i === hlIdx ? '22px' : '5px',
              background: i === hlIdx ? '#c9a96e' : 'rgba(201,169,110,0.22)',
              boxShadow: i === hlIdx ? '0 0 6px rgba(201,169,110,0.45)' : 'none',
              transition: 'all 0.4s ease',
            }} />
          ))}
        </div>

        {/* Pilares — aparecem depois de 2s, linha por linha */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px 16px',
          maxWidth: '580px', width: '100%',
          padding: '0 16px',
          opacity: pillarsIn ? 1 : 0,
          transform: pillarsIn ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          {PILLARS.map((p, i) => (
            <div key={i} style={{
              padding: '9px 12px',
              borderRadius: '9px',
              border: '1px solid rgba(201,169,110,0.11)',
              background: 'rgba(201,169,110,0.03)',
              opacity: pillarsIn ? 1 : 0,
              transform: pillarsIn ? 'translateY(0)' : 'translateY(8px)',
              transition: `opacity 0.4s ease ${0.08 * i}s, transform 0.4s ease ${0.08 * i}s`,
            }}>
              <p style={{ fontSize: '11.5px', fontWeight: 600, color: '#c9a96e', lineHeight: 1.2, marginBottom: '2px' }}>{p.label}</p>
              <p style={{ fontSize: '10px', color: 'rgba(160,165,185,0.55)', lineHeight: 1.4 }}>{p.desc}</p>
            </div>
          ))}
        </div>

      </div>

      {/* ══════════════════════════════════
          RODAPÉ
      ══════════════════════════════════ */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '0 24px 28px',
        gap: '14px',
        opacity: phase === 'enter' ? 0 : 1,
        transition: 'opacity 1.4s ease 1.2s',
      }}>
        {/* Versículo */}
        <div style={{ textAlign: 'center', maxWidth: '340px' }}>
          <p style={{ fontSize: '11.5px', fontStyle: 'italic', color: 'rgba(180,175,195,0.58)', lineHeight: 1.65, fontFamily: 'Georgia, serif' }}>
            &ldquo;{VERSE.text}&rdquo;
          </p>
          <p style={{ fontSize: '9.5px', color: 'rgba(130,130,150,0.42)', marginTop: '4px', letterSpacing: '0.14em' }}>— {VERSE.ref}</p>
        </div>

        {/* Assinatura */}
        <div style={{ textAlign: 'center', marginTop: '2px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(201,169,110,0.65)', fontFamily: 'Georgia, serif', letterSpacing: '0.04em' }}>Erick Silva</p>
          <p style={{ fontSize: '8.5px', color: 'rgba(150,150,170,0.38)', letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: '2px' }}>Pr e The, Ldo. Fil.</p>
        </div>

        {/* Botão pular + barra de progresso */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
          <button
            onClick={finish}
            style={{
              padding: '10px 44px', borderRadius: '100px',
              background: 'linear-gradient(135deg, #c9a96e 0%, #e8c97a 50%, #c9a96e 100%)',
              backgroundSize: '200% auto',
              color: '#0a0b0e', fontSize: '13px', fontWeight: 700,
              letterSpacing: '0.05em', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 28px rgba(201,169,110,0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseOver={e => { const b = e.currentTarget; b.style.transform = 'scale(1.05)'; b.style.boxShadow = '0 6px 36px rgba(201,169,110,0.50), inset 0 1px 0 rgba(255,255,255,0.18)'; }}
            onMouseOut={e => { const b = e.currentTarget; b.style.transform = 'scale(1)'; b.style.boxShadow = '0 4px 28px rgba(201,169,110,0.35), inset 0 1px 0 rgba(255,255,255,0.18)'; }}
          >
            Entrar na plataforma
          </button>

          {/* Barra de progresso auto-dismiss */}
          <div style={{ width: '100px', height: '2px', borderRadius: '2px', background: 'rgba(201,169,110,0.10)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, rgba(201,169,110,0.5), #c9a96e)',
              width: '100%', transformOrigin: 'left',
              animation: 'spl-progress 15.8s linear forwards',
            }} />
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'rgba(201,169,110,0.05)' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, transparent, #c9a96e 40%, #f0d878 50%, #c9a96e 60%, transparent)',
          width: phase === 'enter' ? '0%' : '100%',
          transition: 'width 1.6s linear 0.1s',
          boxShadow: '0 0 8px rgba(201,169,110,0.40)',
        }} />
      </div>

      <style>{`
        @keyframes spl-twk    { 0%,100%{opacity:0.08;transform:scale(1)}   50%{opacity:0.65;transform:scale(1.6)} }
        @keyframes spl-spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes spl-progress { from{transform:scaleX(0)} to{transform:scaleX(1)} }
      `}</style>
    </div>
  );
}
