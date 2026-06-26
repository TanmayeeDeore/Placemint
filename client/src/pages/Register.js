import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(user.role === 'student' ? '/student' : user.role === 'teacher' ? '/teacher' : '/employer');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="auth-title">Create account</div>
        <div className="auth-sub">Join SnappHire</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {[['Full name','name','text'],['Email','email','email'],['Password','password','password']].map(([label,field,type]) => (
            <div className="form-group" key={field}>
              <label className="form-label">{label}</label>
              <input type={type} required className="form-input"
                value={form[field]} onChange={update(field)}/>
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">I am a…</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {['student','teacher','employer'].map(r => (
                <button type="button" key={r}
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  className={`tag-btn ${form.role === r ? 'selected' : ''}`}
                  style={{ textTransform: 'capitalize' }}>{r}</button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-8">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-16">
          Have an account? <Link to="/login" className="text-brand">Sign in</Link>
        </p>
      </div>
    </div>
  );
}