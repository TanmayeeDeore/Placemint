import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const BRANCHES = ['All','CSE','ECE','ME','EE','IT','Civil','Chemical'];
const STATUSES = ['All','applied','shortlisted','selected','rejected'];
const STATUS_STYLE = { applied:'bg-blue-50 text-blue-700', shortlisted:'bg-amber-50 text-amber-700', selected:'bg-green-50 text-green-700', rejected:'bg-red-50 text-red-600' };

export default function TeacherDashboard() {
  const [apps,    setApps]    = useState([]);
  const [students,setStudents]= useState([]);
  const [jobs,    setJobs]    = useState([]);
  const [tab,     setTab]     = useState('applications');
  const [loading, setLoading] = useState(true);
  const [fBranch, setFBranch] = useState('All');
  const [fStatus, setFStatus] = useState('All');
  const [search,  setSearch]  = useState('');
  const [invJob,  setInvJob]  = useState('');
  const [invMails,setInvMails]= useState('');
  const [inviting,setInviting]= useState(false);
  const [invMsg,  setInvMsg]  = useState({ text:'', ok:true });

  useEffect(() => {
    Promise.all([api.get('/applications/all'), api.get('/profile'), api.get('/jobs')])
      .then(([a,s,j]) => {
        setApps(a.data.applications); setStudents(s.data.profiles); setJobs(j.data.jobs);
        if (j.data.jobs[0]) setInvJob(j.data.jobs[0]._id);
      }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = apps.filter(a =>
    (fBranch==='All' || a.studentId?.profileId?.branch===fBranch) &&
    (fStatus==='All' || a.status===fStatus) &&
    (!search || a.studentId?.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const exportCSV = () => {
    const rows=[['Student','Email','Branch','CGPA','Job','Company','Status','Applied'],
      ...filtered.map(a=>[a.studentId?.name||'',a.studentId?.email||'',a.studentId?.profileId?.branch||'',a.studentId?.profileId?.cgpa||'',a.jobId?.title||'',a.jobId?.company||'',a.status,new Date(a.createdAt).toLocaleDateString()])];
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'}));
    a.download='snapphire-placements.csv'; a.click();
  };

  const sendInvites = async () => {
    const list=invMails.split(/[\n,]/).map(e=>e.trim()).filter(Boolean);
    if (!list.length||!invJob) return;
    setInviting(true); setInvMsg({text:'',ok:true});
    try {
      await api.post('/invitations/send', {emails:list, jobId:invJob});
      setInvMsg({text:`${list.length} invitation${list.length!==1?'s':''} sent!`,ok:true}); setInvMails('');
    } catch(err){ setInvMsg({text:err.response?.data?.message||'Failed',ok:false}); }
    finally{ setInviting(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-32 text-gray-400 text-sm">Loading…</div>;

  const TABS = [['applications','📋 Applications'],['students','👥 Students'],['invite','✉️ Invitations']];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Placement officer</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage and monitor all placements</p>
        </div>
        <button onClick={exportCSV} className="btn-outline flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[['Students',students.length,'🎓'],['Applications',apps.length,'📋'],['Shortlisted',apps.filter(a=>a.status==='shortlisted').length,'⭐'],['Selected',apps.filter(a=>a.status==='selected').length,'🎉']]
          .map(([l,v,i])=>(
            <div key={l} className="card p-4">
              <div className="text-xl mb-1">{i}</div>
              <div className="text-2xl font-bold text-gray-900">{v}</div>
              <div className="text-xs text-gray-400 mt-0.5">{l}</div>
            </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit mb-6">
        {TABS.map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${tab===id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Applications tab */}
      {tab==='applications' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex flex-wrap gap-3 items-center">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input placeholder="Search student…" className="input pl-8 w-44 py-2"
                value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="input w-36 py-2" value={fBranch} onChange={e=>setFBranch(e.target.value)}>
              {BRANCHES.map(b=><option key={b} value={b}>{b==='All'?'All branches':b}</option>)}
            </select>
            <select className="input w-36 py-2" value={fStatus} onChange={e=>setFStatus(e.target.value)}>
              {STATUSES.map(s=><option key={s} value={s}>{s==='All'?'All statuses':s}</option>)}
            </select>
            <span className="text-xs text-gray-400 ml-auto">{filtered.length} result{filtered.length!==1?'s':''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Student','Branch','CGPA','Job','Company','Status','Applied'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length===0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">No results matching your filters</td></tr>
                ) : filtered.map(app=>(
                  <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{app.studentId?.name}</p>
                      <p className="text-xs text-gray-400">{app.studentId?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{app.studentId?.profileId?.branch||'—'}</td>
                    <td className="px-4 py-3 text-gray-600">{app.studentId?.profileId?.cgpa||'—'}</td>
                    <td className="px-4 py-3"><Link to={`/jobs/${app.jobId?._id}`} className="text-brand-500 hover:underline font-medium">{app.jobId?.title}</Link></td>
                    <td className="px-4 py-3 text-gray-600">{app.jobId?.company}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[app.status]||''}`}>{app.status}</span></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(app.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Students tab */}
      {tab==='students' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="text-sm text-gray-500">{students.length} registered students</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Name','Email','Branch','CGPA','Skills','Resume'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map(p=>(
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.userId?.name||'—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{p.userId?.email}</td>
                    <td className="px-4 py-3 text-gray-600">{p.branch||'—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.cgpa||'—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-[140px] truncate">{p.skills?.join(', ')||'—'}</td>
                    <td className="px-4 py-3">
                      {p.resumeUrl
                        ? <a href={p.resumeUrl} target="_blank" rel="noreferrer" className="text-brand-500 text-xs font-medium hover:underline">View ↗</a>
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite tab */}
      {tab==='invite' && (
        <div className="max-w-lg">
          <div className="card p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Send invitations</h3>
              <p className="text-xs text-gray-400">Students receive a personal email with a direct link to apply. Invitations expire in 48 hours.</p>
            </div>
            <div>
              <label className="label">Select job</label>
              <select className="input" value={invJob} onChange={e=>setInvJob(e.target.value)}>
                {jobs.map(j=><option key={j._id} value={j._id}>{j.title} — {j.company}</option>)}
              </select>
            </div>
            <div>
              <label className="label">
                Student emails{' '}
                <span className="normal-case font-normal text-gray-400">(one per line or comma-separated)</span>
              </label>
              <textarea rows={6} className="input resize-none font-mono text-xs"
                placeholder={'student1@college.edu\nstudent2@college.edu\nstudent3@college.edu'}
                value={invMails} onChange={e=>setInvMails(e.target.value)}/>
              <p className="text-xs text-gray-400 mt-1">
                {invMails.split(/[\n,]/).filter(e=>e.trim()).length} email(s) entered
              </p>
            </div>
            <button onClick={sendInvites} disabled={inviting||!invMails.trim()||!invJob}
              className="btn-primary w-full py-3">
              {inviting ? 'Sending…' : 'Send invitations'}
            </button>
            {invMsg.text && (
              <div className={`text-sm text-center font-medium ${invMsg.ok?'text-green-600':'text-red-500'}`}>
                {invMsg.text}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}