import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { id: 'student',  label: 'Student',           icon: '🎓', desc: 'Browse & apply to jobs' },
  { id: 'teacher',  label: 'Placement Officer',  icon: '🏫', desc: 'Manage placements' },
  { id: 'employer', label: 'Employer',           icon: '🏢', desc: 'Post jobs & hire' },
];

export default function Register() {
  const [form,    setForm]    = useState({ name: '', email: '', password: '', role: 'student' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(user.role === 'student' ? '/student' : user.role === 'teacher' ? '/teacher' : '/employer');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Place<span className="text-brand-500">mint</span></h1>
          <p className="text-sm text-gray-400 mt-1">Campus Placement Platform</p>
        </div>

        <div className="card p-7">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Create your account</h2>
          <p className="text-sm text-gray-400 mb-6">Join thousands of students and employers</p>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5 text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input type="text" required className="input" placeholder="Tanmayee Deore"
                value={form.name} onChange={update('name')}/>
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" required className="input" placeholder="you@college.edu"
                value={form.email} onChange={update('email')}/>
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" required minLength={6} className="input" placeholder="Min. 6 characters"
                value={form.password} onChange={update('password')}/>
            </div>

            <div>
              <label className="label">I am a…</label>
              <div className="space-y-2">
                {ROLES.map(r => (
                  <label key={r.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                      ${form.role === r.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <input type="radio" name="role" value={r.id} className="hidden"
                      checked={form.role === r.id} onChange={update('role')}/>
                    <span className="text-xl">{r.icon}</span>
                    <div>
                      <p className={`text-sm font-medium ${form.role === r.id ? 'text-brand-600' : 'text-gray-700'}`}>
                        {r.label}
                      </p>
                      <p className="text-xs text-gray-400">{r.desc}</p>
                    </div>
                    {form.role === r.id && (
                      <div className="ml-auto w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-base font-semibold rounded-xl mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}