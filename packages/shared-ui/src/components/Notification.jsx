import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

const TONE_STYLES = {
  success: {
    container: 'border-emerald-200 bg-white text-slate-900',
    iconWrap: 'bg-emerald-50 text-emerald-600',
    Icon: CheckCircle2,
  },
  error: {
    container: 'border-red-200 bg-white text-slate-900',
    iconWrap: 'bg-red-50 text-red-600',
    Icon: AlertCircle,
  },
  info: {
    container: 'border-cyan-200 bg-white text-slate-900',
    iconWrap: 'bg-cyan-50 text-cyan-600',
    Icon: Info,
  },
};

export function NotificationProvider({ children }) {
  const [items, setItems] = useState([]);

  const dismiss = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(({ title, message, type = 'info', duration = 4200 }) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setItems((prev) => [...prev.slice(-3), { id, title, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, duration);
    }
    return id;
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, dismiss }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0"
        aria-live="polite"
      >
        {items.map((item) => {
          const style = TONE_STYLES[item.type] || TONE_STYLES.info;
          const Icon = style.Icon;
          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg transition-all ${style.container}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.iconWrap}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                {item.title && (
                  <p className="text-xs font-semibold text-slate-900">
                    {item.title}
                  </p>
                )}
                {item.message && (
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                    {item.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      notify: () => {},
      dismiss: () => {},
    };
  }
  return ctx;
}
