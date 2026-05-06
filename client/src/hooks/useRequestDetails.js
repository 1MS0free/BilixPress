import { useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { checkDuplicateRating } from '../services/ratingService';

export const useRequestDetails = (requestId, currentUserId) => {
  const [request, setRequest] = useState(null);
  const [shopperRating, setShopperRating] = useState(null);
  const [requesterRating, setRequesterRating] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [error, setError] = useState('');

  // 1. Real-time listener for the REQUEST only
  useEffect(() => {
    if (!requestId) return;

    const unsub = onSnapshot(
      doc(db, 'requests', requestId),
      (snap) => {
        if (!snap.exists()) {
          setError('Request not found.');
          return;
        }
        setRequest({ id: snap.id, ...snap.data() });
      },
      (err) => setError(err.message)
    );

    return () => unsub();
  }, [requestId]);

  // 2. Optimized Effect: Fetch ratings ONLY when IDs change
  useEffect(() => {
    const fetchUserRatings = async () => {
      if (!request) return;

      const promises = [];
      if (request.shopperId) promises.push(getDoc(doc(db, 'users', request.shopperId)));
      if (request.requesterId) promises.push(getDoc(doc(db, 'users', request.requesterId)));

      const results = await Promise.all(promises);

      results.forEach((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (snap.id === request.shopperId) {
            setShopperRating(data.ratingAverage ?? null);
          }
          if (snap.id === request.requesterId) {
            setRequesterRating(data.ratingAverage ?? null);
          }
        }
      });
    };

    fetchUserRatings();
  }, [request?.shopperId, request?.requesterId]);

  // 3. Check rating eligibility
  useEffect(() => {
    if (!request || !currentUserId) return;

    if (request.status === 'Completed') {
      setShowRating(true);
      checkDuplicateRating(request.id, currentUserId).then(setHasRated);
    } else {
      setShowRating(false);
      setHasRated(false);
    }
  }, [request?.status, request?.id, currentUserId]);

  return {
    request,
    shopperRating,
    requesterRating,
    showRating,
    hasRated,
    setHasRated,
    error,
  };
};