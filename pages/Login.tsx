
import React, { useState, useEffect } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedEmail, setSavedEmail] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('bookly_saved_email');
    if (saved) {
      setSavedEmail(saved);
      setEmail(saved);
      setMode('signin');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!agreedToTerms) {
        setError('You must agree to the Terms of Service.');
        return;
      }
    }

    setLoading(true);
    // Save email for future logins
    localStorage.setItem('bookly_saved_email', email);

    setTimeout(() => {
      onLogin();
    }, 800);
  };

  const handleSwitchAccount = () => {
    setSavedEmail('');
    setEmail('');
    setPassword('');
    localStorage.removeItem('bookly_saved_email');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 flex items-center justify-center p-6" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif' }}>
      {/* Responsive container: stacked on mobile, side-by-side on desktop */}
      <div className="w-full max-w-5xl flex rounded-[40px] overflow-hidden shadow-2xl shadow-teal-100 bg-white">

        {/* Decorative Left Panel (desktop only) */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-teal-600 to-teal-500 p-12 w-[45%] text-white">
          <div>
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-white text-3xl font-black mb-8">
              <span>B.</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight leading-tight mb-4">
              Run your business.<br />
              <span className="text-teal-200">Smarter.</span>
            </h1>
            <p className="text-teal-100 text-sm leading-relaxed font-medium">
              AI-powered sales capture, inventory tracking, customer CRM, and real-time profit insights — all in one place.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: 'fa-wand-magic-sparkles', text: 'AI Order Capture from chat' },
              { icon: 'fa-chart-pie', text: 'Real-time profit dashboard' },
              { icon: 'fa-users', text: 'Customer tier management' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-xs">
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <span className="text-sm font-medium text-teal-100">{item.text}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-teal-300 font-bold uppercase tracking-widest">Bookly v2.0</p>
        </div>

        {/* Login Form Panel */}
        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center relative overflow-hidden">
          {/* Mobile decorative top bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 to-teal-400 lg:hidden"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

          <div className="relative z-10 space-y-8 max-w-sm mx-auto w-full">
            {/* Logo (mobile only) */}
            <div className="text-center space-y-3 lg:hidden">
              <div className="w-20 h-20 bg-teal-500 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl shadow-xl shadow-teal-200 rotate-6 mb-4 font-black">
                <span>B.</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bookly</h1>
              <p className="text-slate-500 text-sm font-medium">Performance audit & automated bookkeeping.</p>
            </div>

            {/* Desktop heading */}
            <div className="hidden lg:block">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back</h2>
              <p className="text-slate-500 text-sm font-medium mt-1">Sign in to your Bookly account</p>
            </div>

            {/* Sign-in / Sign-up Toggle */}
            <div className="flex bg-slate-100 rounded-2xl p-1">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'signin' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400'}`}
              >
                Sign Up
              </button>
            </div>

            {/* Saved email welcome back */}
            {mode === 'signin' && savedEmail && (
              <div className="bg-teal-50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Welcome back</p>
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[180px]">{savedEmail}</p>
                </div>
                <button type="button" onClick={handleSwitchAccount} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase">
                  Switch
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!(mode === 'signin' && savedEmail) && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <i className="fa-solid fa-envelope"></i>
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-300"
                      placeholder="name@business.com"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <i className="fa-solid fa-lock"></i>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-300"
                    placeholder={mode === 'signup' ? 'Create a password (min 6 chars)' : 'Enter your password'}
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <i className="fa-solid fa-lock"></i>
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-300"
                      placeholder="Re-enter your password"
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={e => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-teal-500 rounded"
                    />
                    <span className="text-xs text-slate-500 leading-relaxed">
                      I agree to the{' '}
                      <button type="button" onClick={() => setShowTerms(!showTerms)} className="text-teal-600 font-bold underline underline-offset-2">
                        Terms of Service
                      </button>{' '}
                      regarding AI usage, data processing, and data ownership.
                    </span>
                  </label>

                  {showTerms && (
                    <div className="bg-slate-50 rounded-2xl p-4 text-[11px] text-slate-500 leading-relaxed space-y-2 max-h-40 overflow-y-auto">
                      <p className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Terms of Service</p>
                      <p><strong>AI Usage:</strong> Bookly uses AI to extract order details from text you provide. AI-processed data is used solely to populate your sales records.</p>
                      <p><strong>Data Ownership:</strong> All business data remains your property. You may export or delete your data at any time.</p>
                      <p><strong>Data Storage:</strong> Your data is stored locally on your device. We employ industry-standard security practices.</p>
                      <p><strong>Privacy:</strong> We do not sell, rent, or share your personal or business data with any third party without your explicit consent.</p>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 text-xs font-bold rounded-xl px-4 py-3 flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (mode === 'signup' && !agreedToTerms)}
                className="w-full bg-teal-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-teal-200 hover:bg-teal-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                ) : (
                  <>
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    <i className="fa-solid fa-arrow-right"></i>
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              v2.0 • Bookly MVP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
