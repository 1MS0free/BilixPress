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
  const [activeItemsList, setActiveItemsList] = useState([]); 
  const [completedCount, setCompletedCount] = useState(0);

  // Check role strictly from database
  const isShopper = userData?.role === 'Shopper' || authUser?.role === 'Shopper';

  useEffect(() => {
    if (!authUser) return;

    // 1. Real-time Profile (Rating Fix)
    const unsubUser = onSnapshot(doc(db, 'users', authUser.uid), (snap) => {
      if (snap.exists()) setUserData(snap.data());
    });

    // 2. Role-Based List & Stats
    let qActive, qComp;

    if (isShopper) {
      // SHOPPER: Show tasks they are currently handling
      qActive = query(collection(db, 'requests'), where('shopperId', '==', authUser.uid), where('status', '==', 'Accepted'));
      qComp = query(collection(db, 'requests'), where('shopperId', '==', authUser.uid), where('status', '==', 'Completed'));
    } else {
      // REQUESTER: Show requests they have posted
      qActive = query(collection(db, 'requests'), where('requesterId', '==', authUser.uid), where('status', 'in', ['Posted', 'Accepted']));
      qComp = query(collection(db, 'requests'), where('requesterId', '==', authUser.uid), where('status', '==', 'Completed'));
    }

    const unsubActive = onSnapshot(qActive, (s) => {
      setActiveItemsList(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubComp = onSnapshot(qComp, (s) => setCompletedCount(s.docs.length));

    return () => { unsubUser(); unsubActive(); unsubComp(); };
  }, [authUser, isShopper]);

  if (authLoading) return <div className="p-10 text-center">Loading...</div>;

  const displayRating = userData?.rating ? Number(userData.rating).toFixed(2) : "0.00";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={userData || authUser} />

      <main className="flex-1 p-10 max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Welcome back, <span className="text-blue-600">{userData?.name || 'User'}</span>!
          </h1>
          <p className="text-gray-500 mt-2 text-lg italic">
            {isShopper ? "Ready to help someone today?" : "Manage your shopping requests here."}
          </p>
        </header>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-blue-600">{activeItemsList.length}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase tracking-wider text-xs">
              {isShopper ? 'Active Tasks' : 'Active Requests'}
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-green-600">{completedCount}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase tracking-wider text-xs">Completed</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-yellow-500">{displayRating}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase tracking-wider text-xs">Rating</p>
          </div>
        </div>

        {/* Action Cards - FIXED SHOPPER BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {isShopper ? (
            /* SHOPPER ACTIONS */
            <>
              <button onClick={() => navigate('/browse')} className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 hover:bg-blue-50 transition-all flex flex-col items-center group">
                <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔍</span>
                <h3 className="text-xl font-bold text-gray-800">Browse Requests</h3>
                <p className="text-gray-500 text-sm mt-2">Find tasks and start earning.</p>
              </button>
              <button onClick={() => navigate('/messages')} className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 hover:bg-purple-50 transition-all flex flex-col items-center group">
                <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">💬</span>
                <h3 className="text-xl font-bold text-gray-800">View Messages</h3>
                <p className="text-gray-500 text-sm mt-2">Stay in touch with your requesters.</p>
              </button>
            </>
          ) : (
            /* REQUESTER ACTIONS */
            <>
              <button onClick={() => navigate('/post-request')} className="bg-white p-10 rounded-2xl shadow-sm border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center group">
                <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">➕</span>
                <h3 className="text-xl font-bold text-gray-800">Post New Request</h3>
                <p className="text-gray-500 text-sm mt-2">Need someone to buy something for you?</p>
              </button>
              <button onClick={() => navigate('/messages')} className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 hover:bg-purple-50 transition-all flex flex-col items-center group">
                <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">💬</span>
                <h3 className="text-xl font-bold text-gray-800">View Messages</h3>
                <p className="text-gray-500 text-sm mt-2">Coordinate with your shoppers.</p>
              </button>
            </>
          )}
        </div>

        {/* List Section - Restored for both roles */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span>📋</span> {isShopper ? 'Active Tasks' : 'Active Requests'}
          </h3>
          
          {activeItemsList.length > 0 ? (
            <div className="space-y-4">
              {activeItemsList.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/request/${item.id}`)}
                  className="flex justify-between items-center p-5 border border-gray-100 rounded-xl hover:border-blue-300 hover:bg-blue-50/20 cursor-pointer transition-all"
                >
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{item.itemName}</p>
                    <p className="text-sm text-gray-400">{item.storeName || 'Any Store'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 font-extrabold text-lg">₱{item.budget}</p>
                    <span className={`text-[10px] tracking-wider font-bold px-3 py-1 rounded-full uppercase mt-1 inline-block ${
                      item.status === 'Accepted' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 italic">
              No active {isShopper ? 'tasks' : 'requests'} found.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;