import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuth, authModalMode, login, register } = useAuth();
  const [mode, setMode] = useState(authModalMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('guest');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync mode with context
  React.useEffect(() => {
    setMode(authModalMode);
    setError('');
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (userType) => {
    setError('');
    setLoading(true);
    try {
      if (userType === 'host') {
        await login('host@luxuryretreats.com', 'password123');
      } else {
        await login('sophia@traveller.io', 'password123');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuth}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        <div className="min-h-full flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <button
                onClick={closeAuth}
                aria-label="Close authentication modal"
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
              </button>
              <h3 className="font-semibold text-base text-[#222222]">
                {mode === 'login' ? 'Log in' : 'Sign up'}
              </h3>
              <div className="w-8" />
            </div>

            {/* Content */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#222222] mb-1">
                Welcome to Airbnb
              </h2>
              <p className="text-xs text-[#717171] mb-5">
                Experience award-winning architecture and bespoke stays worldwide.
              </p>

              {/* Quick Demo Access Bar */}
              <div className="mb-5 p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-[11px] font-semibold text-gray-600 block mb-2 flex items-center gap-1">
                  <ShieldCheck size={14} className="text-[#FF385C]" /> Quick Demo Access:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('host')}
                    disabled={loading}
                    className="py-1.5 px-3 rounded-xl bg-white border border-gray-300 hover:border-black text-xs font-semibold text-gray-800 transition-colors shadow-2xs"
                  >
                    Demo Host (Elena)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('guest')}
                    disabled={loading}
                    className="py-1.5 px-3 rounded-xl bg-white border border-gray-300 hover:border-black text-xs font-semibold text-gray-800 transition-colors shadow-2xs"
                  >
                    Demo Guest (Sophia)
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Sophia Chen"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 focus:border-black outline-none text-sm font-medium"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 focus:border-black outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 focus:border-black outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('guest')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                          role === 'guest'
                            ? 'border-black bg-gray-50 text-black'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        Guest (Traveler)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('host')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                          role === 'host'
                            ? 'border-black bg-gray-50 text-black'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        Host (Property Owner)
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#FF385C] to-[#E61E4D] hover:opacity-95 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : mode === 'login' ? 'Log in' : 'Create Account'}
                </button>
              </form>

              <div className="mt-5 text-center text-xs text-gray-600">
                {mode === 'login' ? (
                  <span>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="font-bold text-black underline hover:text-[#FF385C]"
                    >
                      Sign up
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-bold text-black underline hover:text-[#FF385C]"
                    >
                      Log in
                    </button>
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
