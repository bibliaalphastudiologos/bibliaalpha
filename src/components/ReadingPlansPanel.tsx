import { cn } from '../App';
import * as React from 'react';
import { X, BookOpen, CheckCircle2, Circle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { PLANS } from '../data/readingPlans';
import { useAuth } from './AuthProvider';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ReadingPlansPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChapter: (bookId: string, chapter: number) => void;
}

const LS_PLAN_KEY        = 'bibliaalpha_active_plan';
const LS_MILESTONES_KEY  = 'bibliaalpha_milestones';

export default function ReadingPlansPanel({
  isOpen,
  onClose,
  onSelectChapter,
}: ReadingPlansPanelProps) {
  const { user } = useAuth();

  const [activePlanId, setActivePlanId] = useState<string | null>(
    () => localStorage.getItem(LS_PLAN_KEY) || null
  );
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(LS_MILESTONES_KEY) || '{}'); } catch { return {}; }
  });

  // ── Carregar do Firestore ao montar (usuário autenticado) ──────────────────
  const loadedFromFirestore = useRef(false);

  useEffect(() => {
    if (!user || loadedFromFirestore.current) return;
    loadedFromFirestore.current = true;

    async function loadFromFirestore() {
      try {
        const ref = doc(db, 'users', user!.uid, 'plans', 'progress');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.activePlanId !== undefined) {
            setActivePlanId(data.activePlanId);
            if (data.activePlanId) localStorage.setItem(LS_PLAN_KEY, data.activePlanId);
            else localStorage.removeItem(LS_PLAN_KEY);
          }
          if (data.milestones) {
            setCompletedMilestones(data.milestones);
            localStorage.setItem(LS_MILESTONES_KEY, JSON.stringify(data.milestones));
          }
        }
      } catch (e) {
        console.warn('[ReadingPlans] Firestore load error:', e);
      }
    }

    loadFromFirestore();
  }, [user]);

  // ── Persistir no localStorage + Firestore ─────────────────────────────────
  function persistPlanId(id: string | null) {
    setActivePlanId(id);
    if (id) localStorage.setItem(LS_PLAN_KEY, id);
    else localStorage.removeItem(LS_PLAN_KEY);

    if (user) {
      setDoc(
        doc(db, 'users', user.uid, 'plans', 'progress'),
        { activePlanId: id },
        { merge: true }
      ).catch(e => console.warn('[ReadingPlans] Firestore save plan error:', e));
    }
  }

  function persistToggleMilestone(milestoneId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setCompletedMilestones(prev => {
      const next = { ...prev, [milestoneId]: !prev[milestoneId] };
      localStorage.setItem(LS_MILESTONES_KEY, JSON.stringify(next));

      if (user) {
        setDoc(
          doc(db, 'users', user.uid, 'plans', 'progress'),
          { milestones: next },
          { merge: true }
        ).catch(e => console.warn('[ReadingPlans] Firestore save milestone error:', e));
      }

      return next;
    });
  }

  const getPlanProgress = (planId: string) => {
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return 0;
    const completed = plan.milestones.filter(m => completedMilestones[m.id]).length;
    return Math.round((completed / plan.milestones.length) * 100);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/10 z-40 lg:hidden" onClick={onClose} />
      )}
      <div
        className={cn(
          'fixed inset-y-0 right-0 w-[90vw] sm:w-[450px] bg-sleek-bg shadow-2xl border-l border-sleek-border z-50 transition-transform duration-300 ease-in-out flex flex-col font-sans',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="h-14 shrink-0 border-b border-sleek-border flex items-center justify-between px-4 bg-sleek-bg" style={{backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}}>
          <div className="flex items-center gap-2 font-semibold text-[13px] text-sleek-text-main">
            <BookOpen size={16} /> Planos de Leitura
          </div>
          <button
            onClick={onClose}
            className="panel-close-btn"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col bg-sleek-bg">
          {!activePlanId ? (
            <div className="space-y-4">
              <h3 className="text-[14px] font-bold text-sleek-text-main mb-2">Escolha uma Jornada</h3>
              {PLANS.map(plan => {
                const progress = getPlanProgress(plan.id);
                return (
                  <div
                    key={plan.id}
                    onClick={() => persistPlanId(plan.id)}
                    className="border border-sleek-border rounded-xl p-4 cursor-pointer hover:border-blue-300/60 hover:shadow-md transition-all group bg-sleek-bg relative overflow-hidden"
                  >
                    {progress === 100 && (
                      <div className="absolute inset-0 bg-green-500/5 rounded-xl pointer-events-none" />
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[14px] text-sleek-text-main group-hover:text-blue-600 transition-colors leading-snug mb-1">
                          {plan.title}
                        </h4>
                        <p className="text-[12px] text-sleek-text-muted leading-relaxed">{plan.description}</p>
                      </div>
                      <div className="shrink-0 w-11 h-11 relative flex items-center justify-center">
                        <svg viewBox="0 0 36 36" className="w-11 h-11 -rotate-90">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="var(--color-sleek-border)" strokeWidth="3" />
                          <circle cx="18" cy="18" r="14" fill="none"
                            stroke={progress === 100 ? '#22c55e' : '#3b82f6'}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${(progress / 100) * 87.96} 87.96`}
                          />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-sleek-text-muted">{progress}%</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-sleek-text-muted">
                        {plan.milestones.filter(m => completedMilestones[m.id]).length} / {plan.milestones.length} passagens
                      </span>
                      <span className="text-[11px] font-semibold text-blue-600 group-hover:underline">
                        {progress === 0 ? 'Começar →' : progress === 100 ? '✓ Concluído' : 'Continuar →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <button
                onClick={() => persistPlanId(null)}
                className="text-[12px] text-sleek-text-muted hover:text-sleek-text-main mb-3 flex items-center gap-1 font-medium transition-colors"
              >
                ← Todos os planos
              </button>
              {PLANS.filter(p => p.id === activePlanId).map(plan => {
                const progressVal = getPlanProgress(plan.id);
                const doneCount = plan.milestones.filter(m => completedMilestones[m.id]).length;
                return (
                <div key={plan.id}>
                  {/* Sticky progress banner */}
                  <div className="sticky top-0 z-10 -mx-5 px-5 py-3 mb-4 bg-sleek-bg/95 backdrop-blur border-b border-sleek-border">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-[14px] font-bold text-sleek-text-main leading-tight">{plan.title}</h3>
                      <span className="text-[11px] font-bold text-sleek-text-muted">{doneCount}/{plan.milestones.length}</span>
                    </div>
                    <div className="w-full bg-sleek-border rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: progressVal + '%', background: progressVal === 100 ? '#22c55e' : '#3b82f6' }} />
                    </div>
                  </div>
                  <p className="text-[12px] text-sleek-text-muted mb-4 leading-relaxed">{plan.description}</p>
                  <div className="space-y-2">
                    {plan.milestones.map(milestone => {
                      const isDone = completedMilestones[milestone.id] || false;
                      return (
                        <div
                          key={milestone.id}
                          className={cn(
                            'milestone-card',
                            isDone ? 'done' : '',
                          )}
                          onClick={() => {
                            onSelectChapter(milestone.bookId, milestone.chapters[0]);
                            onClose();
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={e => persistToggleMilestone(milestone.id, e)}
                              className={cn(
                                'shrink-0 transition-colors',
                                isDone
                                  ? 'text-green-500'
                                  : 'text-sleek-text-muted hover:text-sleek-text-main',
                              )}
                            >
                              {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                            </button>
                            <div className="min-w-0">
                              <div className={cn(
                                'text-[13px] font-medium transition-colors leading-snug',
                                isDone ? 'text-sleek-text-muted line-through' : 'text-sleek-text-main',
                              )}>
                                {milestone.label}
                              </div>
                              {milestone.chapters && milestone.chapters.length > 1 && (
                                <div className="text-[10px] text-sleek-text-muted mt-0.5">
                                  Cap. {milestone.chapters[0]}–{milestone.chapters[milestone.chapters.length - 1]}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={cn(
                            "text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all shrink-0",
                            isDone
                              ? "text-green-600 bg-green-50 border border-green-100"
                              : "text-blue-600 bg-blue-50 border border-blue-100 group-hover:bg-blue-100"
                          )}>
                            {isDone ? "Lido" : "Ler"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
