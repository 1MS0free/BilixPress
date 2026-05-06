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
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    if (!authUser) return;

    // 1. Listen to USER profile for Role and Rating
    const unsubUser = onSnapshot(doc(db, 'users', authUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        
        // 2. Once we have the role, get the lists
        const isShopper = data.role === 'Shopper';
        let qActive, qComp;

        if (isShopper) {
          qActive = query(collection(db, 'requests'), where('shopperId', '==', authUser.uid), where('status', '==', 'Accepted'));
          qComp = query(collection(db, 'requests'), where('shopperId', '==', authUser.uid), where('status', '==', 'Completed'));
        } else {
          qActive = query(collection(db, 'requests'), where('requesterId', '==', authUser.uid), where('status', 'in', ['Posted', 'Accepted']));
          qComp = query(collection(db, 'requests'), where('requesterId', '==', authUser.uid), where('status', '==', 'Completed'));
        }

        onSnapshot(qActive, (s) => setActiveItemsList(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        onSnapshot(qComp, (s) => setCompletedCount(s.docs.length));
        
        setIsSyncing(false);
      }
    });

    return () => unsubUser();
  }, [authUser]);

  if (authLoading || isSyncing) return <div className="p-20 text-center font-bold">Syncing Database...</div>;

  // HARD CONSTANTS BASED ON DATABASE ROLE
  const isShopper = userData?.role === 'Shopper';
  const rating = userData?.rating ? Number(userData.rating).toFixed(2) : "0.00";
  const reviews = userData?.reviewCount || 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={userData || authUser} />
      <main className="flex-1 p-10 max-w-7xl mx-auto">
        
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">Welcome back, {userData?.name}!</h1>
          <p className="text-gray-500 mt-2 text-lg italic">{isShopper ? "Shopper Dashboard" : "Requester Dashboard"}</p>
        </header>

        {/* 3 STATS BOXES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-blue-600">{activeItemsList.length}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase tracking-wider text-xs">{isShopper ? 'Active Tasks' : 'Active Items'}</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-green-600">{completedCount}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase tracking-wider text-xs">Completed</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-yellow-500">{rating}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase tracking-wider text-xs">Rating</p>
            <p className="text-[10px] text-gray-400 italic">From {reviews} reviews</p>
          </div>
        </div>

        {/* THE TWO BOXES - FORCED SWITCH */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {isShopper ? (
            <>
              {/* SHOPPER VIEW */}
              <div onClick={() => navigate('/browse')} className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 hover:bg-blue-50 cursor-pointer text-center">
                <h3 className="text-2xl font-black mb-4">Browse Requests</h3>
                <button className="bg-blue-600 text-white px-10 py-3 rounded-lg font-bold">Go to Browse</button>
              </div>
              <div onClick={() => navigate('/messages')} className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 hover:bg-purple-50 cursor-pointer text-center">
                <h3 className="text-2xl font-black mb-4">View Messages</h3>
                <button className="bg-purple-600 text-white px-10 py-3 rounded-lg font-bold">Open Messages</button>
              </div>
            </>
          ) : (
            <>
              {/* REQUESTER VIEW */}
              <div onClick={() => navigate('/post-request')} className="bg-white p-12 rounded-2xl shadow-sm border-2 border-dashed border-gray-200 hover:border-blue-400 cursor-pointer text-center">
                <span className="text-5xl block mb-2">➕</span>
                <h3 className="text-xl font-bold">Post New Request</h3>
              </div>
              <div onClick={() => navigate('/messages')} className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 cursor-pointer text-center">
                <span className="text-5xl block mb-2">💬</span>
                <h3 className="text-xl font-bold">View Messages</h3>
              </div>
            </>
          )}
        </div>

        {/* BOTTOM LIST */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold mb-6">📋 {isShopper ? 'Active Tasks' : 'Active Requests'}</h3>
          {activeItemsList.length > 0 ? (
            activeItemsList.map(item => (
              <div key={item.id} className="flex justify-between p-4 border-b">
                <span>{item.itemName}</span>
                <span className="font-bold text-blue-600">₱{item.budget}</span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 italic">No active items found.</p>
          )}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;