import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import Navbar from '../components/Navbar';


const roles = [
  {
    value: 'requester',
    label: 'Request Items',
    description: 'Get help from shoppers',
    icon: (
      <span className="inline-block bg-blue-100 text-blue-600 rounded-full p-2 mr-2">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#2563eb"/></svg>
      </span>
    ),
  },
  {
    value: 'shopper',
    label: 'Shop for Others',
    description: 'Earn convenience fees',
    icon: (
      <span className="inline-block bg-blue-100 text-blue-600 rounded-full p-2 mr-2">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#22c55e"/></svg>
      </span>
    ),
  },
];

const RegisterPage = () => {
  const [role, setRole] = useState('requester');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const isUSTPEmail = (email) => email.endsWith('@ustp.edu.ph');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!isUSTPEmail(email)) {
      setError('Must be a valid USTP email address.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        name,
        email,
        idNumber,
        phoneNumber: phone,
        role,
        createdAt: serverTimestamp(),
        ratingAverage: 0,
        ratingCount: 0,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <form onSubmit={handleRegister} className="bg-white p-10 rounded-xl shadow w-full max-w-lg flex flex-col border border-gray-200">
          <h2 className="text-2xl font-bold mb-1 text-center">Create Account</h2>
          <div className="text-gray-500 text-center mb-6">Join Bilixpress - USTP Students Only</div>
          <div className="mb-4">
            <div className="font-semibold mb-2">I want to</div>
            <div className="flex gap-4">
              {roles.map(r => (
                <button
                  type="button"
                  key={r.value}
                  className={`flex-1 flex flex-col items-center border rounded-lg p-4 transition ${role === r.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                  onClick={() => setRole(r.value)}
                >
                  {r.icon}
                  <span className="font-semibold text-base mb-1">{r.label}</span>
                  <span className="text-xs text-gray-500">{r.description}</span>
                </button>
              ))}
            </div>
          </div>
          {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
          <label className="text-sm font-semibold mb-1 mt-2 text-left">Full Name</label>
          <input type="text" placeholder="Juan Dela Cruz" value={name} onChange={e => setName(e.target.value)} required className="w-full mb-3 p-2 border rounded bg-gray-100" />
          <label className="text-sm font-semibold mb-1 mt-2 text-left">USTP Email</label>
          <div className="relative mb-1">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#2563eb"/></svg>
            </span>
            <input type="email" placeholder="juandelacruz@ustp.edu.ph" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 p-2 border rounded bg-gray-100" />
          </div>
          <div className="text-xs text-gray-400 mb-2">Must be a valid USTP email address</div>
          <label className="text-sm font-semibold mb-1 mt-2 text-left">USTP ID Number</label>
          <div className="relative mb-3">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#a3a3a3"/></svg>
            </span>
            <input type="text" placeholder="2021-0001" value={idNumber} onChange={e => setIdNumber(e.target.value)} required className="w-full pl-10 p-2 border rounded bg-gray-100" />
          </div>
          <label className="text-sm font-semibold mb-1 mt-2 text-left">Phone Number</label>
          <div className="relative mb-3">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#22c55e"/></svg>
            </span>
            <input type="text" placeholder="+639123456789" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full pl-10 p-2 border rounded bg-gray-100" />
          </div>
          <label className="text-sm font-semibold mb-1 mt-2 text-left">Password</label>
          <div className="relative mb-3">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#a3a3a3"/></svg>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full pl-10 p-2 border rounded bg-gray-100 pr-10"
            />
            <span
              className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={0}
              role="button"
              aria-label="Show/hide password"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.75 7.5 7.5 4.5 12 4.5c4.5 0 8.25 3 9.75 7.5-1.5 4.5-5.25 7.5-9.75 7.5-4.5 0-8.25-3-9.75-7.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3.75 3.75 0 0112 8.25c2.07 0 3.75 1.68 3.75 3.75 0 .73-.21 1.41-.57 1.98m-1.2 1.2A3.75 3.75 0 018.25 12c0-.73.21-1.41.57-1.98" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.75 7.5 7.5 4.5 12 4.5c1.09 0 2.13.16 3.11.46m3.36 1.54C20.25 9.5 21.75 12 21.75 12c-1.5 4.5-5.25 7.5-9.75 7.5-1.09 0-2.13-.16-3.11-.46m-3.36-1.54C3.75 14.5 2.25 12 2.25 12" /></svg>
              )}
            </span>
          </div>
          <label className="text-sm font-semibold mb-1 mt-2 text-left">Confirm Password</label>
          <div className="relative mb-3">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#a3a3a3"/></svg>
            </span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-10 p-2 border rounded bg-gray-100 pr-10"
            />
            <span
              className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
              onClick={() => setShowConfirmPassword((v) => !v)}
              tabIndex={0}
              role="button"
              aria-label="Show/hide confirm password"
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.75 7.5 7.5 4.5 12 4.5c4.5 0 8.25 3 9.75 7.5-1.5 4.5-5.25 7.5-9.75 7.5-4.5 0-8.25-3-9.75-7.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3.75 3.75 0 0112 8.25c2.07 0 3.75 1.68 3.75 3.75 0 .73-.21 1.41-.57 1.98m-1.2 1.2A3.75 3.75 0 018.25 12c0-.73.21-1.41.57-1.98" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.75 7.5 7.5 4.5 12 4.5c1.09 0 2.13.16 3.11.46m3.36 1.54C20.25 9.5 21.75 12 21.75 12c-1.5 4.5-5.25 7.5-9.75 7.5-1.09 0-2.13-.16-3.11-.46m-3.36-1.54C3.75 14.5 2.25 12 2.25 12" /></svg>
              )}
            </span>
          </div>
          <button type="submit" className="w-full bg-black text-white py-2 rounded-lg font-semibold mt-2 hover:bg-gray-800 transition">Register</button>
          <div className="mt-4 text-center text-sm">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
