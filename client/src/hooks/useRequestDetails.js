import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { checkDuplicateRating } from '../services/ratingService';

export const useRequestDetails = (requestId, currentUserId) => {
  const [request, setRequest] = useState(null);
  const [shopperRating, setShopperRating] = useState(null);
  const [requesterRating, setRequesterRating] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [error, setError] = useState('');

  // 1. Real-time listener for the REQUEST
  useEffect(() => {
    if (!requestId) return;
    const unsub = onSnapshot(doc(db, 'requests', requestId), (snap) => {
      if (!snap.exists()) {
        setError('Request not found.');
        return;
      }
      setRequest({ id: snap.id, ...snap.data() });
    }, (err) => setError(err.message));
    return () => unsub();
  }, [requestId]);

  // 2. Real-time listener for USER RATINGS (Fixed field names)
  useEffect(() => {
    if (!request) return;

    let unsubShopper;
    let unsubRequester;

    if (request.shopperId) {
      unsubShopper = onSnapshot(doc(db, 'users', request.shopperId), (snap) => {
        if (snap.exists()) setShopperRating(snap.data().rating || 0);
      });
    }

    if (request.requesterId) {
      unsubRequester = onSnapshot(doc(db, 'users', request.requesterId), (snap) => {
        if (snap.exists()) setRequesterRating(snap.data().rating || 0);
      });
    }

    return () => {
      if (unsubShopper) unsubShopper();
      if (unsubRequester) unsubRequester();
    };
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

  return { request, shopperRating, requesterRating, showRating, hasRated, setHasRated, error };
};