import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null); // Real-time user stats
  const [activeRequests, setActiveRequests] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!authUser) return;

    // 1. Real-time listener for USER RATING & PROFILE
    const unsubUser = onSnapshot(doc(db, 'users', authUser.uid), (snap) => {
      if (snap.exists()) setUserData(snap.data());
    });

    // 2. Requests/Tasks Listeners
    const qRequests = query(collection(db, 'requests'), where('requesterId', '==', authUser.uid), where('status', 'in', ['Posted', 'Accepted']));
    const qTasks = query(collection(db, 'requests'), where('shopperId', '==', authUser.uid), where('status', '==', 'Accepted'));
    
    const unsubReq = onSnapshot(qRequests, (s) => setActiveRequests(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTsk = onSnapshot(qTasks, (s) => setActiveTasks(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    // 3. Completed Count Listener
    const qComp = query(collection(db, 'requests'), where('status', '==', 'Completed'));
    const unsubComp = onSnapshot(qComp, (s) => {
      const count = s.docs.filter(d => d.data().requesterId === authUser.uid || d.data().shopperId === authUser.uid).length;
      setCompletedCount(count);
    });

    return () => { unsubUser(); unsubReq(); unsubTsk(); unsubComp(); };
  }, [authUser]);

  if (authLoading) return <div className="p-10">Loading...</div>;
  if (!authUser) return <div className="p-10 text-red-500">Please log in.</div>;

  const displayRating = userData?.rating ? Number(userData.rating).toFixed(2) : "0.00";
  const displayCount = userData?.reviewCount || 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={userData || authUser} />
      <main className="flex-1 p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {userData?.name || authUser.displayName || 'User'}!
          </h1>
          <p className="text-gray-500 italic">Ready to help someone today?</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-4xl font-bold text-blue-600">{activeRequests.length + activeTasks.length}</p>
            <p className="text-gray-500 font-medium">Active Items</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-4xl font-bold text-green-600">{completedCount}</p>
            <p className="text-gray-500 font-medium">Completed</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-4xl font-bold text-yellow-500">{displayRating}</p>
            <p className="text-gray-500 font-medium">Rating</p>
            <p className="text-xs text-gray-400 mt-1 italic">Based on {displayCount} reviews</p>
          </div>
        </div>

        {/* Browse & Messages Buttons (Keep your existing UI here) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <h3 className="text-xl font-bold mb-2 text-gray-800">Browse Requests</h3>
                <button onClick={() => navigate('/browse')} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition">Go to Browse</button>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <h3 className="text-xl font-bold mb-2 text-gray-800">View Messages</h3>
                <button onClick={() => navigate('/messages')} className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 transition">Open Messages</button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;