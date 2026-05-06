import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import logo from '../assets/logo_webapp.png';

const statusStyles = {
  Posted:    { dot: 'bg-gray-400',    badge: 'bg-gray-100 text-gray-600'    },
  Accepted:  { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
  Completed: { dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700'     },
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeCount,    setActiveCount]    = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const field = user.role === 'shopper' ? 'shopperId' : 'requesterId';

    const unsubActive = onSnapshot(
      query(collection(db, 'requests'), where(field, '==', user.uid), where('status', 'in', ['Posted', 'Accepted'])),
      snap => setActiveCount(snap.size)
    );
    const unsubCompleted = onSnapshot(
      query(collection(db, 'requests'), where(field, '==', user.uid), where('status', '==', 'Completed')),
      snap => setCompletedCount(snap.size)
    );
    const unsubRecent = onSnapshot(
      query(collection(db, 'requests'), where(field, '==', user.uid)),
      snap => {
        const reqs = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
          .slice(0, 5);
        setRecentRequests(reqs);
      }
    );

    return () => { unsubActive(); unsubCompleted(); unsubRecent(); };
  }, [user?.uid, user?.role]);

  if (authLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  );

  const rating    = user?.ratingAverage != null ? Number(user.ratingAverage).toFixed(2) : null;
  const isShopper = user?.role === 'shopper';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />

      <main className="flex-1 p-8 overflow-y-auto">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Logo" className="w-12 h-12 rounded-2xl shadow-sm object-cover" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Welcome back, <span className="text-blue-600">{user?.name || 'User'}</span>
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {isShopper ? 'Ready to help someone today?' : 'What do you need today?'}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-8">

          {/* Active */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {isShopper ? 'Active Tasks' : 'Active Requests'}
              </span>
              <span className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                  <polyline points="13 2 13 9 20 9"/>
                </svg>
              </span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{activeCount}</div>
            <div className="text-xs text-gray-400 mt-1">In progress</div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completed</span>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
            </div>
            <div className="text-3xl font-bold text-emerald-600">{completedCount}</div>
            <div className="text-xs text-gray-400 mt-1">All time</div>
          </div>

          {/* Rating */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rating</span>
              <span className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </span>
            </div>
            <div className="text-3xl font-bold text-amber-500">
              {rating ?? '—'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {user?.ratingCount ? `${user.ratingCount} review${user.ratingCount !== 1 ? 's' : ''}` : 'No reviews yet'}
            </div>
          </div>

        </div>

        {/* ── Quick Actions ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {isShopper ? (
            <>
              <Link to="/browse" className="group bg-blue-600 hover:bg-blue-700 transition rounded-2xl p-6 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-white">Browse Requests</div>
                  <div className="text-xs text-blue-200 mt-0.5">Find errands and start earning</div>
                </div>
              </Link>
              <Link to="/messages" className="group bg-white hover:bg-gray-50 transition rounded-2xl p-6 flex items-center gap-4 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Messages</div>
                  <div className="text-xs text-gray-400 mt-0.5">Chat with requesters</div>
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link to="/post-request" className="group bg-blue-600 hover:bg-blue-700 transition rounded-2xl p-6 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-white">Post a Request</div>
                  <div className="text-xs text-blue-200 mt-0.5">Let shoppers help you out</div>
                </div>
              </Link>
              <Link to="/messages" className="group bg-white hover:bg-gray-50 transition rounded-2xl p-6 flex items-center gap-4 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Messages</div>
                  <div className="text-xs text-gray-400 mt-0.5">Chat with shoppers</div>
                </div>
              </Link>
            </>
          )}
        </div>

        {/* ── Recent Requests ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800 text-sm">
              {isShopper ? 'Recent Tasks' : 'Recent Requests'}
            </h2>
            <Link
              to={isShopper ? '/active-tasks' : '/my-requests'}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              View all →
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-gray-300">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
              </svg>
              <div className="text-sm font-medium text-gray-400">No requests yet</div>
              <div className="text-xs text-gray-300 mt-1">
                {isShopper ? 'Accept a request to get started' : 'Post your first request to get started'}
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentRequests.map(req => {
                const s = statusStyles[req.status] || statusStyles.Posted;
                return (
                  <li key={req.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{req.itemName}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {req.storeName || 'Any store'} · ₱{req.budget}
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${s.badge}`}>
                      {req.status}
                    </span>
                    <Link
                      to={`/request/${req.id}`}
                      className="text-xs text-blue-500 hover:text-blue-700 font-medium flex-shrink-0"
                    >
                      View →
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
