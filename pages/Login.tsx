
import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-sm p-8 rounded-[40px] shadow-2xl shadow-indigo-100 relative overflow-hidden">

        {/* Decorative */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10 space-y-10">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl shadow-xl rotate-6 mb-6">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              Bookly.
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Simplified sales automation for modern vendors.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email Access</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <i className="fa-solid fa-envelope"></i>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300"
                  placeholder="name@business.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <i className="fa-solid fa-circle-notch animate-spin"></i>
              ) : (
                <>
                  Connect Securely
                  <i className="fa-solid fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            v1.0.0 • Mobile MVP
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
