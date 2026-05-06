import {
  doc,
  updateDoc,
  addDoc,
  getDoc,
  collection,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const acceptRequest = async (requestId, shopperId) => {
  const shopperSnap = await getDoc(doc(db, 'users', shopperId));
  let shopperInfo = { name: '', phone: '', idNumber: '' };
  if (shopperSnap.exists()) {
    const d = shopperSnap.data();
    shopperInfo = {
      name: d.name || '',
      phone: d.phone || '',
      idNumber: d.idNumber || '',
    };
  }

  const requestSnap = await getDoc(doc(db, 'requests', requestId));
  if (!requestSnap.exists()) throw new Error('Request not found.');
  const requesterId = requestSnap.data().requesterId;

  await updateDoc(doc(db, 'requests', requestId), {
    status: 'Accepted',
    shopperId,
  });

  await addDoc(collection(db, 'messages'), {
    requestId,
    senderId: shopperId,
    receiverId: requesterId,
    text: `Hello! I have accepted your request.\nShopper: ${shopperInfo.name}\nContact: ${shopperInfo.phone}\nID Number: ${shopperInfo.idNumber}`,
    createdAt: new Date(),
    system: true,
  });
};

export const completeRequest = async (requestId) => {
  await updateDoc(doc(db, 'requests', requestId), { status: 'Completed' });
};