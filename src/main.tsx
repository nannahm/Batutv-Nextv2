import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { testConnection, db } from './lib/firebase.ts';
import { doc, getDoc } from 'firebase/firestore';
import { seedAllDataToFirestore } from './scripts/clientFirestoreSeeder.ts';

// Test connection and auto-seed initial Firestore documents if not initialized
async function initFirebaseData() {
  try {
    await testConnection();
    const siteSnap = await getDoc(doc(db, 'site_settings', 'default'));
    if (!siteSnap.exists()) {
      console.log('🌱 Firestore database is empty. Initializing BatuTV schema and data...');
      await seedAllDataToFirestore();
      console.log('✅ Firestore initial data populated successfully.');
    }
  } catch (err) {
    console.warn('Firebase initialization note:', err);
  }
}

initFirebaseData();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

