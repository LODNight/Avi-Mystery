import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, ShieldAlert } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = 'info', duration = 3500, title = null }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration, title }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((message, title) => addToast({ message, title, type: 'success' }), [addToast]);
  const showError = useCallback((message, title) => addToast({ message, title, type: 'error' }), [addToast]);
  const showWarning = useCallback((message, title) => addToast({ message, title, type: 'warning' }), [addToast]);
  const showInfo = useCallback((message, title) => addToast({ message, title, type: 'info' }), [addToast]);
  const showHQ = useCallback((message, title) => addToast({ message, title, type: 'hq' }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showSuccess, showError, showWarning, showInfo, showHQ }}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        role="region"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      addToast: () => {},
      removeToast: () => {},
      showSuccess: () => {},
      showError: () => {},
      showWarning: () => {},
      showInfo: () => {},
      showHQ: () => {},
    };
  }
  return context;
}

function ToastItem({ toast, onDismiss }) {
  const { type, message, title } = toast;

  const styles = {
    success: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/90 text-emerald-200',
      icon: <CheckCircle2 className="size-4 shrink-0 text-emerald-400 mt-0.5" />,
      defaultTitle: 'Thành công',
    },
    error: {
      border: 'border-rose-500/40',
      bg: 'bg-rose-950/90 text-rose-200',
      icon: <AlertCircle className="size-4 shrink-0 text-rose-400 mt-0.5" />,
      defaultTitle: 'Lỗi',
    },
    warning: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/90 text-amber-200',
      icon: <AlertTriangle className="size-4 shrink-0 text-amber-400 mt-0.5" />,
      defaultTitle: 'Cảnh báo',
    },
    hq: {
      border: 'border-amber-500/60 ring-1 ring-amber-500/30',
      bg: 'bg-zinc-950/95 text-amber-100',
      icon: <ShieldAlert className="size-4 shrink-0 text-amber-400 mt-0.5" />,
      defaultTitle: 'Trụ Sở HQ Thông Báo',
    },
    info: {
      border: 'border-sky-500/40',
      bg: 'bg-sky-950/90 text-sky-200',
      icon: <Info className="size-4 shrink-0 text-sky-400 mt-0.5" />,
      defaultTitle: 'Thông tin',
    },
  }[type] || {
    border: 'border-border',
    bg: 'bg-card text-card-foreground',
    icon: <Info className="size-4 shrink-0 text-primary mt-0.5" />,
    defaultTitle: 'Thông báo',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-200 animate-slide-up ${styles.bg} ${styles.border}`}
      role="alert"
    >
      {styles.icon}
      <div className="flex-1 min-w-0 pr-1">
        {title && <p className="text-xs font-bold tracking-wide uppercase mb-0.5 opacity-90">{title}</p>}
        <p className="text-xs leading-relaxed font-medium break-words">{message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="p-1 rounded-md text-foreground/50 hover:text-foreground hover:bg-white/10 transition-colors shrink-0"
        aria-label="Đóng thông báo"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
