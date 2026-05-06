import {
  doc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// ✅ ACCEPT REQUEST (optimized + safe)
export const acceptRequest = async (requestId, shopperId, requesterId) => {
  if (!requestId || !shopperId || !requesterId) {
    throw new Error('Missing required parameters.');
  }

  // 1. Update request first (fast UI update via onSnapshot)
  await updateDoc(doc(db, 'requests', requestId), {
    status: 'Accepted',
    shopperId,
    acceptedAt: serverTimestamp(), // ✅ track when accepted
  });

  // 2. Send system message
  await addDoc(collection(db, 'messages'), {
    requestId,
    senderId: shopperId,
    receiverId: requesterId,
    text: '✅ Request accepted. You can now start chatting.',
    createdAt: serverTimestamp(),
    system: true,
  });
};

// ✅ COMPLETE REQUEST (with optional message)
export const completeRequest = async (requestId, shopperId, requesterId) => {
  if (!requestId) {
    throw new Error('Missing requestId.');
  }

  // 1. Mark as completed
  await updateDoc(doc(db, 'requests', requestId), {
    status: 'Completed',
    completedAt: serverTimestamp(), // ✅ track completion time
  });

  // 2. OPTIONAL: notify both users
  if (shopperId && requesterId) {
    await addDoc(collection(db, 'messages'), {
      requestId,
      senderId: shopperId,
      receiverId: requesterId,
      text: '🎉 Request completed. Please leave a rating!',
      createdAt: serverTimestamp(),
      system: true,
    });
  }
};