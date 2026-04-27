'use client';
import { useState } from 'react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email,         setEmail]        = useState('');
  const [password,      setPassword]     = useState('');
  const [showPass,      setShowPass]     = useState(false);
  const [loading,       setLoading]      = useState(false);
  const [googleLoading, setGoogleLoading]= useState(false);
  const [focused,       setFocused]      = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      await authApi.login({ email, password });
      toast.success('Welcome back!');
      // Full page reload so proxy.js reads the fresh httpOnly cookie
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    setGoogleLoading(true);
    authApi.googleLogin();
  };

  const inputCls = (field) => ({
    width: '100%',
    padding: '12px 14px 12px 44px',
    background: 'rgba(255,255,255,0.06)',
    border: `1.5px solid ${focused === field ? '#e8b84b' : 'rgba(255,255,255,0.10)'}`,
    borderRadius: 12,
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: focused === field ? '0 0 0 3px rgba(232,184,75,0.15)' : 'none',
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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

          {/* Gold top line */}
          <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#e8b84b,transparent)', borderRadius: 99, marginBottom: 28 }} />

          {/* Google button */}
          <button onClick={handleGoogle} disabled={googleLoading}
            style={{ width: '100%', padding: '12px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#ffffff', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', marginBottom: 20, fontFamily: 'Inter, sans-serif', opacity: googleLoading ? 0.7 : 1 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 12, color: '#6a5a48', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>or sign in with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused === 'email' ? '#e8b84b' : '#6a5a48', pointerEvents: 'none', transition: 'color 0.2s' }} />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                style={inputCls('email')}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused === 'password' ? '#e8b84b' : '#6a5a48', pointerEvents: 'none', transition: 'color 0.2s' }} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                style={{ ...inputCls('password'), paddingRight: 44 }}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6a5a48', padding: 0, display: 'flex' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', borderRadius: 12, marginTop: 4, background: loading ? 'rgba(232,184,75,0.5)' : 'linear-gradient(135deg,#f5cc6a,#e8b84b)', color: '#0a0a0a', fontSize: 14, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Syne, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s ease', boxShadow: loading ? 'none' : '0 4px 16px rgba(232,184,75,0.3)' }}>
              {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Register link */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#6a5a48', marginTop: 20, fontFamily: 'Inter, sans-serif' }}>
            No account yet?{' '}
            <Link href="/register" style={{ color: '#e8b84b', fontWeight: 600, textDecoration: 'none' }}>
              Create admin account
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#3a2a18', marginTop: 24, fontFamily: 'Inter, sans-serif' }}>
          MiniCRM Agency Suite · Secure access
        </p>
      </div>
    </div>
  );
}
