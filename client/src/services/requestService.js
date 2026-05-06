import {
  doc,
  getDoc,
  writeBatch,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const createRequest = async (requestData) => {
  try {
    const docRef = await addDoc(collection(db, 'requests'), {
      ...requestData,
      status: 'Posted',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating request:", error);
    throw error;
  }
};

export const acceptRequest = async (requestId, shopperId, requesterId) => {
  if (!requestId || !shopperId || !requesterId) throw new Error('Missing parameters.');

  // 1. Fetch Shopper details for the FoodPanda-style message
  const shopperSnap = await getDoc(doc(db, 'users', shopperId));
  const shopperData = shopperSnap.exists() ? shopperSnap.data() : {};

  const batch = writeBatch(db);

  // 2. Update Request Status
  const requestRef = doc(db, 'requests', requestId);
  batch.update(requestRef, {
    status: 'Accepted',
    shopperId,
    acceptedAt: serverTimestamp(),
  });

  // 3. Create Automated System Message
  const messageRef = doc(collection(db, 'messages'));
  const autoMessage = `🤖 SYSTEM: Your request has been accepted by ${shopperData.name || 'a shopper'}.
  
🪪 School ID: ${shopperData.schoolId || 'N/A'}
📞 Number: ${shopperData.phoneNumber || 'N/A'}

You can now coordinate your delivery here!`;

  batch.set(messageRef, {
    requestId,
    senderId: 'system',
    receiverId: requesterId,
    text: autoMessage,
    createdAt: serverTimestamp(),
    system: true,
  });

  await batch.commit();
};

export const completeRequest = async (requestId, shopperId, requesterId) => {
  if (!requestId) throw new Error('Missing requestId.');
  const batch = writeBatch(db);

  batch.update(doc(db, 'requests', requestId), {
    status: 'Completed',
    completedAt: serverTimestamp(),
  });

  if (shopperId && requesterId) {
    batch.set(doc(collection(db, 'messages')), {
      requestId,
      senderId: 'system',
      receiverId: requesterId,
      text: '🎉 Request completed. Please leave a rating!',
      createdAt: serverTimestamp(),
      system: true,
    });
  }
  await batch.commit();
};