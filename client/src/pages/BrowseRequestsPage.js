import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';

const BrowseRequestsPage = () => {
  // const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'requests'), where('status', '==', 'Posted'));
    const unsub = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-10">
        <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Available Errand Requests</h2>
          {requests.length === 0 ? <div>No requests available.</div> : (
            <ul>
              {requests.map(req => (
                <li key={req.id} className="mb-4 p-4 border rounded flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold">{req.itemName}</div>
                    <div className="text-gray-600">Store: {req.storeName || 'N/A'}</div>
                    <div className="text-gray-600">Budget: ₱{req.budget}</div>
                    <div className="text-gray-600">Fee: ₱{req.convenienceFee}</div>
                  </div>
                  <Link to={`/request/${req.id}`} className="mt-2 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">View Details</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default BrowseRequestsPage;
