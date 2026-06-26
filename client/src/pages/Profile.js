import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const BRANCHES = ['CSE','ECE','ME','EE','IT','Civil','Chemical','Other'];

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ branch:'', cgpa:'', skills:'', bio:'', linkedIn:'', github:'', phone:'' });
  const [resumeUrl, setResumeUrl] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get(`/profile/${user.id}`).then(r => {
      const p = r.data.profile;
      setResumeUrl(p.resumeUrl || '');
      setForm({ branch: p.branch||'', cgpa: p.cgpa||'', skills: (p.skills||[]).join(', '), bio: p.bio||'', linkedIn: p.linkedIn||'', github: p.github||'', phone: p.phone||'' });
    }).catch(console.error);
  }, [user]);

  const update = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const save = async e => {
    e.preventDefault(); setSaving(true); setMsg('');
    try {
      await api.put('/profile', { ...form, cgpa: Number(form.cgpa), skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) });
      setMsg('Profile saved!');
    } catch (err) { setMsg(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const uploadResume = async e => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); setMsg('');
    const fd = new FormData(); fd.append('resume', file);
    try {
      const { data } = await api.post('/profile/upload-resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResumeUrl(data.resumeUrl); setMsg('Resume uploaded!');
    } catch (err) { setMsg(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const fields = ['branch','cgpa','skills','bio','phone'];
  const filled  = fields.filter(f => form[f]).length;
  const pct     = Math.round(((filled + (resumeUrl ? 1 : 0)) / (fields.length + 1)) * 100);

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <div className="flex-between mb-20">
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>My profile</h1>
        <div style={{ textAlign: 'right' }}>
          <div className="text-xs text-muted mb-4">Profile completeness</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="completeness-bar" style={{ width: 80 }}>
              <div className="completeness-fill" style={{ width: `${pct}%` }}/>
            </div>
            <span className="text-brand text-xs" style={{ fontWeight: 600 }}>{pct}%</span>
          </div>
        </div>
      </div>

      {/* Resume */}
      <div className="card mb-12">
        <div className="text-sm" style={{ fontWeight: 500, marginBottom: 10 }}>Resume</div>
        {resumeUrl ? (
          <div className="flex-between">
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-brand text-sm">View current resume</a>
            <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
              Replace <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={uploadResume}/>
            </label>
          </div>
        ) : (
          <label style={{ display: 'block', border: '2px dashed #ddd', borderRadius: 10, padding: 32, textAlign: 'center', cursor: 'pointer' }}>
            <p className="text-muted text-sm">{uploading ? 'Uploading…' : 'Click to upload resume (PDF or Word, max 5 MB)'}</p>
            <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={uploadResume}/>
          </label>
        )}
      </div>

      {/* Form */}
      <form className="card" onSubmit={save}>
        <div className="form-row mb-12" style={{ marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Branch</label>
            <select className="form-select" value={form.branch} onChange={update('branch')}>
              <option value="">Select branch</option>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">CGPA</label>
            <input type="number" step="0.01" min="0" max="10" className="form-input"
              placeholder="e.g. 8.5" value={form.cgpa} onChange={update('cgpa')}/>
          </div>
        </div>

        {[
          { label: 'Skills (comma-separated)', field: 'skills', placeholder: 'React, Node.js, Python…' },
          { label: 'Bio', field: 'bio', placeholder: 'Tell employers about yourself…', textarea: true },
          { label: 'LinkedIn URL', field: 'linkedIn', placeholder: 'linkedin.com/in/…' },
          { label: 'GitHub URL',   field: 'github',   placeholder: 'github.com/…' },
          { label: 'Phone',        field: 'phone',    placeholder: '+91 9876543210' },
        ].map(({ label, field, placeholder, textarea }) => (
          <div className="form-group" key={field}>
            <label className="form-label">{label}</label>
            {textarea
              ? <textarea className="form-textarea" rows={3} placeholder={placeholder} value={form[field]} onChange={update(field)}/>
              : <input type="text" className="form-input" placeholder={placeholder} value={form[field]} onChange={update(field)}/>}
          </div>
        ))}

        <button type="submit" disabled={saving} className="btn btn-primary btn-full">
          {saving ? 'Saving…' : 'Save profile'}
        </button>
        {msg && <div className={`alert mt-12 ${msg.includes('!') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
      </form>
    </div>
  );
}