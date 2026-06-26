import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const BRANCHES = ['CSE','ECE','ME','EE','IT','Civil','Chemical','Other'];

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'', company:'', description:'', location:'', ctc:'', jobType:'full-time', minCgpa:'0', branches:[], deadline:'' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const toggleBranch = b =>
    setForm(p => ({ ...p, branches: p.branches.includes(b) ? p.branches.filter(x=>x!==b) : [...p.branches, b] }));

  const submit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/jobs', { title:form.title, company:form.company, description:form.description, location:form.location, ctc:form.ctc, jobType:form.jobType, deadline:form.deadline, eligibility:{ minCgpa:Number(form.minCgpa), branches:form.branches } });
      navigate('/employer');
    } catch (err) { setError(err.response?.data?.message || 'Failed to post job'); }
    finally { setSaving(false); }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Post a new job</h1>
      <p className="text-muted text-sm mb-20">Students matching your eligibility criteria will see this listing.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={submit}>
        {/* Job details */}
        <div className="card mb-12">
          <div className="text-sm" style={{ fontWeight: 500, marginBottom: 14 }}>Job details</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Job title *</label>
              <input required className="form-input" placeholder="Software Engineer" value={form.title} onChange={update('title')}/>
            </div>
            <div className="form-group">
              <label className="form-label">Company *</label>
              <input required className="form-input" placeholder="TechCorp" value={form.company} onChange={update('company')}/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Job description *</label>
            <textarea required className="form-textarea" rows={5}
              placeholder="Describe the role, responsibilities, and what you're looking for…"
              value={form.description} onChange={update('description')}/>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" placeholder="Bangalore / Remote" value={form.location} onChange={update('location')}/>
            </div>
            <div className="form-group">
              <label className="form-label">CTC / Stipend</label>
              <input className="form-input" placeholder="12 LPA / 25k/month" value={form.ctc} onChange={update('ctc')}/>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Job type</label>
              <select className="form-select" value={form.jobType} onChange={update('jobType')}>
                <option value="full-time">Full-time</option>
                <option value="internship">Internship</option>
                <option value="part-time">Part-time</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Application deadline *</label>
              <input required type="date" className="form-input" min={today} value={form.deadline} onChange={update('deadline')}/>
            </div>
          </div>
        </div>

        {/* Eligibility */}
        <div className="card mb-12">
          <div className="text-sm" style={{ fontWeight: 500, marginBottom: 14 }}>Eligibility criteria</div>
          <div className="form-group">
            <label className="form-label">Minimum CGPA: <strong className="text-brand">{form.minCgpa}</strong> (0 = no requirement)</label>
            <input type="range" min="0" max="10" step="0.5" value={form.minCgpa} onChange={update('minCgpa')}
              style={{ width: '100%', accentColor: '#534AB7' }}/>
          </div>
          <div className="form-group">
            <label className="form-label">Eligible branches <span className="text-muted">(none checked = all branches)</span></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {BRANCHES.map(b => (
                <button type="button" key={b}
                  className={`tag-btn ${form.branches.includes(b) ? 'selected' : ''}`}
                  onClick={() => toggleBranch(b)}>{b}</button>
              ))}
            </div>
            {form.branches.length === 0 && <p className="text-xs text-muted mt-8">All branches eligible</p>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
            {saving ? 'Posting…' : 'Post job'}
          </button>
        </div>
      </form>
    </div>
  );
}