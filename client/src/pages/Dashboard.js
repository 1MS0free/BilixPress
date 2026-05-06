import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null); 
  const [activeItemsCount, setActiveItemsCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  // Determine role
  const isShopper = userData?.role === 'Shopper';

  useEffect(() => {
    if (!authUser) return;

    // 1. REAL-TIME PROFILE & RATING SYNC
    const unsubUser = onSnapshot(doc(db, 'users', authUser.uid), (snap) => {
      if (snap.exists()) setUserData(snap.data());
    });

    // 2. ROLE-BASED DATA FETCHING
    let qActive, qComp;

    if (isShopper) {
      // SHOPPER VIEW: Tasks they are currently handling
      qActive = query(collection(db, 'requests'), where('shopperId', '==', authUser.uid), where('status', '==', 'Accepted'));
      qComp = query(collection(db, 'requests'), where('shopperId', '==', authUser.uid), where('status', '==', 'Completed'));
    } else {
      // REQUESTER VIEW: Requests they have posted
      qActive = query(collection(db, 'requests'), where('requesterId', '==', authUser.uid), where('status', 'in', ['Posted', 'Accepted']));
      qComp = query(collection(db, 'requests'), where('requesterId', '==', authUser.uid), where('status', '==', 'Completed'));
    }

    const unsubActive = onSnapshot(qActive, (s) => setActiveItemsCount(s.docs.length));
    const unsubComp = onSnapshot(qComp, (s) => setCompletedCount(s.docs.length));

    return () => { unsubUser(); unsubActive(); unsubComp(); };
  }, [authUser, isShopper]);

  if (authLoading) return <div className="p-10 text-center">Loading...</div>;

  const displayRating = userData?.rating ? Number(userData.rating).toFixed(2) : "0.00";
  const displayCount = userData?.reviewCount || 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={userData || authUser} />

      <main className="flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Welcome back, {userData?.name || authUser.displayName || 'User'}!
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {isShopper ? "Manage your shopping tasks here." : "Manage your shopping requests here."}
          </p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-blue-600">{activeItemsCount}</p>
            <p className="text-gray-500 font-semibold mt-2 uppercase tracking-wider text-sm">
               {isShopper ? "Active Tasks" : "Active Requests"}
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-green-600">{completedCount}</p>
            <p className="text-gray-500 font-semibold mt-2 uppercase tracking-wider text-sm">Completed</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-yellow-500">{displayRating}</p>
            <p className="text-gray-500 font-semibold mt-2 uppercase tracking-wider text-sm">Rating</p>
            <p className="text-xs text-gray-400 mt-2 italic">Based on {displayCount} reviews</p>
          </div>
        </div>

        {/* Action Cards - FULLY RESTORED ROLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isShopper ? (
            /* SHOPPER BUTTONS */
            <button 
              onClick={() => navigate('/browse')}
              className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 hover:bg-blue-50 transition-all flex flex-col items-center group"
            >
              <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔍</span>
              <h3 className="text-xl font-bold text-gray-800">Browse Requests</h3>
              <p className="text-gray-500 text-sm mt-2">Find nearby tasks and start earning.</p>
            </button>
          ) : (
            /* REQUESTER BUTTONS */
            <button 
              onClick={() => navigate('/post-request')}
              className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 hover:bg-green-50 transition-all flex flex-col items-center group"
            >
              <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">➕</span>
              <h3 className="text-xl font-bold text-gray-800">Post New Request</h3>
              <p className="text-gray-500 text-sm mt-2">Need someone to buy something for you?</p>
            </button>
          )}

          <button 
            onClick={() => navigate('/messages')}
            className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all flex flex-col items-center group"
          >
            <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">💬</span>
            <h3 className="text-xl font-bold text-gray-800">View Messages</h3>
            <p className="text-gray-500 text-sm mt-2">
              Stay in touch with your {isShopper ? "requesters" : "shoppers"}.
            </p>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;