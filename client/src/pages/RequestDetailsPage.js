import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import RatingForm from '../components/RatingForm';
import { checkDuplicateRating } from '../services/ratingService';
import BackButton from '../components/BackButton';
import RequestChat from '../components/RequestChat';

const RequestDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState('');
  const [shopperRating, setShopperRating] = useState(null);
  const [requesterRating, setRequesterRating] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequest = async () => {
      const docRef = doc(db, 'requests', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const req = { id: docSnap.id, ...docSnap.data() };
        setRequest(req);
        // Fetch ratings for shopper and requester
        if (req.shopperId) {
          const shopperDoc = await getDoc(doc(db, 'users', req.shopperId));
          if (shopperDoc.exists()) setShopperRating(shopperDoc.data().ratingAverage || null);
        }
        if (req.requesterId) {
          const requesterDoc = await getDoc(doc(db, 'users', req.requesterId));
          if (requesterDoc.exists()) setRequesterRating(requesterDoc.data().ratingAverage || null);
        }
      } else setError('Request not found.');
    };
    fetchRequest();
  }, [id]);

  useEffect(() => {
    const checkRating = async () => {
      if (!request || !user) return;
      if (request.status === 'Completed') {
        setShowRating(true);
        const alreadyRated = await checkDuplicateRating(request.id, user.uid);
        setHasRated(alreadyRated);
      } else {
        setShowRating(false);
      }
    };
    checkRating();
  }, [request, user]);

  const handleAccept = async () => {
    try {
      await updateDoc(doc(db, 'requests', id), {
        status: 'Accepted',
        shopperId: user.uid,
      });
      // Fetch shopper info
      const shopperDoc = await getDoc(doc(db, 'users', user.uid));
      let shopperInfo = { name: '', phone: '', idNumber: '' };
      if (shopperDoc.exists()) {
        const d = shopperDoc.data();
        shopperInfo = { name: d.name || '', phone: d.phone || '', idNumber: d.idNumber || '' };
      }
      // Fetch request to get requesterId
      const reqDoc = await getDoc(doc(db, 'requests', id));
      let requesterId = '';
      if (reqDoc.exists()) {
        requesterId = reqDoc.data().requesterId;
      }
      // Send automatic message to requester
      await addDoc(collection(db, 'messages'), {
        requestId: id,
        senderId: user.uid,
        receiverId: requesterId,
        text: `Hello! I have accepted your request.\nShopper: ${shopperInfo.name}\nContact: ${shopperInfo.phone}\nID Number: ${shopperInfo.idNumber}`,
        createdAt: new Date(),
        system: true,
      });
      navigate(`/chat/${id}`);
    } catch {
      setError('Failed to accept request.');
    }
  };

  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!request) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 p-10 flex gap-8">
        <div className="flex-1 max-w-2xl">
          <BackButton />
          <div className="bg-white rounded shadow p-6 mb-6">
            <div className="flex items-center mb-4">
              <span className="inline-block bg-blue-100 text-blue-600 rounded-full p-2 mr-2">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#2563eb"/></svg>
              </span>
              <h2 className="text-2xl font-bold">{request.itemName}</h2>
            </div>
            <div className="mb-2">Description: {request.description || 'N/A'}</div>
            <div className="mb-2">Store: {request.storeName || 'N/A'}</div>
            <div className="mb-2">Budget: ₱{request.budget}</div>
            <div className="mb-2">Convenience Fee: ₱{request.convenienceFee}</div>
            <div className="mb-2">Status: <span className="font-semibold">{request.status}</span></div>
            <div className="mb-2 flex gap-4">
              {request.shopperId && (
                <span className="flex items-center gap-1 text-yellow-600">
                  Shopper Avg. Rating:
                  {shopperRating !== null ? (
                    <span className="font-bold">★ {shopperRating.toFixed(2)}</span>
                  ) : 'N/A'}
                </span>
              )}
              {request.requesterId && (
                <span className="flex items-center gap-1 text-yellow-600">
                  Requester Avg. Rating:
                  {requesterRating !== null ? (
                    <span className="font-bold">★ {requesterRating.toFixed(2)}</span>
                  ) : 'N/A'}
                </span>
              )}
            </div>
            {request.status === 'Posted' && user?.uid !== request.requesterId && (
              <button onClick={handleAccept} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Accept Request</button>
            )}
            {/* Mark as Done button for shopper */}
            {request.status === 'Accepted' && user?.uid === request.shopperId && (
              <button
                onClick={async () => {
                  await updateDoc(doc(db, 'requests', id), { status: 'Completed' });
                  setRequest(prev => ({ ...prev, status: 'Completed' }));
                }}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Mark as Done
              </button>
            )}
            {showRating && !hasRated && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <span className="inline-block bg-yellow-100 text-yellow-600 rounded-full p-1 mr-2">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#facc15"/></svg>
                  </span>
                  Rate your transaction
                </h3>
                <RatingForm
                  requestId={request.id}
                  reviewerId={user.uid}
                  revieweeId={user.uid === request.requesterId ? request.shopperId : request.requesterId}
                  onRated={() => setHasRated(true)}
                />
              </div>
            )}
            {showRating && hasRated && (
              <div className="mt-8 text-green-600 font-semibold">You have already rated this transaction.</div>
            )}
          </div>
        </div>
        {/* Chat sidebar */}
        <div className="w-full max-w-sm bg-white rounded shadow p-6 flex flex-col h-fit self-start">
          <h3 className="text-lg font-bold mb-4">Messages</h3>
          <RequestChat requestId={id} user={user} />
        </div>
      </main>
    </div>
  );
};

export default RequestDetailsPage;
