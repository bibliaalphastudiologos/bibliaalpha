import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, UserProfile, loginWithGoogle, processRedirectResult, SUPER_ADMIN_EMAIL } from '../services/firebase';

// ── Tipo do registro de acesso (coleção access/{email}) ───────────
export interface AccessRecord {
  email:           string;
  active:          boolean;
  status:          'active' | 'refunded' | 'chargeback' | 'cancelled';
  product:         string;
  plan:            string;
  paymentProvider: string;
  paymentId:       string;
  externalReference: string;
  createdAt:       any;
  approvedAt:      any;
  expiresAt:       any | null;
  lifetime:        boolean;
}

interface StudioAccessRecord {
  email: string;
  nome?: string;
  payment_status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  access_status?: 'active' | 'blocked' | 'expired';
  paymentId?: string;
  approvedAt?: any;
  approvalDateBrasilia?: string;
  planPeriod?: string;
  planPrice?: string;
}

interface AuthContextType {
  user:         User | null;
  profile:      UserProfile | null;
  accessRecord: AccessRecord | null;   // dados de acesso via Mercado Pago
  hasAccess:    boolean;               // true se pode usar a plataforma
  loading:      boolean;
  profileError: string | null;
  login:        () => Promise<void>;
  logout:       () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user:         null,
  profile:      null,
  accessRecord: null,
  hasAccess:    false,
  loading:      true,
  profileError: null,
  login:        async () => {},
  logout:       async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Verifica se o access record é válido (ativo e não expirado)
function isAccessValid(data: any): boolean {
  if (!data) return false;
  if (data.active !== true) return false;
  if (data.status !== 'active') return false;
  if (data.product && !['biblia_alpha', 'studio_logos', 'studio_logos_platform'].includes(data.product)) return false;
  if (data.lifetime === true) return true;
  if (!data.expiresAt) return false;
  const exp = data.expiresAt?.toDate?.() ?? new Date(data.expiresAt);
  return exp > new Date();
}

function isStudioAccessValid(data: Partial<StudioAccessRecord> | null): boolean {
  return data?.payment_status === 'approved' && data?.access_status === 'active';
}

function isProfileAccessValid(profile: Partial<UserProfile> | null): boolean {
  if (!profile || profile.status === 'blocked' || profile.access_status === 'blocked') return false;
  return (
    profile.status === 'approved' ||
    profile.payment_status === 'approved' && profile.access_status === 'active' ||
    profile.manual_access === true && profile.access_status === 'active' ||
    Boolean(profile.approvedAt) ||
    Boolean(profile.approvalDateBrasilia)
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,         setUser]         = useState<User | null>(null);
  const [profile,      setProfile]      = useState<UserProfile | null>(null);
  const [accessRecord, setAccessRecord] = useState<AccessRecord | null>(null);
  const [hasAccess,    setHasAccess]    = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const authTimer = setTimeout(() => {
      console.warn('Auth timeout — desbloqueando tela');
      setLoading(false);
    }, 8000);

    processRedirectResult();

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        clearTimeout(authTimer);
        setUser(firebaseUser);
        setProfileError(null);

        if (!firebaseUser) {
          setProfile(null);
          setAccessRecord(null);
          setHasAccess(false);
          setLoading(false);
          return;
        }

        const isSuperAdminUser = firebaseUser.email === SUPER_ADMIN_EMAIL;

        const superAdminFallback: UserProfile = {
          email:   firebaseUser.email || '',
          nome:    firebaseUser.displayName || 'Erick Silva',
          foto:    firebaseUser.photoURL || '',
          status:  'approved',
          isAdmin: true,
        };

        // SuperAdmin — acesso garantido sem consulta extra
        if (isSuperAdminUser) {
          setProfile(superAdminFallback);
          setHasAccess(true);
          setLoading(false);
          return;
        }

        try {
          const normalizedEmail = (firebaseUser.email || '').toLowerCase();

          // Contrato compartilhado entre Biblia Alpha e Studio Logos.
          const [userSnap, accessSnap, studioAccessSnap] = await Promise.allSettled([
            getDoc(doc(db, 'users', firebaseUser.uid)),
            getDoc(doc(db, 'access', normalizedEmail)),
            getDoc(doc(db, 'payment_access', normalizedEmail)),
          ]);

          // ── Processar access/{email} ──
          let accessData: AccessRecord | null = null;
          let accessValid = false;
          if (accessSnap.status === 'fulfilled' && accessSnap.value.exists()) {
            accessData  = accessSnap.value.data() as AccessRecord;
            accessValid = isAccessValid(accessData);
          }

          let studioAccessData: StudioAccessRecord | null = null;
          let studioAccessValid = false;
          if (studioAccessSnap.status === 'fulfilled' && studioAccessSnap.value.exists()) {
            studioAccessData = studioAccessSnap.value.data() as StudioAccessRecord;
            studioAccessValid = isStudioAccessValid(studioAccessData);
          }

          setAccessRecord(accessData);

          // ── Processar users/{uid} ──
          if (userSnap.status === 'fulfilled') {
            const docSnap = userSnap.value;
            if (docSnap.exists()) {
              const profileData = docSnap.data() as UserProfile;
              const hasUnifiedAccess = accessValid || studioAccessValid || isProfileAccessValid(profileData);
              const healedProfile: UserProfile = {
                ...profileData,
                payment_status: profileData.payment_status || studioAccessData?.payment_status || (hasUnifiedAccess ? 'approved' : 'pending'),
                access_status: profileData.access_status || studioAccessData?.access_status || (hasUnifiedAccess ? 'active' : 'blocked'),
                paymentId: profileData.paymentId || studioAccessData?.paymentId,
              };
              setProfile(healedProfile);
              setHasAccess(hasUnifiedAccess);
              if (hasUnifiedAccess && (profileData.payment_status !== 'approved' || profileData.access_status !== 'active')) {
                await setDoc(doc(db, 'users', firebaseUser.uid), {
                  payment_status: healedProfile.payment_status,
                  access_status: healedProfile.access_status,
                  paymentId: healedProfile.paymentId,
                  status: 'approved',
                  updatedAt: serverTimestamp(),
                }, { merge: true });
              }
            } else {
              // Novo usuário — criar documento
              const newProfile: UserProfile = {
                email:   firebaseUser.email || '',
                nome:    firebaseUser.displayName || 'Sem Nome',
                foto:    firebaseUser.photoURL || '',
                status:  accessValid || studioAccessValid ? 'approved' : 'pending',
                payment_status: studioAccessData?.payment_status || (accessValid ? 'approved' : 'pending'),
                access_status: studioAccessData?.access_status || (accessValid || studioAccessValid ? 'active' : 'blocked'),
                paymentId: studioAccessData?.paymentId,
                isAdmin: false,
              };
              try {
                await setDoc(doc(db, 'users', firebaseUser.uid), {
                  ...newProfile,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
                setProfile(newProfile);
              } catch (e: any) {
                console.error('Erro ao criar perfil:', e);
                setProfile(newProfile); // usa o local mesmo sem persistir
              }
              setHasAccess(accessValid || studioAccessValid);
            }
          } else {
            // Falha na consulta de users — não bloqueia se access for válido
            console.warn('Falha ao consultar users:', (userSnap as any).reason);
            setProfile(null);
            setHasAccess(accessValid || studioAccessValid);
            if (!accessValid && !studioAccessValid) {
              setProfileError('Erro ao verificar perfil. Tente novamente.');
            }
          }
        } catch (e: any) {
          console.error('Erro no AuthProvider:', e);
          if (isSuperAdminUser) {
            setProfile(superAdminFallback);
            setHasAccess(true);
          } else {
            setProfileError(
              e?.code === 'permission-denied'
                ? 'Acesso negado pelo Firestore.'
                : `Erro: ${e?.code || e?.message || 'desconhecido'}`
            );
          }
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        clearTimeout(authTimer);
        console.error('Auth error:', error);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(authTimer);
      unsubscribeAuth();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        accessRecord,
        hasAccess,
        loading,
        profileError,
        login:  loginWithGoogle,
        logout: () => auth.signOut(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
