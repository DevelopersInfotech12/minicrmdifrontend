'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FolderKanban, CreditCard, StickyNote, UserPlus, RefreshCw, Moon, Sun, Zap, LogOut, UserCircle, CalendarDays, Receipt, UserCheck, Banknote } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';

const nav = [
  { href:'/dashboard', label:'Dashboard',  icon:LayoutDashboard },
  { href:'/clients',   label:'Clients',    icon:Users },
  { href:'/leads',     label:'Leads',      icon:UserPlus },
  { href:'/projects',  label:'Projects',   icon:FolderKanban },
  { href:'/recurring', label:'Recurring',  icon:RefreshCw },
  { href:'/payments',  label:'Payments',   icon:CreditCard },
  { href:'/invoices',  label:'Invoices',   icon:Receipt },
  { href:'/notes',     label:'Notes',      icon:StickyNote },
  { href:'/calendar',  label:'Calendar',   icon:CalendarDays },
  { href:'/employees', label:'Employees',  icon:UserCheck },
  { href:'/payroll',   label:'Payroll',    icon:Banknote },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = mounted && theme === 'dark';
  const [user,   setUser]       = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    authApi.me().then(r => setUser(r.data.data.user)).catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await authApi.logout(); } catch {}
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=none';
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login';
  };

  const sidebarBg    = isDark ? '#0f0e0c' : '#072041';
  const activeColor  = isDark ? '#e8b84b' : '#e6e6eb';
  const activeBg     = isDark ? 'rgba(232,184,75,0.12)' : '#006cc465';
  const activeBorder = isDark ? 'rgba(232,184,75,0.25)' : 'rgba(129,140,248,0.3)';
  const initials     = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'A';

  return (
    <aside style={{ width:240, flexShrink:0, background:sidebarBg, borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ height:2, background: isDark
        ? 'linear-gradient(90deg,#b88c2a,#e8b84b,#f5cc6a,#e8b84b)'
        : 'linear-gradient(90deg,#b88c2a,#e8b84b,#f5cc6a,#e8b84b)'
      }} />

      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/06">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: isDark ? 'linear-gradient(135deg,#e8b84b,#b88c2a)' : 'linear-gradient(135deg,#818cf8,#4f46e5)', boxShadow:'0 4px 12px rgba(0,0,0,0.3)' }}>
            <Zap size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display font-extrabold text-sm text-white tracking-tight leading-none">MiniCRM</p>
            <p className="text-[9px] font-bold tracking-widest uppercase mt-0.5 text-white/60">Agency Suite</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
        {nav.map(({ href, label, icon:Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className="block mb-0.5 no-underline">
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer"
                style={{ background: active ? activeBg : 'transparent', border:`1px solid ${active ? activeBorder : 'transparent'}` }}>
                <Icon size={16} color={active ? activeColor : 'rgb(255, 255, 255)'} strokeWidth={active ? 2.5 : 2} />
                <span className="text-sm flex-1" style={{ fontWeight: active ? 800 : 600, color: active ? activeColor : 'rgb(255, 255, 255)' }}>
                  {label}
                </span>
                {badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 uppercase tracking-wide">
                    {badge}
                  </span>
                )}
                {active && !badge && <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeColor }} />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2.5 py-2.5 border-t border-white/06 space-y-2">
        <button onClick={toggle}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl bg-white/06 border border-white/08 cursor-pointer transition-all hover:bg-white/10">
          {isDark ? <Sun size={15} color="#e8b84b" /> : <Moon size={15} color="#ffffff" />}
          <span className="text-xs font-bold text-white flex-1 text-left">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          <div className="w-9 h-5 rounded-full relative transition-all" style={{ background: isDark ? '#e8b84b' : '#6366f1' }}>
            <div className="absolute top-1 w-3 h-3 bg-white rounded-full shadow transition-all" style={{ left: isDark ? '20px' : '4px' }} />
          </div>
        </button>

        <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/06 border border-white/08 no-underline hover:bg-white/10 transition-all">
          {user?.avatar
            ? <img src={user.avatar} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
            : <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-[#0a0a0a] flex-shrink-0"
                style={{ background: isDark ? 'linear-gradient(135deg,#e8b84b,#b88c2a)' : 'linear-gradient(135deg,#818cf8,#4f46e5)' }}>
                {initials}
              </div>
          }
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/90 leading-none truncate">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-white/40 mt-0.5 truncate">{user?.email || ''}</p>
          </div>
          <UserCircle size={14} className="text-white/30 flex-shrink-0" />
        </Link>
{/* 
        <button onClick={handleLogout} disabled={loggingOut}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl cursor-pointer transition-all border border-red-500/20 bg-red-500/08 hover:bg-red-500/15">
          <LogOut size={14} color="#f87171" />
          <span className="text-xs font-semibold text-red-400 flex-1 text-left">
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </span>
        </button> */}
      </div>
    </aside>
  );
}
