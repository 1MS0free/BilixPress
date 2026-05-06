import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
// NEW: Professional Icons
import { 
  LayoutDashboard, 
  Package, 
  CheckCircle2, 
  Star, 
  PlusCircle, 
  MessageSquare, 
  ArrowRight,
  Search
} from 'lucide-react';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeItemsList, setActiveItemsList] = useState([]); 
  const [completedCount, setCompletedCount] = useState(0);
  const [avgRating, setAvgRating] = useState("0.00");
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    const role = user?.role || localStorage.getItem('active_user_role');
    const isShopperRole = role === 'shopper';

    let qActive, qComp;
    if (isShopperRole) {
      qActive = query(collection(db, 'requests'), where('shopperId', '==', user.uid), where('status', '==', 'Accepted'));
      qComp = query(collection(db, 'requests'), where('shopperId', '==', user.uid), where('status', '==', 'Completed'));
    } else {
      qActive = query(collection(db, 'requests'), where('requesterId', '==', user.uid), where('status', 'in', ['Posted', 'Accepted']));
      qComp = query(collection(db, 'requests'), where('requesterId', '==', user.uid), where('status', '==', 'Completed'));
    }

    const unsubActive = onSnapshot(qActive, (s) => setActiveItemsList(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubComp = onSnapshot(qComp, (s) => setCompletedCount(s.docs.length));
    const qRatings = query(collection(db, 'ratings'), where('revieweeId', '==', user.uid));
    
    const unsubRatings = onSnapshot(qRatings, (snapshot) => {
      if (!snapshot.empty) {
        const ratingsArray = snapshot.docs.map(doc => doc.data().rating);
        const total = ratingsArray.reduce((acc, curr) => acc + curr, 0);
        setAvgRating((total / ratingsArray.length).toFixed(2));
        setTotalReviews(ratingsArray.length);
      } else {
        setAvgRating(user?.rating ? Number(user.rating).toFixed(2) : "0.00");
        setTotalReviews(user?.reviewCount || 0);
      }
    });

    return () => { unsubActive(); unsubComp(); unsubRatings(); };
  }, [user]);

  if (authLoading) return null;

  const isShopper = (user?.role || localStorage.getItem('active_user_role')) === 'shopper';

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]"> {/* Slate-50 background */}
      <Sidebar user={user} />

      <main className="flex-1 p-8 max-w-6xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="w-6 h-6 text-indigo-600" />
            <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Overview</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-slate-500 mt-1">
            {isShopper ? "Check your latest tasks and delivery updates." : "Review your active requests and shopper messages."}
          </p>
        </header>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard 
            label={isShopper ? 'Active Tasks' : 'Active Items'} 
            value={activeItemsList.length} 
            icon={<Package className="w-5 h-5 text-blue-600" />} 
            color="blue"
          />
          <StatCard 
            label="Completed" 
            value={completedCount} 
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} 
            color="emerald"
          />
          <StatCard 
            label="Rating" 
            value={avgRating} 
            icon={<Star className="w-5 h-5 text-amber-500" />} 
            subValue={`Based on ${totalReviews} reviews`}
            color="amber"
          />
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {isShopper ? (
            <>
              <ActionCard 
                title="Browse Requests"
                desc="Find new shopping tasks in your area."
                icon={<Search className="w-8 h-8" />}
                onClick={() => navigate('/browse')}
                variant="primary"
              />
              <ActionCard 
                title="View Messages"
                desc="Chat with your requesters about deliveries."
                icon={<MessageSquare className="w-8 h-8" />}
                onClick={() => navigate('/messages')}
                variant="secondary"
              />
            </>
          ) : (
            <>
              <ActionCard 
                title="Post New Request"
                desc="Get someone to shop for you today."
                icon={<PlusCircle className="w-8 h-8" />}
                onClick={() => navigate('/post-request')}
                variant="primary"
              />
              <ActionCard 
                title="View Messages"
                desc="Coordinate with your active shoppers."
                icon={<MessageSquare className="w-8 h-8" />}
                onClick={() => navigate('/messages')}
                variant="secondary"
              />
            </>
          )}
        </div>

        {/* LIST SECTION */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-400" />
              {isShopper ? 'Active Tasks' : 'Active Requests'}
            </h3>
          </div>
          <div className="p-2">
            {activeItemsList.length > 0 ? (
              activeItemsList.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/request/${item.id}`)}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                      {item.itemName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.itemName}</p>
                      <p className="text-xs text-slate-400 uppercase font-medium tracking-widest">{item.storeName || 'Any Store'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">₱{item.budget}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold uppercase tracking-tighter">
                        {item.status}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 italic">No active {isShopper ? 'tasks' : 'requests'} at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Reusable Professional Components
const StatCard = ({ label, value, icon, subValue, color }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <h2 className="text-3xl font-black text-slate-900">{value}</h2>
      </div>
      <div className={`p-2 rounded-lg bg-${color}-50`}>
        {icon}
      </div>
    </div>
    {subValue && <p className="text-[10px] text-slate-400 mt-2 font-medium">{subValue}</p>}
  </div>
);

const ActionCard = ({ title, desc, icon, onClick, variant }) => (
  <button 
    onClick={onClick}
    className={`p-8 rounded-2xl border flex flex-col items-center text-center transition-all shadow-sm hover:shadow-md active:scale-[0.98]
      ${variant === 'primary' 
        ? 'bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700' 
        : 'bg-white border-slate-200 text-slate-900 hover:border-indigo-300'}`}
  >
    <div className={`mb-4 ${variant === 'primary' ? 'text-indigo-200' : 'text-indigo-600'}`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-1">{title}</h3>
    <p className={`text-sm ${variant === 'primary' ? 'text-indigo-100' : 'text-slate-500'}`}>{desc}</p>
  </button>
);

export default Dashboard;