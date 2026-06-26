import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [apps,    setApps]    = useState([]);
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get(`/profile/${user.id}`),
      api.get('/applications/student'),
      api.get('/jobs'),
    ]).then(([pRes, aRes, jRes]) => {
      setProfile(pRes.data.profile);
      setApps(aRes.data.applications);
      setJobs(jRes.data.jobs.slice(0, 4));
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="empty-state">Loading…</div>;

  const fields = ['branch','cgpa','skills','bio','phone'];
  const filled = fields.filter(f => profile?.[f] && String(profile[f]).length > 0).length;
  const pct    = Math.round(((filled + (profile?.resumeUrl ? 1 : 0)) / (fields.length + 1)) * 100);

  const DOT = { applied:'dot-applied', shortlisted:'dot-shortlisted', selected:'dot-selected', rejected:'dot-rejected' };

  return (
    <div className="page-wide">
      <div className="flex-between mb-20">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Good {greet()}, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted text-sm mt-4">Here's your placement overview.</p>
        </div>
        <Link to="/jobs" className="btn btn-primary">Browse jobs</Link>
      </div>

      {pct < 70 && (
        <div className="alert alert-warning mb-20">
          Your profile is {pct}% complete. Employers see this when reviewing applications.{' '}
          <Link to="/profile" className="text-brand">Complete it now →</Link>
        </div>
      )}

      <div className="stats-row">
        {[
          ['Applications sent', apps.length],
          ['Shortlisted', apps.filter(a => a.status==='shortlisted').length],
          ['Selected',    apps.filter(a => a.status==='selected').length],
          ['Profile',     `${pct}%`],
        ].map(([label, value]) => (
          <div className="stat-card" key={label}>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="three-col">
        {/* Recent applications */}
        <div className="card" style={{ padding: 0 }}>
          <div className="section-head">
            <span className="section-title">Recent applications</span>
            <Link to="/my-applications" className="text-xs text-brand">View all</Link>
          </div>
          {apps.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <Link to="/jobs" className="text-brand">Find your first job</Link>
            </div>
          ) : apps.slice(0,5).map(app => (
            <div key={app._id} className="flex-between" style={{ padding: '12px 16px', borderBottom: '1px solid #f3f3f3' }}>
              <div>
                <div className="text-sm" style={{ fontWeight: 500 }}>{app.jobId?.title}</div>
                <div className="text-xs text-muted mt-4">{app.jobId?.company}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className={`status-dot ${DOT[app.status]}`}/>
                <span className="text-xs text-muted">{app.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Profile card */}
          <div className="card">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
              <div className="avatar">
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm" style={{ fontWeight: 500 }}>{user?.name}</div>
                <div className="text-xs text-muted">{profile?.branch || 'Branch not set'}</div>
              </div>
            </div>
            {[
              ['CGPA',   profile?.cgpa || '—'],
              ['Skills', profile?.skills?.slice(0,3).join(', ') || '—'],
              ['Resume', profile?.resumeUrl ? '✓ Uploaded' : '✗ Not uploaded'],
            ].map(([label, value]) => (
              <div key={label} className="flex-between text-xs" style={{ marginBottom: 6 }}>
                <span className="text-muted">{label}</span>
                <span style={{ color: label==='Resume' && profile?.resumeUrl ? '#276749' : '#333' }}>{value}</span>
              </div>
            ))}
            <Link to="/profile" className="btn btn-outline btn-sm btn-full mt-12">Edit profile</Link>
          </div>

          {/* New jobs */}
          <div className="card" style={{ padding: 0 }}>
            <div className="section-head"><span className="section-title">New for you</span></div>
            {jobs.map(job => (
              <Link key={job._id} to={`/jobs/${job._id}`}
                style={{ display: 'block', padding: '11px 16px', borderBottom: '1px solid #f3f3f3', textDecoration: 'none', color: 'inherit' }}
                className="job-card">
                <div className="text-sm" style={{ fontWeight: 500 }}>{job.title}</div>
                <div className="text-xs text-muted mt-4">{job.company} · {job.ctc || job.jobType}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function greet() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}