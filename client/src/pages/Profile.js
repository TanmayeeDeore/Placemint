import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const BRANCHES = ['CSE','ECE','ME','EE','IT','Civil','Chemical','Other'];

export default function Profile() {
  const { user } = useAuth();
  const [form,      setForm]      = useState({ branch:'', cgpa:'', skills:'', bio:'', linkedIn:'', github:'', phone:'' });
  const [resumeUrl, setResumeUrl] = useState('');
  const [msg,       setMsg]       = useState({ text: '', type: '' });
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver,  setDragOver]  = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get(`/profile/${user.id}`).then(r => {
      const p = r.data.profile;
      setResumeUrl(p.resumeUrl || '');
      setForm({ branch: p.branch||'', cgpa: p.cgpa||'', skills:(p.skills||[]).join(', '), bio:p.bio||'', linkedIn:p.linkedIn||'', github:p.github||'', phone:p.phone||'' });
    }).catch(console.error);
  }, [user]);

  const update = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const showMsg = (text, type) => { setMsg({ text, type }); setTimeout(() => setMsg({ text:'', type:'' }), 4000); };

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put('/profile', { ...form, cgpa: Number(form.cgpa), skills: form.skills.split(',').map(s=>s.trim()).filter(Boolean) });
      showMsg('Profile saved successfully!', 'success');
    } catch (err) { showMsg(err.response?.data?.message || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const doUpload = async file => {
    if (!file) return;
    const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) { showMsg('Only PDF or Word files allowed', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showMsg('File must be under 5 MB', 'error'); return; }
    setUploading(true);
    const fd = new FormData(); fd.append('resume', file);
    try {
      const { data } = await api.post('/profile/upload-resume', fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      setResumeUrl(data.resumeUrl);
      showMsg('Resume uploaded!', 'success');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Upload failed — check your Cloudinary keys in server/.env', 'error');
    } finally { setUploading(false); }
  };

  const fields = ['branch','cgpa','skills','bio','phone'];
  const filled  = fields.filter(f => form[f] && String(form[f]).length > 0).length;
  const pct     = Math.round(((filled + (resumeUrl ? 1 : 0)) / (fields.length + 1)) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My profile</h1>
          <p className="text-sm text-gray-400 mt-0.5">Keep your profile updated to get better matches</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 mb-1.5">Completeness</div>
          <div className="flex items-center gap-2">
            <div className="w-28 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width:`${pct}%`, background: pct < 50 ? '#f59e0b' : pct < 80 ? '#3b82f6' : '#10b981' }}/>
            </div>
            <span className="text-sm font-semibold text-gray-700">{pct}%</span>
          </div>
        </div>
      </div>

      {/* Toast */}
      {msg.text && (
        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-5 text-sm font-medium
          ${msg.type==='success' ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-600'}`}>
          <span>{msg.type==='success' ? '✓' : '⚠'}</span>
          {msg.text}
        </div>
      )}

      {/* Resume upload */}
      <div className="card p-5 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Resume / CV</h3>
        {resumeUrl ? (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Resume uploaded</p>
                <a href={resumeUrl} target="_blank" rel="noreferrer"
                  className="text-xs text-green-600 hover:underline">View file →</a>
              </div>
            </div>
            <label className="btn-outline text-xs px-3 py-1.5 cursor-pointer">
              Replace
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => doUpload(e.target.files?.[0])}/>
            </label>
          </div>
        ) : (
          <label
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); doUpload(e.dataTransfer.files?.[0]); }}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all
              ${dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'}`}>
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <svg className="animate-spin w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span className="text-sm text-gray-500">Uploading…</span>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600">Drop your resume here</p>
                <p className="text-xs text-gray-400 mt-1">or click to browse · PDF or Word · max 5 MB</p>
              </>
            )}
            <input type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={e => doUpload(e.target.files?.[0])}/>
          </label>
        )}
      </div>

      {/* Profile form */}
      <form className="card p-5 space-y-5" onSubmit={save}>
        <h3 className="text-sm font-semibold text-gray-700">Academic details</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Branch</label>
            <select className="input" value={form.branch} onChange={update('branch')}>
              <option value="">Select branch</option>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="label">CGPA (out of 10)</label>
            <input type="number" step="0.01" min="0" max="10" className="input"
              placeholder="e.g. 8.50" value={form.cgpa} onChange={update('cgpa')}/>
          </div>
        </div>

        <div>
          <label className="label">Skills <span className="normal-case font-normal text-gray-400">(comma-separated)</span></label>
          <input type="text" className="input" placeholder="React, Node.js, Python, SQL…"
            value={form.skills} onChange={update('skills')}/>
          {form.skills && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.skills.split(',').map(s=>s.trim()).filter(Boolean).map(s => (
                <span key={s} className="text-xs bg-brand-50 text-brand-600 px-2.5 py-1 rounded-full">{s}</span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea className="input resize-none" rows={3}
            placeholder="Tell employers what makes you stand out…"
            value={form.bio} onChange={update('bio')}/>
        </div>

        <div className="border-t border-gray-50 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Links & contact</h3>
          <div className="space-y-3">
            {[
              { label:'LinkedIn URL', field:'linkedIn', placeholder:'https://linkedin.com/in/yourname', icon:'in' },
              { label:'GitHub URL',   field:'github',   placeholder:'https://github.com/yourname',    icon:'gh' },
              { label:'Phone number', field:'phone',    placeholder:'+91 98765 43210',                icon:'📞' },
            ].map(({ label, field, placeholder, icon }) => (
              <div key={field} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-semibold text-gray-400 shrink-0">
                  {icon}
                </div>
                <div className="flex-1">
                  <label className="label">{label}</label>
                  <input type="text" className="input" placeholder={placeholder}
                    value={form[field]} onChange={update(field)}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-sm font-semibold">
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}