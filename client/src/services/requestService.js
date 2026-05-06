import {
  doc,
  writeBatch,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// ✅ ACCEPT REQUEST (Optimized with Batches)
export const acceptRequest = async (requestId, shopperId, requesterId) => {
  if (!requestId || !shopperId || !requesterId) {
    throw new Error('Missing required parameters.');
  }

  const batch = writeBatch(db);

  // 1. Reference for the request document
  const requestRef = doc(db, 'requests', requestId);
  batch.update(requestRef, {
    status: 'Accepted',
    shopperId,
    acceptedAt: serverTimestamp(),
  });

  // 2. Reference for a new system message
  const messageRef = doc(collection(db, 'messages'));
  batch.set(messageRef, {
    requestId,
    senderId: shopperId,
    receiverId: requesterId,
    text: '✅ Request accepted. You can now start chatting.',
    createdAt: serverTimestamp(),
    system: true,
  });

  // 3. Commit both updates in one network trip
  await batch.commit();
};

// ✅ COMPLETE REQUEST (Optimized with Batches)
export const completeRequest = async (requestId, shopperId, requesterId) => {
  if (!requestId) {
    throw new Error('Missing requestId.');
  }

  const batch = writeBatch(db);

  // 1. Mark as completed
  const requestRef = doc(db, 'requests', requestId);
  batch.update(requestRef, {
    status: 'Completed',
    completedAt: serverTimestamp(),
  });

  // 2. Notify both users via system message
  if (shopperId && requesterId) {
    const messageRef = doc(collection(db, 'messages'));
    batch.set(messageRef, {
      requestId,
      senderId: shopperId,
      receiverId: requesterId,
      text: '🎉 Request completed. Please leave a rating!',
      createdAt: serverTimestamp(),
      system: true,
    });
  }

  await batch.commit();
};