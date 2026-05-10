'use client';
import { useState } from 'react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Zap, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState('');

  const inputCls = (field) => ({
    width: '100%', padding: '12px 14px 12px 44px',
    background: 'rgba(255,255,255,0.06)',
    border: `1.5px solid ${focused === field ? '#e8b84b' : 'rgba(255,255,255,0.10)'}`,
    borderRadius: 12, color: '#ffffff', fontSize: 14,
    fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'all 0.2s ease',
    boxShadow: focused === field ? '0 0 0 3px rgba(232,184,75,0.15)' : 'none',
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('All fields are required');
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await authApi.register({ name, email, password });
      toast.success('Account created! Welcome to MiniCRM 🎉');
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0d0c0a',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(232,184,75,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.06) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 440, padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#e8b84b,#b88c2a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(232,184,75,0.3)' }}>
            <Zap size={26} color="#0a0a0a" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#ffffff', letterSpacing: '-0.03em', margin: 0 }}>Create Your Account</h1>
          <p style={{ fontSize: 13, color: '#8a7a65', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>Your own isolated CRM workspace</p>
        </div>

        <div style={{ background: 'rgba(22,20,16,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, backdropFilter: 'blur(20px)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
          <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#e8b84b,transparent)', borderRadius: 99, marginBottom: 28 }} />

          {/* Info banner */}
          <div style={{ background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <p style={{ fontSize: 12, color: '#c8a855', margin: 0, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
              Each account has its own private workspace. Your clients, projects and data are completely isolated from other accounts.
            </p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9a8a70', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused==='name'?'#e8b84b':'#6a5a48', pointerEvents: 'none', transition: 'color 0.2s' }} />
                <input placeholder="John Doe" value={name} onChange={e=>setName(e.target.value)}
                  onFocus={()=>setFocused('name')} onBlur={()=>setFocused('')}
                  style={inputCls('name')} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9a8a70', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused==='email'?'#e8b84b':'#6a5a48', pointerEvents: 'none', transition: 'color 0.2s' }} />
                <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}
                  onFocus={()=>setFocused('email')} onBlur={()=>setFocused('')}
                  style={inputCls('email')} autoComplete="email" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9a8a70', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused==='password'?'#e8b84b':'#6a5a48', pointerEvents: 'none', transition: 'color 0.2s' }} />
                <input type={showPass?'text':'password'} placeholder="Min 6 characters" value={password} onChange={e=>setPassword(e.target.value)}
                  onFocus={()=>setFocused('password')} onBlur={()=>setFocused('')}
                  style={{ ...inputCls('password'), paddingRight: 44 }} autoComplete="new-password" />
                <button type="button" onClick={()=>setShowPass(s=>!s)}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#6a5a48', padding:0, display:'flex' }}>
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9a8a70', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused==='confirm'?'#e8b84b':'#6a5a48', pointerEvents: 'none', transition: 'color 0.2s' }} />
                <input type={showPass?'text':'password'} placeholder="Repeat password" value={confirm} onChange={e=>setConfirm(e.target.value)}
                  onFocus={()=>setFocused('confirm')} onBlur={()=>setFocused('')}
                  style={{ ...inputCls('confirm'), paddingRight: 44, borderColor: confirm && confirm!==password ? '#ef4444' : focused==='confirm'?'#e8b84b':'rgba(255,255,255,0.10)' }} />
              </div>
              {confirm && confirm !== password && (
                <p style={{ fontSize: 12, color: '#f87171', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: 12, marginTop: 4,
              background: loading ? 'rgba(232,184,75,0.5)' : 'linear-gradient(135deg,#f5cc6a,#e8b84b)',
              color: '#0a0a0a', fontSize: 14, fontWeight: 700, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Syne, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : '0 4px 16px rgba(232,184,75,0.3)',
            }}>
              {loading ? 'Creating account…' : <><span>Create Account</span><ArrowRight size={16}/></>}
            </button>
          </form>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />
          <p style={{ textAlign: 'center', fontSize: 13, color: '#6a5a48', fontFamily: 'Inter, sans-serif' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#e8b84b', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
