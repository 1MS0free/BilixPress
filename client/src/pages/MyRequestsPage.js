import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import { Link, useNavigate } from 'react-router-dom';
import { checkDuplicateRating } from '../services/ratingService';

const statusColor = (status) => {
  if (status === 'Accepted')  return 'text-green-600 bg-green-50 border border-green-200';
  if (status === 'Completed') return 'text-blue-600 bg-blue-50 border border-blue-200';
  return 'text-gray-600 bg-gray-100 border border-gray-200';
};

const MyRequestsPage = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [requests, setRequests] = useState([]);
  const [ratedMap, setRatedMap] = useState({});

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'requests'), where('requesterId', '==', user.uid));
    const unsub = onSnapshot(q, async (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort: Accepted first, then Posted, then Completed
      reqs.sort((a, b) => {
        const order = { Accepted: 0, Posted: 1, Completed: 2 };
        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
      });
      setRequests(reqs);

      const rated = {};
      await Promise.all(
        reqs.map(async (req) => {
          if (req.status === 'Completed') {
            rated[req.id] = await checkDuplicateRating(req.id, user.uid);
          }
        })
      );
      setRatedMap(rated);
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 p-10">
        <h2 className="text-2xl font-bold mb-6">My Requests</h2>

        {requests.length === 0 ? (
          <div className="text-gray-500">No requests yet.</div>
        ) : (
          <ul className="space-y-4">
            {requests.map(req => (
              <li
                key={req.id}
                className={`bg-white rounded-xl shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4
                  ${req.status === 'Accepted' ? 'ring-2 ring-green-400' : ''}`}
              >
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-semibold text-lg">{req.itemName}</div>
                    {/* Pulsing NEW badge for freshly accepted */}
                    {req.status === 'Accepted' && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full animate-pulse font-semibold">
                        ACCEPTED
                      </span>
                    )}
                  </div>
                  <div className="text-gray-500 text-sm">Store: {req.storeName || 'N/A'}</div>
                  <div className="text-gray-500 text-sm">
                    Budget: ₱{req.budget}&nbsp;|&nbsp;Fee: ₱{req.convenienceFee}
                  </div>
                  <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full ${statusColor(req.status)}`}>
                    {req.status}
                  </span>

                  {/* Status hint */}
                  {req.status === 'Posted' && (
                    <p className="text-xs text-gray-400 italic mt-1">
                      ⏳ Waiting for a shopper to accept...
                    </p>
                  )}
                  {req.status === 'Accepted' && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      🎉 A shopper accepted your request! You can now chat with them.
                    </p>
                  )}
                  {req.status === 'Completed' && (
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      ✓ Request completed.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[170px]">

                  {/* View Details — always */}
                  <Link
                    to={`/request/${req.id}`}
                    className="text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
                  >
                    View Details
                  </Link>

                  {/* ── CHAT BUTTON — only when Accepted or Completed ── */}
                  {(req.status === 'Accepted' || req.status === 'Completed') && req.shopperId && (
                    <Link
                      to={`/request/${req.id}`}
                      className={`text-center text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2
                        ${req.status === 'Accepted'
                          ? 'bg-green-600 hover:bg-green-700 shadow-md shadow-green-200'
                          : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      💬 Chat with Shopper
                    </Link>
                  )}

                  {/* ── RATE BUTTON — only when Completed and not yet rated ── */}
                  {req.status === 'Completed' && req.shopperId && !ratedMap[req.id] && (
                    <Link
                      to={`/request/${req.id}#rate`}
                      className="text-center bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 text-sm font-medium"
                    >
                      ⭐ Rate Shopper
                    </Link>
                  )}

                  {/* Already rated */}
                  {req.status === 'Completed' && ratedMap[req.id] && (
                    <span className="text-center text-green-600 text-sm font-medium px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                      ✓ Rated
                    </span>
                  )}

                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default MyRequestsPage;
