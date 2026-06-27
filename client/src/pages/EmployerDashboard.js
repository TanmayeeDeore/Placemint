import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTS = ['applied','shortlisted','selected','rejected'];
const STATUS_STYLE = { applied:'bg-blue-50 text-blue-700', shortlisted:'bg-amber-50 text-amber-700', selected:'bg-green-50 text-green-700', rejected:'bg-red-50 text-red-600' };

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [jobs,     setJobs]     = useState([]);
  const [selJob,   setSelJob]   = useState(null);
  const [apps,     setApps]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [loadApps, setLoadApps] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [emails,   setEmails]   = useState('');
  const [inviting, setInviting] = useState(false);
  const [invMsg,   setInvMsg]   = useState({ text:'', ok:true });

  useEffect(() => {
    api.get('/jobs').then(r => {
      setJobs(r.data.jobs);
      if (r.data.jobs[0]) pickJob(r.data.jobs[0]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const pickJob = async job => {
    setSelJob(job); setApps([]); setLoadApps(true);
    try { const {data} = await api.get(`/applications/job/${job._id}`); setApps(data.applications); }
    catch {} finally { setLoadApps(false); }
  };

  const updateStatus = async (appId, status) => {
    setUpdating(appId);
    try {
      await api.patch(`/applications/${appId}/status`, { status });
      setApps(prev => prev.map(a => a._id===appId ? {...a,status} : a));
    } catch {} finally { setUpdating(null); }
  };

  const sendInvites = async () => {
    const list = emails.split(/[\n,]/).map(e=>e.trim()).filter(Boolean);
    if (!list.length || !selJob) return;
    setInviting(true); setInvMsg({ text:'', ok:true });
    try {
      await api.post('/invitations/send', { emails:list, jobId:selJob._id });
      setInvMsg({ text:`${list.length} invitation${list.length!==1?'s':''} sent!`, ok:true });
      setEmails('');
    } catch (err) { setInvMsg({ text:err.response?.data?.message||'Failed', ok:false }); }
    finally { setInviting(false); }
  };

  const closeJob = async id => {
    await api.put(`/jobs/${id}`, { status:'closed' });
    setJobs(prev => prev.map(j => j._id===id?{...j,status:'closed'}:j));
    if (selJob?._id===id) setSelJob(j => j?{...j,status:'closed'}:j);
  };

  if (loading) return <div className="flex items-center justify-center py-32 text-gray-400 text-sm">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employer dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">{user?.name}</p>
        </div>
        <Link to="/jobs/new" className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Post a job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          ['Total jobs', jobs.length, '💼'],
          ['Open', jobs.filter(j=>j.status==='open').length, '🟢'],
          ['Applicants', apps.length, '👥'],
          ['Shortlisted', apps.filter(a=>a.status==='shortlisted').length, '⭐'],
        ].map(([l,v,i]) => (
          <div key={l} className="card p-4">
            <div className="text-lg mb-1">{i}</div>
            <div className="text-2xl font-bold text-gray-900">{v}</div>
            <div className="text-xs text-gray-400 mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Job list */}
        <div className="card overflow-hidden self-start">
          <div className="px-4 py-3.5 border-b border-gray-50">
            <h2 className="font-semibold text-sm text-gray-700">Your jobs ({jobs.length})</h2>
          </div>
          {jobs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-gray-400 mb-3">No jobs posted yet</p>
              <Link to="/jobs/new" className="btn-primary text-xs px-3 py-1.5">Post first job</Link>
            </div>
          ) : jobs.map(job => (
            <button key={job._id} onClick={() => pickJob(job)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors
                ${selJob?._id===job._id ? 'bg-brand-50 border-l-2 border-l-brand-500' : ''}`}>
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-medium truncate ${selJob?._id===job._id ? 'text-brand-600' : 'text-gray-800'}`}>
                  {job.title}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0
                  ${job.status==='open' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {job.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{job.company} · {new Date(job.deadline).toLocaleDateString()}</p>
            </button>
          ))}
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          {selJob ? (
            <>
              {/* Job summary */}
              <div className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selJob.title}</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{selJob.company} · {selJob.location}</p>
                  </div>
                  <div className="flex gap-2">
                    {selJob.status==='open' && (
                      <button onClick={() => closeJob(selJob._id)} className="btn-outline text-xs px-3 py-1.5 text-red-500 hover:border-red-200 hover:bg-red-50">
                        Close job
                      </button>
                    )}
                    <Link to={`/jobs/${selJob._id}`} className="btn-outline text-xs px-3 py-1.5">View listing</Link>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
                  <span className="bg-gray-50 px-2.5 py-1 rounded-lg">Min CGPA: {selJob.eligibility?.minCgpa||0}</span>
                  {selJob.eligibility?.branches?.length>0 && (
                    <span className="bg-gray-50 px-2.5 py-1 rounded-lg">{selJob.eligibility.branches.join(', ')}</span>
                  )}
                  <span className="bg-gray-50 px-2.5 py-1 rounded-lg capitalize">{selJob.jobType}</span>
                </div>
              </div>

              {/* Applicants */}
              <div className="card overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-gray-700">Applicants ({apps.length})</h3>
                  <div className="text-xs text-gray-400">
                    {apps.filter(a=>a.status==='shortlisted').length} shortlisted · {apps.filter(a=>a.status==='selected').length} selected
                  </div>
                </div>
                {loadApps ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
                ) : apps.length===0 ? (
                  <div className="text-center py-10">
                    <span className="text-3xl block mb-2">📭</span>
                    <p className="text-sm text-gray-400">No applications yet. Send invitations below.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {apps.map(app => (
                      <div key={app._id} className="px-5 py-3.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 shrink-0">
                          {app.studentId?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{app.studentId?.name}</p>
                          <p className="text-xs text-gray-400">{app.studentId?.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.resumeUrl && (
                            <a href={app.resumeUrl} target="_blank" rel="noreferrer"
                              className="text-xs text-brand-500 border border-brand-100 px-2.5 py-1 rounded-lg hover:bg-brand-50 transition-colors">
                              Resume
                            </a>
                          )}
                          <select value={app.status} disabled={updating===app._id}
                            onChange={e => updateStatus(app._id, e.target.value)}
                            className={`text-xs px-2.5 py-1 rounded-lg border-0 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-100 ${STATUS_STYLE[app.status]}`}>
                            {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invite */}
              <div className="card p-5">
                <h3 className="font-semibold text-sm text-gray-700 mb-1">Invite students</h3>
                <p className="text-xs text-gray-400 mb-3">Enter emails — one per line or comma-separated. Each gets a personal invite link.</p>
                <textarea rows={3} className="input resize-none mb-3 font-mono text-xs"
                  placeholder="student@college.edu&#10;another@college.edu"
                  value={emails} onChange={e => setEmails(e.target.value)}/>
                <div className="flex items-center justify-between">
                  <button onClick={sendInvites} disabled={inviting||!emails.trim()}
                    className="btn-primary text-sm px-4 py-2">
                    {inviting ? 'Sending…' : 'Send invitations'}
                  </button>
                  {invMsg.text && (
                    <p className={`text-xs font-medium ${invMsg.ok ? 'text-green-600' : 'text-red-500'}`}>{invMsg.text}</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="card flex items-center justify-center h-64">
              <div className="text-center">
                <span className="text-4xl block mb-2">👈</span>
                <p className="text-sm text-gray-400">Select a job from the list</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}