import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';

const PostRequestPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ itemName: '', description: '', storeName: '', budget: '', convenienceFee: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.itemName || !form.budget || !form.convenienceFee) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      await addDoc(collection(db, 'requests'), {
        ...form,
        budget: Number(form.budget),
        convenienceFee: Number(form.convenienceFee),
        status: 'Posted',
        requesterId: user.uid,
        shopperId: '',
        photoUrl: '',
        createdAt: serverTimestamp(),
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to post request.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 flex items-center justify-center p-10">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-6">Post an Errand Request</h2>
          {error && <div className="mb-4 text-red-500">{error}</div>}
          <div className="relative mb-4">
            <input
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded peer focus:outline-none focus:border-blue-500"
              placeholder=" "
              autoComplete="off"
            />
            <label className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none 
               ${form.itemName ? '-top-2.5 text-xs text-blue-600' : 'top-2 text-base text-gray-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600'}`}>
               Item Name
            </label>
          </div>
          <div className="relative mb-4">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full p-2 border rounded peer focus:outline-none focus:border-blue-500"
              placeholder=" "
              rows={3}
              autoComplete="off"
            />
           <label className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none 
               ${form.description ? '-top-2.5 text-xs text-blue-600' : 'top-2 text-base text-gray-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600'}`}>
               Description
            </label>
          </div>
          <div className="relative mb-4">
            <input
              name="storeName"
              value={form.storeName}
              onChange={handleChange}
              className="w-full p-2 border rounded peer focus:outline-none focus:border-blue-500"
              placeholder=" "
              autoComplete="off"
            />
           <label className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none 
              ${form.storeName ? '-top-2.5 text-xs text-blue-600' : 'top-2 text-base text-gray-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600'}`}>
               Store Name
            </label>
          </div>
          <div className="relative mb-4">
            <input
              name="budget"
              type="number"
              value={form.budget}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded peer focus:outline-none focus:border-blue-500"
              placeholder=" "
              autoComplete="off"
            />
           <label className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none 
               ${form.budget ? '-top-2.5 text-xs text-blue-600' : 'top-2 text-base text-gray-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600'}`}>
               Budget (₱)
            </label>
          </div>
          <div className="relative mb-6">
            <input
              name="convenienceFee"
              type="number"
              value={form.convenienceFee}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded peer focus:outline-none focus:border-blue-500"
              placeholder=" "
              autoComplete="off"
            />
            <label className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none 
              ${form.convenienceFee ? '-top-2.5 text-xs text-blue-600' : 'top-2 text-base text-gray-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600'}`}>
              Convenience Fee (₱)
            </label>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Post Request</button>
        </form>
      </main>
    </div>
  );
};

export default PostRequestPage;
