import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Attempt to fetch custom profile (name, role) from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const fullUserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              ...userDoc.data(), // This spreads name, role, etc.
            };
            setUser(fullUserData);
            // Save to local storage so the sidebar works even if Firestore is slow/blocked
            localStorage.setItem('active_user_role', userDoc.data().role);
            localStorage.setItem('active_user_name', userDoc.data().name || firebaseUser.displayName);
          } else {
            // No firestore doc found, use basic auth info
            setUser({ 
              uid: firebaseUser.uid, 
              email: firebaseUser.email, 
              name: firebaseUser.displayName || 'User',
              role: 'requester' 
            });
          }
        } catch (err) {
          console.error("Auth Hook Error:", err);
          // Recovery: use local storage if the network/blocker killed the firestore request
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: localStorage.getItem('active_user_name') || 'User',
            role: localStorage.getItem('active_user_role') || 'requester'
          });
        }
      } else {
        setUser(null);
        localStorage.removeItem('active_user_role');
        localStorage.removeItem('active_user_name');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}