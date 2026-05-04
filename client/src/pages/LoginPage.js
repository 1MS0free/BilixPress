import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      const role = userDoc.exists() ? userDoc.data().role : 'user';
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white p-10 rounded-xl shadow w-full max-w-md flex flex-col">
          <h2 className="text-2xl font-bold mb-2 text-center">Welcome Back</h2>
          <div className="text-gray-500 text-center mb-6">Login to your Bilixpress account</div>
          {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
          <label className="text-sm font-semibold mb-1 mt-2 text-left">USTP Email</label>
          <div className="relative mb-4">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect width="20" height="20" rx="4" fill="#a3a3a3"/><path d="M4 8h16v2H4V8zm0 4h16v2H4v-2z" fill="#fff"/></svg>
            </span>
            <input type="email" placeholder="yourname@ustp.edu.ph" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 p-2 border rounded bg-gray-100" />
          </div>
          <label className="text-sm font-semibold mb-1 mt-2 text-left">Password</label>
          <div className="relative mb-4">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect width="20" height="20" rx="4" fill="#a3a3a3"/><path d="M6 12a6 6 0 1112 0 6 6 0 01-12 0zm6-4a4 4 0 100 8 4 4 0 000-8z" fill="#fff"/></svg>
            </span>
            <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-10 p-2 border rounded bg-gray-100" />
            <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-2.5 text-gray-400">
              {showPassword ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 13c-3.59 0-6.71-2.01-8.19-5C5.29 8.51 8.41 6.5 12 6.5s6.71 2.01 8.19 5c-1.48 2.99-4.6 5-8.19 5z" fill="#a3a3a3"/></svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 6.5c-3.59 0-6.71 2.01-8.19 5 .41.82.93 1.58 1.54 2.26l1.42-1.42A4.978 4.978 0 017 12c0-2.76 2.24-5 5-5 .88 0 1.71.23 2.42.63l1.42-1.42C18.71 8.51 15.59 6.5 12 6.5zm0 11c-5 0-9.27-3.11-11-7.5C2.73 7.61 7 4.5 12 4.5c2.21 0 4.29.72 6 1.93l-1.42 1.42A7.963 7.963 0 0012 6.5z" fill="#a3a3a3"/></svg>
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Remember me
            </label>
            <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">Forgot password?</Link>
          </div>
          <button type="submit" className="w-full bg-black text-white py-2 rounded-lg font-semibold mt-2 hover:bg-gray-800 transition">Login</button>
          <div className="mt-4 text-center text-sm">
            Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
