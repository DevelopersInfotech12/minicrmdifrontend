'use client';
import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import { Users, FolderKanban, CreditCard, TrendingUp, Clock, ArrowUpRight, RefreshCw, UserPlus, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import PageHeader from '@/components/ui/PageHeader';

const fmt = (v) => !v ? '₹0' : '₹' + Number(v).toLocaleString('en-IN');

function StatCard({ label, value, icon: Icon, gradient, sub, delay=0, loading }) {
  return (
    <div className=" relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/09 p-5 shadow-card dark:shadow-card-dark"
      style={{ animationDelay:`${delay}ms` }}>

      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background:gradient }}>
          <Icon size={19} color="#fff" strokeWidth={2.5} />
        </div>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-500 font-sans">{sub}</span>
      </div>
      {loading ? (
        <><div className="skeleton h-8 w-24 rounded-lg mb-1.5" /><div className="skeleton h-3.5 w-28 rounded" /></>
      ) : (
        <>
          <p className="font-display font-extrabold text-2xl text-gray-600 dark:text-white tracking-tight leading-none">{value ?? 0}</p>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1.5">{label}</p>
        </>
      )}
    </div>
  );
}

function AlertCard({ icon:Icon, message, sub, color, href }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3 animate-fade-up border"
      style={{ background:`${color}12`, borderColor:`${color}35` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:`${color}20` }}>
        <Icon size={16} color={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{message}</p>
        {sub && <p className="text-xs font-medium text-gray-500 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs font-bold no-underline px-3 py-1.5 rounded-lg border transition-all"
          style={{ color, background:`${color}15`, borderColor:`${color}30` }}>
          View <ArrowUpRight size={11} />
        </Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(() => {
    dashboardApi.getStats().then(r=>setData(r.data.data)).catch(console.error).finally(()=>setLoading(false));
  }, []);

  const d = data || {};
  const alerts = [];
  if (d.alerts?.overdueCount>0)    alerts.push({ icon:CreditCard,  color:'#ef4444', msg:`${d.alerts.overdueCount} milestone payment${d.alerts.overdueCount>1?'s':''} overdue`,        sub:fmt(d.alerts.totalMilestonePending)+' pending', href:'/payments' });
  if (d.recurring?.overdueCount>0) alerts.push({ icon:RefreshCw,   color:'#f59e0b', msg:`${d.recurring.overdueCount} recurring renewal${d.recurring.overdueCount>1?'s':''} overdue`, sub:fmt(d.recurring.monthlyRevenue)+'/mo',          href:'/recurring' });
  if (d.tasks?.overdue>0)          alerts.push({ icon:CheckSquare,  color:'#f97316', msg:`${d.tasks.overdue} task${d.tasks.overdue>1?'s':''} overdue across projects`,                 href:'/projects' });
  if (d.leads?.followUpsDue>0)     alerts.push({ icon:UserPlus,     color:'#a78bfa', msg:`${d.leads.followUpsDue} lead follow-up${d.leads.followUpsDue>1?'s':''} due`,                 href:'/leads' });

  const secondaryCards = [
    { label:'Monthly Recurring', value:fmt(d.recurring?.monthlyRevenue), icon:RefreshCw,   color:'#e8b84b', sub:'MRR' },
    { label:'Total Leads',       value:d.leads?.total??0,                icon:UserPlus,    color:'#a78bfa', sub:`${d.leads?.new??0} new` },
    { label:'Active Projects',   value:d.projects?.active??0,            icon:Clock,       color:'#34d399', sub:`${d.projects?.completed??0} completed` },
    { label:'Task Progress',     value:`${d.tasks?.completionPct??0}%`,  icon:CheckSquare, color:'#60a5fa', sub:`${d.tasks?.done??0}/${d.tasks?.total??0} tasks` },
  ];

  const projectBreakdown = [
    { label:'Active',    count:d.projects?.active,    color:'#34d399', borderColor:'rgba(52,211,153,0.25)',  bg:'rgba(52,211,153,0.08)' },
    { label:'Completed', count:d.projects?.completed, color:'#60a5fa', borderColor:'rgba(96,165,250,0.25)',  bg:'rgba(96,165,250,0.08)' },
    { label:'On Hold',   count:d.projects?.onHold,    color:'#fbbf24', borderColor:'rgba(251,191,36,0.25)',  bg:'rgba(251,191,36,0.08)' },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your agency at a glance" />

      {alerts.length > 0 && (
        <div className="flex flex-col gap-2 mb-6">
          {alerts.map((a,i) => <AlertCard key={i} icon={a.icon} message={a.msg} sub={a.sub} color={a.color} href={a.href} />)}
        </div>
      )}

      {/* Main stats */}
  <div className="grid grid-cols-4 gap-3.5 mb-3.5">
  <StatCard
    label="Total Clients"
    value={d.clients?.total}
    icon={Users}
    gradient="linear-gradient(135deg,#fbbf24,#b45309)"
    sub={`${d.clients?.active ?? 0} active`}
    loading={loading}
    delay={0}
  />

  <StatCard
    label="Total Projects"
    value={d.projects?.total}
    icon={FolderKanban}
    gradient="linear-gradient(135deg,#a78bfa,#5b21b6)"
    sub={`${d.projects?.active ?? 0} active`}
    loading={loading}
    delay={50}
  />

  <StatCard
    label="Total Revenue"
    value={fmt(d.payments?.totalRevenue)}
    icon={TrendingUp}
    gradient="linear-gradient(135deg,#34d399,#065f46)"
    sub="All time"
    loading={loading}
    delay={100}
  />

  <StatCard
    label="Pending Payments"
    value={fmt(d.payments?.totalPending)}
    icon={CreditCard}
    gradient="linear-gradient(135deg,#f87171,#7f1d1d)"
    sub="Outstanding"
    loading={loading}
    delay={150}
  />
</div>

      {/* Secondary cards */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        {secondaryCards.map(({ label, value, icon:Icon, color, sub }, i) => (
          <div key={label} className="animate-fade-up bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/09 rounded-xl px-4 py-4 flex items-center gap-3.5 shadow-card dark:shadow-card-dark"
            style={{ animationDelay:`${200+i*50}ms` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
              style={{ background:`${color}18`, borderColor:`${color}30` }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              {loading
                ? <div className="skeleton h-5 w-20 rounded mb-1" />
                : <p className="font-display font-bold text-lg text-gray-700 dark:text-white tracking-tight leading-none">{value}</p>
              }
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">{label}</p>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-600">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Project breakdown */}
      <div className="grid grid-cols-3 gap-3.5 mb-6 ">
        {projectBreakdown.map(({ label, count, color, borderColor, bg }) => (
          <div key={label} className="animate-fade-up rounded-xl px-5 py-4 border"
            style={{ background:bg, borderColor }}>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:color }} />
              <span className="text-[11px] font-bold uppercase tracking-widest font-sans" style={{ color }}>{label}</span>
            </div>
            {loading
              ? <div className="skeleton h-8 w-12 rounded" />
              : <p className="font-display font-extrabold text-3xl tracking-tight" style={{ color }}>{count ?? 0}</p>
            }
          </div>
        ))}
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { title:'Recent Clients',  href:'/clients',  items:d.recentClients,  emptyMsg:'No clients yet',  gradient:'linear-gradient(135deg,#e8b84b,#9a7020)', render:c => ({ name:c.name, sub:c.company||c.email, link:`/clients/${c._id}`, badge:<StatusBadge status={c.isActive} /> }) },
          { title:'Recent Projects', href:'/projects', items:d.recentProjects, emptyMsg:'No projects yet', gradient:'linear-gradient(135deg,#a78bfa,#6d28d9)', render:p => ({ name:p.title, sub:p.client?.name, link:`/projects/${p._id}`, badge:<StatusBadge status={p.status} /> }) },
        ].map(({ title, href, items, emptyMsg, gradient, render }, ti) => (
          <div key={ti} className="animate-fade-up bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/09 rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark"
            style={{ animationDelay:`${300+ti*50}ms` }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/08">
              <p className="font-display font-bold text-sm text-gray-900 dark:text-white">{title}</p>
              <Link href={href} className="flex items-center gap-1 text-xs font-bold text-gold-600 dark:text-gold-400 no-underline hover:text-gold-700">
                View all <ArrowUpRight size={11} />
              </Link>
            </div>
            {loading ? (
              Array.from({length:4}).map((_,i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-white/06">
                  <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
                  <div className="flex-1"><div className="skeleton h-3.5 w-2/5 rounded mb-1.5" /><div className="skeleton h-3 w-1/4 rounded" /></div>
                </div>
              ))
            ) : items?.length ? items.map((item, i) => {
              const r = render(item);
              return (
                <Link key={i} href={r.link} className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-white/06 no-underline hover:bg-gray-50 dark:hover:bg-[#1e1b16] transition-colors group">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-sm text-[#0a0a0a]"
                    style={{ background:gradient }}>
                    {r.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-600 dark:text-white truncate">{r.name}</p>
                    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 truncate mt-0.5">{r.sub}</p>
                  </div>
                  {r.badge}
                </Link>
              );
            }) : <p className="text-sm font-medium text-gray-400 dark:text-gray-600 text-center py-8">{emptyMsg}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
