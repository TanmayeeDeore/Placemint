import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Jobs() {
  const [jobs,    setJobs]    = useState([]);
  const [search,  setSearch]  = useState('');
  const [jobType, setJobType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const params = {};
        if (search)  params.search  = search;
        if (jobType) params.jobType = jobType;
        const { data } = await api.get('/jobs', { params });
        setJobs(data.jobs);
      } catch {} finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [search, jobType]);

  return (
    <div className="page">
      <div className="flex-between mb-16">
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Available positions</h1>
        <span className="text-muted text-sm">{jobs.length} jobs</span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input placeholder="Search by title or company…" className="form-input"
          style={{ flex: 1 }} value={search} onChange={e => setSearch(e.target.value)}/>
        <select className="form-select" style={{ width: 140 }}
          value={jobType} onChange={e => setJobType(e.target.value)}>
          <option value="">All types</option>
          <option value="full-time">Full-time</option>
          <option value="internship">Internship</option>
          <option value="part-time">Part-time</option>
        </select>
      </div>

      {loading ? <div className="empty-state">Loading jobs…</div>
      : jobs.length === 0 ? <div className="empty-state">No jobs match your profile.</div>
      : jobs.map(job => (
        <Link key={job._id} to={`/jobs/${job._id}`} className="card job-card" style={{ display: 'block', marginBottom: 10, textDecoration: 'none', color: 'inherit' }}>
          <div className="flex-between">
            <div>
              <div className="job-title">{job.title}</div>
              <div className="job-meta">{job.company} · {job.location}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`badge badge-${job.jobType}`}>{job.jobType}</span>
              {job.ctc && <div className="text-xs text-muted mt-4">{job.ctc}</div>}
            </div>
          </div>
          <div className="job-footer">
            <span>Min CGPA: {job.eligibility?.minCgpa || 0}</span>
            {job.eligibility?.branches?.length > 0 && <span>Branches: {job.eligibility.branches.join(', ')}</span>}
            <span style={{ marginLeft: 'auto' }}>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}