// src/services/ratingService.js
import { addDoc, collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
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
  await updateUserRatingAverage(revieweeId, rating);
  return docRef.id;
}

export async function updateUserRatingAverage(userId, newRating) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', userId)));
  let userData = null;
  userSnap.forEach(doc => { userData = doc.data(); });
  if (!userData) return;
  const oldAvg = userData.ratingAverage || 0;
  const count = userData.ratingCount || 0;
  const newAvg = ((oldAvg * count) + newRating) / (count + 1);
  await updateDoc(userRef, {
    ratingAverage: newAvg,
    ratingCount: count + 1,
  });
}

export async function getUserRatings(userId) {
  const q = query(collection(db, 'ratings'), where('revieweeId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
