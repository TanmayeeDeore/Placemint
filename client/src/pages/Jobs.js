import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const TYPE_BADGE = {
  'full-time':  'bg-blue-50 text-blue-700',
  'internship': 'bg-teal-50 text-teal-700',
  'part-time':  'bg-purple-50 text-purple-700',
};

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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job listings</h1>
          <p className="text-sm text-gray-400 mt-1">
            {loading ? 'Loading…' : `${jobs.length} position${jobs.length!==1?'s':''} matching your profile`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input placeholder="Search by title or company…" className="input pl-9"
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <select className="input w-40" value={jobType} onChange={e => setJobType(e.target.value)}>
          <option value="">All types</option>
          <option value="full-time">Full-time</option>
          <option value="internship">Internship</option>
          <option value="part-time">Part-time</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium text-gray-600">No jobs match your profile</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or update your CGPA and branch in your profile</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <Link key={job._id} to={`/jobs/${job._id}`}
              className="card p-5 block hover:border-brand-200 hover:shadow-md transition-all no-underline">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-semibold text-gray-900 truncate">{job.title}</h2>
                  </div>
                  <p className="text-sm text-gray-500">{job.company} · {job.location}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_BADGE[job.jobType]||'bg-gray-50 text-gray-600'}`}>
                    {job.jobType}
                  </span>
                  {job.ctc && <p className="text-xs text-gray-400 mt-1">{job.ctc}</p>}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Min CGPA: {job.eligibility?.minCgpa || 0}
                </span>
                {job.eligibility?.branches?.length > 0 && (
                  <span>{job.eligibility.branches.join(', ')}</span>
                )}
                <span className="ml-auto flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {new Date(job.deadline).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}