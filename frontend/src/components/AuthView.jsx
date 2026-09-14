import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Wallet, ArrowRight, ShieldCheck, PieChart, Smartphone, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthView = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  const { login, signup } = useAuth();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isOffline || !navigator.onLine) {
      setError('You are currently offline. Please connect to the internet to sign in or register.');
      return;
    }

    if (!email || !password || (isSignup && !name)) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setSubmitting(true);
      if (isSignup) {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || !navigator.onLine) {
        setError('Unable to connect to the cloud server. Please check your internet connection.');
      } else {
        setError(msg || 'Authentication failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    if (isOffline || !navigator.onLine) {
      setError('Demo login requires an internet connection for the first sign in.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      try {
        await login('demo@example.com', 'demo123');
      } catch {
        await signup('Demo User', 'demo@example.com', 'demo123');
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-700/30">
        
        {/* Left: Branding & Value Proposition */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white relative overflow-hidden">
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-white/15 rounded-xl text-xs font-semibold backdrop-blur-md mb-6">
              <Wallet className="w-4 h-4" />
              ExpenseTracker PWA
            </div>
            <h1 className="text-3xl font-extrabold leading-tight">
              Master Your Money with Precision.
            </h1>
            <p className="text-emerald-100/90 text-sm mt-3">
              Track cash, UPI, cards, analyze monthly trends, and keep your records completely private with offline support.
            </p>
          </div>

          {/* Features Highlights */}
          <div className="space-y-4 my-8">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-xl shrink-0 mt-0.5">
                <PieChart className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <p className="text-xs font-bold">Deep Visual Analytics</p>
                <p className="text-[11px] text-emerald-100/80">Weekly, monthly, category and payment breakdowns.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-xl shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <p className="text-xs font-bold">Offline-Ready PWA</p>
                <p className="text-[11px] text-emerald-100/80">Install on mobile or desktop and work without internet.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-xl shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <p className="text-xs font-bold">Secure User Isolation</p>
                <p className="text-[11px] text-emerald-100/80">Your financial data is encrypted and strictly scoped to you.</p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-emerald-200/80">
            © 2026 ExpenseTracker • 100% Free & Open Stack
          </p>
        </div>

        {/* Right: Auth Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-900">ExpenseTracker</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isSignup
                ? 'Sign up to begin tracking your personal finances'
                : 'Enter your credentials to access your dashboard'}
            </p>
          </div>

          {/* Offline alert banner */}
          {isOffline && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800 animate-fade-in">
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
              <span>You are currently offline. Connect to Wi-Fi/data to log in or create an account.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
                {error}
              </div>
            )}

            {isSignup && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ajeet Kumar"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? 'Please wait...' : isSignup ? 'Sign Up' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={submitting}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-4 py-2 rounded-xl transition-colors w-full text-center"
            >
              ⚡ Quick Demo Login (1-Click)
            </button>
          </div>

          {/* Switch Tab */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              {isSignup ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError('');
                }}
                className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                {isSignup ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
