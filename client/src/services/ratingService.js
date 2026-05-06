// src/services/ratingService.js
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export async function checkDuplicateRating(requestId, reviewerId) {
  const q = query(
    collection(db, 'ratings'),
    where('requestId', '==', requestId),
    where('reviewerId', '==', reviewerId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function addRating({ requestId, reviewerId, revieweeId, rating, comment }) {
  if (rating < 1 || rating > 5) throw new Error('Invalid rating value');

  const duplicate = await checkDuplicateRating(requestId, reviewerId);
  if (duplicate) throw new Error('You have already rated this user for this request.');

  const docRef = await addDoc(collection(db, 'ratings'), {
    requestId,
    reviewerId,
    revieweeId,
    rating,
    comment: comment || '',
    createdAt: serverTimestamp(),
  });

  await updateUserRatingAverage(revieweeId);
  return docRef.id;
}

// ✅ Fix 1: Don't pass newRating — recalculate from actual DB records for accuracy
export async function updateUserRatingAverage(userId) {
  const userRef = doc(db, 'users', userId);

  // ✅ Fix 2: Use getDoc(userRef) instead of getDocs + query — direct & cheaper
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  // ✅ Fix 3: Recalculate from all actual ratings instead of incremental math
  // (incremental avg drifts over time if any ratings are deleted/edited)
  const ratingsSnap = await getDocs(
    query(collection(db, 'ratings'), where('revieweeId', '==', userId))
  );

  const scores = ratingsSnap.docs.map(d => d.data().rating);
  if (scores.length === 0) return;

  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  await updateDoc(userRef, {
    ratingAverage: parseFloat(avg.toFixed(2)),
    ratingCount: scores.length,
  });
}

export async function getUserRatings(userId) {
  const q = query(collection(db, 'ratings'), where('revieweeId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}