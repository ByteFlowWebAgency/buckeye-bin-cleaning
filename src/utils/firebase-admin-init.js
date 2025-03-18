import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export function initFirebaseAdmin() {
  try {
    // Check if any Firebase Admin apps are already initialized
    if (getApps().length === 0) {
      const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '')
        .replace(/\\n/g, '\n')
        .replace(/"/g, '')
        .replace(/'/g, '');

      if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 
          !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 
          !privateKey) {
        throw new Error('Firebase Admin credentials are missing');
      }

      console.log('Initializing new Firebase Admin instance');
      const app = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });

      const db = getFirestore(app);
      const auth = getAuth(app);

      return { app, db, auth };
    }

    console.log('Using existing Firebase Admin instance');
    const app = getApps()[0];
    return {
      app,
      db: getFirestore(app),
      auth: getAuth(app)
    };
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
} 