"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/data/firebase';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: async () => null,
  signOut: async () => null
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !auth) return;

    return auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Get the ID token result to check admin claim
        const tokenResult = await firebaseUser.getIdTokenResult();
        setUser({
          ...firebaseUser,
          admin: tokenResult.claims.admin === true
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  const value = {
    user,
    loading,
    signIn: async (email, password) => {
      if (!auth) return null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Get fresh token to check admin status
        const tokenResult = await userCredential.user.getIdTokenResult();
        return {
          ...userCredential.user,
          admin: tokenResult.claims.admin === true
        };
      } catch (error) {
        console.error("Sign in error:", error);
        throw error;
      }
    },
    signOut: async () => {
      if (!auth) return null;
      return firebaseSignOut(auth);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}