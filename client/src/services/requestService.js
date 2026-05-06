import {
  doc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// ✅ OPTIMIZED
export const acceptRequest = async (requestId, shopperId, requesterId) => {
  // Fast update
  await updateDoc(doc(db, 'requests', requestId), {
    status: 'Accepted',
    shopperId,
  });

  // Simple system message (no extra reads)
  await addDoc(collection(db, 'messages'), {
    requestId,
    senderId: shopperId,
    receiverId: requesterId,
    text: 'Hello! I have accepted your request.',
    createdAt: serverTimestamp(),
    system: true,
  });
};

export const completeRequest = async (requestId) => {
  await updateDoc(doc(db, 'requests', requestId), {
    status: 'Completed',
  });
};