'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { X, CheckCircle, AlertCircle, Info, Download, FileText } from 'lucide-react';
import Link from 'next/link';

export function NotificationToast() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => {
        const getIcon = () => {
          switch (notification.type) {
            case 'success':
              return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'error':
              return <AlertCircle className="w-5 h-5 text-red-600" />;
            case 'schedule1':
              return <FileText className="w-5 h-5 text-blue-600" />;
            default:
              return <Info className="w-5 h-5 text-blue-600" />;
          }
        };

        const getBgColor = () => {
          switch (notification.type) {
            case 'success':
              return 'bg-green-50 border-green-200';
            case 'error':
              return 'bg-red-50 border-red-200';
            case 'schedule1':
              return 'bg-blue-50 border-blue-200';
            default:
              return 'bg-blue-50 border-blue-200';
          }
        };

        return (
          <div
            key={notification.id}
            className={`${getBgColor()} border rounded-lg shadow-lg p-4 animate-in slide-in-from-right`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[var(--color-text)] mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm text-[var(--color-muted)] mb-2">
                  {notification.message}
                </p>
                {notification.action && (
                  <div className="flex items-center gap-2">
                    {notification.action.href ? (
                      <Link
                        href={notification.action.href}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-navy)] hover:underline"
                        onClick={() => removeNotification(notification.id)}
                      >
                        {notification.action.icon && <notification.action.icon className="w-4 h-4" />}
                        {notification.action.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          if (notification.action.onClick) {
                            notification.action.onClick();
                          }
                          removeNotification(notification.id);
                        }}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-navy)] hover:underline"
                      >
                        {notification.action.icon && <notification.action.icon className="w-4 h-4" />}
                        {notification.action.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 p-1 hover:bg-white/50 rounded transition"
              >
                <X className="w-4 h-4 text-[var(--color-muted)]" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

