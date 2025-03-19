import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Skip initialization during build
const initializeFirebase = () => {
  if (typeof window === 'undefined') return null;

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const apps = getApps();
  if (!apps.length) {
    return initializeApp(firebaseConfig);
  }
  return apps[0];
};

const app = initializeFirebase();
export const auth = typeof window === 'undefined' ? null : getAuth(app);
export const db = typeof window === 'undefined' ? null : getFirestore(app);

const analytics = typeof window !== "undefined" ? getAnalytics() : null;

export { analytics };
