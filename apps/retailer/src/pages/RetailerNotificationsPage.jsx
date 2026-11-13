import React, { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button, EmptyState, PageHeader } from '@yenopay/shared-ui';
import { formatDateTime } from '@yenopay/shared-utils';
import { useRetailerStore } from '../hooks/useRetailerStore.jsx';

export function RetailerNotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } =
    useRetailerStore();
  const [filter, setFilter] = useState('all');

  const visible = notifications.filter((n) =>
    filter === 'unread' ? !n.read : true
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Wallet credit alerts, settlement status updates, and compliance announcements."
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={CheckCheck}
            onClick={markAllNotificationsRead}
          >
            Mark All Read
          </Button>
        }
      />

      <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium cursor-pointer ${
            filter === 'unread'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="No unread notifications at the moment."
        />
      ) : (
        <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {visible.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between ${
                item.read ? 'bg-white' : 'bg-cyan-50/30'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-teal-700">{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDateTime(item.createdAt)}</span>
                  {!item.read && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-cyan-700">Unread</span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-600">{item.body}</p>
              </div>
              {!item.read && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => markNotificationRead(item.id)}
                >
                  Mark Read
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
