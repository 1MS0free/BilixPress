import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';

const BrowseRequestsPage = () => {
  // ✅ Restored — was commented out, causing Sidebar to receive null user
  const { user } = useAuth();
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
      {/* ✅ user prop restored — Sidebar needs it to show correct nav items */}
      <Sidebar user={user} />

      <main className="flex-1 p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Browse Requests</h2>
          <p className="text-sm text-gray-500 mt-1">Pick an errand and start earning</p>
        </div>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 12h6M9 16h4"/>
            </svg>
            <p className="text-sm font-medium text-gray-400">No requests available right now</p>
            <p className="text-xs text-gray-300 mt-1">Check back soon!</p>
          </div>
        ) : (
          <ul className="space-y-3 max-w-3xl">
            {requests.map(req => (
              <li
                key={req.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                  </div>
                  {/* Info */}
                  <div>
                    <div className="font-semibold text-gray-900">{req.itemName}</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {req.storeName || 'Any store'}
                    </div>
                    <div className="flex gap-3 mt-1.5">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        Budget: ₱{req.budget}
                      </span>
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                        Fee: ₱{req.convenienceFee}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/request/${req.id}`}
                  className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition text-center"
                >
                  View Details
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default BrowseRequestsPage;
