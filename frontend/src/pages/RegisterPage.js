import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', organization: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, organization: form.organization, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Registration failed. Please try again.');
        return;
      }
      login(data.token, data.user);
      navigate('/portal');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = form.password.length === 0 ? null : form.password.length < 6 ? 'weak' : form.password.length < 10 ? 'fair' : 'strong';

  return (
    <div className="min-h-screen flex" data-testid="register-page">
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
          <h2 className="text-4xl font-bold mb-4">Join our partner network</h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-sm mb-8">
            Register your organization to access the iWhistle Partner Portal — program details, documents, and your partnership application.
          </p>
          <div className="space-y-3">
            {['Access the full Partnership Portal', 'Review program documents & pricing', 'Submit your partnership application', 'Track your application status'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-slate-900">
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
            <span className="font-bold text-xl text-iwhistle-deep dark:text-white">Whistle</span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-iwhistle-deep dark:text-white mb-2" data-testid="register-title">Create your partner account</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Get access to the iWhistle Partnership Portal</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                data-testid="register-error"
                className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                  <input
                    id="name" name="name" type="text"
                    value={form.name} onChange={handleChange} required
                    data-testid="register-name-input"
                    placeholder="John Smith"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-iwhistle-blue focus:ring-2 focus:ring-iwhistle-blue/20 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Organization</label>
                  <input
                    id="organization" name="organization" type="text"
                    value={form.organization} onChange={handleChange} required
                    data-testid="register-org-input"
                    placeholder="Basketball Association"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-iwhistle-blue focus:ring-2 focus:ring-iwhistle-blue/20 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <input
                  id="email" name="email" type="email"
                  value={form.email} onChange={handleChange} required
                  data-testid="register-email-input"
                  placeholder="you@organization.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-iwhistle-blue focus:ring-2 focus:ring-iwhistle-blue/20 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    id="password" name="password" type={showPassword ? 'text' : 'password'}
                    value={form.password} onChange={handleChange} required
                    data-testid="register-password-input"
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-iwhistle-blue focus:ring-2 focus:ring-iwhistle-blue/20 outline-none transition-all text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordStrength && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex gap-1">
                      {['weak', 'fair', 'strong'].map((s, i) => (
                        <div key={s} className={`h-1 w-8 rounded-full ${
                          passwordStrength === 'weak' && i === 0 ? 'bg-red-400' :
                          passwordStrength === 'fair' && i <= 1 ? 'bg-amber-400' :
                          passwordStrength === 'strong' ? 'bg-green-400' : 'bg-gray-200'
                        }`} />
                      ))}
                    </div>
                    <span className={`text-xs ${passwordStrength === 'weak' ? 'text-red-500' : passwordStrength === 'fair' ? 'text-amber-500' : 'text-green-500'}`}>
                      {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                <input
                  id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword} onChange={handleChange} required
                  data-testid="register-confirm-password-input"
                  placeholder="Re-enter your password"
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all text-sm dark:bg-slate-700 dark:text-gray-100 ${
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 dark:border-slate-600 focus:border-iwhistle-blue focus:ring-2 focus:ring-iwhistle-blue/20'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="register-submit-btn"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" data-testid="go-to-login-link" className="text-iwhistle-blue font-medium hover:text-iwhistle-deep transition-colors">
                  Sign in
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
