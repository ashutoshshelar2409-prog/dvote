import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Loader2, X } from 'lucide-react';

export default function StatusToast({ toast, onDismiss }) {
  if (!toast) return null;

  const { type, title, message, duration = 6000 } = toast;

  useEffect(() => {
    if (type === 'success' || type === 'info') {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss, type, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} color="#10b981" />;
      case 'error':
        return <AlertCircle size={20} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={20} color="#f59e0b" />;
      case 'pending':
        return <Loader2 size={20} color="#3b82f6" className="animate-spin" />;
      default:
        return <AlertCircle size={20} color="#3b82f6" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'rgba(16, 185, 129, 0.4)';
      case 'error':
        return 'rgba(239, 68, 68, 0.4)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.4)';
      case 'pending':
        return 'rgba(59, 130, 246, 0.4)';
      default:
        return 'var(--border-subtle)';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 200,
      maxWidth: '420px',
      width: 'calc(100% - 3rem)',
    }}>
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: '#131b2e',
          border: `1px solid ${getBorderColor()}`,
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem',
          boxShadow: 'var(--shadow-card)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ marginTop: '0.1rem', flexShrink: 0 }}>
          {getIcon()}
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.2rem',
          }}>
            {title}
          </h4>
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
            wordBreak: 'break-word',
          }}>
            {message}
          </p>
        </div>

        <button
          onClick={onDismiss}
          style={{
            backgroundColor: 'transparent',
            color: 'var(--text-muted)',
            padding: '0.2rem',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

