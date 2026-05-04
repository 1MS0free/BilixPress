import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const LandingPage = () => (
  <div className="min-h-screen flex flex-col bg-[#1766e0] bg-gradient-to-br from-[#1766e0] to-[#2563eb]">
    <Navbar />
    <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 mt-12">Campus Errands Made Simple</h1>
      <p className="text-lg md:text-xl text-white mb-8 max-w-2xl">USTP's peer-to-peer errand platform. Students helping students get what they need, when they need it.</p>
      <div className="flex flex-row items-center justify-center space-x-4 mb-4">
        <Link to="/login" className="px-8 py-2 bg-white text-[#1766e0] font-semibold rounded-lg shadow hover:bg-gray-100 transition">Login</Link>
        <Link to="/register" className="px-8 py-2 bg-white text-[#1766e0] font-semibold rounded-lg shadow hover:bg-gray-100 transition">Register</Link>
      </div>
      <div className="text-white text-sm mt-2">🎓 Exclusively for USTP students</div>
    </main>
    <section className="bg-white w-full py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
      <p className="text-center text-gray-600 mb-10">Three simple steps to get what you need</p>
      <div className="flex flex-col md:flex-row items-center justify-center gap-12">
        <div className="flex flex-col items-center">
          <div className="bg-[#1766e0] text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold mb-2">1</div>
          <div className="font-semibold mb-1">Post Request</div>
          <div className="text-gray-500 text-center max-w-xs">Share what item you need and from which store</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-[#1766e0] text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold mb-2">2</div>
          <div className="font-semibold mb-1">Shopper Accepts</div>
          <div className="text-gray-500 text-center max-w-xs">A fellow student accepts and purchases your item</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-[#1766e0] text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold mb-2">3</div>
          <div className="font-semibold mb-1">Receive Your Item</div>
          <div className="text-gray-500 text-center max-w-xs">Get your item delivered right at campus</div>
        </div>
      </div>
    </section>
    <section className="bg-[#f8fafd] w-full py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-4">Why Choose Bilixpress?</h2>
      <p className="text-center text-gray-600 mb-10">Everything you need for campus errands</p>
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center w-64 mb-6 md:mb-0">
          <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center mb-2">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 6v6l4 2" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="font-semibold mb-1">Quick & Easy</div>
          <div className="text-gray-500 text-center">Post a request in seconds and get your items fast</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center w-64 mb-6 md:mb-0">
          <div className="bg-green-100 text-green-600 rounded-full w-10 h-10 flex items-center justify-center mb-2">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2"/><path d="M12 8v4l3 2" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="font-semibold mb-1">Student Community</div>
          <div className="text-gray-500 text-center">Support fellow USTP students while getting help</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center w-64">
          <div className="bg-purple-100 text-purple-600 rounded-full w-10 h-10 flex items-center justify-center mb-2">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#a855f7" strokeWidth="2"/><path d="M12 8v4l3 2" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="font-semibold mb-1">Safe & Verified</div>
          <div className="text-gray-500 text-center">USTP email verification and student ID required</div>
        </div>
      </div>
    </section>
    <footer className="bg-[#1766e0] w-full py-16 px-4 text-center">
      <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
      <p className="text-white mb-8">Join thousands of satisfied students using Bilixpress</p>
      <Link to="/register" className="inline-block px-8 py-3 bg-white text-[#1766e0] font-semibold rounded-lg shadow hover:bg-gray-100 transition">Create Free Account</Link>
    </footer>
  </div>
);

export default LandingPage;
