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
  const [activeRequests, setActiveRequests] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!authUser) return;

    // 1. REAL-TIME RATING SYNC
    // This keeps your 2.67 rating and "Based on X reviews" perfectly updated
    const unsubUser = onSnapshot(doc(db, 'users', authUser.uid), (snap) => {
      if (snap.exists()) setUserData(snap.data());
    });

    // 2. REQUESTER ONLY: Active items you posted
    const qRequests = query(
      collection(db, 'requests'), 
      where('requesterId', '==', authUser.uid), 
      where('status', 'in', ['Posted', 'Accepted'])
    );
    
    const unsubReq = onSnapshot(qRequests, (s) => {
      setActiveRequests(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 3. REQUESTER ONLY: Completed items you posted
    const qComp = query(
      collection(db, 'requests'), 
      where('requesterId', '==', authUser.uid),
      where('status', '==', 'Completed')
    );

    const unsubComp = onSnapshot(qComp, (s) => {
      setCompletedCount(s.docs.length);
    });

    return () => { unsubUser(); unsubReq(); unsubComp(); };
  }, [authUser]);

  if (authLoading) return <div className="p-10 text-center">Loading Profile...</div>;
  if (!authUser) return <div className="p-10 text-red-500">Please log in.</div>;

  // Rating Display Logic (using the fixed field names)
  const displayRating = userData?.rating ? Number(userData.rating).toFixed(2) : "0.00";
  const displayCount = userData?.reviewCount || 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={userData || authUser} />

      <main className="flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Welcome back, {userData?.name || authUser.displayName || 'Fritz'}!
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Manage your shopping requests here.</p>
        </header>

        {/* Stats Row - Clean and Simple */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-blue-600">{activeRequests.length}</p>
            <p className="text-gray-500 font-semibold mt-2 uppercase tracking-wider text-sm">Active Requests</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-green-600">{completedCount}</p>
            <p className="text-gray-500 font-semibold mt-2 uppercase tracking-wider text-sm">Completed</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-yellow-500">{displayRating}</p>
            <p className="text-gray-500 font-semibold mt-2 uppercase tracking-wider text-sm">Your Rating</p>
            <p className="text-xs text-gray-400 mt-2 italic font-medium">
              Based on {displayCount} {displayCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>

        {/* Big Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button 
            onClick={() => navigate('/post-request')}
            className="bg-white p-10 rounded-2xl shadow-sm border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center group"
          >
            <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">➕</span>
            <h3 className="text-xl font-bold text-gray-800">Post New Request</h3>
            <p className="text-gray-500 text-sm mt-2">Need someone to buy something for you?</p>
          </button>

          <button 
            onClick={() => navigate('/messages')}
            className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center group"
          >
            <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">💬</span>
            <h3 className="text-xl font-bold text-gray-800">View Messages</h3>
            <p className="text-gray-500 text-sm mt-2">Check updates from your shoppers.</p>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;