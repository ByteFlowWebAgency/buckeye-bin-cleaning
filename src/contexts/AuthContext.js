"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/data/firebase';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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
        try {
          // Get the ID token result to check admin claim
          const tokenResult = await firebaseUser.getIdTokenResult(true); // Force refresh
          
          // Check Firestore admin collection
          const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.email));
          
          if (adminDoc.exists() && adminDoc.data().isAdmin) {
            setUser({
              ...firebaseUser,
              admin: true
            });
          } else {
            console.log('User not found in admins collection or not admin');
            setUser(null);
            await firebaseSignOut(auth);
          }
        } catch (error) {
          console.error("Admin verification error:", error);
          setUser(null);
          await firebaseSignOut(auth);
        }
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
        
        const adminDoc = await getDoc(doc(db, 'admins', email));
        
        if (!adminDoc.exists() || !adminDoc.data().isAdmin) {
          await firebaseSignOut(auth);
          throw new Error('Not authorized as admin');
        }

        return {
          ...userCredential.user,
          admin: true
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