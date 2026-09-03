import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfigFile from '../../../firebase-applet-config.json';

const clientConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (firebaseConfigFile as any).projectId || 'batutv-next',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (firebaseConfigFile as any).appId,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (firebaseConfigFile as any).apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (firebaseConfigFile as any).authDomain,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (firebaseConfigFile as any).storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (firebaseConfigFile as any).messagingSenderId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || (firebaseConfigFile as any).measurementId,
};

export const clientApp = !getApps().length ? initializeApp(clientConfig) : getApp();
export const clientDb = getFirestore(clientApp);
export const clientAuth = getAuth(clientApp);
