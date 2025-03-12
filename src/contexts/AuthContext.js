"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '@/data/firebase';

// Create a default context with empty functions
const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve()
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user");
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = (email, password) => {
    console.log("Attempting to sign in:", email);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = () => {
    console.log("Signing out");
    return firebaseSignOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signOut
  };

  console.log("Auth context rendering, loading:", loading, "user:", user ? "exists" : "null");
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);