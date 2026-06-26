import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications/student').then(r => setApps(r.data.applications))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state">Loading…</div>;

  return (
    <div className="page">
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>My applications</h1>

      {apps.length === 0 ? (
        <div className="empty-state">
          No applications yet. <Link to="/jobs" className="text-brand">Browse jobs</Link>
        </div>
      ) : apps.map(app => (
        <div key={app._id} className="card" style={{ marginBottom: 10 }}>
          <div className="flex-between">
            <div>
              <Link to={`/jobs/${app.jobId?._id}`} style={{ fontSize: 15, fontWeight: 500, color: '#1a1a1a', textDecoration: 'none' }}>
                {app.jobId?.title}
              </Link>
              <p className="text-muted text-sm mt-4">{app.jobId?.company} · {app.jobId?.location}</p>
            </div>
            <span className={`badge badge-${app.status}`}>{app.status}</span>
          </div>
          {app.coverNote && (
            <p className="text-xs text-muted mt-8" style={{ fontStyle: 'italic' }}>"{app.coverNote}"</p>
          )}
          <p className="text-xs text-muted mt-8">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}