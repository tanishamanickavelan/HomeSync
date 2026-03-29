import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon } from '@heroicons/react/24/outline';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    joinType: 'create', // 'create' or 'join'
    family_name: '', invite_code: '', city: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleNext = e => {
    e.preventDefault();
    setError('');
    setStep(2);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: form.name, email: form.email, password: form.password,
        ...(form.joinType === 'create' ? { family_name: form.family_name, city: form.city } : { invite_code: form.invite_code })
      };
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const indianCities = ['Chennai', 'Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi', 'Coimbatore', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Surat', 'Lucknow'];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">MaBot</span>
        </div>

        <div className="card">
          {/* Steps */}
          <div className="flex items-center mb-6">
            {[1, 2].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${step >= s ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-400'}`}>{s}</div>
                {i < 1 && <div className={`flex-1 h-0.5 mx-2 ${step > 1 ? 'bg-teal-500' : 'bg-slate-700'}`} />}
              </React.Fragment>
            ))}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h2 className="font-display text-xl font-bold text-white mb-1">Personal Details</h2>
              <p className="text-slate-400 text-sm mb-4">Create your MaBot account</p>
              <div>
                <label className="label">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange}
                  className="input" placeholder="Ravi Sharma" required />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className="input" placeholder="ravi@example.com" required />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange}
                  className="input" placeholder="At least 6 characters" minLength={6} required />
              </div>
              <button type="submit" className="btn-primary w-full py-2.5">Continue →</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-display text-xl font-bold text-white mb-1">Family Setup</h2>
              <p className="text-slate-400 text-sm mb-4">Create or join a household</p>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setForm(p => ({ ...p, joinType: 'create' }))}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all text-left
                    ${form.joinType === 'create' ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}>
                  🏠 Create Family
                  <p className="text-xs text-slate-500 font-normal mt-0.5">Start new household</p>
                </button>
                <button type="button" onClick={() => setForm(p => ({ ...p, joinType: 'join' }))}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all text-left
                    ${form.joinType === 'join' ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}>
                  🔗 Join Family
                  <p className="text-xs text-slate-500 font-normal mt-0.5">Use invite code</p>
                </button>
              </div>

              {form.joinType === 'create' ? (
                <>
                  <div>
                    <label className="label">Family Name</label>
                    <input name="family_name" value={form.family_name} onChange={handleChange}
                      className="input" placeholder="The Sharma Family" required />
                  </div>
                  <div>
                    <label className="label">City</label>
                    <select name="city" value={form.city} onChange={handleChange} className="input">
                      <option value="">Select city</option>
                      {indianCities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="label">Invite Code</label>
                  <input name="invite_code" value={form.invite_code} onChange={handleChange}
                    className="input uppercase tracking-widest" placeholder="e.g. SHARMA" required />
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                  {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-slate-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
