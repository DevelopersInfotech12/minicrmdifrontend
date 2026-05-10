'use client';
import { useState } from 'react';
import { authApi, saveToken } from '@/lib/api';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      toast.success('Welcome back!');
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  const inputCls = (field) => ({
    width: '100%', padding: '12px 14px 12px 44px',
    background: 'rgba(255,255,255,0.06)',
    border: `1.5px solid ${focused === field ? '#e8b84b' : 'rgba(255,255,255,0.10)'}`,
    borderRadius: 12, color: '#ffffff', fontSize: 14,
    fontFamily: 'Inter, sans-serif', outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: focused === field ? '0 0 0 3px rgba(232,184,75,0.15)' : 'none',
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0d0c0a',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(232,184,75,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.06) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 420, padding: 24 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#e8b84b,#b88c2a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(232,184,75,0.3)' }}>
            <Zap size={26} color="#0a0a0a" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#ffffff', letterSpacing: '-0.03em', margin: 0 }}>MiniCRM</h1>
          <p style={{ fontSize: 14, color: '#8a7a65', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>Sign in to your agency dashboard</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(22,20,16,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, backdropFilter: 'blur(20px)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
          <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#e8b84b,transparent)', borderRadius: 99, marginBottom: 28 }} />

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9a8a70', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused === 'email' ? '#e8b84b' : '#6a5a48', pointerEvents: 'none', transition: 'color 0.2s' }} />
                <input type="email" placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                  style={inputCls('email')} autoComplete="email" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9a8a70', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused === 'password' ? '#e8b84b' : '#6a5a48', pointerEvents: 'none', transition: 'color 0.2s' }} />
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                  style={{ ...inputCls('password'), paddingRight: 44 }} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6a5a48', padding: 0, display: 'flex' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: 12, marginTop: 4,
              background: loading ? 'rgba(232,184,75,0.5)' : 'linear-gradient(135deg,#f5cc6a,#e8b84b)',
              color: '#0a0a0a', fontSize: 14, fontWeight: 700, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Syne, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : '0 4px 16px rgba(232,184,75,0.3)',
            }}>
              {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />

          <p style={{ textAlign: 'center', fontSize: 13, color: '#6a5a48', fontFamily: 'Inter, sans-serif' }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: '#e8b84b', fontWeight: 600, textDecoration: 'none' }}>
              Create your admin account
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#3a2a18', marginTop: 24, fontFamily: 'Inter, sans-serif' }}>
          MiniCRM Agency Suite · Each account has its own isolated data
        </p>
      </div>
    </div>
  );
}
