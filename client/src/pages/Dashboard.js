import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const { user } = useAuth();
  // Example stats, replace with real data as needed
  const stats = [
    { label: 'Active Requests', value: 0 },
    { label: 'Completed', value: 0 },
    { label: 'Rating', value: '5.0' },
  ];
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Student'}!</h1>
        <p className="mb-6 text-gray-600">Need something? Post a request and let shoppers help you out.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded shadow p-6 flex flex-col items-center">
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded shadow p-6 flex flex-col items-center justify-center">
            <div className="text-lg font-semibold mb-2">Post New Request</div>
            <p className="text-gray-500 mb-4 text-center">Need something from a store? Create a request and let shoppers help you.</p>
            <Link to="/post-request" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create Request</Link>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center justify-center">
            <div className="text-lg font-semibold mb-2">View Messages</div>
            <p className="text-gray-500 mb-4 text-center">Chat with shoppers about your requests.</p>
            <Link to="/messages" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Open Messages</Link>
          </div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="text-lg font-semibold mb-4">Recent Requests</div>
          <div className="flex flex-col items-center justify-center text-gray-400 py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3m10-5h3a1 1 0 011 1v4a1 1 0 01-1 1h-3m-6 4v4a1 1 0 001 1h2a1 1 0 001-1v-4m-6 4h6" /></svg>
            <div>No active requests yet</div>
            <div className="text-sm">Post your first request to get started!</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
