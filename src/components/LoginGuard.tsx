import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { SUPER_ADMIN_EMAIL } from '../services/firebase';
import AdminPanel from './AdminPanel';

const LANDING_URL    = 'https://studiologos.com.br';
const WHATSAPP_GROUP = 'https://chat.whatsapp.com/Gt78A68duMBADzzuwnGmbb?mode=gi_t';

interface Feature { icon: string; color: string; label: string; detail: string; }
const FEATURES: Feature[] = [
  { icon: 'B', color: '#c9a96e', label: 'Bíblia com +20 traduções',   detail: 'ARC, NVI, ACF, KJV e mais, em paralelo' },
  { icon: '✎', color: '#60A5FA', label: 'Bloco de estudos na nuvem',  detail: 'Notas, destaques e tarefas sincronizados' },
  { icon: '❝', color: '#A78BFA', label: 'Comentários por versículo',  detail: 'Calvino, Matthew Henry, Spurgeon e outros' },
  { icon: '⊞', color: '#34D399', label: 'Biblioteca teológica',       detail: 'Centenas de eBooks clássicos gratuitos' },
  { icon: '✦', color: '#F472B6', label: 'Devocionais diários',        detail: 'Para Ministério, Homens, Mulheres e Jovens' },
  { icon: '⌕', color: '#FB923C', label: 'Pesquisa & Strong',          detail: 'Dicionário, concordância e enciclopédia' },
];

const WA_ICON = (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ── Tela de Acesso Liberado (/acesso-liberado) ──────────────────────
function AcessoLiberadoPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-sleek-bg px-6 font-sans text-center relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-green-500/6 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="relative max-w-sm w-full">
        <div className="mb-6 w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto" style={{ boxShadow: '0 0 32px rgba(34,197,94,0.18)' }}>
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-sleek-text-main mb-3 tracking-tight">
          Pagamento confirmado!
        </h1>
        <p className="text-sm text-sleek-text-muted leading-relaxed mb-2">
          Seu acesso à <strong className="text-sleek-text-main font-semibold">Bíblia Alpha</strong> foi liberado automaticamente.
        </p>
        <p className="text-sm text-sleek-text-muted leading-relaxed mb-8">
          Entre com o mesmo e-mail Google informado no momento da compra.
        </p>
        <a
          href="/"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: 'linear-gradient(135deg, #c9a96e 0%, #e8c97a 50%, #c9a96e 100%)',
            color: '#0a0b0e',
            boxShadow: '0 4px 20px rgba(201,169,110,0.30)',
          }}
        >
          <img src="/logo.svg" alt="" className="w-5 h-5" />
          Entrar na Bíblia Alpha
        </a>
      </div>
    </div>
  );
}

// ── Paywall — sem acesso (logado mas sem assinatura) ────────────────
function PaywallScreen({ displayName, email, onLogout }: { displayName: string; email: string; onLogout: () => void }) {
  return (
    <div className="flex h-screen w-full overflow-hidden font-sans">
      {/* Painel esquerdo (desktop) */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] xl:w-[55%] relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #0a0d12 0%, #0e1a0a 35%, #0d1117 65%, #080b14 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: (i % 3 === 0 ? 2.2 : 1.1) + 'px', height: (i % 3 === 0 ? 2.2 : 1.1) + 'px',
              top: ((i * 19 + 11) % 100) + '%', left: ((i * 29 + 5) % 100) + '%',
              background: i % 3 === 0 ? 'rgba(201,169,110,0.45)' : 'rgba(255,255,255,0.12)',
              animation: `twk ${(2.5 + (i % 4) * 0.8).toFixed(1)}s ease-in-out ${((i % 5) * 0.6).toFixed(1)}s infinite`,
            }} />
          ))}
        </div>
        <div className="absolute pointer-events-none" style={{
          top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '480px', height: '480px',
          background: 'radial-gradient(circle,rgba(201,169,110,0.10) 0%,transparent 65%)',
          filter: 'blur(60px)',
        }} />
        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          <div className="flex items-center gap-3 mb-auto">
            <div style={{ width:'40px',height:'40px',borderRadius:'11px',background:'linear-gradient(145deg,#1a1500,#0a0d12)',border:'1px solid rgba(201,169,110,0.30)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <img src="/logo.svg" alt="" style={{ width:'26px',height:'26px',filter:'drop-shadow(0 0 8px rgba(201,169,110,0.9))' }} />
            </div>
            <div>
              <p style={{ fontSize:'16px',fontWeight:700,color:'#c9a96e',fontFamily:'Georgia,serif' }}>Bíblia Alpha</p>
              <p style={{ fontSize:'9px',color:'rgba(160,165,185,0.55)',letterSpacing:'0.26em',textTransform:'uppercase' }}>Plataforma de Estudo Bíblico</p>
            </div>
          </div>
          <div className="my-8">
            <h2 style={{ fontSize:'30px',fontWeight:700,color:'#e8e8e2',lineHeight:1.25,letterSpacing:'-0.01em',marginBottom:'12px' }}>
              Estude a Bíblia com<br/>
              <span style={{ color:'#c9a96e',fontFamily:'Georgia,serif' }}>profundidade e clareza</span>
            </h2>
            <p style={{ fontSize:'14px',color:'rgba(180,180,200,0.62)',lineHeight:1.65,maxWidth:'380px' }}>
              Comentários de grandes teólogos, devocionais, planos de leitura, biblioteca e bloco de notas — tudo num só lugar.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display:'flex',alignItems:'flex-start',gap:'10px',padding:'10px 12px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.06)',background:'rgba(255,255,255,0.03)' }}>
                <div style={{ width:'28px',height:'28px',borderRadius:'8px',flexShrink:0,background:f.color+'18',border:'1px solid '+f.color+'30',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:700,color:f.color,fontFamily:'serif' }}>{f.icon}</div>
                <div>
                  <p style={{ fontSize:'12px',fontWeight:600,color:'#d4d0c8',lineHeight:1.3 }}>{f.label}</p>
                  <p style={{ fontSize:'10.5px',color:'rgba(160,165,185,0.55)',lineHeight:1.4,marginTop:'2px' }}>{f.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize:'12px',color:'rgba(201,169,110,0.55)',fontStyle:'italic',fontFamily:'Georgia,serif' }}>
            "A tua palavra é lâmpada para os meus pés…" — Sl 119:105
          </p>
        </div>
      </div>

      {/* Painel direito */}
      <div className="flex-1 flex flex-col items-center justify-center bg-sleek-bg relative overflow-hidden px-6 py-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[280px] bg-gradient-to-b from-amber-500/4 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="relative w-full max-w-sm">

          {/* Logo mobile */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div style={{ width:'44px',height:'44px',borderRadius:'13px',background:'linear-gradient(145deg,#111,#000)',border:'1px solid rgba(201,169,110,0.28)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <img src="/logo.svg" alt="" style={{ width:'28px',height:'28px',filter:'drop-shadow(0 0 10px rgba(201,169,110,0.7))' }} />
            </div>
            <div>
              <p className="text-[17px] font-bold text-sleek-text-main" style={{ fontFamily:'Georgia,serif' }}>Bíblia Alpha</p>
              <p className="text-[9px] text-sleek-text-muted tracking-[0.28em] uppercase">Plataforma de Estudo</p>
            </div>
          </div>

          {/* Avatar + saudação */}
          <div className="mb-6 text-center">
            <p className="text-xs text-sleek-text-muted mb-1">Conectado como</p>
            <p className="text-sm font-semibold text-sleek-text-main">{email}</p>
          </div>

          {/* Card de status */}
          <div className="mb-6 p-4 bg-amber-500/6 border border-amber-400/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                  Acesso não encontrado
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                  Este e-mail ainda não possui uma assinatura ativa. Assine para desbloquear toda a plataforma.
                </p>
              </div>
            </div>
          </div>

          {/* CTA principal */}
          <a
            href={LANDING_URL}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm mb-3 transition-all"
            style={{
              background: 'linear-gradient(135deg, #c9a96e 0%, #e8c97a 50%, #c9a96e 100%)',
              color: '#0a0b0e',
              boxShadow: '0 4px 24px rgba(201,169,110,0.35)',
            }}
          >
            Assinar Bíblia Alpha
          </a>

          {/* Nota de automatismo */}
          <p className="text-[11px] text-sleek-text-muted text-center leading-relaxed mb-5">
            Acesso liberado automaticamente após a confirmação do pagamento.<br/>
            Basta informar seu e-mail Google e entrar na Bíblia Alpha.
          </p>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-sleek-border" />
            <span className="text-[11px] text-sleek-text-muted">ou</span>
            <div className="flex-1 h-px bg-sleek-border" />
          </div>

          {/* WhatsApp */}
          <a
            href={WHATSAPP_GROUP}
            target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3 border border-green-200 rounded-xl hover:bg-green-50 transition-all text-sm text-green-700 font-medium mb-6"
          >
            {WA_ICON}
            Falar no WhatsApp
          </a>

          <button
            onClick={onLogout}
            className="w-full text-sm text-sleek-text-muted hover:text-sleek-text-main transition-colors text-center"
          >
            Sair / Trocar conta
          </button>
        </div>
      </div>

      <style>{`@keyframes twk { 0%,100%{opacity:0.10;transform:scale(1)} 50%{opacity:0.65;transform:scale(1.5)} }`}</style>
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────────
export default function LoginGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, hasAccess, loading, profileError, login, logout } = useAuth();

  const [showAdmin,       setShowAdmin]       = useState(() => {
    if (typeof window !== 'undefined')
      return new URLSearchParams(window.location.search).get('admin') === '1';
    return false;
  });
  const [loginError,      setLoginError]      = useState<string | null>(null);
  const [loginLoading,    setLoginLoading]    = useState(false);
  const [visibleFeatures, setVisibleFeatures] = useState<number[]>([]);

  // Verificar se está na página /acesso-liberado
  const isAcessoLiberadoPage = typeof window !== 'undefined' &&
    window.location.pathname === '/acesso-liberado';

  useEffect(() => {
    const h = () => setShowAdmin(true);
    window.addEventListener('open-admin', h);
    return () => window.removeEventListener('open-admin', h);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      FEATURES.forEach((_, i) => {
        setTimeout(() => setVisibleFeatures(p => [...p, i]), 300 + i * 90);
      });
    }
  }, [loading, user]);

  const handleLogin = async () => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      await login();
    } catch (e: any) {
      const code = e?.code ?? '';
      const errorMap: Record<string, string> = {
        'auth/unauthorized-domain':    'Domínio não autorizado.',
        'auth/network-request-failed': 'Sem conexão. Tente novamente.',
        'auth/popup-blocked':          'Popup bloqueado. Permita popups para este site.',
        'auth/popup-closed-by-user':   'Login cancelado.',
        'auth/cancelled-popup-request':'Operação cancelada. Tente novamente.',
        'auth/too-many-requests':      'Muitas tentativas. Aguarde alguns minutos.',
        'auth/user-disabled':          'Conta desativada. Entre em contato pelo WhatsApp.',
      };
      setLoginError(errorMap[code] ?? `Erro: ${code || e?.message || 'desconhecido'}`);
    } finally {
      setLoginLoading(false);
    }
  };

  // Página /acesso-liberado — sem precisar de login
  if (isAcessoLiberadoPage) {
    return <AcessoLiberadoPage />;
  }

  // Loading
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-sleek-bg">
        <div className="flex flex-col items-center gap-4">
          <div style={{ width:'48px',height:'48px',borderRadius:'14px',background:'linear-gradient(145deg,var(--color-sleek-hover),var(--color-sleek-surface))',border:'1px solid var(--color-sleek-border)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 20px rgba(0,0,0,0.10)' }}>
            <img src="/logo.svg" alt="" style={{ width:'30px',height:'30px',opacity:0.85 }} />
          </div>
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-sleek-text-muted/40" style={{ animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
            ))}
          </div>
          <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.3}40%{transform:scale(1);opacity:1}}`}</style>
        </div>
      </div>
    );
  }

  // Não logado — tela de login
  if (!user) {
    return (
      <div className="flex h-screen w-full overflow-hidden font-sans">
        {/* Painel esquerdo */}
        <div className="hidden lg:flex flex-col justify-between w-[52%] xl:w-[55%] relative overflow-hidden"
          style={{ background:'linear-gradient(150deg,#0a0d12 0%,#0e1a0a 35%,#0d1117 65%,#080b14 100%)' }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="absolute rounded-full" style={{
                width:(i%3===0?2.2:1.1)+'px',height:(i%3===0?2.2:1.1)+'px',
                top:((i*19+11)%100)+'%',left:((i*29+5)%100)+'%',
                background:i%3===0?'rgba(201,169,110,0.45)':'rgba(255,255,255,0.12)',
                animation:`twk ${(2.5+(i%4)*0.8).toFixed(1)}s ease-in-out ${((i%5)*0.6).toFixed(1)}s infinite`,
              }} />
            ))}
          </div>
          <div className="absolute pointer-events-none" style={{ top:'40%',left:'50%',transform:'translate(-50%,-50%)',width:'480px',height:'480px',background:'radial-gradient(circle,rgba(201,169,110,0.10) 0%,transparent 65%)',filter:'blur(60px)' }} />
          <div className="relative z-10 flex flex-col h-full px-10 py-10">
            <div className="flex items-center gap-3 mb-auto">
              <div style={{ width:'40px',height:'40px',borderRadius:'11px',background:'linear-gradient(145deg,#1a1500,#0a0d12)',border:'1px solid rgba(201,169,110,0.30)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 20px rgba(201,169,110,0.18)' }}>
                <img src="/logo.svg" alt="" style={{ width:'26px',height:'26px',filter:'drop-shadow(0 0 8px rgba(201,169,110,0.9))' }} />
              </div>
              <div>
                <p style={{ fontSize:'16px',fontWeight:700,color:'#c9a96e',fontFamily:'Georgia,serif',letterSpacing:'0.02em' }}>Bíblia Alpha</p>
                <p style={{ fontSize:'9px',color:'rgba(160,165,185,0.55)',letterSpacing:'0.26em',textTransform:'uppercase',marginTop:'1px' }}>Plataforma de Estudo Bíblico</p>
              </div>
            </div>
            <div className="my-8">
              <p style={{ fontSize:'11px',color:'rgba(201,169,110,0.70)',letterSpacing:'0.32em',textTransform:'uppercase',marginBottom:'12px',fontWeight:500 }}>Tudo que você precisa para crescer na Palavra</p>
              <h2 style={{ fontSize:'32px',fontWeight:700,color:'#e8e8e2',lineHeight:1.25,letterSpacing:'-0.01em',marginBottom:'14px' }}>
                Estude a Bíblia com<br/>
                <span style={{ color:'#c9a96e',fontFamily:'Georgia,serif' }}>profundidade e clareza</span>
              </h2>
              <p style={{ fontSize:'14px',color:'rgba(180,180,200,0.62)',lineHeight:1.65,maxWidth:'380px' }}>
                Comentários de grandes teólogos, devocionais, planos de leitura, biblioteca e bloco de notas sincronizado.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {FEATURES.map((f, i) => (
                <div key={i} style={{ display:'flex',alignItems:'flex-start',gap:'10px',padding:'10px 12px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.06)',background:'rgba(255,255,255,0.03)',opacity:visibleFeatures.includes(i)?1:0,transform:visibleFeatures.includes(i)?'translateY(0)':'translateY(10px)',transition:'opacity 0.35s ease,transform 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
                  <div style={{ width:'28px',height:'28px',borderRadius:'8px',flexShrink:0,background:f.color+'18',border:'1px solid '+f.color+'30',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:700,color:f.color,fontFamily:'serif' }}>{f.icon}</div>
                  <div>
                    <p style={{ fontSize:'12px',fontWeight:600,color:'#d4d0c8',lineHeight:1.3 }}>{f.label}</p>
                    <p style={{ fontSize:'10.5px',color:'rgba(160,165,185,0.55)',lineHeight:1.4,marginTop:'2px' }}>{f.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
              <div style={{ width:'30px',height:'1px',background:'rgba(201,169,110,0.30)' }} />
              <p style={{ fontSize:'12px',fontStyle:'italic',color:'rgba(180,175,195,0.55)',fontFamily:'Georgia,serif' }}>"A tua palavra é lâmpada para os meus pés…"</p>
              <p style={{ fontSize:'10px',color:'rgba(130,130,150,0.45)',whiteSpace:'nowrap' }}>Sl 119:105</p>
            </div>
          </div>
        </div>

        {/* Painel direito — form de login */}
        <div className="flex-1 flex flex-col items-center justify-center bg-sleek-bg relative overflow-hidden px-6 py-10">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[280px] bg-gradient-to-b from-blue-500/4 to-transparent rounded-full blur-3xl" />
            <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage:'linear-gradient(var(--color-sleek-border) 1px,transparent 1px),linear-gradient(90deg,var(--color-sleek-border) 1px,transparent 1px)',backgroundSize:'38px 38px' }} />
          </div>
          <div className="relative w-full max-w-sm">
            <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
              <div style={{ width:'44px',height:'44px',borderRadius:'13px',background:'linear-gradient(145deg,#111,#000)',border:'1px solid rgba(201,169,110,0.28)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <img src="/logo.svg" alt="" style={{ width:'28px',height:'28px',filter:'drop-shadow(0 0 10px rgba(201,169,110,0.7))' }} />
              </div>
              <div>
                <p className="text-[17px] font-bold text-sleek-text-main" style={{ fontFamily:'Georgia,serif' }}>Bíblia Alpha</p>
                <p className="text-[9px] text-sleek-text-muted tracking-[0.28em] uppercase mt-0.5">Plataforma de Estudo</p>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-sleek-text-main tracking-tight mb-2">Bem-vindo de volta</h2>
              <p className="text-sm text-sleek-text-muted leading-relaxed">Entre com sua conta Google para acessar seus estudos e toda a plataforma.</p>
            </div>
            {loginError && (
              <div className="mb-5 p-3 bg-red-500/8 border border-red-400/25 rounded-xl">
                <p className="text-xs text-red-500 font-mono leading-relaxed">{loginError}</p>
              </div>
            )}
            <button
              onClick={handleLogin} disabled={loginLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-sleek-border rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm mb-3"
            >
              {loginLoading
                ? <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
                : <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />}
              {loginLoading ? 'Entrando…' : 'Continuar com Google'}
            </button>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-sleek-border" />
              <span className="text-[11px] text-sleek-text-muted tracking-wide">ou</span>
              <div className="flex-1 h-px bg-sleek-border" />
            </div>
            <a href={WHATSAPP_GROUP} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3 border border-green-200 rounded-xl hover:bg-green-50 transition-all text-sm text-green-700 font-medium mb-8">
              {WA_ICON}
              Conhecer no grupo do WhatsApp
            </a>
            <p className="text-[11px] text-sleek-text-muted text-center leading-relaxed">
              Acesso liberado automaticamente após o pagamento.<br/>
              Novo por aqui? <a href={LANDING_URL} className="text-amber-600 hover:underline">Assine em studiologos.com.br</a>
            </p>
          </div>
        </div>

        <style>{`@keyframes twk{0%,100%{opacity:0.10;transform:scale(1)}50%{opacity:0.65;transform:scale(1.5)}}`}</style>
      </div>
    );
  }

  // Logado mas sem perfil carregado / erro
  if (!profile && profileError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-sleek-bg p-4 font-sans text-center">
        <div className="mb-4 w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-sleek-text-main mb-2">Erro ao carregar perfil</p>
        <div className="mb-5 p-3 bg-red-500/8 border border-red-400/25 rounded-xl max-w-sm w-full">
          <p className="text-xs text-red-500 font-mono">{profileError}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.location.reload()} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Tentar novamente</button>
          <button onClick={() => logout()} className="px-4 py-2 text-sm text-blue-600 hover:underline">Sair</button>
        </div>
      </div>
    );
  }

  // Carregando perfil
  if (!profile && !profileError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-sleek-bg p-4 font-sans text-center">
        {user?.photoURL && <img src={user.photoURL} alt="" className="w-14 h-14 rounded-full border-2 border-sleek-border mb-4 shadow-md" referrerPolicy="no-referrer" />}
        <p className="text-sm font-semibold text-sleek-text-main mb-1">Olá, {user?.displayName?.split(' ')[0] ?? 'bem-vindo'}!</p>
        <p className="text-xs text-sleek-text-muted mb-4">Verificando seu acesso…</p>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-sleek-text-muted/40" style={{ animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
          ))}
        </div>
        <button onClick={() => logout()} className="text-xs text-sleek-text-muted hover:text-sleek-text-main mt-6">Cancelar / Sair</button>
        <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.3}40%{transform:scale(1);opacity:1}}`}</style>
      </div>
    );
  }

  const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
  const isAdminUser  = (profile?.isAdmin ?? false) || isSuperAdmin;

  // Sem acesso — paywall
  if (!hasAccess) {
    return <PaywallScreen displayName={user.displayName || ''} email={user.email || ''} onLogout={logout} />;
  }

  // Acesso bloqueado (sistema legado)
  if (profile?.status === 'blocked') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-sleek-bg p-4 font-sans text-center relative overflow-hidden">
        <div className="mb-5 w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-sleek-text-main mb-2">Acesso bloqueado</h1>
        <p className="text-sleek-text-muted mb-7 max-w-sm text-sm leading-relaxed">Sua conta foi suspensa. Entre em contato pelo WhatsApp.</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <a href={WHATSAPP_GROUP} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 px-6 py-3 border border-green-200 rounded-xl hover:bg-green-50 transition-all text-sm text-green-700 font-medium">
            {WA_ICON}
            Falar com o suporte
          </a>
          <button onClick={() => logout()} className="text-sm text-sleek-text-muted hover:underline">Sair</button>
        </div>
      </div>
    );
  }

  // ── App ──
  return (
    <>
      {children}
      {isAdminUser && (
        <button
          onClick={() => setShowAdmin(true)}
          className="fixed bottom-4 right-4 z-[99] bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all"
          title="Painel Admin"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </button>
      )}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </>
  );
}
