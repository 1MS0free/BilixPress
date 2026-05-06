import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createRequest } from '../services/requestService';
import Sidebar from '../components/Sidebar';

const PostRequestPage = () => {
  const navigate = useNavigate();
  
  // ✅ 1. Use the Nuclear-fixed hook for safety
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    storeName: '',
    budget: '',
    convenienceFee: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── NUCLEAR SAFETY CHECKS ──────────────────────────────────────────────────

  // Check 1: Still verifying who the user is
  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar user={null} />
        <main className="flex-1 p-10">Verifying session...</main>
      </div>
    );
  }

  // Check 2: No user found (User must be logged in to post)
  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar user={null} />
        <main className="flex-1 p-10 text-red-500">
          <p className="font-bold">Access Denied</p>
          <p>Please log in to create a new request.</p>
        </main>
      </div>
    );
  }

  // ── FORM LOGIC ─────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createRequest({
        ...formData,
        requesterId: user.uid,
        requesterEmail: user.email,
        status: 'Posted',
        createdAt: new Date(),
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to post request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />

      <main className="flex-1 p-10">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Post a New Request</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Item Name</label>
              <input
                type="text"
                name="itemName"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Store Name (Optional)</label>
              <input
                type="text"
                name="storeName"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description / Details</label>
              <textarea
                name="description"
                rows="3"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Item Budget (₱)</label>
                <input
                  type="number"
                  name="budget"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Convenience Fee (₱)</label>
                <input
                  type="number"
                  name="convenienceFee"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-md text-white font-bold transition ${
                isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
              }`}
            >
              {isSubmitting ? 'Posting...' : 'Confirm and Post Request'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PostRequestPage;