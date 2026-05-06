import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import logo from '../assets/logo_webapp.png';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();

  const [activeCount,    setActiveCount]    = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    // Determine which field to query based on role
    const isRequester = user.role !== 'shopper';
    const field = isRequester ? 'requesterId' : 'shopperId';

    // Active requests (Posted or Accepted)
    const activeQ = query(
      collection(db, 'requests'),
      where(field, '==', user.uid),
      where('status', 'in', ['Posted', 'Accepted'])
    );
    const unsubActive = onSnapshot(activeQ, (snap) => {
      setActiveCount(snap.size);
    });

    // Completed requests
    const completedQ = query(
      collection(db, 'requests'),
      where(field, '==', user.uid),
      where('status', '==', 'Completed')
    );
    const unsubCompleted = onSnapshot(completedQ, (snap) => {
      setCompletedCount(snap.size);
    });

    // Recent requests (all statuses, for the list)
    const recentQ = query(
      collection(db, 'requests'),
      where(field, '==', user.uid)
    );
    const unsubRecent = onSnapshot(recentQ, (snap) => {
      const reqs = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          // Sort by createdAt descending
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        })
        .slice(0, 5); // show 5 most recent
      setRecentRequests(reqs);
    });

    return () => {
      unsubActive();
      unsubCompleted();
      unsubRecent();
    };
  }, [user?.uid, user?.role]);

  if (authLoading) return <div className="p-8">Loading...</div>;

  // Rating pulled directly from user doc (updated by ratingService)
  const rating = user?.ratingAverage != null
    ? Number(user.ratingAverage).toFixed(2)
    : 'N/A';

  const statusColor = (status) => {
    if (status === 'Accepted')  return 'text-green-600 bg-green-50 border border-green-200';
    if (status === 'Completed') return 'text-blue-600 bg-blue-50 border border-blue-200';
    return 'text-gray-600 bg-gray-100 border border-gray-200';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 p-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <img src={logo} alt="App Logo" className="h-14 w-14 rounded-2xl shadow" />
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
            <p className="text-gray-600">
              {user?.role === 'shopper'
                ? 'Browse requests and start earning.'
                : 'Need something? Post a request and let shoppers help you out.'}
            </p>
          </div>
        </div>

        {/* ── Live Stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-3xl font-bold mb-1">{activeCount}</div>
            <div className="text-gray-500 text-sm">Active Requests</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-3xl font-bold mb-1">{completedCount}</div>
            <div className="text-gray-500 text-sm">Completed</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-3xl font-bold mb-1 text-yellow-500">
              {rating !== 'N/A' ? `★ ${rating}` : 'N/A'}
            </div>
            <div className="text-gray-500 text-sm">
              Avg. Rating {user?.ratingCount ? `(${user.ratingCount} reviews)` : ''}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {user?.role === 'shopper' ? (
            <>
              <div className="bg-white rounded shadow p-6 flex flex-col items-center justify-center">
                <div className="text-lg font-semibold mb-2">Browse Requests</div>
                <p className="text-gray-500 mb-4 text-center">Find errands near you and start earning.</p>
                <Link to="/browse" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Browse Now
                </Link>
              </div>
              <div className="bg-white rounded shadow p-6 flex flex-col items-center justify-center">
                <div className="text-lg font-semibold mb-2">View Messages</div>
                <p className="text-gray-500 mb-4 text-center">Chat with requesters about active tasks.</p>
                <Link to="/messages" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                  Open Messages
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded shadow p-6 flex flex-col items-center justify-center">
                <div className="text-lg font-semibold mb-2">Post New Request</div>
                <p className="text-gray-500 mb-4 text-center">Need something from a store? Create a request and let shoppers help you.</p>
                <Link to="/post-request" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Create Request
                </Link>
              </div>
              <div className="bg-white rounded shadow p-6 flex flex-col items-center justify-center">
                <div className="text-lg font-semibold mb-2">View Messages</div>
                <p className="text-gray-500 mb-4 text-center">Chat with shoppers about your requests.</p>
                <Link to="/messages" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                  Open Messages
                </Link>
              </div>
            </>
          )}
        </div>

        {/* ── Recent Requests ────────────────────────────────────────────── */}
        <div className="bg-white rounded shadow p-6">
          <div className="text-lg font-semibold mb-4">Recent Requests</div>

          {recentRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-400 py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 7v4a1 1 0 001 1h3m10-5h3a1 1 0 011 1v4a1 1 0 01-1 1h-3m-6 4v4a1 1 0 001 1h2a1 1 0 001-1v-4m-6 4h6" />
              </svg>
              <div>No active requests yet</div>
              <div className="text-sm">Post your first request to get started!</div>
            </div>
          ) : (
            <ul className="divide-y">
              {recentRequests.map(req => (
                <li key={req.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">{req.itemName}</div>
                    <div className="text-sm text-gray-500">
                      {req.storeName || 'N/A'} · ₱{req.budget}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor(req.status)}`}>
                      {req.status}
                    </span>
                    <Link
                      to={`/request/${req.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
