import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);
  const nav  = useNavigate();

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = async (n) => {
    await markRead(n._id);
    setOpen(false);
    if (n.jobId) nav(`/jobs/${n.jobId}`);
  };

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="notif-btn" onClick={() => setOpen(o => !o)}>
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="section-head">
            <span className="section-title">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                style={{ fontSize: 11, color: '#534AB7', background: 'none', border: 'none', cursor: 'pointer' }}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#bbb', fontSize: 13 }}>
              No notifications
            </div>
          ) : (
            notifications.slice(0, 15).map(n => (
              <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                onClick={() => handleClick(n)}>
                <div className="notif-msg">{n.message}</div>
                <div className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}