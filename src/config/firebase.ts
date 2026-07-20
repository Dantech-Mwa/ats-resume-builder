// ============================================
// FIREBASE CONFIGURATION - DanJobs Project
// ============================================

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider, FacebookAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration for DanJobs project
const firebaseConfig = {
  apiKey: "AIzaSyCPH2IL888M6HJYPXm4BAr_BfNA0VR-NQ0",
  authDomain: "danjobs-74fbc.firebaseapp.com",
  databaseURL: "https://danjobs-74fbc-default-rtdb.firebaseio.com",
  projectId: "danjobs-74fbc",
  storageBucket: "danjobs-74fbc.firebasestorage.app",
  messagingSenderId: "309689264774",
  appId: "1:309689264774:web:c86842f034d249c2d63f07",
  measurementId: "G-4CDY5C08K3",
};

// Validate Firebase config
const validateConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.warn(
      `⚠️ Firebase: Missing configuration fields: ${missingFields.join(', ')}. ` +
      'Please check your configuration.'
    );
    return false;
  }
  return true;
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let realtimeDb: Database;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;
let googleProvider: GoogleAuthProvider;
let facebookProvider: FacebookAuthProvider;
let githubProvider: GithubAuthProvider;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
  realtimeDb = getDatabase(app);
  storage = getStorage(app);
  
  // Initialize Analytics only in production
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
  
  // Configure auth providers
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account',
  });
  
  facebookProvider = new FacebookAuthProvider();
  facebookProvider.addScope('email');
  facebookProvider.addScope('public_profile');
  
  githubProvider = new GithubAuthProvider();
  githubProvider.addScope('user:email');
  
  console.log('✅ Firebase initialized successfully - Project: danjobs-74fbc');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  
  // Create dummy instances for fallback
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  realtimeDb = {} as Database;
  storage = {} as FirebaseStorage;
  googleProvider = {} as GoogleAuthProvider;
  facebookProvider = {} as FacebookAuthProvider;
  githubProvider = {} as GithubAuthProvider;
}

// Export initialized services
export {
  app,
  auth,
  db,
  realtimeDb,
  storage,
  analytics,
  googleProvider,
  facebookProvider,
  githubProvider,
};

// Export config for debugging (hides API key)
export const getFirebaseConfig = () => ({
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? '***' : undefined,
});

// Check initialization
export const isFirebaseInitialized = (): boolean => {
  return !!app?.name && !!auth?.app;
};

// Error message mapping
export const getFirebaseErrorMessage = (error: any): string => {
  const errorCode = error?.code || '';
  const errorMessage = error?.message || 'An unknown error occurred';
  
  const errorMap: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid login credentials.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser.',
    'auth/requires-recent-login': 'Please sign in again to perform this action.',
    'storage/unauthorized': 'You do not have permission to access this file.',
    'storage/canceled': 'Upload was canceled.',
    'firestore/permission-denied': 'You do not have permission to access this data.',
  };
  
  return errorMap[errorCode] || errorMessage;
};