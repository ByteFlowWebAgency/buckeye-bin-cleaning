import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export function initFirebaseAdmin() {
  // Skip initialization during build time
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    return {
      db: null,
      auth: null
    };
  }

  try {
    // Check if any firebase apps have been initialized
    const apps = getApps();
    
    if (!apps.length) {
      // Get the private key
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
        ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;

      if (!privateKey || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        throw new Error('Firebase Admin credentials not available');
      }

      // Initialize the app
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: privateKey
        })
      });
    }

    // Get Firestore and Auth instances
    const db = getFirestore();
    const auth = getAuth();

    return { db, auth };
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    
    // During development, throw the error
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    
    // In production, return null instances
    return {
      db: null,
      auth: null
    };
  }
} 