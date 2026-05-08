import React, { useEffect, useState, useCallback } from 'react';
import {
  collection, query, onSnapshot, doc, updateDoc,
  deleteDoc, serverTimestamp, orderBy, limit, where,
  getDocs, setDoc, Timestamp,
} from 'firebase/firestore';
import { db, UserProfile } from '../services/firebase';
import { Shield, Trash2, CheckCircle, XCircle, Search, Users, CreditCard, RefreshCw, Lock, Unlock } from 'lucide-react';

interface UserDoc extends UserProfile { id: string; createdAt?: any; updatedAt?: any; }

interface AccessDoc {
  id: string;
  email: string;
  active: boolean;
  status: string;
  plan: string;
  product: string;
  paymentProvider: string;
  paymentId: string;
  approvedAt: any;
  expiresAt: any;
  lifetime: boolean;
}

interface OrderDoc {
  id: string;
  email: string;
  status: string;
  plan: string;
  price: number;
  currency: string;
  paymentId?: string;
  provider: string;
  createdAt: any;
  updatedAt: any;
}

type Tab = 'users' | 'assinantes' | 'orders';

function fmtDate(ts: any): string {
  if (!ts) return '—';
  try {
    const d = ts?.toDate?.() ?? new Date(ts);
    return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  } catch { return '—'; }
}

function StatusBadge({ status, active }: { status: string; active?: boolean }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    active:    { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Ativo' },
    approved:  { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Aprovado' },
    pending:   { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Pendente' },
    blocked:   { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Bloqueado' },
    rejected:  { bg: 'bg-red-50',    text: 'text-red-600',    label: 'Rejeitado' },
    cancelled: { bg: 'bg-gray-100',  text: 'text-gray-600',   label: 'Cancelado' },
    refunded:  { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Estornado' },
    chargeback:{ bg: 'bg-red-100',   text: 'text-red-800',    label: 'Chargeback' },
  };
  const s = map[status] ?? { bg:'bg-gray-100', text:'text-gray-600', label: status };
  return (
    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [tab,        setTab]        = useState<Tab>('users');
  const [users,      setUsers]      = useState<UserDoc[]>([]);
  const [accesses,   setAccesses]   = useState<AccessDoc[]>([]);
  const [orders,     setOrders]     = useState<OrderDoc[]>([]);
  const [search,     setSearch]     = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPlan,  setManualPlan] = useState('anual');
  const [manualMsg,   setManualMsg]   = useState('');
  const [saving,      setSaving]      = useState(false);

  // ── users ──
  useEffect(() => {
    const q = query(collection(db, 'users'));
    return onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserDoc)));
    });
  }, []);

  // ── access ──
  useEffect(() => {
    if (tab !== 'assinantes') return;
    const q = query(collection(db, 'access'), orderBy('approvedAt', 'desc'), limit(100));
    return onSnapshot(q, (snap) => {
      setAccesses(snap.docs.map(d => ({ id: d.id, ...d.data() } as AccessDoc)));
    });
  }, [tab]);

  // ── orders ──
  useEffect(() => {
    if (tab !== 'orders') return;
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as OrderDoc)));
    });
  }, [tab]);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'blocked' | 'pending') => {
    try {
      await updateDoc(doc(db, 'users', id), { status, updatedAt: serverTimestamp() });
    } catch { alert('Erro ao atualizar status.'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este usuário?')) return;
    try { await deleteDoc(doc(db, 'users', id)); } catch { alert('Erro ao excluir.'); }
  };

  const handleToggleAccess = async (email: string, active: boolean) => {
    try {
      await updateDoc(doc(db, 'access', email), {
        active:    !active,
        status:    !active ? 'active' : 'blocked',
        updatedAt: serverTimestamp(),
      });
    } catch { alert('Erro ao alterar acesso.'); }
  };

  const handleGrantManual = async () => {
    const email = manualEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setManualMsg('Email inválido.'); return;
    }
    setSaving(true);
    setManualMsg('');
    try {
      const expiresAt = manualPlan === 'vitalicio' ? null
        : Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
      await setDoc(doc(db, 'access', email), {
        email,
        active:          true,
        status:          'active',
        product:         'biblia_alpha',
        plan:            manualPlan,
        paymentProvider: 'manual',
        paymentId:       'admin_grant_' + Date.now(),
        externalReference: 'manual',
        approvedAt:      serverTimestamp(),
        expiresAt,
        lifetime:        manualPlan === 'vitalicio',
        createdAt:       serverTimestamp(),
        updatedAt:       serverTimestamp(),
      }, { merge: true });
      await setDoc(doc(db, 'payment_access', email), {
        email,
        nome: email,
        payment_status: 'approved',
        access_status: 'active',
        paymentId: 'admin_grant_' + Date.now(),
        rawStatus: 'manual',
        planPrice: 'R$ 19,00',
        planPeriod: manualPlan === 'vitalicio' ? 'vitalicio' : 'mensal',
        approvedAt: serverTimestamp(),
        approvalDateBrasilia: new Date().toLocaleDateString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setManualMsg(`✓ Acesso liberado para ${email}`);
      setManualEmail('');
    } catch (e: any) {
      setManualMsg('Erro: ' + (e?.message || 'desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers    = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.nome?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAccesses = accesses.filter(a =>
    a.email?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredOrders   = orders.filter(o =>
    o.email?.toLowerCase().includes(search.toLowerCase()) ||
    o.id?.includes(search)
  );

  return (
    <div className="fixed inset-0 z-50 bg-sleek-bg overflow-y-auto font-sans">
      <div className="max-w-6xl mx-auto p-4 lg:p-8">

        {/* Header */}
        <header className="flex items-center justify-between mb-6 pb-5 border-b border-sleek-border">
          <div className="flex items-center gap-3">
            <Shield size={22} className="text-blue-500" />
            <div>
              <h1 className="text-lg font-bold text-sleek-text-main">Painel Admin</h1>
              <p className="text-xs text-sleek-text-muted">Bíblia Alpha · Controle de Acessos</p>
            </div>
          </div>
          <button onClick={onClose} className="px-4 py-2 bg-sleek-hover rounded-lg text-sm font-medium hover:bg-sleek-border transition text-sleek-text-main">
            Voltar ao App
          </button>
        </header>

        {/* Stats rápidos */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-sleek-surface border border-sleek-border rounded-xl p-4">
            <p className="text-[11px] text-sleek-text-muted uppercase tracking-wide mb-1">Usuários</p>
            <p className="text-2xl font-bold text-sleek-text-main">{users.length}</p>
          </div>
          <div className="bg-sleek-surface border border-sleek-border rounded-xl p-4">
            <p className="text-[11px] text-sleek-text-muted uppercase tracking-wide mb-1">Assinantes ativos</p>
            <p className="text-2xl font-bold text-green-600">{accesses.filter(a => a.active && a.status === 'active').length || '…'}</p>
          </div>
          <div className="bg-sleek-surface border border-sleek-border rounded-xl p-4">
            <p className="text-[11px] text-sleek-text-muted uppercase tracking-wide mb-1">Orders aprovadas</p>
            <p className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'approved').length || '…'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-sleek-hover rounded-xl p-1 w-fit">
          {(['users', 'assinantes', 'orders'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-sleek-bg shadow-sm text-sleek-text-main' : 'text-sleek-text-muted hover:text-sleek-text-main'}`}>
              {t === 'users' ? 'Usuários' : t === 'assinantes' ? 'Assinantes' : 'Orders'}
            </button>
          ))}
        </div>

        {/* Busca */}
        <div className="relative mb-5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sleek-text-muted" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por email…"
            className="w-full pl-9 pr-4 py-2.5 bg-sleek-input-bg border border-sleek-border rounded-xl text-sm text-sleek-text-main placeholder:text-sleek-text-muted focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* ── Tab: Usuários ── */}
        {tab === 'users' && (
          <div className="space-y-2">
            {filteredUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 bg-sleek-surface border border-sleek-border rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  {u.foto
                    ? <img src={u.foto} alt="" className="w-10 h-10 rounded-full flex-shrink-0" referrerPolicy="no-referrer" />
                    : <div className="w-10 h-10 rounded-full bg-sleek-hover flex items-center justify-center text-sm font-bold text-sleek-text-muted flex-shrink-0">{u.nome?.charAt(0)}</div>
                  }
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-sleek-text-main truncate">{u.nome}</p>
                    <p className="text-xs text-sleek-text-muted truncate">{u.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={u.status} />
                      {u.isAdmin && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">ADMIN</span>}
                    </div>
                  </div>
                </div>
                {!u.isAdmin && (
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    {u.status !== 'approved' && (
                      <button onClick={() => handleUpdateStatus(u.id, 'approved')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded-lg transition">
                        <CheckCircle size={12} /> Aprovar
                      </button>
                    )}
                    {u.status !== 'blocked' && (
                      <button onClick={() => handleUpdateStatus(u.id, 'blocked')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 rounded-lg transition">
                        <XCircle size={12} /> Bloquear
                      </button>
                    )}
                    <button onClick={() => handleDelete(u.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Assinantes ── */}
        {tab === 'assinantes' && (
          <>
            {/* Liberar acesso manual */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm font-semibold text-blue-800 mb-3">Liberar acesso manualmente</p>
              <div className="flex gap-2 flex-wrap">
                <input
                  value={manualEmail} onChange={e => setManualEmail(e.target.value)}
                  placeholder="email@gmail.com"
                  className="flex-1 min-w-[200px] px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                />
                <select value={manualPlan} onChange={e => setManualPlan(e.target.value)}
                  className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none">
                  <option value="anual">Anual</option>
                  <option value="vitalicio">Vitalício</option>
                </select>
                <button onClick={handleGrantManual} disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium">
                  {saving ? 'Salvando…' : 'Liberar'}
                </button>
              </div>
              {manualMsg && <p className="mt-2 text-xs font-medium text-blue-700">{manualMsg}</p>}
            </div>

            <div className="space-y-2">
              {filteredAccesses.length === 0 && (
                <p className="text-sm text-sleek-text-muted text-center py-8">Nenhum assinante encontrado.</p>
              )}
              {filteredAccesses.map(a => (
                <div key={a.id} className="flex items-center justify-between p-4 bg-sleek-surface border border-sleek-border rounded-xl gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-sleek-text-main truncate">{a.email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <StatusBadge status={a.status} active={a.active} />
                      <span className="text-[10px] bg-sleek-hover text-sleek-text-muted px-2 py-0.5 rounded-full capitalize">{a.plan}</span>
                      {a.lifetime && <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Vitalício</span>}
                    </div>
                    <p className="text-[11px] text-sleek-text-muted mt-1">
                      Aprovado: {fmtDate(a.approvedAt)}
                      {!a.lifetime && a.expiresAt && ` · Expira: ${fmtDate(a.expiresAt)}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleAccess(a.email, a.active)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition flex-shrink-0 ${
                      a.active
                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    }`}
                  >
                    {a.active ? <><Lock size={12}/> Revogar</> : <><Unlock size={12}/> Reativar</>}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tab: Orders ── */}
        {tab === 'orders' && (
          <div className="space-y-2">
            {filteredOrders.length === 0 && (
              <p className="text-sm text-sleek-text-muted text-center py-8">Nenhuma order encontrada.</p>
            )}
            {filteredOrders.map(o => (
              <div key={o.id} className="p-4 bg-sleek-surface border border-sleek-border rounded-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-sleek-text-main truncate">{o.email}</p>
                    <p className="text-[11px] text-sleek-text-muted font-mono mt-0.5 truncate">{o.id}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <StatusBadge status={o.status} />
                      <span className="text-[10px] bg-sleek-hover text-sleek-text-muted px-2 py-0.5 rounded-full capitalize">{o.plan}</span>
                      <span className="text-[10px] text-sleek-text-muted">R$ {Number(o.price).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] text-sleek-text-muted">{fmtDate(o.createdAt)}</p>
                    {o.paymentId && <p className="text-[10px] text-sleek-text-muted font-mono mt-0.5">MP #{o.paymentId}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
