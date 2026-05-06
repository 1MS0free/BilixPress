import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { completeRequest } from '../services/requestService';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';

const ActiveTasksPage = () => {
  const { user }  = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'requests'),
      where('shopperId', '==', user.uid),
      where('status', 'in', ['Accepted', 'In Progress'])
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  const handleComplete = async (taskId) => {
    try {
      await completeRequest(taskId);
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  if (!user) return <div className="p-8">Please log in to view your active tasks.</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 p-10">
        <h1 className="text-2xl font-bold mb-6">Active Tasks</h1>

        {tasks.length === 0 ? (
          <div className="text-gray-500">No active tasks found.</div>
        ) : (
          <ul className="space-y-4">
            {tasks.map(task => (
              <li key={task.id} className="bg-white rounded-xl shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                {/* Task info */}
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">{task.itemName}</div>
                  <div className="text-gray-500 text-sm">Store: {task.storeName || 'N/A'}</div>
                  <div className="text-gray-500 text-sm">
                    Budget: ₱{task.budget}&nbsp;|&nbsp;Fee: ₱{task.convenienceFee}
                  </div>
                  <span className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full text-green-600 bg-green-50 border border-green-200">
                    {task.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[170px]">

                  {/* View Details */}
                  <Link
                    to={`/request/${task.id}`}
                    className="text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
                  >
                    View Details
                  </Link>

                  {/* Chat with Requester */}
                  <Link
                    to={`/request/${task.id}`}
                    className="text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    💬 Chat with Requester
                  </Link>

                  {/* Mark as Done */}
                  <button
                    onClick={() => handleComplete(task.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    ✓ Mark as Done
                  </button>

                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default ActiveTasksPage;
