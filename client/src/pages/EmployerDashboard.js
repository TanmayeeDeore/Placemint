import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_OPT = ['applied','shortlisted','selected','rejected'];

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [jobs,      setJobs]      = useState([]);
  const [selJob,    setSelJob]    = useState(null);
  const [apps,      setApps]      = useState([]);
  const [loadApps,  setLoadApps]  = useState(false);
  const [updating,  setUpdating]  = useState(null);
  const [emails,    setEmails]    = useState('');
  const [inviting,  setInviting]  = useState(false);
  const [invMsg,    setInvMsg]    = useState('');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    api.get('/jobs').then(r => {
      setJobs(r.data.jobs);
      if (r.data.jobs[0]) pickJob(r.data.jobs[0]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const pickJob = async job => {
    setSelJob(job); setApps([]); setLoadApps(true);
    try {
      const { data } = await api.get(`/applications/job/${job._id}`);
      setApps(data.applications);
    } catch {} finally { setLoadApps(false); }
  };

  const updateStatus = async (appId, status) => {
    setUpdating(appId);
    try {
      await api.patch(`/applications/${appId}/status`, { status });
      setApps(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
    } catch {} finally { setUpdating(null); }
  };

  const sendInvites = async () => {
    const list = emails.split(/[\n,]/).map(e => e.trim()).filter(Boolean);
    if (!list.length || !selJob) return;
    setInviting(true); setInvMsg('');
    try {
      await api.post('/invitations/send', { emails: list, jobId: selJob._id });
      setInvMsg(`${list.length} invitation${list.length !== 1 ? 's' : ''} sent!`);
      setEmails('');
    } catch (err) { setInvMsg(err.response?.data?.message || 'Failed'); }
    finally { setInviting(false); }
  };

  const closeJob = async id => {
    await api.put(`/jobs/${id}`, { status: 'closed' });
    setJobs(prev => prev.map(j => j._id === id ? { ...j, status: 'closed' } : j));
    if (selJob?._id === id) setSelJob(j => j ? { ...j, status: 'closed' } : j);
  };

  if (loading) return <div className="empty-state">Loading…</div>;

  return (
    <div className="page-wide">
      <div className="flex-between mb-20">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Employer dashboard</h1>
          <p className="text-muted text-sm mt-4">{user?.name}</p>
        </div>
        <Link to="/jobs/new" className="btn btn-primary">+ Post a job</Link>
      </div>

      <div className="stats-row">
        {[
          ['Total jobs',   jobs.length],
          ['Open',         jobs.filter(j=>j.status==='open').length],
          ['Applicants',   apps.length],
          ['Shortlisted',  apps.filter(a=>a.status==='shortlisted').length],
        ].map(([label, val]) => (
          <div className="stat-card" key={label}>
            <div className="stat-value">{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        {/* Job list */}
        <div className="card" style={{ padding: 0, alignSelf: 'start' }}>
          <div className="section-head"><span className="section-title">Your jobs</span></div>
          {jobs.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <Link to="/jobs/new" className="text-brand">Post your first job</Link>
            </div>
          ) : jobs.map(job => (
            <div key={job._id} className={`sidebar-item ${selJob?._id === job._id ? 'active' : ''}`}
              onClick={() => pickJob(job)}>
              <div className="flex-between">
                <span style={{ fontWeight: 500 }}>{job.title}</span>
                <span className={`badge badge-${job.status}`}>{job.status}</span>
              </div>
              <div className="text-xs text-muted mt-4">{job.company} · Deadline: {new Date(job.deadline).toLocaleDateString()}</div>
            </div>
          ))}
        </div>

        {/* Right panel */}
        {selJob ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Job header */}
            <div className="card">
              <div className="flex-between">
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600 }}>{selJob.title}</h2>
                  <p className="text-muted text-sm mt-4">{selJob.company} · {selJob.location}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {selJob.status === 'open' && (
                    <button className="btn btn-outline btn-sm" onClick={() => closeJob(selJob._id)}>Close job</button>
                  )}
                  <Link to={`/jobs/${selJob._id}`} className="btn btn-outline btn-sm">View listing</Link>
                </div>
              </div>
            </div>

            {/* Applicants */}
            <div className="card" style={{ padding: 0 }}>
              <div className="section-head">
                <span className="section-title">Applicants ({apps.length})</span>
                <span className="text-xs text-muted">
                  {apps.filter(a=>a.status==='shortlisted').length} shortlisted · {apps.filter(a=>a.status==='selected').length} selected
                </span>
              </div>
              {loadApps ? <div className="empty-state" style={{ padding: 32 }}>Loading…</div>
              : apps.length === 0 ? <div className="empty-state" style={{ padding: 32 }}>No applications yet.</div>
              : apps.map(app => (
                <div key={app._id} style={{ padding: '12px 16px', borderBottom: '1px solid #f3f3f3', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar">
                    {app.studentId?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-sm" style={{ fontWeight: 500 }}>{app.studentId?.name}</div>
                    <div className="text-xs text-muted">{app.studentId?.email}</div>
                    {app.coverNote && <div className="text-xs text-muted mt-4" style={{ fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{app.coverNote}"</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {app.resumeUrl && (
                      <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Resume</a>
                    )}
                    <select value={app.status} disabled={updating === app._id}
                      onChange={e => updateStatus(app._id, e.target.value)}
                      className={`badge badge-${app.status}`}
                      style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 500 }}>
                      {STATUS_OPT.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Invite */}
            <div className="card">
              <div className="text-sm" style={{ fontWeight: 500, marginBottom: 6 }}>Invite students</div>
              <p className="text-xs text-muted mb-12">Emails — one per line or comma-separated. Each gets a direct invite link.</p>
              <textarea className="form-textarea" rows={3}
                placeholder="student@college.edu, another@college.edu"
                value={emails} onChange={e => setEmails(e.target.value)}
                style={{ marginBottom: 10 }}/>
              <div className="flex-between">
                <button className="btn btn-primary btn-sm" onClick={sendInvites} disabled={inviting || !emails.trim()}>
                  {inviting ? 'Sending…' : 'Send invitations'}
                </button>
                {invMsg && <span className={`text-xs ${invMsg.includes('!') ? 'text-brand' : ''}`} style={{ color: invMsg.includes('!') ? '#276749' : '#c53030' }}>{invMsg}</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="card empty-state">Select a job to see applicants</div>
        )}
      </div>
    </div>
  );
}