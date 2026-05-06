import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  // Use the user and loading state from your useAuth hook
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeItemsList, setActiveItemsList] = useState([]); 
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    // MATCHING YOUR Sidebar.jsx LOGIC: Check both object and localStorage
    const role = user?.role || localStorage.getItem('active_user_role');
    
    // Using lowercase 'shopper' to match your useAuth.js
    const isShopperRole = role === 'shopper';

    let qActive, qComp;

    if (isShopperRole) {
      // SHOPPER: Accepted tasks and Completed tasks
      qActive = query(collection(db, 'requests'), where('shopperId', '==', user.uid), where('status', '==', 'Accepted'));
      qComp = query(collection(db, 'requests'), where('shopperId', '==', user.uid), where('status', '==', 'Completed'));
    } else {
      // REQUESTER: Posted/Accepted tasks and Completed tasks
      qActive = query(collection(db, 'requests'), where('requesterId', '==', user.uid), where('status', 'in', ['Posted', 'Accepted']));
      qComp = query(collection(db, 'requests'), where('requesterId', '==', user.uid), where('status', '==', 'Completed'));
    }

    const unsubActive = onSnapshot(qActive, (s) => setActiveItemsList(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubComp = onSnapshot(qComp, (s) => setCompletedCount(s.docs.length));

    return () => { unsubActive(); unsubComp(); };
  }, [user]);

  if (authLoading) return null;

  // CONSISTENT ROLE CHECKING
  const currentRole = user?.role || localStorage.getItem('active_user_role');
  const isShopper = currentRole === 'shopper';
  
  // RATING SYNC: Using the data spread into the user object by useAuth
  // This pulls 'rating' and 'reviewCount' directly from your Firestore 'users' doc
  const ratingValue = user?.rating ? Number(user.rating).toFixed(2) : "0.00";
  const reviewCount = user?.reviewCount || 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />

      <main className="flex-1 p-10 max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Welcome back, <span className="text-blue-600">{user?.name || 'User'}</span>!
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {isShopper ? "Ready to help someone today?" : "Manage your shopping requests here."}
          </p>
        </header>

        {/* 3 STATS BOXES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-blue-600">{activeItemsList.length}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase text-xs">
              {isShopper ? 'Active Tasks' : 'Active Items'}
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-green-600">{completedCount}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase text-xs">Completed</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-5xl font-black text-yellow-500">{ratingValue}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase text-xs">Rating</p>
            {reviewCount > 0 && <p className="text-[10px] text-gray-400 italic">Based on {reviewCount} reviews</p>}
          </div>
        </div>

        {/* THE TWO BOXES - NOW LOCKED TO LOWERCASE ROLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {isShopper ? (
            <>
              {/* SHOPPER VIEW */}
              <div onClick={() => navigate('/browse')} className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 hover:bg-blue-50 cursor-pointer text-center group">
                <h3 className="text-2xl font-black mb-4">Browse Requests</h3>
                <div className="bg-blue-600 text-white px-10 py-3 rounded-lg font-bold group-hover:bg-blue-700 inline-block">Go to Browse</div>
              </div>
              <div onClick={() => navigate('/messages')} className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 hover:bg-purple-50 cursor-pointer text-center group">
                <h3 className="text-2xl font-black mb-4">View Messages</h3>
                <div className="bg-purple-600 text-white px-10 py-3 rounded-lg font-bold group-hover:bg-purple-700 inline-block">Open Messages</div>
              </div>
            </>
          ) : (
            <>
              {/* REQUESTER VIEW */}
              <div onClick={() => navigate('/post-request')} className="bg-white p-12 rounded-2xl shadow-sm border-2 border-dashed border-gray-200 hover:border-blue-400 cursor-pointer text-center">
                <span className="text-5xl block mb-2">➕</span>
                <h3 className="text-xl font-bold">Post New Request</h3>
                <p className="text-sm text-gray-400 mt-1">Need something bought for you?</p>
              </div>
              <div onClick={() => navigate('/messages')} className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 cursor-pointer text-center">
                <span className="text-5xl block mb-2">💬</span>
                <h3 className="text-xl font-bold">View Messages</h3>
                <p className="text-sm text-gray-400 mt-1">Check updates from your shoppers.</p>
              </div>
            </>
          )}
        </div>

        {/* ACTIVE LIST */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">
            📋 {isShopper ? 'Active Tasks' : 'Active Requests'}
          </h3>
          {activeItemsList.length > 0 ? (
            <div className="space-y-4">
              {activeItemsList.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-5 border rounded-xl hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/request/${item.id}`)}>
                  <div>
                    <p className="font-bold text-gray-800">{item.itemName}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-tighter">{item.storeName || 'Any Store'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 font-bold text-lg">₱{item.budget}</p>
                    <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded uppercase">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-gray-300 italic">No active items found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;