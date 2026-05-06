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
  
  // CRITICAL: Prevent rendering the wrong boxes by holding the UI until the profile loads
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  useEffect(() => {
    if (!authUser) return;

    // 1. Fetch User Profile (Role & OLD RATING DATA)
    const unsubUser = onSnapshot(doc(db, 'users', authUser.uid), (snap) => {
      if (snap.exists()) {
        setUserData(snap.data());
        setIsProfileLoaded(true); // Unlock the UI only after we have the real role and rating
      }
    });

    return () => unsubUser();
  }, [authUser]);

  useEffect(() => {
    // 2. Fetch Stats only after we confirm who they are
    if (!authUser || !isProfileLoaded || !userData?.role) return;

    const isShopper = userData.role === 'Shopper';
    let qActive, qComp;

    if (isShopper) {
      qActive = query(collection(db, 'requests'), where('shopperId', '==', authUser.uid), where('status', '==', 'Accepted'));
      qComp = query(collection(db, 'requests'), where('shopperId', '==', authUser.uid), where('status', '==', 'Completed'));
    } else {
      qActive = query(collection(db, 'requests'), where('requesterId', '==', authUser.uid), where('status', 'in', ['Posted', 'Accepted']));
      qComp = query(collection(db, 'requests'), where('requesterId', '==', authUser.uid), where('status', '==', 'Completed'));
    }

    const unsubActive = onSnapshot(qActive, (s) => {
      setActiveItemsList(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubComp = onSnapshot(qComp, (s) => {
      setCompletedCount(s.docs.length);
    });

    return () => { unsubActive(); unsubComp(); };
  }, [authUser, isProfileLoaded, userData]);

  // Show a blank/loading screen until we 100% know the role
  if (authLoading || !isProfileLoaded) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 font-bold text-gray-400">Syncing Profile Data...</div>;
  }

  // Define role and stats AFTER data is verified
  const isShopper = userData.role === 'Shopper';
  const displayRating = userData.rating ? Number(userData.rating).toFixed(2) : "0.00";
  const displayReviews = userData.reviewCount || 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={userData || authUser} />

      <main className="flex-1 p-10 max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Welcome back, {userData?.name || 'User'}!
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {isShopper ? "Manage your active tasks and browse for new ones." : "Manage your shopping requests here."}
          </p>
        </header>

        {/* STATS ROW (Rating is now synced properly with old data) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-5xl font-black text-blue-600">{activeItemsList.length}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase tracking-wider text-xs">
              {isShopper ? 'Active Tasks' : 'Active Requests'}
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-5xl font-black text-green-600">{completedCount}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase tracking-wider text-xs">Completed</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-5xl font-black text-yellow-500">{displayRating}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase tracking-wider text-xs">Rating</p>
            <p className="text-[10px] text-gray-400 mt-1 italic">Based on {displayReviews} reviews</p>
          </div>
        </div>

        {/* DISTINCT 2-BOX ACTION ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {isShopper ? (
            /* EXACT SHOPPER UI */
            <>
              <button onClick={() => navigate('/browse')} className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center justify-center group">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Browse Requests</h3>
                <div className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold group-hover:bg-blue-700 transition-colors">Go to Browse</div>
              </button>
              <button onClick={() => navigate('/messages')} className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center justify-center group">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">View Messages</h3>
                <div className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold group-hover:bg-purple-700 transition-colors">Open Messages</div>
              </button>
            </>
          ) : (
            /* EXACT REQUESTER UI */
            <>
              <button onClick={() => navigate('/post-request')} className="bg-white p-10 rounded-2xl shadow-sm border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all flex flex-col items-center justify-center group">
                <span className="text-5xl mb-4 text-purple-600 group-hover:scale-110 transition-transform">➕</span>
                <h3 className="text-xl font-bold text-gray-900">Post New Request</h3>
                <p className="text-gray-500 text-sm mt-2">Need someone to buy something for you?</p>
              </button>
              <button onClick={() => navigate('/messages')} className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center justify-center group">
                <span className="text-5xl mb-4 text-gray-300 group-hover:scale-110 transition-transform">💬</span>
                <h3 className="text-xl font-bold text-gray-900">View Messages</h3>
                <p className="text-gray-500 text-sm mt-2">Check updates from your shoppers.</p>
              </button>
            </>
          )}
        </div>

        {/* ACTIVE LIST SECTION */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            📋 {isShopper ? 'Active Tasks' : 'Active Requests'}
          </h3>
          
          {activeItemsList.length > 0 ? (
            <div className="space-y-4">
              {activeItemsList.map((item) => (
                <div key={item.id} onClick={() => navigate(`/request/${item.id}`)} className="flex justify-between items-center p-6 border border-gray-100 rounded-xl hover:border-blue-300 hover:bg-blue-50/20 cursor-pointer transition-all shadow-sm">
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{item.itemName}</p>
                    <p className="text-sm text-gray-500">{item.storeName || 'Any Store'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 font-extrabold text-xl">₱{item.budget}</p>
                    <span className={`text-[10px] tracking-widest font-bold px-3 py-1 rounded-full uppercase mt-2 inline-block ${item.status === 'Accepted' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-gray-400 italic font-medium">
              No active {isShopper ? 'tasks' : 'requests'} found.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;