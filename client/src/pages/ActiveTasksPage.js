import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';

const ActiveTasksPage = () => {
  const { user } = useAuth();
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
              <li key={task.id} className="bg-white rounded shadow p-4 flex flex-col gap-2">
                <div className="font-semibold">{task.itemName}</div>
                <div>Status: <span className="font-bold">{task.status}</span></div>
                <div>Budget: ₱{task.budget}</div>
                <div>Convenience Fee: ₱{task.convenienceFee}</div>
                <a href={`/request/${task.id}`} className="text-blue-600 hover:underline">View Details</a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default ActiveTasksPage;
