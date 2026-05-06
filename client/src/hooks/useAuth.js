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
          // The "Nuclear Fix": wrap the Firestore request in a try/catch.
          // If uBlock or Opera GX blocks this, the code jumps straight to 'catch'
          // instead of hanging here forever.
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          setUser({ 
            uid: firebaseUser.uid, 
            email: firebaseUser.email, 
            ...(userDoc.exists() ? userDoc.data() : {}) 
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        // This handles the ERR_BLOCKED_BY_CLIENT gracefully
        console.warn("Firestore access blocked by browser/extension. Proceeding with basic auth data.", err);
        
        // Safety net: Set basic user info so the app still knows who is logged in
        if (firebaseUser) {
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
        }
      } finally {
        // CRITICAL: This line is the "Nuclear" part. 
        // It ensures that no matter what happens above, the loading screen IS REMOVED.
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}