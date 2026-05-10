'use client';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { User, Mail, Lock, LogOut, Shield, Chrome, Eye, EyeOff, Save, Camera } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-50 dark:bg-[#1a1714] border border-gray-200 dark:border-white/12 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-gold-500 dark:focus:border-gold-400 focus:ring-2 focus:ring-gold-500/20 transition-all";
const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#c8b896] mb-1.5";

export default function ProfilePage() {
  const router = useRouter();
  const [user,          setUser]         = useState(null);
  const [loading,       setLoading]      = useState(true);
  const [saving,        setSaving]       = useState(false);
  const [loggingOut,    setLoggingOut]   = useState(false);
  const [name,          setName]         = useState('');
  const [email,         setEmail]        = useState('');
  const [currentPass,   setCurrentPass]  = useState('');
  const [newPass,       setNewPass]      = useState('');
  const [confirmPass,   setConfirmPass]  = useState('');
  const [showCurrent,   setShowCurrent]  = useState(false);
  const [showNew,       setShowNew]      = useState(false);
  const [changingPass,  setChangingPass] = useState(false);

  useEffect(() => {
  authApi.me()
    .then(r => {
      const u = r.data.data.user;
      setUser(u);
      setName(u.name || '');
      setEmail(u.email || '');
    })
    .catch((err) => {
      console.error('Profile error:', err?.response?.status, err?.response?.data);
      if (err?.response?.status !== 401) {
        toast.error('Failed to load profile');
      }
    })
    .finally(() => setLoading(false));
}, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authApi.updateProfile({ name, email });
      setUser(res.data.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) return toast.error('Passwords do not match');
    if (newPass.length < 6) return toast.error('Password must be at least 6 characters');
    setChangingPass(true);
    try {
      await authApi.changePassword({ currentPassword: currentPass, newPassword: newPass });
      toast.success('Password changed successfully!');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally { setChangingPass(false); }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch {}
    // Clear cookie client-side too
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=none';
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login';
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'A';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your account settings" />

      <div className="grid grid-cols-3 gap-6">

        {/* LEFT — Avatar + Info card */}
        <div className="col-span-1 space-y-4">

          {/* Avatar card */}
          <div className="bg-gray-100 dark:bg-[#161410] border border-gray-200 dark:border-white/09 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-gold-400/30" />
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-[#0a0a0a] font-display"
                  style={{ background:'linear-gradient(135deg,#e8b84b,#b88c2a)' }}>
                  {initials}
                </div>
              )}
            </div>
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/20">
              <Shield size={11} className="text-gold-600 dark:text-gold-400" />
              <span className="text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wide">Admin</span>
            </div>
          </div>

          {/* Account info card */}
          <div className="bg-gray-100 dark:bg-[#161410] border border-gray-200 dark:border-white/09 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500">Account Info</h3>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/12 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Mail size={13} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wide">Email</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/12 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Chrome size={13} className="text-purple-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wide">Google Linked</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.googleId ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-500/12 border border-green-200 dark:border-green-500/20 flex items-center justify-center flex-shrink-0">
                <User size={13} className="text-green-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wide">Last Login</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN', { dateStyle:'medium' }) : 'Now'}
                </p>
              </div>
            </div>
          </div>

          {/* Logout card */}
          <div className="bg-red-50 dark:bg-red-500/08 border border-red-200 dark:border-red-500/20 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-3">Danger Zone</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              Sign out of your account on this device.
            </p>
            <button onClick={handleLogout} disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl
              bg-red-500 hover:bg-red-600 text-white text-sm font-bold
              border-none cursor-pointer transition-all disabled:opacity-60">
              <LogOut size={15} />
              {loggingOut ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        </div>

        {/* RIGHT — Edit forms */}
        <div className="col-span-2 space-y-5">

          {/* Edit Profile */}
          <div className="bg-gray-100 dark:bg-[#161410] border border-gray-200 dark:border-white/09 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-white/08">
              <div className="w-9 h-9 rounded-xl bg-gold-400/12 border border-gold-400/20 flex items-center justify-center">
                <User size={16} className="text-gold-600 dark:text-gold-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-gray-900 dark:text-white">Edit Profile</h3>
                <p className="text-xs text-gray-500 dark:text-gray-500">Update your name and email address</p>
              </div>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={saving}
                  className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm cursor-pointer disabled:opacity-60">
                  <Save size={14} />
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password — only for email/password accounts */}
          {user?.password !== null && (
            <div className="bg-gray-100 dark:bg-[#161410] border border-gray-200 dark:border-white/09 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-white/08">
                <div className="w-9 h-9 rounded-xl bg-purple-400/12 border border-purple-400/20 flex items-center justify-center">
                  <Lock size={16} className="text-purple-500" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900 dark:text-white">Change Password</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Update your password — min 6 characters</p>
                </div>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className={labelCls}>Current Password</label>
                  <div className="relative">
                    <input type={showCurrent ? 'text' : 'password'} className={inputCls} value={currentPass}
                      onChange={e => setCurrentPass(e.target.value)} placeholder="••••••••" style={{ paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowCurrent(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer bg-transparent border-none">
                      {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>New Password</label>
                    <div className="relative">
                      <input type={showNew ? 'text' : 'password'} className={inputCls} value={newPass}
                        onChange={e => setNewPass(e.target.value)} placeholder="••••••••" style={{ paddingRight: 44 }} />
                      <button type="button" onClick={() => setShowNew(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none">
                        {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Confirm New Password</label>
                    <input type="password" className={`${inputCls} ${confirmPass && confirmPass !== newPass ? 'border-red-400' : ''}`}
                      value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="••••••••" />
                    {confirmPass && confirmPass !== newPass && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={changingPass}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                    bg-purple-500 hover:bg-purple-600 text-white border-none cursor-pointer transition-all disabled:opacity-60">
                    <Lock size={14} />
                    {changingPass ? 'Changing…' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Google-only account notice */}
          {user?.googleId && !user?.password && (
            <div className="bg-blue-50 dark:bg-blue-500/08 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-5 flex items-start gap-3">
              <Chrome size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-400">Google Account</p>
                <p className="text-sm text-blue-600 dark:text-blue-500 mt-1 leading-relaxed">
                  This account is linked to Google. Password change is not available for Google-only accounts.
                  You can set a password by logging in with email/password after requesting a reset.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
