import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';

const MessagesPage = () => {
  const { user } = useAuth();
  // Placeholder for messages UI
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 p-10 flex flex-col items-center justify-center">
        <div className="bg-white rounded shadow p-8 w-full max-w-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Messages</h2>
          <div className="text-gray-500">No conversations yet.<br />Messages will appear here when you accept or create requests.</div>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
