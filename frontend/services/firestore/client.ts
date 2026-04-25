import { initializeApp, type FirebaseApp, getApps } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

function getFirebaseConfig(): FirebaseConfig {
  const config: FirebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  };

  const missingKeys = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing Firebase config: ${missingKeys.join(', ')}. Set EXPO_PUBLIC_FIREBASE_* env values.`,
    );
  }

  return config;
}

function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0];
    return firebaseApp;
  }

  firebaseApp = initializeApp(getFirebaseConfig());
  return firebaseApp;
}

export function getFirestoreDb(): Firestore {
  if (firestoreDb) {
    return firestoreDb;
  }

  firestoreDb = getFirestore(getFirebaseApp());
  return firestoreDb;
}
