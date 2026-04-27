'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FolderKanban, CreditCard, StickyNote, UserPlus, RefreshCw, Moon, Sun, Zap } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const nav = [
  { href:'/dashboard', label:'Dashboard',  icon:LayoutDashboard },
  { href:'/clients',   label:'Clients',    icon:Users },
  { href:'/leads',     label:'Leads',      icon:UserPlus },
  { href:'/projects',  label:'Projects',   icon:FolderKanban },
  { href:'/recurring', label:'Recurring',  icon:RefreshCw },
  { href:'/payments',  label:'Payments',   icon:CreditCard },
  { href:'/notes',     label:'Notes',      icon:StickyNote },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  const sidebarBg = isDark ? '#0f0e0c' : '#1a1d3a';

  return (
    <aside style={{ width:240, flexShrink:0, background:sidebarBg, borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Gold/Indigo top accent */}
      <div style={{ height:2, background: isDark
        ? 'linear-gradient(90deg,#b88c2a,#e8b84b,#f5cc6a,#e8b84b)'
        : 'linear-gradient(90deg,#4f46e5,#818cf8,#a5b4fc,#818cf8)'
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
            <p className="text-[9px] font-bold tracking-widest uppercase mt-0.5"
              style={{ color: isDark ? '#e8b84b' : '#818cf8' }}>Agency Suite</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 px-2.5 pb-2">Menu</p>
        {nav.map(({ href, label, icon:Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          const activeColor = isDark ? '#e8b84b' : '#818cf8';
          const activeBg    = isDark ? 'rgba(232,184,75,0.12)' : 'rgba(129,140,248,0.15)';
          const activeBorder= isDark ? 'rgba(232,184,75,0.25)' : 'rgba(129,140,248,0.3)';
          return (
            <Link key={href} href={href} className="block mb-0.5 no-underline">
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer"
                style={{ background: active ? activeBg : 'transparent', border:`1px solid ${active ? activeBorder : 'transparent'}` }}>
                <Icon size={16} color={active ? activeColor : 'rgba(255, 255, 255, 0.74)'} strokeWidth={active ? 2.5 : 2} />
                <span className="text-sm flex-1" style={{ fontWeight: active ? 800 : 600, color: active ? activeColor : 'rgba(255, 255, 255, 0.89)' }}>
                  {label}
                </span>
                {active && <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeColor }} />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2.5 py-3 border-t border-white/06 space-y-2">
        {/* Theme toggle */}
        <button onClick={toggle} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl bg-white/06 border border-white/01 cursor-pointer transition-all hover:bg-white/10">
          {isDark ? <Sun size={15} color="#e8b84b" /> : <Moon size={15} color="#818cf8" />}
          <span className="text-xs font-semibold text-white/65 flex-1 text-left">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          <div className="w-9 h-5 rounded-full relative transition-all" style={{ background: isDark ? '#e8b84b' : '#6366f1' }}>
            <div className="absolute top-1 w-3 h-3 bg-white rounded-full shadow transition-all" style={{ left: isDark ? '20px' : '4px' }} />
          </div>
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/06 border border-white/08">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-[#0a0a0a] flex-shrink-0"
            style={{ background: isDark ? 'linear-gradient(135deg,#e8b84b,#b88c2a)' : 'linear-gradient(135deg,#818cf8,#4f46e5)' }}>A</div>
          <div>
            <p className="text-xs font-semibold text-white/90 leading-none">Admin</p>
            <p className="text-[10px] text-white/40 mt-0.5">Developersinfotech@gmail.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
