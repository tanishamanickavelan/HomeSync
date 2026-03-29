import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => setForm({ email, password: 'password123' });

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-800 via-slate-900 to-teal-900/20 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(20,184,166,0.08),transparent_60%)]" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/20">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-3">MaBot</h1>
          <p className="text-teal-400 font-medium mb-2">Household Coordination Platform</p>
          <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
            Multi-agent orchestration for modern Indian families. Manage tasks, bills, groceries and home services — all in one place.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 max-w-xs mx-auto text-left">
            {[
              { emoji: '🤖', label: 'AI Agents', desc: 'Smart automation' },
              { emoji: '📋', label: 'Task Manager', desc: 'Family coordination' },
              { emoji: '🛒', label: 'Grocery Tracker', desc: 'Never run out' },
              { emoji: '💰', label: 'Bill Reminders', desc: 'Stay on track' },
            ].map(f => (
              <div key={f.label} className="bg-slate-700/30 rounded-xl p-3 border border-slate-700/50">
                <div className="text-xl mb-1">{f.emoji}</div>
                <div className="text-xs font-medium text-slate-200">{f.label}</div>
                <div className="text-xs text-slate-500">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">MaBot</span>
          </div>

          <h2 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-6">Sign in to your household dashboard</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                className="input" placeholder="ravi@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  className="input pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-5 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-2 font-medium">🧪 Demo Accounts</p>
            <div className="space-y-1.5">
              <button onClick={() => fillDemo('ravi@example.com')}
                className="w-full text-left text-xs px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 transition-all">
                👨 Admin: ravi@example.com
              </button>
              <button onClick={() => fillDemo('priya@example.com')}
                className="w-full text-left text-xs px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 transition-all">
                👩 Member: priya@example.com
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Password: password123</p>
          </div>

          <p className="text-center text-sm text-slate-400 mt-5">
            New to MaBot?{' '}
            <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
