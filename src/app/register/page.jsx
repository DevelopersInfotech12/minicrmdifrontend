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

  const inputStyle = (field) => ({
    width: '100%',
    padding: '12px 14px 12px 44px',
    background: focused === field ? '#ffffff' : '#f8f6f2',
    border: `1.5px solid ${focused === field ? '#c8922a' : '#e8e0d4'}`,
    borderRadius: 10,
    color: '#1a1208',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: focused === field ? '0 0 0 3px rgba(200,146,42,0.12)' : '0 1px 2px rgba(0,0,0,0.04)',
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:wght@400;500;600&display=swap');

        .register-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #fcfcfc;
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }

        .card {
          background: #ffffff;
          border: 1px solid #ede5d8;
          border-radius: 20px;
          padding: 36px 32px;
          box-shadow:
            0 1px 0 #ede5d8,
            0 4px 6px rgba(0,0,0,0.03),
            0 16px 40px rgba(0,0,0,0.07);
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #e8b84b, #c8922a, #e8b84b);
          background-size: 200% 100%;
          animation: shimmer 3s ease infinite;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .submit-btn {
          width: 100%;
          padding: 13px;
          border-radius: 10px;
          margin-top: 6px;
          background: #6366f1;
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          font-family: 'Fraunces', serif;
          letter-spacing: 0.01em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(99,102,241,0.30), 0 1px 2px rgba(0,0,0,0.08);
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          pointer-events: none;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.35), 0 2px 4px rgba(0,0,0,0.10);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0;
          color: #b8a898;
          font-size: 12px;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #ede5d8;
        }

        .label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #9a8878;
          margin-bottom: 7px;
          font-family: 'DM Sans', sans-serif;
        }

        .logo-ring {
          animation: pulse-ring 3s ease-in-out infinite;
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 6px 20px rgba(99,102,241,0.25); }
          50%       { box-shadow: 0 8px 28px rgba(99,102,241,0.40); }
        }

        .info-banner {
          background: rgba(200,146,42,0.07);
          border: 1px solid rgba(200,146,42,0.20);
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        input::placeholder { color: #c8b8a8; }
      `}</style>

      <div className="register-root">
        <div style={{ width: '100%', maxWidth: 420, padding: '24px 20px', position: 'relative', zIndex: 1 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div
              className="logo-ring"
              style={{
                width: 52, height: 52, borderRadius: 16,
                background: '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <Zap size={24} color="#ffffff" strokeWidth={2.5} />
            </div>
            <h1 style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 700, fontSize: 30,
              color: '#1a1208',
              letterSpacing: '-0.03em',
              margin: 0, lineHeight: 1,
            }}>
              MiniCRM
            </h1>
            <p style={{ fontSize: 14, color: '#9a8878', marginTop: 7, fontFamily: "'DM Sans', sans-serif" }}>
              Create your agency dashboard
            </p>
          </div>

          {/* Card */}
          <div className="card">

            {/* Info banner */}
            <div className="info-banner">
              <span style={{ fontSize: 15 }}>💡</span>
              <p style={{ fontSize: 12, color: '#a07830', margin: 0, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                Each account has its own private workspace. Your clients, projects and data are completely isolated.
              </p>
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Name */}
              <div>
                <label className="label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    style={{
                      position: 'absolute', left: 14, top: '50%',
                      transform: 'translateY(-50%)',
                      color: focused === 'name' ? '#c8922a' : '#b8a898',
                      pointerEvents: 'none', transition: 'color 0.2s',
                    }}
                  />
                  <input
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused('')}
                    style={inputStyle('name')}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute', left: 14, top: '50%',
                      transform: 'translateY(-50%)',
                      color: focused === 'email' ? '#c8922a' : '#b8a898',
                      pointerEvents: 'none', transition: 'color 0.2s',
                    }}
                  />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    style={inputStyle('email')}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute', left: 14, top: '50%',
                      transform: 'translateY(-50%)',
                      color: focused === 'password' ? '#c8922a' : '#b8a898',
                      pointerEvents: 'none', transition: 'color 0.2s',
                    }}
                  />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                    style={{ ...inputStyle('password'), paddingRight: 44 }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#b8a898', padding: 4, display: 'flex',
                      borderRadius: 6, transition: 'color 0.2s',
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute', left: 14, top: '50%',
                      transform: 'translateY(-50%)',
                      color: focused === 'confirm' ? '#c8922a' : '#b8a898',
                      pointerEvents: 'none', transition: 'color 0.2s',
                    }}
                  />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onFocus={() => setFocused('confirm')}
                    onBlur={() => setFocused('')}
                    style={{
                      ...inputStyle('confirm'),
                      paddingRight: 44,
                      border: `1.5px solid ${confirm && confirm !== password ? '#ef4444' : focused === 'confirm' ? '#c8922a' : '#e8e0d4'}`,
                    }}
                  />
                </div>
                {confirm && confirm !== password && (
                  <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5, fontFamily: "'DM Sans', sans-serif" }}>
                    Passwords do not match
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading
                  ? 'Creating account…'
                  : <><span>Create Account</span><ArrowRight size={15} /></>
                }
              </button>
            </form>

            <div className="divider">or</div>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#9a8878', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#c8b8a8', marginTop: 22, fontFamily: "'DM Sans', sans-serif" }}>
            MiniCRM Agency Suite · Each account has its own isolated data
          </p>
        </div>
      </div>
    </>
  );
}