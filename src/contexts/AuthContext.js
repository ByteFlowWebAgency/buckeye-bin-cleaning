"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/data/firebase';

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

    return auth.onAuthStateChanged(user => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const value = {
    user,
    loading,
    signIn: async (email, password) => {
      if (!auth) return null;
      return auth.signInWithEmailAndPassword(email, password);
    },
    signOut: async () => {
      if (!auth) return null;
      return auth.signOut();
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