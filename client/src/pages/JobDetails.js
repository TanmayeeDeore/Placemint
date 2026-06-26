import { useState, useEffect } from 'react';
import { useParams, useSearchParams} from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function JobDetail() {
  const { id } = useParams();
  const [sp]   = useSearchParams();
  const { user } = useAuth();
  const [job,     setJob]     = useState(null);
  const [applied, setApplied] = useState(false);
  const [cover,   setCover]   = useState('');
  const [msg,     setMsg]     = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data.job);
        if (user?.role === 'student') {
          const r = await api.get('/applications/student');
          setApplied(r.data.applications.some(a => a.jobId._id === id || a.jobId === id));
        }
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [id, user]);

  const handleApply = async () => {
    setApplying(true); setMsg('');
    try {
      await api.post('/applications', { jobId: id, coverNote: cover });
      setApplied(true);
      setMsg('Application submitted!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to apply');
    } finally { setApplying(false); }
  };

  if (loading) return <div className="empty-state">Loading…</div>;
  if (!job)    return <div className="empty-state">Job not found.</div>;

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      {sp.get('invited') === 'true' && (
        <div className="alert alert-info mb-16">You were personally invited for this position!</div>
      )}

      <div className="card mb-12">
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>{job.title}</h1>
        <p className="text-muted mt-4">{job.company} · {job.location}</p>

        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <span className={`badge badge-${job.jobType}`}>{job.jobType}</span>
          {job.ctc && <span className="badge" style={{ background: '#f7f7f7', color: '#555' }}>{job.ctc}</span>}
          <span className="badge" style={{ background: '#f7f7f7', color: '#555' }}>
            Deadline: {new Date(job.deadline).toLocaleDateString()}
          </span>
        </div>

        <hr className="divider"/>
        <h3 className="text-sm" style={{ fontWeight: 500, marginBottom: 8 }}>Description</h3>
        <p className="text-sm text-muted" style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{job.description}</p>

        <hr className="divider"/>
        <h3 className="text-sm" style={{ fontWeight: 500, marginBottom: 8 }}>Eligibility</h3>
        <p className="text-sm text-muted">Minimum CGPA: <strong>{job.eligibility?.minCgpa}</strong></p>
        {job.eligibility?.branches?.length > 0 && (
          <p className="text-sm text-muted mt-4">Branches: <strong>{job.eligibility.branches.join(', ')}</strong></p>
        )}
      </div>

      {user?.role === 'student' && (
        <div className="card">
          <h3 className="text-sm" style={{ fontWeight: 500, marginBottom: 12 }}>Apply for this position</h3>
          {applied ? (
            <div className="alert alert-success">You have already applied for this position.</div>
          ) : (
            <>
              <textarea className="form-textarea" rows={4}
                placeholder="Cover note (optional) — why are you a great fit?"
                value={cover} onChange={e => setCover(e.target.value)}
                style={{ marginBottom: 12 }}/>
              <button className="btn btn-primary btn-full" onClick={handleApply} disabled={applying}>
                {applying ? 'Submitting…' : 'Submit application'}
              </button>
            </>
          )}
          {msg && (
            <div className={`alert mt-12 ${msg.includes('!') ? 'alert-success' : 'alert-error'}`}>{msg}</div>
          )}
        </div>
      )}
    </div>
  );
}