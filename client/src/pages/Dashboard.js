import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeRequests, setActiveRequests] = useState([]); // User as Requester
  const [activeTasks, setActiveTasks] = useState([]);       // User as Shopper
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // 1. Requests you posted (Requester Role)
    const qRequests = query(
      collection(db, 'requests'),
      where('requesterId', '==', user.uid),
      where('status', 'in', ['Posted', 'Accepted'])
    );

    // 2. Tasks you accepted (Shopper Role)
    const qTasks = query(
      collection(db, 'requests'),
      where('shopperId', '==', user.uid),
      where('status', '==', 'Accepted')
    );

    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      setActiveRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      setActiveTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 3. Overall Completed Count
    const qCompleted = query(
      collection(db, 'requests'),
      where('status', '==', 'Completed')
    );

    const unsubCompleted = onSnapshot(qCompleted, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data());
      const count = docs.filter(d => d.requesterId === user.uid || d.shopperId === user.uid).length;
      setCompletedCount(count);
    });

    return () => {
      unsubRequests();
      unsubTasks();
      unsubCompleted();
    };
  }, [user]);

  if (authLoading) return <div className="p-10">Loading...</div>;
  if (!user) return <div className="p-10 text-red-500">Please log in.</div>;

  // --- RATING LOGIC ---
  // If the user has a rating in Firestore, use it. Otherwise, default to 5.00 for new users.
  const displayRating = user.rating ? Number(user.rating).toFixed(2) : "5.00";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />

      <main className="flex-1 p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user.name || user.displayName || 'User'}!
          </h1>
          <p className="text-gray-500 italic">Ready to help someone today?</p>
        </header>

        {/* Stats Row */}
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
            {/* UPDATED RATING DISPLAY */}
            <p className="text-4xl font-bold text-yellow-500">{displayRating}</p>
            <p className="text-gray-500 font-medium">Rating</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <h3 className="text-xl font-bold mb-2 text-gray-800">Browse Requests</h3>
            <p className="text-gray-500 mb-6 font-light">
              Look for people nearby who need help with their shopping or deliveries.
            </p>
            <button 
              onClick={() => navigate('/browse')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
            >
              Go to Browse
            </button>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <h3 className="text-xl font-bold mb-2 text-gray-800">View Messages</h3>
            <p className="text-gray-500 mb-6 font-light">
              Stay in touch with your shoppers or requesters about ongoing tasks.
            </p>
            <button 
              onClick={() => navigate('/messages')}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 transition shadow-lg"
            >
              Open Messages
            </button>
          </div>
        </div>

        {/* Bottom Section - Recent Tasks */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Recent Tasks</h3>
          {activeTasks.length > 0 ? (
            <div className="space-y-4">
              {activeTasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => navigate(`/request/${task.id}`)}
                  className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                >
                  <div>
                    <p className="font-bold text-gray-800">{task.itemName}</p>
                    <p className="text-sm text-gray-500">{task.storeName || 'Any Store'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 font-bold">₱{task.budget}</p>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full uppercase">
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-4xl mb-4">🛒</div>
              <p className="text-gray-400 italic">No active tasks yet. Head to "Browse Requests" to find one!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;