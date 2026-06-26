import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'student' ? '/student' : user.role === 'teacher' ? '/teacher' : '/employer');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const fill = (e, p) => { setEmail(e); setPassword(p); };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Sign in to SnappHire</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" required className="form-input"
              value={email} onChange={e => setEmail(e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" required className="form-input"
              value={password} onChange={e => setPassword(e.target.value)}/>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-8">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <hr className="divider"/>
        <div className="text-xs text-muted text-center mb-8">Demo accounts (password: password123)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[['Student','student1@demo.com'],['Teacher','teacher@demo.com'],['Employer','employer@demo.com']]
            .map(([label, e]) => (
              <button key={label} onClick={() => fill(e, 'password123')}
                className="btn btn-outline btn-sm">{label}</button>
            ))}
        </div>

        <p className="text-center text-sm text-muted mt-16">
          No account? <Link to="/register" className="text-brand">Register</Link>
        </p>
      </div>
    </div>
  );
}


