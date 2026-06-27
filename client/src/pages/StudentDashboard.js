import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS = {
  applied:     { dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700'   },
  shortlisted: { dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700' },
  selected:    { dot: 'bg-green-400',  badge: 'bg-green-50 text-green-700' },
  rejected:    { dot: 'bg-red-400',    badge: 'bg-red-50 text-red-600'     },
};

function greet() { const h=new Date().getHours(); return h<12?'morning':h<17?'afternoon':'evening'; }

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [apps,    setApps]    = useState([]);
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([api.get(`/profile/${user.id}`), api.get('/applications/student'), api.get('/jobs')])
      .then(([p,a,j]) => { setProfile(p.data.profile); setApps(a.data.applications); setJobs(j.data.jobs.slice(0,4)); })
      .catch(console.error).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSkeleton/>;

  const fields = ['branch','cgpa','skills','bio','phone'];
  const filled = fields.filter(f => profile?.[f] && String(profile[f]).length > 0).length;
  const pct    = Math.round(((filled + (profile?.resumeUrl ? 1 : 0)) / (fields.length + 1)) * 100);

  const initials = user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Hero greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good {greet()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-1">Here's your placement overview for today.</p>
        </div>
        <Link to="/jobs" className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Browse jobs
        </Link>
      </div>

      {/* Profile incomplete banner */}
      {pct < 70 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">Your profile is {pct}% complete</p>
            <p className="text-xs text-amber-600 mt-0.5">Employers see your full profile before shortlisting. Add resume, skills, and bio.</p>
          </div>
          <Link to="/profile" className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors">
            Complete →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Applications', value:apps.length,                                  icon:'📋', color:'bg-blue-50' },
          { label:'Shortlisted',  value:apps.filter(a=>a.status==='shortlisted').length, icon:'⭐', color:'bg-amber-50' },
          { label:'Selected',     value:apps.filter(a=>a.status==='selected').length,   icon:'🎉', color:'bg-green-50' },
          { label:'Profile',      value:`${pct}%`,                                    icon:'👤', color:'bg-brand-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.color}`}>
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Applications */}
        <div className="lg:col-span-3 card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recent applications</h2>
            <Link to="/my-applications" className="text-xs text-brand-500 font-medium hover:underline">View all</Link>
          </div>
          {apps.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center px-4">
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">📭</span>
              </div>
              <p className="text-sm font-medium text-gray-600">No applications yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">Start applying to jobs that match your profile</p>
              <Link to="/jobs" className="btn-primary text-xs px-4 py-2">Find jobs →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {apps.slice(0,5).map(app => {
                const s = STATUS[app.status] || STATUS.applied;
                return (
                  <div key={app._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`}/>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{app.jobId?.title}</p>
                        <p className="text-xs text-gray-400">{app.jobId?.company} · {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ml-2 ${s.badge}`}>
                      {app.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right col */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profile card */}
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
                {initials}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-400">{profile?.branch || 'Branch not set'}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              {[
                ['CGPA',   profile?.cgpa ? `${profile.cgpa} / 10` : '—'],
                ['Skills', profile?.skills?.slice(0,3).join(', ') || '—'],
                ['Resume', profile?.resumeUrl ? '✓ Uploaded' : '✗ Not uploaded'],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-400">{k}</span>
                  <span className={`font-medium ${k==='Resume' ? (profile?.resumeUrl?'text-green-600':'text-red-400') : 'text-gray-700'}`}>{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400">Profile strength</span>
                <span className="text-xs font-semibold text-brand-500">{pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width:`${pct}%` }}/>
              </div>
            </div>
            <Link to="/profile" className="btn-outline w-full text-center block mt-3 py-2 text-xs">
              Edit profile
            </Link>
          </div>

          {/* New jobs */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-800">Recommended for you</h2>
            </div>
            {jobs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No matching jobs yet</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {jobs.map(job => (
                  <Link key={job._id} to={`/jobs/${job._id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors no-underline">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{job.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{job.company}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">{job.ctc || job.jobType}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="h-8 bg-gray-100 rounded-xl w-72"/>
      <div className="grid grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl"/>)}
      </div>
      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-3 h-64 bg-gray-100 rounded-2xl"/>
        <div className="col-span-2 h-64 bg-gray-100 rounded-2xl"/>
      </div>
    </div>
  );
}