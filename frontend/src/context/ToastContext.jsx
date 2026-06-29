import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext(null);

let uid = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++uid;
    setToasts(prev => [...prev, { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  // Cleanup on unmount
  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
          zIndex: 9999, pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'all',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem', fontWeight: 600,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              animation: 'slideInToast 0.2s ease',
              background: t.type === 'error'
                ? 'rgba(255,40,60,0.15)'
                : t.type === 'warning'
                ? 'rgba(255,202,85,0.15)'
                : 'rgba(41,238,114,0.15)',
              border: `1px solid ${t.type === 'error' ? 'var(--danger)' : t.type === 'warning' ? 'var(--gold)' : 'var(--green)'}`,
              color: t.type === 'error' ? 'var(--danger)' : t.type === 'warning' ? 'var(--gold)' : 'var(--green)',
            }}
            onClick={() => dismiss(t.id)}
          >
            <span>{t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : '✓'}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
