import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const BRANCHES = ['All','CSE','ECE','ME','EE','IT','Civil','Chemical'];
const STATUSES = ['All','applied','shortlisted','selected','rejected'];

export default function TeacherDashboard() {
  const [apps,    setApps]    = useState([]);
  const [students,setStudents]= useState([]);
  const [jobs,    setJobs]    = useState([]);
  const [tab,     setTab]     = useState('applications');
  const [loading, setLoading] = useState(true);
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [search,       setSearch]       = useState('');
  const [invJobId,  setInvJobId]  = useState('');
  const [invEmails, setInvEmails] = useState('');
  const [inviting,  setInviting]  = useState(false);
  const [invMsg,    setInvMsg]    = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/applications/all'),
      api.get('/profile'),
      api.get('/jobs'),
    ]).then(([a, s, j]) => {
      setApps(a.data.applications);
      setStudents(s.data.profiles);
      setJobs(j.data.jobs);
      if (j.data.jobs[0]) setInvJobId(j.data.jobs[0]._id);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = apps.filter(a =>
    (filterBranch === 'All' || a.studentId?.profileId?.branch === filterBranch) &&
    (filterStatus === 'All' || a.status === filterStatus) &&
    (!search || a.studentId?.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const exportCSV = () => {
    const rows = [['Student','Email','Branch','CGPA','Job','Company','Status','Applied'],
      ...filtered.map(a => [a.studentId?.name||'',a.studentId?.email||'',a.studentId?.profileId?.branch||'',a.studentId?.profileId?.cgpa||'',a.jobId?.title||'',a.jobId?.company||'',a.status,new Date(a.createdAt).toLocaleDateString()])];
    const blob = new Blob([rows.map(r=>r.join(',')).join('\n')], {type:'text/csv'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'snapphire-applications.csv'; a.click();
  };

  const sendInvites = async () => {
    const list = invEmails.split(/[\n,]/).map(e=>e.trim()).filter(Boolean);
    if (!list.length || !invJobId) return;
    setInviting(true); setInvMsg('');
    try {
      await api.post('/invitations/send', { emails: list, jobId: invJobId });
      setInvMsg(`${list.length} invitation${list.length!==1?'s':''} sent!`);
      setInvEmails('');
    } catch (err) { setInvMsg(err.response?.data?.message||'Failed'); }
    finally { setInviting(false); }
  };

  if (loading) return <div className="empty-state">Loading…</div>;

  return (
    <div className="page-wide">
      <div className="flex-between mb-20">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Placement officer dashboard</h1>
          <p className="text-muted text-sm mt-4">Manage and track all placements</p>
        </div>
        <button className="btn btn-outline" onClick={exportCSV}>Export CSV</button>
      </div>

      <div className="stats-row">
        {[['Students',students.length],['Applications',apps.length],['Shortlisted',apps.filter(a=>a.status==='shortlisted').length],['Selected',apps.filter(a=>a.status==='selected').length]]
          .map(([l,v]) => <div className="stat-card" key={l}><div className="stat-value">{v}</div><div className="stat-label">{l}</div></div>)}
      </div>

      <div className="tabs">
        {[['applications','Applications'],['students','Students'],['invite','Send invitations']].map(([id,label]) => (
          <button key={id} className={`tab ${tab===id?'active':''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'applications' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="section-head" style={{ flexWrap: 'wrap', gap: 8 }}>
            <input placeholder="Search student…" className="form-input" style={{ width: 180 }}
              value={search} onChange={e => setSearch(e.target.value)}/>
            <select className="form-select" style={{ width: 140 }} value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
              {BRANCHES.map(b => <option key={b} value={b}>{b==='All'?'All branches':b}</option>)}
            </select>
            <select className="form-select" style={{ width: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s==='All'?'All statuses':s}</option>)}
            </select>
            <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>{filtered.length} results</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr>{['Student','Branch','CGPA','Job','Company','Status','Applied'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#bbb', padding: 32 }}>No results</td></tr>
                  : filtered.map(app => (
                    <tr key={app._id}>
                      <td><div style={{ fontWeight: 500 }}>{app.studentId?.name}</div><div className="text-xs text-muted">{app.studentId?.email}</div></td>
                      <td>{app.studentId?.profileId?.branch || '—'}</td>
                      <td>{app.studentId?.profileId?.cgpa  || '—'}</td>
                      <td><Link to={`/jobs/${app.jobId?._id}`} className="text-brand">{app.jobId?.title}</Link></td>
                      <td>{app.jobId?.company}</td>
                      <td><span className={`badge badge-${app.status}`}>{app.status}</span></td>
                      <td className="text-muted text-xs">{new Date(app.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'students' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="section-head"><span className="section-title">{students.length} registered students</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr>{['Name','Email','Branch','CGPA','Skills','Resume'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {students.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 500 }}>{p.userId?.name||'—'}</td>
                    <td className="text-muted">{p.userId?.email}</td>
                    <td>{p.branch||'—'}</td>
                    <td>{p.cgpa||'—'}</td>
                    <td className="text-muted text-xs" style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.skills?.join(', ')||'—'}</td>
                    <td>{p.resumeUrl ? <a href={p.resumeUrl} target="_blank" rel="noreferrer" className="text-brand text-xs">View</a> : <span className="text-muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'invite' && (
        <div className="card" style={{ maxWidth: 480 }}>
          <div className="form-group">
            <label className="form-label">Select job</label>
            <select className="form-select" value={invJobId} onChange={e => setInvJobId(e.target.value)}>
              {jobs.map(j => <option key={j._id} value={j._id}>{j.title} — {j.company}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Student emails <span className="text-muted">(one per line or comma-separated)</span></label>
            <textarea className="form-textarea" rows={6}
              placeholder={'student1@college.edu\nstudent2@college.edu'}
              value={invEmails} onChange={e => setInvEmails(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: 12 }}/>
            <p className="text-xs text-muted mt-4">
              {invEmails.split(/[\n,]/).filter(e=>e.trim()).length} email(s) entered
            </p>
          </div>
          <button className="btn btn-primary btn-full" onClick={sendInvites}
            disabled={inviting || !invEmails.trim() || !invJobId}>
            {inviting ? 'Sending…' : 'Send invitations'}
          </button>
          {invMsg && <div className={`alert mt-12 ${invMsg.includes('!')? 'alert-success':'alert-error'}`}>{invMsg}</div>}
          <hr className="divider"/>
          <p className="text-xs text-muted">Each student gets a personal email with a direct link. Invitations expire in 48 hours. Re-sending replaces the old token.</p>
        </div>
      )}
    </div>
  );
}