import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const h = e => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!user) return null;

  const dash = user.role === 'student' ? '/student' : user.role === 'teacher' ? '/teacher' : '/employer';
  const isActive = path => location.pathname === path;

  const navLink = (to, label) => (
    <Link to={to} className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors
      ${isActive(to) ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
      {label}
    </Link>
  );

  const initials = user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const roleColor = user.role === 'student' ? 'bg-brand-100 text-brand-600'
                  : user.role === 'teacher' ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-orange-100 text-orange-600';

  return (
    <nav className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between sticky top-0 z-50">
      {/* Brand */}
      <Link to={dash} className="font-bold text-lg text-brand-600 tracking-tight">
        Place<span className="text-gray-900">mint</span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {user.role === 'student' && <>
          {navLink('/student', 'Dashboard')}
          {navLink('/jobs', 'Jobs')}
          {navLink('/my-applications', 'Applications')}
          {navLink('/profile', 'Profile')}
        </>}
        {user.role === 'employer' && <>
          {navLink('/employer', 'Dashboard')}
          {navLink('/jobs/new', 'Post a job')}
        </>}
        {user.role === 'teacher' && <>
          {navLink('/teacher', 'Dashboard')}
        </>}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <NotificationBell />

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(o => !o)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${roleColor}`}>
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-gray-800 leading-tight">{user.name?.split(' ')[0]}</p>
              <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
            </div>
            <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden py-1">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
                <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${roleColor}`}>
                  {user.role}
                </span>
              </div>
              {user.role === 'student' && (
                <Link to="/profile" onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  My Profile
                </Link>
              )}
              <Link to={dash} onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                Dashboard
              </Link>
              <div className="border-t border-gray-50 mt-1 pt-1">
                <button onClick={() => { logout(); navigate('/login'); setProfileOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}