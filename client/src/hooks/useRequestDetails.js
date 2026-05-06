import { useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { checkDuplicateRating } from '../services/ratingService';

export const useRequestDetails = (requestId, currentUserId) => {
  const [request, setRequest]               = useState(null);
  const [shopperRating, setShopperRating]   = useState(null);
  const [requesterRating, setRequesterRating] = useState(null);
  const [showRating, setShowRating]         = useState(false);
  const [hasRated, setHasRated]             = useState(false);
  const [error, setError]                   = useState('');

  // Real-time listener for the request document
  useEffect(() => {
    if (!requestId) return;

    const unsub = onSnapshot(
      doc(db, 'requests', requestId),
      async (snap) => {
        if (!snap.exists()) {
          setError('Request not found.');
          return;
        }

        const req = { id: snap.id, ...snap.data() };
        setRequest(req);

        // Fetch shopper and requester ratings in parallel
        const [shopperSnap, requesterSnap] = await Promise.all([
          req.shopperId   ? getDoc(doc(db, 'users', req.shopperId))   : null,
          req.requesterId ? getDoc(doc(db, 'users', req.requesterId)) : null,
        ]);

        if (shopperSnap?.exists())
          setShopperRating(shopperSnap.data().ratingAverage ?? null);
        if (requesterSnap?.exists())
          setRequesterRating(requesterSnap.data().ratingAverage ?? null);
      },
      (err) => setError(err.message)
    );

    return () => unsub();
  }, [requestId]);

  // Check rating eligibility whenever request or user changes
  useEffect(() => {
    if (!request || !currentUserId) return;

    if (request.status === 'Completed') {
      setShowRating(true);
      checkDuplicateRating(request.id, currentUserId).then(setHasRated);
    } else {
      setShowRating(false);
      setHasRated(false);
    }
  }, [request, currentUserId]);

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