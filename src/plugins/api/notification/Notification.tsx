import React, { useEffect, useRef } from "react";
import {
  useNotificationStore,
  removeNotification,
  setFocusedNotification,
  focusNextNotification,
  focusPreviousNotification,
  executeAction,
} from "@plugins/api/notification/notificationStore";

const severityIcon = {
  info: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      className="mr-1 flex-shrink-0"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="9" fill="var(--color-info)" />
      <text
        x="10"
        y="15"
        textAnchor="middle"
        fontSize="12"
        fill="var(--color-fg)"
        fontWeight="bold"
      >
        i
      </text>
    </svg>
  ),
  warning: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      className="mr-1 flex-shrink-0"
      aria-hidden="true"
    >
      <polygon points="10,3 19,17 1,17" fill="var(--color-warning)" />
      <text
        x="10"
        y="15"
        textAnchor="middle"
        fontSize="12"
        fill="var(--color-fg)"
        fontWeight="bold"
      >
        !
      </text>
    </svg>
  ),
  error: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      className="mr-1 flex-shrink-0"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="9" fill="var(--color-danger)" />
      <line
        x1="6"
        y1="6"
        x2="14"
        y2="14"
        stroke="var(--color-fg)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="14"
        y1="6"
        x2="6"
        y2="14"
        stroke="var(--color-fg)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

interface NotificationItemProps {
  notification: any;
  isFocused: boolean;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  isFocused,
  onFocus,
  onKeyDown,
}) => {
  const notifId = notification.id;
  const itemRef = useRef<HTMLDivElement>(null);

  // Auto-focus the element when it becomes focused
  useEffect(() => {
    if (isFocused && itemRef.current) {
      itemRef.current?.focus();
    }
  }, [isFocused]);

  return (
    <div
      ref={itemRef}
      tabIndex={0}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      style={{
        background: "var(--color-secondary)",
        color: "var(--color-fg)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        outline: isFocused ? "2px solid var(--color-primary)" : "none",
        outlineOffset: "2px",
      }}
      className="p-2 rounded flex flex-col w-80 transition-all duration-300 ease-in-out opacity-100 translate-y-0 animate-fadein"
      role="alert"
      aria-label={`${notification.severity || "info"} notification from ${notification.pluginName}`}
    >
      <div className="flex items-center mb-0.5">
        {severityIcon[notification.severity as keyof typeof severityIcon] ||
          severityIcon.info}
        <span
          className="text-xs font-bold ml-1"
          style={{ color: "var(--color-fg)" }}
        >
          {notification.pluginName}
        </span>
        <button
          className="btn btn-secondary btn-sm ml-auto text-base leading-none"
          onClick={() => removeNotification(notifId)}
          aria-label="Close notification"
          style={{ padding: "0.125rem 0.375rem" }}
        >
          ×
        </button>
      </div>
      <span
        className="text-xs break-words mt-0.5 leading-relaxed"
        style={{ color: "var(--color-fg)" }}
      >
        {notification.message}
      </span>
      {notification.action && (
        <div className="mt-2 flex justify-end">
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              executeAction(notification.action!.actionId);
            }}
            aria-label={`Action: ${notification.action.label}`}
          >
            {notification.action.label}
          </button>
        </div>
      )}
    </div>
  );
};

export const NotificationModal: React.FC = () => {
  const notifications = useNotificationStore((s) => s.notifications);
  const focusedNotificationId = useNotificationStore(
    (s) => s.focusedNotificationId,
  );
  const visible = notifications.slice(0, 3);
  const hiddenCount = notifications.length - visible.length;

  const handleClearAll = () => {
    notifications.forEach((n) => removeNotification(n.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent, notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);

    switch (e.key) {
      case "q":
      case "Q":
        e.preventDefault();
        removeNotification(notificationId);
        break;
      case "Enter":
        e.preventDefault();
        if (notification?.action) {
          executeAction(notification.action.actionId);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        focusNextNotification();
        break;
      case "ArrowUp":
        e.preventDefault();
        focusPreviousNotification();
        break;
      case "Home":
        e.preventDefault();
        useNotificationStore.getState().focusFirstNotification();
        break;
      case "End":
        e.preventDefault();
        useNotificationStore.getState().focusLastNotification();
        break;
      case "Escape":
        e.preventDefault();
        setFocusedNotification(null);
        break;
    }
  };

  const handleFocus = (notificationId: string) => {
    setFocusedNotification(notificationId);
  };

  // Focus the first notification when notifications appear
  useEffect(() => {
    if (notifications.length > 0 && !focusedNotificationId) {
      setFocusedNotification(notifications[0].id);
    }
  }, [notifications.length, focusedNotificationId]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed left-4 bottom-12 z-50 flex flex-col items-start space-y-1"
      role="region"
      aria-label="Notifications"
    >
      {visible.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          isFocused={focusedNotificationId === n.id}
          onFocus={() => handleFocus(n.id)}
          onKeyDown={(e) => handleKeyDown(e, n.id)}
        />
      ))}
      {hiddenCount > 0 && (
        <div className="flex items-center mt-2 bg-[var(--color-secondary)] bg-opacity-80 rounded px-3 py-2 text-xs text-gray-200 w-80">
          <span className="flex-1">+{hiddenCount} more notifications</span>
          <button
            className="btn btn-danger btn-sm ml-4"
            onClick={handleClearAll}
          >
            Clear All
          </button>
        </div>
      )}
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
