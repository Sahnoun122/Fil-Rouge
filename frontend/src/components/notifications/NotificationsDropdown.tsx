'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { notificationsService } from '@/src/services/notificationsService';
import type { NotificationItem } from '@/src/types/notification.types';

const POLLING_INTERVAL_MS = 30000;

export default function NotificationsDropdown() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationsService.listNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();

    const interval = setInterval(() => {
      void loadNotifications();
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void loadNotifications();
  }, [isOpen, loadNotifications]);

  useEffect(() => {
    const handleWindowFocus = () => {
      void loadNotifications();
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkOneAsRead = useCallback(async (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification._id === id
          ? { ...notification, isRead: true }
          : notification,
      ),
    );

    try {
      await notificationsService.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read', error);
      await loadNotifications();
    }
  }, [loadNotifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!unreadCount || isMutating) {
      return;
    }

    setIsMutating(true);
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true })),
    );

    try {
      await notificationsService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
      await loadNotifications();
    } finally {
      setIsMutating(false);
    }
  }, [isMutating, loadNotifications, unreadCount]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-300/30">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">Notifications</p>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={!unreadCount || isMutating}
              className="text-xs font-semibold text-violet-700 transition disabled:cursor-not-allowed disabled:text-slate-400"
            >
              Tout marquer lu
            </button>
          </div>

          {isLoading ? (
            <p className="py-6 text-center text-sm text-slate-500">Chargement...</p>
          ) : notifications.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Aucune notification
            </p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => {
                    if (!notification.isRead) {
                      void handleMarkOneAsRead(notification._id);
                    }
                  }}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                    notification.isRead
                      ? 'border-slate-200 bg-slate-50'
                      : 'border-violet-200 bg-violet-50/70'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">
                    {notification.title}
                  </p>
                  <p className="mt-1 line-clamp-3 text-xs text-slate-600">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {notification.sentAt
                      ? new Date(notification.sentAt).toLocaleString()
                      : 'En attente'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
