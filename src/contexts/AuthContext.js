"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase'; // your firebase config

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Skip initialization during build
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Return null or loading state during build
  if (typeof window === 'undefined') {
    return children;
  }

  const value = {
    user,
    loading,
    signIn: async (email, password) => {
      return auth.signInWithEmailAndPassword(email, password);
    },
    // ... other auth methods
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  // Return null during build
  if (typeof window === 'undefined') {
    return null;
  }
  return useContext(AuthContext);
}