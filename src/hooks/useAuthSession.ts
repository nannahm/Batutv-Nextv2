import { useState, useEffect } from 'react';
import { StoredAdminSession, getStoredAdminSession, saveAdminSession, clearAdminSession } from '@/src/utils/authSession';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';

export type AdminSession = StoredAdminSession;

/**
 * Custom Hook untuk mengelola status autentikasi Admin BatuTV Control
 */
export function useAuthSession() {
  const [session, setSession] = useState<AdminSession | null>(() => getStoredAdminSession());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Sinkronisasi status dari local session
    const current = getStoredAdminSession();
    setSession(current);

    // Sinkronisasi dengan Firebase Auth jika aktif
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User login di Firebase
        if (!session) {
          const newSession: AdminSession = {
            uid: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'Admin BatuTV',
            email: user.email || 'admin@batutv.id',
            role: 'admin',
            timestamp: Date.now(),
          };
          saveAdminSession(newSession);
          setSession(newSession);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (newSession: AdminSession) => {
    saveAdminSession(newSession);
    setSession(newSession);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signout warning:', e);
    }
    clearAdminSession();
    setSession(null);
  };

  return {
    session,
    isAuthenticated: !!session,
    role: session?.role || null,
    loading,
    login,
    logout,
  };
}
