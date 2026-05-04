import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';

const MyRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'requests'), where('requesterId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 p-10">
        <h2 className="text-2xl font-bold mb-6">My Requests</h2>
        {requests.length === 0 ? <div>No requests yet</div> : (
          <ul>
            {requests.map(req => (
              <li key={req.id} className="mb-4 p-4 border rounded">
                <div className="font-semibold">{req.itemName}</div>
                <div className="text-gray-600">Store: {req.storeName || 'N/A'}</div>
                <div className="text-gray-600">Budget: ₱{req.budget}</div>
                <div className="text-gray-600">Fee: ₱{req.convenienceFee}</div>
                <div className="text-gray-600">Status: {req.status}</div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default MyRequestsPage;
