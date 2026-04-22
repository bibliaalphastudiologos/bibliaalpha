import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const FEATURES = [
  { icon: '📖', text: 'Bíblia completa com mais de 20 versões e paralelo de versículos' },
  { icon: '🔍', text: 'Pesquisa avançada com dicionário, concordância e dicionário Strong' },
  { icon: '🤖', text: 'IA Teológica integrada para dúvidas e estudos aprofundados' },
  { icon: '📚', text: 'Biblioteca com centenas de eBooks clássicos do Domínio Público' },
  { icon: '📝', text: 'Bloco de notas pessoal sincronizado com suas leituras' },
  { icon: '🗺', text: 'Planos de leitura guiados para toda a Bíblia' },
  { icon: '💬', text: 'Comentários de grandes teólogos integrados por versículo' },
  { icon: '🌙', text: 'Modo escuro, tipografia ajustável e leitura imersiva' },
];

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');
  const [featureIdx, setFeatureIdx] = useState(0);
  const [featureFade, setFeatureFade] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 9500);
    const t3 = setTimeout(() => onFinish(), 10300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  useEffect(() => {
    if (phase === 'enter') return;
    const interval = setInterval(() => {
      setFeatureFade(false);
      setTimeout(() => {
        setFeatureIdx(i => (i + 1) % FEATURES.length);
        setFeatureFade(true);
      }, 300);
    }, 2200);
    return () => clearInterval(interval);
  }, [phase]);

  const feature = FEATURES[featureIdx];

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: [
          'radial-gradient(ellipse at 20% 50%, rgba(139,92,46,0.28) 0%, transparent 50%)',
          'radial-gradient(ellipse at 80% 20%, rgba(180,130,60,0.20) 0%, transparent 45%)',
          'radial-gradient(ellipse at 60% 80%, rgba(120,80,30,0.22) 0%, transparent 50%)',
          'linear-gradient(150deg, #0d1117 0%, #1a1200 35%, #0d1117 65%, #0a0d14 100%)',
        ].join(', '),
        transition: 'opacity 0.7s ease',
        opacity: phase === 'exit' ? 0 : 1,
      }}
    >
      {/* Partículas douradas e brancas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 55 }).map((_, i) => {
          const sz = (i % 3 === 0 ? 2.2 : 1.2);
          const isGold = i % 3 === 0;
          const top = ((i * 17 + 13) % 100);
          const left = ((i * 31 + 7) % 100);
          const dur = (2 + (i % 4) * 0.7).toFixed(1);
          const delay = ((i % 6) * 0.5).toFixed(1);
          return (
            <div key={i} className="absolute rounded-full" style={{
              width: sz + 'px', height: sz + 'px',
              top: top + '%', left: left + '%',
              background: isGold ? 'rgba(201,169,110,0.45)' : 'rgba(255,255,255,0.18)',
              animation: `twinkleSplash ${dur}s ease-in-out ${delay}s infinite`,
            }} />
          );
        })}
      </div>

      {/* Halo dourado central */}
      <div className="absolute rounded-full pointer-events-none" style={{
        width: '420px', height: '420px',
        background: 'radial-gradient(circle, rgba(201,169,110,0.16) 0%, rgba(180,130,60,0.07) 40%, transparent 70%)',
        filter: 'blur(60px)',
        transition: 'opacity 1.6s ease',
        opacity: phase === 'enter' ? 0 : 1,
      }} />

      {/* Badge topo */}
      <div style={{
        transition: 'opacity 1.2s ease 0.8s, transform 1.2s ease 0.8s',
        opacity: phase === 'enter' ? 0 : 1,
        transform: phase === 'enter' ? 'translateY(-8px)' : 'translateY(0)',
        marginBottom: '20px',
      }}>
        <span style={{
          fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase',
          color: '#c9a96e', border: '1px solid rgba(201,169,110,0.4)',
          borderRadius: '100px', padding: '4px 16px',
          background: 'rgba(201,169,110,0.08)',
        }}>
          ✦ &nbsp; Plataforma Bíblica Completa &nbsp; ✦
        </span>
      </div>

      {/* Logo */}
      <div style={{
        transition: 'opacity 1.2s ease, transform 1.2s ease',
        opacity: phase === 'enter' ? 0 : 1,
        transform: phase === 'enter' ? 'translateY(24px) scale(0.88)' : 'translateY(0) scale(1)',
        filter: 'drop-shadow(0 0 40px rgba(201,169,110,0.65)) drop-shadow(0 0 16px rgba(201,169,110,0.4))',
      }}>
        <img src="/icon.svg" alt="Bíblia Alpha" style={{ width: '76px', height: '76px', objectFit: 'contain' }} draggable={false} />
      </div>

      {/* Divisor dourado */}
      <div style={{
        margin: '20px 0',
        width: phase === 'enter' ? '0px' : '200px',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #c9a96e 30%, #f0d878 50%, #c9a96e 70%, transparent)',
        transition: 'width 1.5s ease 0.5s',
        boxShadow: '0 0 8px rgba(201,169,110,0.4)',
      }} />

      {/* Título principal */}
      <div className="text-center px-6" style={{
        transition: 'opacity 1.4s ease 0.6s, transform 1.4s ease 0.6s',
        opacity: phase === 'enter' ? 0 : 1,
        transform: phase === 'enter' ? 'translateY(12px)' : 'translateY(0)',
      }}>
        <p style={{ fontSize: '12px', fontWeight: 300, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(180,180,200,0.7)', marginBottom: '6px' }}>
          Bem-vindo à
        </p>
        <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#c9a96e', fontFamily: 'Georgia, serif', letterSpacing: '0.04em', lineHeight: 1, textShadow: '0 0 40px rgba(201,169,110,0.45)' }}>
          Bíblia Alpha
        </h1>
        <p style={{ fontSize: '11px', color: 'rgba(160,160,180,0.75)', fontWeight: 300, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '8px' }}>
          Estudo · Meditação · Crescimento
        </p>
      </div>

      {/* Frase rotativa de recursos — propaganda */}
      <div style={{
        marginTop: '30px',
        minHeight: '64px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 1.4s ease 1s',
        opacity: phase === 'enter' ? 0 : 1,
        maxWidth: '340px',
        width: '100%',
        padding: '0 24px',
      }}>
        <div style={{ transition: 'opacity 0.3s ease', opacity: featureFade ? 1 : 0, textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>{feature.icon}</div>
          <p style={{ fontSize: '13px', color: 'rgba(200,200,220,0.85)', lineHeight: 1.6, fontStyle: 'italic' }}>
            {feature.text}
          </p>
        </div>
      </div>

      {/* Separador secundário */}
      <div style={{
        marginTop: '22px',
        width: phase === 'enter' ? '0px' : '80px',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), transparent)',
        transition: 'width 1.5s ease 1.2s',
      }} />

      {/* Versículo */}
      <div style={{
        maxWidth: '320px', marginTop: '16px', padding: '0 24px', textAlign: 'center',
        transition: 'opacity 1.4s ease 1.2s',
        opacity: phase === 'enter' ? 0 : 0.8,
      }}>
        <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'rgba(160,160,180,0.75)', lineHeight: 1.65 }}>
          &ldquo;A tua palavra é lâmpada para os meus pés e luz para o meu caminho.&rdquo;
        </p>
        <p style={{ fontSize: '10px', color: 'rgba(130,130,150,0.6)', marginTop: '4px', letterSpacing: '0.12em' }}>
          — Salmos 119:105
        </p>
      </div>

      {/* Assinatura */}
      <div className="absolute bottom-10 text-center" style={{
        transition: 'opacity 1.6s ease 1.4s',
        opacity: phase === 'enter' ? 0 : 0.8,
      }}>
        <div style={{ fontSize: '15px', fontWeight: 500, color: '#c9a96e', fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>
          Erick Silva
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(150,150,170,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '2px' }}>
          Pr e The, Ldo. Fil.
        </div>
      </div>

      {/* Dots indicadores das features */}
      <div className="absolute flex gap-1.5" style={{
        bottom: '28px',
        transition: 'opacity 1.4s ease 1.4s',
        opacity: phase === 'enter' ? 0 : 0.65,
      }}>
        {FEATURES.map((_, i) => (
          <div key={i} style={{
            width: i === featureIdx ? '16px' : '5px',
            height: '3px',
            borderRadius: '2px',
            background: i === featureIdx ? '#c9a96e' : 'rgba(201,169,110,0.28)',
            transition: 'all 0.35s ease',
          }} />
        ))}
      </div>

      {/* Barra de progresso dourada */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'rgba(201,169,110,0.07)' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, transparent, #c9a96e 40%, #f0d878 50%, #c9a96e 60%, transparent)',
          width: phase === 'enter' ? '0%' : '100%',
          transition: 'width 9.5s linear 0.2s',
          boxShadow: '0 0 6px rgba(201,169,110,0.55)',
        }} />
      </div>

      <style>{`
        @keyframes twinkleSplash {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}
