import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const dash = user.role === 'student' ? '/student'
             : user.role === 'teacher' ? '/teacher' : '/employer';

  return (
    <nav className="navbar">
      <Link to={dash} className="navbar-brand">SnappHire</Link>
      <div className="navbar-links">
        {user.role === 'student' && <>
          <Link to="/jobs"            className="navbar-link">Jobs</Link>
          <Link to="/my-applications" className="navbar-link">My applications</Link>
          <Link to="/profile"         className="navbar-link">Profile</Link>
        </>}
        {user.role === 'employer' && <>
          <Link to="/employer" className="navbar-link">Dashboard</Link>
          <Link to="/jobs/new" className="navbar-link">Post a job</Link>
        </>}
        {user.role === 'teacher' && <>
          <Link to="/teacher" className="navbar-link">Dashboard</Link>
        </>}

        <NotificationBell />

        <span className="navbar-user">{user.name}</span>
        <button className="btn-logout" onClick={() => { logout(); navigate('/login'); }}>
          Logout
        </button>
      </div>
    </nav>
  );
}