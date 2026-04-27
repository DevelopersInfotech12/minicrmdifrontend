'use client';
import { X } from 'lucide-react';

// ── Button ──────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', style: extraStyle = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    border: 'none', borderRadius: '10px', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-body)', fontWeight: 500, transition: 'all 0.15s ease',
    opacity: disabled ? 0.5 : 1,
  };
  const sizes = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '10px 18px', fontSize: '13px' },
    lg: { padding: '13px 24px', fontSize: '14px' },
  };
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff', boxShadow: '0 0 20px var(--accent-glow)' },
    secondary: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
    danger: { background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(244,63,94,0.2)' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid transparent' },
    success: { background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(16,217,160,0.2)' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...extraStyle }}>
      {children}
    </button>
  );
}

// ── Badge ──────────────────────────────────────────────────────────
export function Badge({ children, color = 'default' }) {
  const colors = {
    default: { background: 'var(--bg-elevated)', color: 'var(--text-secondary)' },
    success: { background: 'var(--success-bg)', color: 'var(--success)' },
    warning: { background: 'var(--warning-bg)', color: 'var(--warning)' },
    danger: { background: 'var(--danger-bg)', color: 'var(--danger)' },
    info: { background: 'var(--info-bg)', color: 'var(--info)' },
    accent: { background: 'var(--accent-glow)', color: 'var(--accent)' },
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
      letterSpacing: '0.3px', ...colors[color],
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
      {children}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────────
export function Card({ children, style: extra = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '16px',
      padding: '24px',
      cursor: onClick ? 'pointer' : 'default',
      transition: onClick ? 'all 0.15s ease' : undefined,
      ...extra,
    }}>
      {children}
    </div>
  );
}

// ── Input ──────────────────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>{label}</label>}
      <input {...props} style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
        borderRadius: '10px', padding: '10px 14px',
        color: 'var(--text-primary)', fontSize: '13px',
        fontFamily: 'var(--font-body)', width: '100%',
        outline: 'none', transition: 'border-color 0.15s',
        ...props.style,
      }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'}
      />
      {error && <span style={{ fontSize: '11px', color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
}

// ── Select ──────────────────────────────────────────────────────────
export function Select({ label, error, children, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>{label}</label>}
      <select {...props} style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
        borderRadius: '10px', padding: '10px 14px',
        color: 'var(--text-primary)', fontSize: '13px',
        fontFamily: 'var(--font-body)', width: '100%', outline: 'none',
        cursor: 'pointer',
      }}>
        {children}
      </select>
      {error && <span style={{ fontSize: '11px', color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────
export function Textarea({ label, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>{label}</label>}
      <textarea {...props} style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
        borderRadius: '10px', padding: '10px 14px',
        color: 'var(--text-primary)', fontSize: '13px',
        fontFamily: 'var(--font-body)', width: '100%', outline: 'none',
        resize: 'vertical', minHeight: '90px',
        ...props.style,
      }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'}
      />
      {error && <span style={{ fontSize: '11px', color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = '520px' }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      padding: '16px',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px', width, maxWidth: '100%',
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
        animation: 'modalIn 0.2s ease',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 24px 0', marginBottom: '20px',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {title}
          </h2>
          <button onClick={onClose} style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '6px', cursor: 'pointer',
            color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
          }}>
            <X size={14} />
          </button>
        </div>
        <div style={{ padding: '0 24px 24px' }}>{children}</div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

// ── PageHeader ──────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          {title}
        </h1>
        {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── EmptyState ──────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '16px',
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <Icon size={28} color="var(--text-muted)" />
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>{description}</p>
      {action}
    </div>
  );
}

// ── Spinner ──────────────────────────────────────────────────────
export function Spinner({ size = 24 }) {
  return (
    <>
      <div style={{
        width: size, height: size,
        border: '2px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ── LoadingPage ──────────────────────────────────────────────────
export function LoadingPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <Spinner size={36} />
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color = 'accent', sub }) {
  const colors = {
    accent: { bg: 'var(--accent-glow)', icon: 'var(--accent)' },
    success: { bg: 'var(--success-bg)', icon: 'var(--success)' },
    warning: { bg: 'var(--warning-bg)', icon: 'var(--warning)' },
    danger: { bg: 'var(--danger-bg)', icon: 'var(--danger)' },
    info: { bg: 'var(--info-bg)', icon: 'var(--info)' },
  };
  const c = colors[color];
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px' }}>{label}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>{sub}</div>}
        </div>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={20} color={c.icon} />
        </div>
      </div>
    </Card>
  );
}

// ── Avatar ──────────────────────────────────────────────────────
export function Avatar({ name, size = 36 }) {
  const { getInitials } = require('@/src/lib/utils');
  const colors = ['#6c63ff','#10d9a0','#f59e0b','#f43f5e','#38bdf8','#a78bfa','#fb7185'];
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color + '22', border: `1.5px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color,
      fontFamily: 'var(--font-display)', flexShrink: 0,
    }}>
      {getInitials(name)}
    </div>
  );
}

// ── ConfirmDialog ──────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="400px">
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </Modal>
  );
}
