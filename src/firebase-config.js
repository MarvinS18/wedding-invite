import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIHrRcTiId_cM_86b6AsS5Dos5JZot1JQ",
  authDomain: "wedding-invite-1d5ed.firebaseapp.com",
  projectId: "wedding-invite-1d5ed",
  storageBucket: "wedding-invite-1d5ed.firebasestorage.app",
  messagingSenderId: "86641016833",
  appId: "1:86641016833:web:7bc581068725a9fc970000",
  measurementId: "G-K0TLJS2132"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Esporta Storage (usando bucket EU) e Firestore
export const storage = getStorage(app, 'wedding-invite-1d5ed');
export const db = getFirestore(app);
