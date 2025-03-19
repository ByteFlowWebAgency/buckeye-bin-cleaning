import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export function initFirebaseAdmin() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return { db: null, auth: null };
  }

  try {
    const apps = getApps();
    
    if (!apps.length) {
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
        ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;

      if (!privateKey || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        return { db: null, auth: null };
      }

      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: privateKey
        })
      });
    }

    return {
      db: getFirestore(),
      auth: getAuth()
    };
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    return { db: null, auth: null };
  }
} 