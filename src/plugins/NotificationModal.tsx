import React, { useEffect, useRef } from 'react';
import { useNotificationStore } from '@plugins/notificationStore';

const severityIcon = {
  info: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="mr-1 flex-shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="var(--color-info)" />
      <text x="10" y="15" textAnchor="middle" fontSize="12" fill="var(--color-fg)" fontWeight="bold">i</text>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="mr-1 flex-shrink-0" aria-hidden="true">
      <polygon points="10,3 19,17 1,17" fill="var(--color-warning)" />
      <text x="10" y="15" textAnchor="middle" fontSize="12" fill="var(--color-fg)" fontWeight="bold">!</text>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="mr-1 flex-shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="var(--color-danger)" />
      <line x1="6" y1="6" x2="14" y2="14" stroke="var(--color-fg)" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="6" x2="6" y2="14" stroke="var(--color-fg)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export const NotificationModal: React.FC = () => {
  const notifications = useNotificationStore((s) => s.notifications);
  const removeNotification = useNotificationStore((s) => s.removeNotification);
  const timers = useRef<{ [key: number]: NodeJS.Timeout }>({});

  useEffect(() => {
    notifications.forEach(n => {
      if (!timers.current[n.timestamp]) {
        timers.current[n.timestamp] = setTimeout(() => {
          removeNotification(n.timestamp);
          delete timers.current[n.timestamp];
        }, 5000);
      }
    });
    // Clean up timers for removed notifications
    Object.keys(timers.current).forEach(ts => {
      if (!notifications.find(n => n.timestamp === Number(ts))) {
        clearTimeout(timers.current[Number(ts)]);
        delete timers.current[Number(ts)];
      }
    });
    // Cleanup on unmount
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};
    };
  }, [notifications, removeNotification]);

  return (
    <div className="fixed left-4 bottom-12 z-50 flex flex-col items-start space-y-1">
      {notifications.map(n => (
        <div
          key={n.timestamp}
          style={{
            background: 'var(--color-secondary)',
            color: 'var(--color-fg)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          }}
          className="p-2 rounded flex flex-col min-w-[300px] max-w-md transition-all duration-300 ease-in-out opacity-100 translate-y-0 animate-fadein"
        >
          <div className="flex items-center mb-0.5">
            {severityIcon[n.severity || 'info']}
            <span className="text-xs font-bold ml-1" style={{ color: 'var(--color-fg)' }}>{n.pluginName}</span>
            <button
              className="ml-auto text-gray-400 hover:text-white text-base leading-none"
              onClick={() => removeNotification(n.timestamp)}
              aria-label="Close notification"
              style={{ color: 'var(--color-fg)' }}
            >
              ×
            </button>
          </div>
          <span className="text-xs break-words mt-0.5" style={{ color: 'var(--color-fg)' }}>{n.message}</span>
        </div>
      ))}
      <style>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein {
          animation: fadein 0.3s;
        }
      `}</style>
    </div>
  );
}; 