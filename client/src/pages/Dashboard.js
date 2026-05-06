import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null); 
  const [activeItemsList, setActiveItemsList] = useState([]); 
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!authUser?.uid) return;

    // 1. Get User Profile & Rating
    const unsubUser = onSnapshot(doc(db, 'users', authUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);

        // 2. Fetch Stats based on Role
        const role = data.role;
        let qActive, qComp;

        if (role === 'Shopper') {
          qActive = query(collection(db, 'requests'), where('shopperId', '==', authUser.uid), where('status', '==', 'Accepted'));
          qComp = query(collection(db, 'requests'), where('shopperId', '==', authUser.uid), where('status', '==', 'Completed'));
        } else {
          qActive = query(collection(db, 'requests'), where('requesterId', '==', authUser.uid), where('status', 'in', ['Posted', 'Accepted']));
          qComp = query(collection(db, 'requests'), where('requesterId', '==', authUser.uid), where('status', '==', 'Completed'));
        }

        onSnapshot(qActive, (s) => setActiveItemsList(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        onSnapshot(qComp, (s) => setCompletedCount(s.docs.length));
      }
    });

    return () => unsubUser();
  }, [authUser]);

  // Use a simple fallback if data is missing to prevent black screen/crashes
  const safeRole = userData?.role || 'User';
  const isShopper = safeRole === 'Shopper';
  const rating = userData?.rating ? Number(userData.rating).toFixed(2) : "0.00";
  const reviews = userData?.reviewCount || 0;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar user={userData || authUser} />

      <main className="flex-1 p-10 max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold">
            Welcome back, <span className="text-blue-600">{userData?.name || 'User'}</span>!
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {isShopper ? "Ready to help someone today?" : "Manage your shopping requests here."}
          </p>
        </header>

        {/* 3 STATS BOXES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-blue-600">{activeItemsList.length}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase text-xs">{isShopper ? 'Active Tasks' : 'Active Items'}</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-green-600">{completedCount}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase text-xs">Completed</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-yellow-500">{rating}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase text-xs">Rating</p>
            <p className="text-[10px] text-gray-400 italic">Based on {reviews} reviews</p>
          </div>
        </div>

        {/* THE TWO BOXES - FIXED UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {isShopper ? (
            <>
              {/* SHOPPER VIEW: Browse & Messages */}
              <div onClick={() => navigate('/browse')} className="bg-white p-12 rounded-2xl border border-gray-100 hover:shadow-md cursor-pointer text-center">
                <h3 className="text-2xl font-bold mb-4">Browse Requests</h3>
                <button className="bg-blue-600 text-white px-10 py-3 rounded-lg font-bold">Go to Browse</button>
              </div>
              <div onClick={() => navigate('/messages')} className="bg-white p-12 rounded-2xl border border-gray-100 hover:shadow-md cursor-pointer text-center">
                <h3 className="text-2xl font-bold mb-4">View Messages</h3>
                <button className="bg-purple-600 text-white px-10 py-3 rounded-lg font-bold">Open Messages</button>
              </div>
            </>
          ) : (
            <>
              {/* REQUESTER VIEW: Post & Messages */}
              <div onClick={() => navigate('/post-request')} className="bg-white p-10 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-400 cursor-pointer text-center group">
                <span className="text-5xl mb-4 block">➕</span>
                <h3 className="text-xl font-bold">Post New Request</h3>
                <p className="text-gray-500 text-sm mt-2">Need something bought for you?</p>
              </div>
              <div onClick={() => navigate('/messages')} className="bg-white p-10 rounded-2xl border border-gray-100 hover:shadow-md cursor-pointer text-center">
                <span className="text-5xl mb-4 block">💬</span>
                <h3 className="text-xl font-bold">View Messages</h3>
                <p className="text-gray-500 text-sm mt-2">Check updates from your shoppers.</p>
              </div>
            </>
          )}
        </div>

        {/* LIST SECTION */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            📋 {isShopper ? 'Active Tasks' : 'Active Requests'}
          </h3>
          {activeItemsList.length > 0 ? (
            <div className="space-y-4">
              {activeItemsList.map((item) => (
                <div key={item.id} onClick={() => navigate(`/request/${item.id}`)} className="flex justify-between items-center p-5 border border-gray-50 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="font-bold text-gray-800">{item.itemName}</p>
                    <p className="text-sm text-gray-400">{item.storeName || 'Any Store'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 font-bold">₱{item.budget}</p>
                    <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded uppercase">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-300 italic">No active items found.</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;