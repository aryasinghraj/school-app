import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiRequest } from '../lib/api';
import { ShieldCheck, MapPin, KeyRound, Mail, ArrowRight, UserCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('error', 'Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      login(data.token, data.user);
      showToast('success', `Welcome back, ${data.user.name}!`);
    } catch (err: any) {
      showToast('error', err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50">
        
        {/* Left Branding Side */}
        <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 p-8 lg:p-12 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white text-brand-700 flex items-center justify-center font-extrabold text-2xl shadow-lg">
                JPS
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Jaipur Public School</h1>
                <p className="text-xs text-brand-200 flex items-center gap-1 font-medium mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>Shri Dungargarh, Rajasthan</span>
                </p>
              </div>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold leading-tight mt-8">
              Complete School Management System
            </h2>
            <p className="text-sm text-brand-100/80 mt-3 leading-relaxed">
              Empowering educators, students, and parents with real-time academic records, attendance tracking, report cards, fee management, and school notices.
            </p>
          </div>

          <div className="mt-12 pt-6 border-t border-brand-700/50 flex items-center justify-between text-xs text-brand-300 font-medium">
            <span>© 2026 Jaipur Public School</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure Portal</span>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="bg-white p-8 lg:p-12 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sign In to Portal</h2>
            <p className="text-xs text-gray-500 mt-1">Select your account or enter credentials below</p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@jaipurpublic.edu.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-gray-400 absolute left-3.5 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* Quick Demo Credentials (Development Only) */}
          {import.meta.env.DEV && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-3">
                <UserCheck className="w-4 h-4 text-brand-600" /> Quick Demo Accounts (1-Click Fill):
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDemoAccount('admin@jaipurpublic.edu.in', 'admin123')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded-lg font-semibold text-gray-700 text-left transition-colors"
                >
                  👑 School Admin
                </button>
                <button
                  type="button"
                  onClick={() => setDemoAccount('teacher@jaipurpublic.edu.in', 'teacher123')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded-lg font-semibold text-gray-700 text-left transition-colors"
                >
                  👨‍🏫 Teacher
                </button>
                <button
                  type="button"
                  onClick={() => setDemoAccount('student@jaipurpublic.edu.in', 'student123')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded-lg font-semibold text-gray-700 text-left transition-colors"
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => setDemoAccount('parent@jaipurpublic.edu.in', 'parent123')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded-lg font-semibold text-gray-700 text-left transition-colors"
                >
                  👨‍👩‍👦 Parent
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
