import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // 1. Try to get data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          let userData = { 
            uid: firebaseUser.uid, 
            email: firebaseUser.email, 
            ...(userDoc.exists() ? userDoc.data() : {}) 
          };

          // 2. Cache the data in localStorage for "offline/blocked" situations
          if (userDoc.exists()) {
            localStorage.setItem(`user_cache_${firebaseUser.uid}`, JSON.stringify(userData));
          }

          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn("Firestore access blocked. Attempting to use cached profile.", err);
        
        if (firebaseUser) {
          // 3. FALLBACK: Try to recover role from localStorage cache
          const cachedData = localStorage.getItem(`user_cache_${firebaseUser.uid}`);
          if (cachedData) {
            setUser(JSON.parse(cachedData));
          } else {
            // Last resort: basic info only
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
          }
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}