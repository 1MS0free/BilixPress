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
  const [activeRequestsList, setActiveRequestsList] = useState([]); // List of active requests (for Requester)
  const [activeTasksList, setActiveTasksList] = useState([]);     // List of active tasks (for Shopper)
  const [completedCount, setCompletedCount] = useState(0);

  // Determine role strictly
  const isShopper = userData?.role === 'Shopper' || authUser?.role === 'Shopper';

  useEffect(() => {
    if (!authUser) return;

    // 1. Real-time User Profile (for immediate rating updates)
    const unsubUser = onSnapshot(doc(db, 'users', authUser.uid), (snap) => {
      if (snap.exists()) setUserData(snap.data());
    });

    // 2. Real-time Requests list (Requester role)
    const qRequests = query(
      collection(db, 'requests'),
      where('requesterId', '==', authUser.uid),
      where('status', 'in', ['Posted', 'Accepted'])
    );

    // 3. Real-time Tasks list (Shopper role)
    const qTasks = query(
      collection(db, 'requests'),
      where('shopperId', '==', authUser.uid),
      where('status', '==', 'Accepted')
    );

    // 4. Completed count listener (Filtered by role to keep counts isolated)
    const qComp = query(collection(db, 'requests'), where('status', '==', 'Completed'));

    const unsubReq = onSnapshot(qRequests, (snapshot) => {
      setActiveRequestsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubTsk = onSnapshot(qTasks, (snapshot) => {
      setActiveTasksList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubComp = onSnapshot(qComp, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data());
      const count = docs.filter(d => isShopper ? d.shopperId === authUser.uid : d.requesterId === authUser.uid).length;
      setCompletedCount(count);
    });

    return () => {
      unsubUser();
      unsubReq();
      unsubTsk();
      unsubComp();
    };
  }, [authUser, isShopper]);

  if (authLoading) return <div className="p-10 text-center font-semibold text-gray-600">Loading Profile...</div>;
  if (!authUser) return <div className="p-10 text-red-500 font-bold text-center">Please log in.</div>;

  const displayRating = userData?.rating ? Number(userData.rating).toFixed(2) : "0.00";
  const displayCount = userData?.reviewCount || 0;
  
  // Calculate active items count based on role for the top stats row
  const activeCount = isShopper ? activeTasksList.length : activeRequestsList.length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={userData || authUser} />

      <main className="flex-1 p-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, <span className="text-blue-600">{userData?.name || authUser.displayName || 'User'}</span>!
          </h1>
          <p className="text-gray-500 mt-2 text-lg italic">
            {isShopper ? 'Ready to help someone today?' : 'Manage your shopping requests here.'}
          </p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Active Stats Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md text-center">
            <p className="text-5xl font-black text-blue-600">{activeCount}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase tracking-wider text-xs">
              {isShopper ? 'Active Tasks' : 'Active Requests'}
            </p>
          </div>

          {/* Completed Stats Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md text-center">
            <p className="text-5xl font-black text-green-600">{completedCount}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase tracking-wider text-xs">Completed</p>
          </div>

          {/* Rating Stats Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md text-center relative overflow-hidden">
            <p className="text-5xl font-black text-yellow-500">{displayRating}</p>
            <p className="text-gray-500 font-bold mt-2 uppercase tracking-wider text-xs">Rating</p>
            <p className="text-[11px] text-gray-400 mt-1 italic">
              Based on {displayCount} {displayCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>

        {/* Action Cards (Correctly Swapped) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {isShopper ? (
            /* SHOPPER ACTIONS: Browse Requests & View Messages */
            <>
              <button 
                onClick={() => navigate('/browse')}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Browse Requests</h3>
                <p className="text-gray-500 text-sm mt-2 max-w-xs">Look for people nearby who need help with deliveries.</p>
              </button>

              <button 
                onClick={() => navigate('/messages')}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-400 hover:bg-purple-50/50 transition-all flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">View Messages</h3>
                <p className="text-gray-500 text-sm mt-2 max-w-xs">Stay in touch with your requesters about active tasks.</p>
              </button>
            </>
          ) : (
            /* REQUESTER ACTIONS: Post New Request & View Messages */
            <>
              <button 
                onClick={() => navigate('/post-request')}
                className="bg-white p-8 rounded-2xl shadow-sm border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">➕</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Post New Request</h3>
                <p className="text-gray-500 text-sm mt-2 max-w-xs">Need someone to buy or deliver items for you?</p>
              </button>

              <button 
                onClick={() => navigate('/messages')}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-400 hover:bg-purple-50/50 transition-all flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">View Messages</h3>
                <p className="text-gray-500 text-sm mt-2 max-w-xs">Check in on updates and details from your active shoppers.</p>
              </button>
            </>
          )}
        </div>

        {/* List Section: Active Tasks or Active Requests with Custom List Styles */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span>📋</span> {isShopper ? 'Recent Tasks' : 'Recent Requests'}
          </h3>
          
          {isShopper ? (
            /* --- SHOPPER: LIST OF ACTIVE TASKS --- */
            activeTasksList.length > 0 ? (
              <div className="space-y-4">
                {activeTasksList.map((task) => (
                  <div 
                    key={task.id} 
                    onClick={() => navigate(`/request/${task.id}`)}
                    className="flex justify-between items-center p-5 border border-gray-100 rounded-xl hover:border-blue-300 hover:bg-blue-50/20 cursor-pointer transition-all duration-200"
                  >
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{task.itemName}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{task.storeName || 'Any Store'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-600 font-extrabold text-lg">₱{task.budget}</p>
                      <span className="text-[10px] tracking-wider font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase mt-1 inline-block">
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🛒</div>
                <p className="text-gray-400 italic">No active tasks yet. Head over to "Browse Requests" to find some work!</p>
              </div>
            )
          ) : (
            /* --- REQUESTER: LIST OF ACTIVE REQUESTS --- */
            activeRequestsList.length > 0 ? (
              <div className="space-y-4">
                {activeRequestsList.map((req) => (
                  <div 
                    key={req.id} 
                    onClick={() => navigate(`/request/${req.id}`)}
                    className="flex justify-between items-center p-5 border border-gray-100 rounded-xl hover:border-green-300 hover:bg-green-50/20 cursor-pointer transition-all duration-200"
                  >
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{req.itemName}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{req.storeName || 'Any Store'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 font-extrabold text-lg">₱{req.budget}</p>
                      <span className={`text-[10px] tracking-wider font-bold px-3 py-1 rounded-full uppercase mt-1 inline-block ${
                        req.status === 'Accepted' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-gray-400 italic">No active requests posted. Tap "Post New Request" to get started!</p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;