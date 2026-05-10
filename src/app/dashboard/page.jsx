'use client';
import { useEffect, useState } from 'react';
import { dashboardApi, meetingsApi } from '@/lib/api';
import {
  Users, FolderKanban, CreditCard, TrendingUp, Clock,
  ArrowUpRight, RefreshCw, UserPlus, CheckSquare,
  CalendarDays, UserCheck, UserX, Video, Phone, MapPin,
  CheckCircle2, XCircle, Banknote, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import PageHeader from '@/components/ui/PageHeader';

const fmt    = (v) => !v ? '₹0' : '₹' + Number(v).toLocaleString('en-IN');
const fmtNum = (v) => v ?? 0;

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, gradient, sub, loading }) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] p-5 shadow-card dark:shadow-card-dark">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: gradient }}>
          <Icon size={19} color="#fff" strokeWidth={2.5} />
        </div>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-500 font-sans">{sub}</span>
      </div>
      {loading ? (
        <><div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse mb-1.5" /><div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-white/10 animate-pulse" /></>
      ) : (
        <>
          <p className="font-display font-extrabold text-2xl text-gray-800 dark:text-white tracking-tight leading-none">{value ?? 0}</p>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1.5">{label}</p>
        </>
      )}
    </div>
  );
}

// ── Mini Stat ────────────────────────────────────────────────────────────────
function MiniStat({ label, value, icon: Icon, color, sub, loading }) {
  return (
    <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-xl px-4 py-4 flex items-center gap-3.5 shadow-card dark:shadow-card-dark">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
        style={{ background: `${color}18`, borderColor: `${color}30` }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        {loading
          ? <div className="h-5 w-20 rounded bg-gray-200 dark:bg-white/10 animate-pulse mb-1" />
          : <p className="font-display font-bold text-lg text-gray-700 dark:text-white tracking-tight leading-none">{value}</p>
        }
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600">{sub}</p>
      </div>
    </div>
  );
}

// ── Alert Card ───────────────────────────────────────────────────────────────
function AlertCard({ icon: Icon, message, sub, color, href }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3 border"
      style={{ background: `${color}12`, borderColor: `${color}35` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
        <Icon size={16} color={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{message}</p>
        {sub && <p className="text-xs font-medium text-gray-500 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs font-bold no-underline px-3 py-1.5 rounded-lg border transition-all"
          style={{ color, background: `${color}15`, borderColor: `${color}30` }}>
          View <ArrowUpRight size={11} />
        </Link>
      )}
    </div>
  );
}

// ── Breakdown Row ────────────────────────────────────────────────────────────
function BreakdownRow({ label, value, total, color, icon: Icon }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}20` }}>
        <Icon size={12} color={color} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-semibold text-gray-600 dark:text-gray-300">{label}</span>
          <span className="text-[12px] font-bold text-gray-800 dark:text-white">{value ?? 0}</span>
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
      <span className="text-[11px] font-bold text-gray-400 w-8 text-right">{pct}%</span>
    </div>
  );
}

// ── Meeting type icon ────────────────────────────────────────────────────────
const MeetingTypeIcon = ({ type }) => {
  if (type === 'Video Call') return <Video size={13} className="text-blue-500" />;
  if (type === 'Phone Call') return <Phone size={13} className="text-green-500" />;
  return <MapPin size={13} className="text-amber-500" />;
};

// ── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data,     setData]     = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [meetLoad, setMeetLoad] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    meetingsApi.getToday()
      .then(r => setMeetings(r.data.data?.meetings || []))
      .catch(() => setMeetings([]))
      .finally(() => setMeetLoad(false));
  }, []);

  const d = data || {};

  // Alerts
  const alerts = [];
  if (d.alerts?.overdueCount > 0)    alerts.push({ icon: CreditCard,  color: '#ef4444', msg: `${d.alerts.overdueCount} milestone payment${d.alerts.overdueCount > 1 ? 's' : ''} overdue`,           sub: fmt(d.alerts.totalMilestonePending) + ' pending', href: '/payments' });
  if (d.recurring?.overdueCount > 0) alerts.push({ icon: RefreshCw,   color: '#f59e0b', msg: `${d.recurring.overdueCount} recurring renewal${d.recurring.overdueCount > 1 ? 's' : ''} overdue`,   sub: fmt(d.recurring.monthlyRevenue) + '/mo',          href: '/recurring' });
  if (d.tasks?.overdue > 0)          alerts.push({ icon: CheckSquare,  color: '#f97316', msg: `${d.tasks.overdue} task${d.tasks.overdue > 1 ? 's' : ''} overdue across projects`,                   href: '/projects' });
  if (d.leads?.followUpsDue > 0)     alerts.push({ icon: UserPlus,     color: '#a78bfa', msg: `${d.leads.followUpsDue} lead follow-up${d.leads.followUpsDue > 1 ? 's' : ''} due`,                   href: '/leads' });

  const fmtTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${ampm}`;
  };

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your agency at a glance" />

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="flex flex-col gap-2 mb-6">
          {alerts.map((a, i) => <AlertCard key={i} icon={a.icon} message={a.msg} sub={a.sub} color={a.color} href={a.href} />)}
        </div>
      )}

      {/* ── Main Stats ── */}
      <div className="grid grid-cols-4 gap-3.5 mb-3.5">
        <StatCard label="Total Clients"     value={fmtNum(d.clients?.total)}           icon={Users}       gradient="linear-gradient(135deg,#fbbf24,#b45309)" sub={`${d.clients?.active ?? 0} active`}    loading={loading} />
        <StatCard label="Total Projects"    value={fmtNum(d.projects?.total)}          icon={FolderKanban} gradient="linear-gradient(135deg,#a78bfa,#5b21b6)" sub={`${d.projects?.active ?? 0} active`}   loading={loading} />
        <StatCard label="Total Revenue"     value={fmt(d.payments?.totalRevenue)}      icon={TrendingUp}  gradient="linear-gradient(135deg,#34d399,#065f46)"  sub={d.payments?.projectsWithBudget > 0 ? `${d.payments.projectsWithBudget} projects` : 'All time'}  loading={loading} />
        <StatCard label="Pending Payments"  value={fmt(d.payments?.totalPending)}      icon={CreditCard}  gradient="linear-gradient(135deg,#f87171,#7f1d1d)"  sub={fmt(d.payments?.totalPaid) + ' paid'}          loading={loading} />
      </div>

      {/* ── Secondary Stats ── */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <MiniStat label="Monthly Recurring" value={fmt(d.recurring?.monthlyRevenue)}    icon={RefreshCw}   color="#e8b84b" sub="MRR"                                          loading={loading} />
        <MiniStat label="Total Leads"       value={fmtNum(d.leads?.total)}              icon={UserPlus}    color="#a78bfa" sub={`${d.leads?.new ?? 0} new`}                   loading={loading} />
        <MiniStat label="Active Projects"   value={fmtNum(d.projects?.active)}          icon={Clock}       color="#34d399" sub={`${d.projects?.completed ?? 0} completed`}    loading={loading} />
        <MiniStat label="Task Progress"     value={`${d.tasks?.completionPct ?? 0}%`}   icon={CheckSquare} color="#60a5fa" sub={`${d.tasks?.done ?? 0}/${d.tasks?.total ?? 0} tasks`} loading={loading} />
      </div>

      {/* ── Breakdown Section ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        {/* Client Breakdown */}
        <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 shadow-card dark:shadow-card-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-gray-800 dark:text-white">Clients</h3>
            <Link href="/clients" className="text-[11px] font-bold text-amber-600 dark:text-amber-400 no-underline flex items-center gap-0.5 hover:underline">
              View all <ArrowUpRight size={10} />
            </Link>
          </div>
          <div className="space-y-3.5">
            <BreakdownRow label="Total"    value={d.clients?.total}    total={d.clients?.total}  color="#6b7280" icon={Users}     />
            <BreakdownRow label="Active"   value={d.clients?.active}   total={d.clients?.total}  color="#34d399" icon={UserCheck} />
            <BreakdownRow label="Inactive" value={d.clients?.inactive} total={d.clients?.total}  color="#f87171" icon={UserX}     />
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/[0.06] grid grid-cols-2 gap-2">
            <div className="text-center">
              <p className="font-display font-black text-xl text-emerald-600 dark:text-emerald-400">{d.clients?.active ?? 0}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</p>
            </div>
            <div className="text-center">
              <p className="font-display font-black text-xl text-red-500">{d.clients?.inactive ?? 0}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inactive</p>
            </div>
          </div>
        </div>

        {/* Project Breakdown */}
        <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 shadow-card dark:shadow-card-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-gray-800 dark:text-white">Projects</h3>
            <Link href="/projects" className="text-[11px] font-bold text-amber-600 dark:text-amber-400 no-underline flex items-center gap-0.5 hover:underline">
              View all <ArrowUpRight size={10} />
            </Link>
          </div>
          <div className="space-y-3.5">
            <BreakdownRow label="Active"    value={d.projects?.active}    total={d.projects?.total} color="#34d399" icon={CheckCircle2} />
            <BreakdownRow label="Completed" value={d.projects?.completed} total={d.projects?.total} color="#60a5fa" icon={CheckSquare}  />
            <BreakdownRow label="On Hold"   value={d.projects?.onHold}    total={d.projects?.total} color="#fbbf24" icon={Clock}        />
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/[0.06] grid grid-cols-3 gap-1">
            {[
              { label: 'Active',    val: d.projects?.active,    color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Done',      val: d.projects?.completed, color: 'text-blue-600 dark:text-blue-400' },
              { label: 'On Hold',   val: d.projects?.onHold,    color: 'text-amber-600 dark:text-amber-400' },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center">
                <p className={`font-display font-black text-xl ${color}`}>{val ?? 0}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 shadow-card dark:shadow-card-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-gray-800 dark:text-white">Revenue</h3>
            <Link href="/payments" className="text-[11px] font-bold text-amber-600 dark:text-amber-400 no-underline flex items-center gap-0.5 hover:underline">
              View all <ArrowUpRight size={10} />
            </Link>
          </div>
          {/* Donut */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-gray-200 dark:text-white/10" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#34d399" strokeWidth="3.5"
                  strokeDasharray={`${d.payments?.totalRevenue > 0 ? Math.round((d.payments.totalPaid / d.payments.totalRevenue) * 100) : 0} 100`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[11px] font-black text-gray-800 dark:text-white">
                  {d.payments?.totalRevenue > 0 ? Math.round((d.payments.totalPaid / d.payments.totalRevenue) * 100) : 0}%
                </p>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {[
                { label: 'Billed',  val: d.payments?.totalRevenue, color: 'bg-gray-300 dark:bg-white/20' },
                { label: 'Paid',    val: d.payments?.totalPaid,    color: 'bg-emerald-400' },
                { label: 'Pending', val: d.payments?.totalPending, color: 'bg-amber-400' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}</span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 dark:text-white">{fmt(val)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <RefreshCw size={11} className="text-amber-500" />
              <span className="text-[11px] text-gray-500 dark:text-gray-400">MRR:</span>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{fmt(d.recurring?.monthlyRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Today's Meetings + Recent Tables ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Today's Meetings */}
        <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-amber-500" />
              <p className="font-display font-bold text-sm text-gray-900 dark:text-white">Today's Meetings</p>
            </div>
            <Link href="/calendar" className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 no-underline hover:underline">
              Calendar <ArrowUpRight size={11} />
            </Link>
          </div>

          {meetLoad ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-3.5 w-2/3 rounded bg-gray-200 dark:bg-white/10 animate-pulse mb-1.5" />
                  <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
                </div>
              </div>
            ))
          ) : meetings.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center px-5">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] flex items-center justify-center mb-3">
                <CalendarDays size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No meetings today</p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">Your schedule is clear</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
              {meetings.map(m => (
                <div key={m._id} className="flex items-start gap-3 px-5 py-3 hover:bg-white dark:hover:bg-[#1e1b16] transition-colors">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.25)' }}>
                    <MeetingTypeIcon type={m.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-800 dark:text-white truncate">{m.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {m.startTime && (
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          {fmtTime(m.startTime)}{m.endTime ? ` – ${fmtTime(m.endTime)}` : ''}
                        </span>
                      )}
                      {(m.client?.name || m.lead?.name) && (
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                          · {m.client?.name || m.lead?.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                    m.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                    m.status === 'Cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}>
                    {m.status || 'Scheduled'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/[0.06]">
            <p className="font-display font-bold text-sm text-gray-900 dark:text-white">Recent Clients</p>
            <Link href="/clients" className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 no-underline hover:underline">
              View all <ArrowUpRight size={11} />
            </Link>
          </div>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse flex-shrink-0" />
                <div className="flex-1"><div className="h-3.5 w-2/5 rounded bg-gray-200 dark:bg-white/10 animate-pulse mb-1.5" /><div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-white/10 animate-pulse" /></div>
              </div>
            ))
          ) : d.recentClients?.length ? d.recentClients.map((c, i) => (
            <Link key={i} href={`/clients/${c._id}`}
              className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-white/[0.06] no-underline hover:bg-white dark:hover:bg-[#1e1b16] transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-[#0a0a0a]"
                style={{ background: 'linear-gradient(135deg,#e8b84b,#9a7020)' }}>
                {c.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-700 dark:text-white truncate">{c.name}</p>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 truncate">{c.company || c.email}</p>
              </div>
              <StatusBadge status={c.isActive} />
            </Link>
          )) : <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-8">No clients yet</p>}
        </div>

        {/* Recent Projects */}
        <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/[0.06]">
            <p className="font-display font-bold text-sm text-gray-900 dark:text-white">Recent Projects</p>
            <Link href="/projects" className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 no-underline hover:underline">
              View all <ArrowUpRight size={11} />
            </Link>
          </div>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse flex-shrink-0" />
                <div className="flex-1"><div className="h-3.5 w-2/5 rounded bg-gray-200 dark:bg-white/10 animate-pulse mb-1.5" /><div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-white/10 animate-pulse" /></div>
              </div>
            ))
          ) : d.recentProjects?.length ? d.recentProjects.map((p, i) => (
            <Link key={i} href={`/projects/${p._id}`}
              className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-white/[0.06] no-underline hover:bg-white dark:hover:bg-[#1e1b16] transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg,#a78bfa,#6d28d9)' }}>
                {p.title[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-700 dark:text-white truncate">{p.title}</p>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 truncate">{p.client?.name || '—'}</p>
              </div>
              <StatusBadge status={p.status} />
            </Link>
          )) : <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-8">No projects yet</p>}
        </div>

      </div>
    </div>
  );
}