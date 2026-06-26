import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {}
  }, [user]);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 30000);
    return () => clearInterval(id);
  }, [fetch]);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markRead, markAllRead };
}