import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email,    setEmail]   = useState('');
  const [password, setPass]    = useState('');
  const [error,    setError]   = useState('');
  const [loading,  setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'student' ? '/student' : user.role === 'teacher' ? '/teacher' : '/employer');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const DEMO = [
    { label: 'Student',  email: 'student1@demo.com', color: 'bg-brand-50 text-brand-600 border-brand-100' },
    { label: 'Officer',  email: 'teacher@demo.com',  color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { label: 'Employer', email: 'employer@demo.com', color: 'bg-orange-50 text-orange-700 border-orange-100' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-500 rounded-2xl mb-4 shadow-lg shadow-brand-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Place<span className="text-brand-500">mint</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Campus Placement Platform</p>
        </div>

        {/* Card */}
        <div className="card p-7">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-400 mb-6">Sign in to your account</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" required className="input" placeholder="you@college.edu"
                value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" required className="input" placeholder="••••••••"
                value={password} onChange={e => setPass(e.target.value)}/>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-base font-semibold rounded-xl mt-2">
              {loading
                ? <span className="flex items-center justify-center gap-2"><Spinner/>Signing in…</span>
                : 'Sign in'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-gray-50">
            <p className="text-xs text-gray-400 text-center mb-3">Try a demo account</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO.map(d => (
                <button key={d.label}
                  onClick={() => { setEmail(d.email); setPass('password123'); }}
                  className={`text-xs font-medium py-2 px-1 rounded-lg border transition-all ${d.color}`}>
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-300 text-center mt-2">password: password123</p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-500 font-medium hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}