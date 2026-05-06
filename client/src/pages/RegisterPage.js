import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import Navbar from '../components/Navbar';

// ── Icons ──────────────────────────────────────────────────────────────────────
// Defined as constants outside the component so they never get recreated

const EyeOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.75 7.5 7.5 4.5 12 4.5c4.5 0 8.25 3 9.75 7.5-1.5 4.5-5.25 7.5-9.75 7.5-4.5 0-8.25-3-9.75-7.5z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/>
  </svg>
);

const EyeOff = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3.75 3.75 0 0112 8.25c2.07 0 3.75 1.68 3.75 3.75 0 .73-.21 1.41-.57 1.98m-1.2 1.2A3.75 3.75 0 018.25 12c0-.73.21-1.41.57-1.98"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.75 7.5 7.5 4.5 12 4.5c1.09 0 2.13.16 3.11.46m3.36 1.54C20.25 9.5 21.75 12 21.75 12c-1.5 4.5-5.25 7.5-9.75 7.5-1.09 0-2.13-.16-3.11-.46m-3.36-1.54C3.75 14.5 2.25 12 2.25 12"/>
  </svg>
);

// ── InputField — OUTSIDE RegisterPage so it's never recreated on re-render ────
const InputField = ({ label, icon, hint, children }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        {icon}
      </span>
      {children}
    </div>
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

// ── Role options — static, defined outside so never recreated ─────────────────
const roles = [
  {
    value: 'requester',
    label: 'Request Items',
    description: 'Get help from shoppers',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    value: 'shopper',
    label: 'Shop for Others',
    description: 'Earn convenience fees',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
];

// ── Field icons — static, defined outside ─────────────────────────────────────
const iconUser = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const iconEmail = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const iconId = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <path d="M16 10a2 2 0 11-4 0 2 2 0 014 0zM8 15h8"/>
  </svg>
);
const iconPhone = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.2 2 2 0 012.1 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.19 7.84a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
  </svg>
);
const iconLock = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

const inputClass = "w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent";

// ── Main Component ─────────────────────────────────────────────────────────────
const RegisterPage = () => {
  const [role,            setRole]            = useState('requester');
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [idNumber,        setIdNumber]        = useState('');
  const [phone,           setPhone]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error,           setError]           = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const navigate = useNavigate();

  const isUSTPEmail = (e) => e.endsWith('@ustp.edu.ph');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!isUSTPEmail(email)) { setError('Must be a valid USTP email address.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid, name, email, idNumber,
        phoneNumber: phone, role,
        createdAt: serverTimestamp(),
        ratingAverage: 0, ratingCount: 0,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <form
          onSubmit={handleRegister}
          className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-lg border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">Create Account</h2>
          <p className="text-gray-400 text-center text-sm mb-6">Join Bilixpress — USTP Students Only</p>

          {/* Role selector */}
          <div className="mb-5">
            <div className="text-sm font-semibold text-gray-700 mb-2">I want to</div>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(r => (
                <button
                  type="button"
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`flex flex-col items-center gap-2 border-2 rounded-xl p-4 transition-all
                    ${role === r.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                >
                  <span className={role === r.value ? 'text-blue-600' : 'text-gray-400'}>
                    {r.icon}
                  </span>
                  <span className="font-semibold text-sm">{r.label}</span>
                  <span className="text-xs text-gray-400">{r.description}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
              {error}
            </div>
          )}

          <InputField label="Full Name" icon={iconUser}>
            <input
              type="text"
              placeholder="Juan Dela Cruz"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className={inputClass}
            />
          </InputField>

          <InputField label="USTP Email" icon={iconEmail} hint="Must be a valid USTP email address">
            <input
              type="email"
              placeholder="juandelacruz@ustp.edu.ph"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </InputField>

          <InputField label="USTP ID Number" icon={iconId}>
            <input
              type="text"
              placeholder="2021-0001"
              value={idNumber}
              onChange={e => setIdNumber(e.target.value)}
              required
              className={inputClass}
            />
          </InputField>

          <InputField label="Phone Number" icon={iconPhone}>
            <input
              type="text"
              placeholder="+639123456789"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              className={inputClass}
            />
          </InputField>

          <InputField label="Password" icon={iconLock}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOpen /> : <EyeOff />}
            </button>
          </InputField>

          <InputField label="Confirm Password" icon={iconLock}>
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <EyeOpen /> : <EyeOff />}
            </button>
          </InputField>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm mt-2 transition"
          >
            Create Account
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
