import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export function initFirebaseAdmin() {
  // Skip initialization during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping Firebase Admin initialization during build phase');
    return {
      db: null,
      auth: null
    };
  }

  try {
    const apps = getApps();
    
    if (!apps.length) {
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
        ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;

      if (!privateKey || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        console.log('Firebase Admin credentials not available');
        return {
          db: null,
          auth: null
        };
      }

      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: privateKey
        })
      });
    }

    const db = getFirestore();
    const auth = getAuth();

    return { db, auth };
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    return {
      db: null,
      auth: null
    };
  }
} 