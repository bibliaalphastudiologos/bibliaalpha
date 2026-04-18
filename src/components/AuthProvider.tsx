import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, UserProfile, loginWithGoogle } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      
      // Subscribe to user profile
      const unsubscribeProfile = onSnapshot(doc(db, 'users', firebaseUser.uid), async (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Heal missing profile on page load if rule previously blocked
          try {
             const userDocRef = doc(db, 'users', firebaseUser.uid);
             const { serverTimestamp, setDoc } = await import('firebase/firestore');
             const isSuperAdmin = firebaseUser.email === 'analista.ericksilva@gmail.com';
             await setDoc(userDocRef, {
                email: firebaseUser.email,
                nome: firebaseUser.displayName || 'Sem Nome',
                foto: firebaseUser.photoURL || '',
                status: isSuperAdmin ? 'approved' : 'pending',
                isAdmin: isSuperAdmin,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
             });
          } catch(e) {
             console.error("Failed to self-heal profile creation", e);
             setProfile(null);
          }
        }
        setLoading(false);
      }, (error) => {
         console.error("Profile fetch error:", error);
         setLoading(false);
      });
      
      return () => unsubscribeProfile();
    });

    return () => unsubscribeAuth();
  }, []);

  const login = async () => {
    await loginWithGoogle();
  };

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
