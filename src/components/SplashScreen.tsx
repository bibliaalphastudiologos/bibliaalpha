import { useEffect, useState, useCallback } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const FEATURES = [
  {
    icon: '📖',
    title: 'Bíblia Completa',
    desc: 'Mais de 20 traduções — ARC, NVI, ACF, KJV e outras — com paralelo de versículos lado a lado.',
  },
  {
    icon: '✍️',
    title: 'Bloco de Estudos',
    desc: 'Anote insights, crie tarefas e destaque versículos. Tudo sincronizado entre celular e desktop.',
  },
  {
    icon: '📚',
    title: 'Biblioteca Teológica',
    desc: 'Centenas de eBooks clássicos do domínio público: Calvino, Spurgeon, Wesley e muito mais.',
  },
  {
    icon: '🔍',
    title: 'Pesquisa Avançada',
    desc: 'Dicionário bíblico, concordância Strong, enciclopédia e busca por palavras-chave.',
  },
  {
    icon: '💬',
    title: 'Comentários por Versículo',
    desc: 'Insights de grandes teólogos integrados diretamente ao texto, versículo por versículo.',
  },
  {
    icon: '🗓️',
    title: 'Planos de Leitura',
    desc: 'Planos guiados para ler toda a Bíblia, com acompanhamento de progresso e lembretes.',
  },
  {
    icon: '🙏',
    title: 'Devocionais',
    desc: 'Reflexões diárias para Ministério, Homens, Mulheres e Jovens — com orações e aplicações.',
  },
  {
    icon: '🌙',
    title: 'Leitura Imersiva',
    desc: 'Modo escuro, tipografia ajustável e interface limpa inspirada no Notion para foco total.',
  },
];

const VERSES = [
  { text: 'A tua palavra é lâmpada para os meus pés e luz para o meu caminho.', ref: 'Salmos 119:105' },
  { text: 'Toda a Escritura é divinamente inspirada e proveitosa para ensinar, para repreender, para corrigir e para instruir em justiça.', ref: '2 Timóteo 3:16' },
  { text: 'Bem-aventurado o homem que não anda no conselho dos ímpios... mas o seu prazer é na lei do Senhor.', ref: 'Salmos 1:1-2' },
];

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'logo' | 'features' | 'exit'>('enter');
  const [verseIdx] = useState(() => Math.floor(Math.random() * VERSES.length));
  const [visibleFeatures, setVisibleFeatures] = useState<number[]>([]);

  const finish = useCallback(() => {
    setPhase('exit');
    setTimeout(onFinish, 600);
  }, [onFinish]);

  // Sequência de entrada
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logo'), 120);
    const t2 = setTimeout(() => setPhase('features'), 1800);
    // Revelar features uma a uma
    FEATURES.forEach((_, i) => {
      setTimeout(() => setVisibleFeatures(prev => [...prev, i]), 1900 + i * 120);
    });
    // Auto-dismiss após 14 segundos
    const t3 = setTimeout(finish, 14000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [finish]);

  const verse = VERSES[verseIdx];

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden flex flex-col"
      style={{
        background: 'linear-gradient(150deg, #0a0d12 0%, #0f1a08 30%, #0d1117 65%, #080b14 100%)',
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }}
    >
      {/* ── Partículas ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width:  (i % 3 === 0 ? 2.4 : 1.2) + 'px',
              height: (i % 3 === 0 ? 2.4 : 1.2) + 'px',
              top:  ((i * 17 + 13) % 100) + '%',
              left: ((i * 31 +  7) % 100) + '%',
              background: i % 3 === 0 ? 'rgba(201,169,110,0.55)' : 'rgba(255,255,255,0.14)',
              animation: `twk ${(2 + (i % 4) * 0.7).toFixed(1)}s ease-in-out ${((i % 6) * 0.5).toFixed(1)}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Grade perspectiva ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.035 }}>
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-10%', right: '-10%', height: '65%',
          backgroundImage: 'linear-gradient(rgba(201,169,110,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,169,110,1) 1px,transparent 1px)',
          backgroundSize: '55px 55px',
          transform: 'perspective(400px) rotateX(62deg)',
          transformOrigin: 'bottom center',
        }} />
      </div>

      {/* ── Halo dourado central ── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '560px', height: '560px',
          background: 'radial-gradient(circle, rgba(201,169,110,0.10) 0%, rgba(180,130,60,0.04) 45%, transparent 70%)',
          filter: 'blur(70px)',
          transition: 'opacity 1.5s ease',
          opacity: phase === 'enter' ? 0 : 0.9,
        }}
      />

      {/* ── FASE: LOGO ── */}
      <div
        className="flex flex-col items-center justify-center flex-1"
        style={{
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          opacity: phase === 'features' ? 0 : (phase === 'logo' ? 1 : 0),
          transform: phase === 'features' ? 'scale(0.92) translateY(-20px)' : 'scale(1)',
          pointerEvents: 'none',
          position: phase === 'features' ? 'absolute' : 'relative',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Badge */}
        <div style={{
          marginBottom: '36px',
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'translateY(-8px)' : 'translateY(0)',
          transition: 'all 0.9s ease 0.3s',
        }}>
          <span style={{
            fontSize: '8px', letterSpacing: '0.42em', textTransform: 'uppercase',
            color: '#c9a96e', border: '1px solid rgba(201,169,110,0.32)', borderRadius: '100px',
            padding: '5px 20px', background: 'rgba(201,169,110,0.06)',
            boxShadow: '0 0 20px rgba(201,169,110,0.08)',
          }}>
            ◆ &nbsp; Plataforma de Estudo Bíblico &nbsp; ◆
          </span>
        </div>

        {/* Logo + anéis */}
        <div style={{
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'scale(0.8) translateY(20px)' : 'scale(1)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.1s',
        }}>
          <div style={{ position: 'absolute', width: '120px', height: '120px', borderRadius: '50%', border: '1px solid rgba(201,169,110,0.22)', animation: 'spinRing 14s linear infinite' }} />
          <div style={{ position: 'absolute', width: '148px', height: '148px', borderRadius: '50%', border: '1px solid rgba(201,169,110,0.10)', animation: 'spinRing 22s linear infinite reverse' }} />
          <div style={{ position: 'absolute', width: '178px', height: '178px', borderRadius: '50%', border: '1px dashed rgba(201,169,110,0.06)', animation: 'spinRing 35s linear infinite' }} />
          <div style={{
            width: '80px', height: '80px', borderRadius: '22px',
            background: 'linear-gradient(145deg, #1a1200, #0a0d12)',
            border: '1px solid rgba(201,169,110,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 50px rgba(201,169,110,0.30), inset 0 1px 0 rgba(201,169,110,0.12)',
            position: 'relative', zIndex: 1,
          }}>
            <img src="/icon.svg" alt="α" style={{ width: '50px', height: '50px', filter: 'drop-shadow(0 0 20px rgba(201,169,110,0.8))' }} draggable={false} />
          </div>
        </div>

        {/* Divisor */}
        <div style={{
          margin: '28px 0 20px',
          width: phase === 'enter' ? '0' : '180px', height: '1px',
          background: 'linear-gradient(90deg, transparent, #c9a96e 35%, #f0d878 50%, #c9a96e 65%, transparent)',
          transition: 'width 1.4s ease 0.6s',
          boxShadow: '0 0 10px rgba(201,169,110,0.35)',
        }} />

        {/* Título */}
        <div style={{ textAlign: 'center', opacity: phase === 'enter' ? 0 : 1, transform: phase === 'enter' ? 'translateY(14px)' : 'translateY(0)', transition: 'all 1.2s ease 0.5s' }}>
          <p style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.30em', textTransform: 'uppercase', color: 'rgba(180,180,200,0.55)', marginBottom: '8px' }}>Bem-vindo à</p>
          <h1 style={{ fontSize: '42px', fontWeight: 700, color: '#c9a96e', fontFamily: 'Georgia, serif', letterSpacing: '0.03em', lineHeight: '1', textShadow: '0 0 48px rgba(201,169,110,0.50), 0 2px 0 rgba(0,0,0,0.6)' }}>Bíblia Alpha</h1>
          <p style={{ fontSize: '11px', color: 'rgba(160,160,185,0.65)', fontWeight: 300, letterSpacing: '0.30em', textTransform: 'uppercase', marginTop: '10px' }}>Estudo &nbsp;·&nbsp; Meditação &nbsp;·&nbsp; Crescimento</p>
        </div>

        {/* Versículo */}
        <div style={{
          maxWidth: '340px', marginTop: '28px', padding: '0 28px', textAlign: 'center',
          opacity: phase === 'enter' ? 0 : 0.75, transition: 'opacity 1.4s ease 0.9s',
        }}>
          <p style={{ fontSize: '12.5px', fontStyle: 'italic', color: 'rgba(180,175,195,0.80)', lineHeight: '1.7', fontFamily: 'Georgia, serif' }}>
            &ldquo;{verse.text}&rdquo;
          </p>
          <p style={{ fontSize: '10px', color: 'rgba(130,130,155,0.55)', marginTop: '6px', letterSpacing: '0.15em' }}>— {verse.ref}</p>
        </div>
      </div>

      {/* ── FASE: FEATURES ── */}
      {phase === 'features' && (
        <div className="flex flex-col h-full overflow-hidden" style={{ animation: 'fadeInUp 0.5s ease both' }}>

          {/* Cabeçalho compacto */}
          <div className="flex flex-col items-center pt-8 pb-5 px-4 shrink-0">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'linear-gradient(145deg, #1a1200, #0a0d12)',
                border: '1px solid rgba(201,169,110,0.30)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px rgba(201,169,110,0.20)',
              }}>
                <img src="/icon.svg" alt="α" style={{ width: '26px', height: '26px', filter: 'drop-shadow(0 0 8px rgba(201,169,110,0.8))' }} draggable={false} />
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#c9a96e', fontFamily: 'Georgia, serif', letterSpacing: '0.02em', lineHeight: '1.1', textShadow: '0 0 24px rgba(201,169,110,0.35)' }}>Bíblia Alpha</h1>
                <p style={{ fontSize: '9.5px', color: 'rgba(160,165,185,0.60)', letterSpacing: '0.28em', textTransform: 'uppercase', marginTop: '2px' }}>Estudo · Meditação · Crescimento</p>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(190,190,210,0.70)', textAlign: 'center', maxWidth: '340px', lineHeight: '1.55', marginTop: '8px' }}>
              Uma plataforma completa de estudo bíblico — tudo que você precisa para crescer na Palavra.
            </p>
          </div>

          {/* Grid de recursos */}
          <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ scrollbarWidth: 'none' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
              gap: '10px',
              maxWidth: '680px',
              margin: '0 auto',
            }}>
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: '13px 15px',
                    borderRadius: '12px',
                    border: '1px solid rgba(201,169,110,0.14)',
                    background: 'rgba(201,169,110,0.04)',
                    backdropFilter: 'blur(8px)',
                    opacity: visibleFeatures.includes(i) ? 1 : 0,
                    transform: visibleFeatures.includes(i) ? 'translateY(0)' : 'translateY(14px)',
                    transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)',
                  }}
                >
                  <span style={{ fontSize: '22px', lineHeight: '1', flexShrink: 0, marginTop: '1px' }}>{f.icon}</span>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#d4b06a', marginBottom: '3px', letterSpacing: '0.01em' }}>{f.title}</p>
                    <p style={{ fontSize: '11.5px', color: 'rgba(175,175,195,0.72)', lineHeight: '1.55' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Assinatura + versículo */}
            <div style={{ textAlign: 'center', marginTop: '20px', opacity: visibleFeatures.length === FEATURES.length ? 1 : 0, transition: 'opacity 0.6s ease 0.3s' }}>
              <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.5), transparent)', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'rgba(180,175,195,0.65)', fontFamily: 'Georgia, serif', lineHeight: '1.6', maxWidth: '300px', margin: '0 auto' }}>
                &ldquo;{verse.text}&rdquo;
              </p>
              <p style={{ fontSize: '10px', color: 'rgba(130,130,150,0.50)', marginTop: '5px', letterSpacing: '0.14em' }}>— {verse.ref}</p>
              <div style={{ marginTop: '14px' }}>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#c9a96e', fontFamily: 'Georgia, serif' }}>Erick Silva</p>
                <p style={{ fontSize: '9px', color: 'rgba(150,150,170,0.50)', letterSpacing: '0.20em', textTransform: 'uppercase', marginTop: '2px' }}>Pr e The, Ldo. Fil.</p>
              </div>
            </div>
          </div>

          {/* Botão Entrar + barra de progresso */}
          <div className="shrink-0 px-4 pb-6 pt-3 flex flex-col items-center gap-3">
            <button
              onClick={finish}
              style={{
                padding: '12px 48px',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, #c9a96e, #e8c97a)',
                color: '#0a0d12',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(201,169,110,0.40), 0 1px 0 rgba(255,255,255,0.15) inset',
                transition: 'all 0.18s ease',
                opacity: visibleFeatures.length >= 4 ? 1 : 0,
                transform: visibleFeatures.length >= 4 ? 'translateY(0)' : 'translateY(8px)',
              }}
              onMouseOver={e => { (e.target as HTMLElement).style.transform = 'scale(1.04)'; }}
              onMouseOut={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
            >
              Começar a estudar →
            </button>

            {/* Barra de progresso auto-dismiss */}
            <div style={{ width: '120px', height: '2px', borderRadius: '2px', background: 'rgba(201,169,110,0.12)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #c9a96e, #f0d878)',
                width: '100%',
                transformOrigin: 'left',
                animation: 'progressBar 12.2s linear forwards',
                boxShadow: '0 0 6px rgba(201,169,110,0.5)',
              }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Barra de progresso fase logo ── */}
      {phase !== 'features' && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'rgba(201,169,110,0.05)' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, transparent, #c9a96e 40%, #f0d878 50%, #c9a96e 60%, transparent)',
            width: phase === 'enter' ? '0%' : '100%',
            transition: 'width 1.8s linear 0.1s',
            boxShadow: '0 0 6px rgba(201,169,110,0.5)',
          }} />
        </div>
      )}

      <style>{`
        @keyframes twk { 0%,100%{opacity:0.10;transform:scale(1)} 50%{opacity:0.70;transform:scale(1.5)} }
        @keyframes spinRing { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes progressBar { from{transform:scaleX(0)} to{transform:scaleX(1)} }
      `}</style>
    </div>
  );
}
