import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Embedded default Firebase configuration from vanviolet-115bb project
const defaultConfig = {
  apiKey: "AIzaSyDAGT3r-B3aHMhvBe7g_hhwQCnRz96opAY",
  authDomain: "vanviolet-115bb.firebaseapp.com",
  projectId: "vanviolet-115bb",
  storageBucket: "vanviolet-115bb.firebasestorage.app",
  messagingSenderId: "581907669568",
  appId: "1:581907669568:web:81185fdb7a6112478775a5",
  measurementId: "G-QX59PP81PD",
  firestoreDatabaseId: "(default)",
};

// Build Firebase configuration from Vite environment variables with fallback to default config
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || defaultConfig.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore with custom database ID if provided in config
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Designated administrator email according to project requirements
export const ADMIN_EMAIL = 'vanviolet.js@gmail.com';

export const isUserAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
};


