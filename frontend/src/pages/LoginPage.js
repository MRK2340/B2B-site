import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Login failed. Please check your credentials.');
        return;
      }
      login(data.token, data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/portal');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background: 'linear-gradient(135deg, #003D7A 0%, #0080C8 50%, #FF8C00 100%)',
            backgroundSize: '200% 200%',
          }}
        />
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">i</span>
            </div>
            <span className="font-bold text-2xl">Whistle</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Welcome back</h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-sm">
            Access your iWhistle partner portal to manage applications, review program documents, and connect with our team.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold">i</span>
            </div>
            <span className="font-bold text-xl text-iwhistle-deep">Whistle</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-iwhistle-deep mb-2" data-testid="login-title">Sign in to your account</h1>
              <p className="text-gray-500 text-sm">Enter your credentials to access the partner portal</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                data-testid="login-error"
                className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="login-email-input"
                  placeholder="you@organization.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-iwhistle-blue focus:ring-2 focus:ring-iwhistle-blue/20 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="login-password-input"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 focus:border-iwhistle-blue focus:ring-2 focus:ring-iwhistle-blue/20 outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    data-testid="toggle-password-visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="login-submit-btn"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" data-testid="go-to-register-link" className="text-iwhistle-blue font-medium hover:text-iwhistle-deep transition-colors">
                  Register as a partner
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link to="/" data-testid="back-to-home-link" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                &larr; Back to home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
