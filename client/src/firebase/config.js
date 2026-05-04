// Firebase configuration for Bilixpress
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA3wA9IRX7ebP1WtdBfzkRbLH3N3h_t72w",
  authDomain: "bilixpress.firebaseapp.com",
  projectId: "bilixpress",
  storageBucket: "bilixpress.appspot.com",
  messagingSenderId: "75827912901",
  appId: "1:75827912901:web:94db991845cb22ee1950ac",
  measurementId: "G-8HC3NDH9HY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
