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
    <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1c1917] border border-gray-200/80 dark:border-white/[0.07] p-5 hover:border-gray-300 dark:hover:border-white/[0.14] transition-all duration-200 group">
      <div className="flex items-start justify-between mb-5">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: gradient }}>
          <Icon size={18} color="#fff" strokeWidth={2} />
        </div>
        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 tracking-wide">{sub}</span>
      </div>
      {loading ? (
        <><div className="h-7 w-20 rounded bg-gray-100 dark:bg-white/[0.06] animate-pulse mb-2" /><div className="h-3.5 w-24 rounded bg-gray-100 dark:bg-white/[0.06] animate-pulse" /></>
      ) : (
        <>
          <p className="font-display font-bold text-[26px] text-gray-900 dark:text-white tracking-tight leading-none mb-1.5">{value ?? 0}</p>
          <p className="font-display font-semibold text-[13px] text-gray-500 dark:text-gray-100">{label}</p>
        </>
      )}
    </div>
  );
}

// ── Mini Stat ────────────────────────────────────────────────────────────────
function MiniStat({ label, value, icon: Icon, color, sub, loading }) {
  return (
    <div className="bg-gray-100 dark:bg-[#1c1917] border border-gray-200/80 dark:border-white/[0.07] rounded-xl px-4 py-3.5 flex items-center gap-3 hover:border-gray-300 dark:hover:border-white/[0.14] transition-all duration-200">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}>
        <Icon size={17} color={color} />
      </div>
      <div className="flex-1 min-w-0">
        {loading
          ? <div className="h-5 w-16 rounded bg-gray-100 dark:bg-white/[0.06] animate-pulse mb-1" />
          : <p className="font-display font-bold text-[17px] text-gray-900 dark:text-white tracking-tight leading-none">{value}</p>
        }
        <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mt-1 truncate">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Alert Card ───────────────────────────────────────────────────────────────
function AlertCard({ icon: Icon, message, sub, color, href }) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-4 py-2.5 border"
      style={{ background: `${color}08`, borderColor: `${color}25` }}>
      <Icon size={14} color={color} className="flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">{message}</p>
        {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-[11px] font-semibold no-underline px-2.5 py-1 rounded-md border transition-all flex-shrink-0"
          style={{ color, background: `${color}10`, borderColor: `${color}25` }}>
          View <ArrowUpRight size={10} />
        </Link>
      )}
    </div>
  );
}

// ── Breakdown Row ────────────────────────────────────────────────────────────
function BreakdownRow({ label, value, total, color, icon: Icon }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={13} color={color} className="flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-medium text-gray-600 dark:text-gray-400">{label}</span>
          <span className="text-[12px] font-semibold text-gray-800 dark:text-gray-200">{value ?? 0}</span>
        </div>
        <div className="h-1 bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
      <span className="text-[11px] font-medium text-gray-400 w-7 text-right flex-shrink-0">{pct}%</span>
    </div>
  );
}

// ── Section Card wrapper ──────────────────────────────────────────────────────
function SectionCard({ title, href, linkLabel = 'View all', children, icon: Icon }) {
  return (
    <div className="bg-gray-100 dark:bg-[#1c1917] border border-gray-200/80 dark:border-white/[0.07] rounded-xl overflow-hidden">
      {/* Header — bg-gray-100 */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200/80 dark:border-white/[0.05]">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-gray-400 dark:text-gray-500" />}
          <p className="font-display font-semibold text-[13px] text-gray-800 dark:text-gray-100">{title}</p>
        </div>
        {href && (
          <Link href={href} className="flex items-center gap-0.5 text-[11px] font-semibold no-underline hover:underline" style={{ color: 'var(--gold)' }}>
            {linkLabel} <ArrowUpRight size={10} />
          </Link>
        )}
      </div>
      {/* Body — bg-gray-50 */}
      <div className="bg-gray-50 dark:bg-[#141413]">
        {children}
      </div>
    </div>
  );
}

// ── Meeting type icon ────────────────────────────────────────────────────────
const MeetingTypeIcon = ({ type }) => {
  if (type === 'Video Call') return <Video size={12} className="text-blue-500" />;
  if (type === 'Phone Call') return <Phone size={12} className="text-emerald-500" />;
  return <MapPin size={12} className="text-amber-500" />;
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

  const alerts = [];
  if (d.alerts?.overdueCount > 0)    alerts.push({ icon: CreditCard,  color: '#ef4444', msg: `${d.alerts.overdueCount} milestone payment${d.alerts.overdueCount > 1 ? 's' : ''} overdue`,         sub: fmt(d.alerts.totalMilestonePending) + ' pending', href: '/payments' });
  if (d.recurring?.overdueCount > 0) alerts.push({ icon: RefreshCw,   color: '#f59e0b', msg: `${d.recurring.overdueCount} recurring renewal${d.recurring.overdueCount > 1 ? 's' : ''} overdue`, sub: fmt(d.recurring.monthlyRevenue) + '/mo',          href: '/recurring' });
  if (d.tasks?.overdue > 0)          alerts.push({ icon: CheckSquare,  color: '#f97316', msg: `${d.tasks.overdue} task${d.tasks.overdue > 1 ? 's' : ''} overdue`,                                  href: '/projects' });
  if (d.leads?.followUpsDue > 0)     alerts.push({ icon: UserPlus,     color: '#8b5cf6', msg: `${d.leads.followUpsDue} lead follow-up${d.leads.followUpsDue > 1 ? 's' : ''} due`,                   href: '/leads' });

  const fmtTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${ampm}`;
  };

  const paidPct = d.payments?.totalRevenue > 0
    ? Math.round((d.payments.totalPaid / d.payments.totalRevenue) * 100) : 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Dashboard" subtitle="Your agency at a glance" />

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {alerts.map((a, i) => <AlertCard key={i} icon={a.icon} message={a.msg} sub={a.sub} color={a.color} href={a.href} />)}
        </div>
      )}

      {/* ── Primary KPIs ── */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Clients"    value={fmtNum(d.clients?.total)}      icon={Users}        gradient="linear-gradient(135deg,#f59e0b,#d97706)" sub={`${d.clients?.active ?? 0} active`}   loading={loading} />
        <StatCard label="Total Projects"   value={fmtNum(d.projects?.total)}     icon={FolderKanban} gradient="linear-gradient(135deg,#8b5cf6,#6d28d9)" sub={`${d.projects?.active ?? 0} active`}  loading={loading} />
        <StatCard label="Total Revenue"    value={fmt(d.payments?.totalRevenue)} icon={TrendingUp}   gradient="linear-gradient(135deg,#10b981,#059669)"  sub="All time"                             loading={loading} />
        <StatCard label="Pending Payments" value={fmt(d.payments?.totalPending)} icon={CreditCard}   gradient="linear-gradient(135deg,#f43f5e,#e11d48)"  sub={fmt(d.payments?.totalPaid) + ' paid'} loading={loading} />
      </div>

      {/* ── Secondary KPIs ── */}
      <div className="grid grid-cols-4 gap-3">
        <MiniStat label="Monthly Recurring" value={fmt(d.recurring?.monthlyRevenue)}  icon={RefreshCw}   color="#f59e0b" sub="MRR"                                        loading={loading} />
        <MiniStat label="Total Leads"        value={fmtNum(d.leads?.total)}            icon={UserPlus}    color="#8b5cf6" sub={`${d.leads?.new ?? 0} new this month`}       loading={loading} />
        <MiniStat label="Active Projects"    value={fmtNum(d.projects?.active)}        icon={Clock}       color="#10b981" sub={`${d.projects?.completed ?? 0} completed`}   loading={loading} />
        <MiniStat label="Task Completion"    value={`${d.tasks?.completionPct ?? 0}%`} icon={CheckSquare} color="#3b82f6" sub={`${d.tasks?.done ?? 0} of ${d.tasks?.total ?? 0} done`} loading={loading} />
      </div>

      {/* ── Breakdown Section ── */}
      <div className="grid grid-cols-3 gap-3">

        {/* Client Breakdown */}
        <SectionCard title="Clients" href="/clients" icon={Users}>
          <div className="px-5 py-4 space-y-3.5">
            <BreakdownRow label="Total"    value={d.clients?.total}    total={d.clients?.total}  color="#9ca3af" icon={Users}     />
            <BreakdownRow label="Active"   value={d.clients?.active}   total={d.clients?.total}  color="#10b981" icon={UserCheck} />
            <BreakdownRow label="Inactive" value={d.clients?.inactive} total={d.clients?.total}  color="#f43f5e" icon={UserX}     />
          </div>
          <div className="px-5 pb-4 grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
              <p className="font-display font-bold text-lg text-emerald-600 dark:text-emerald-400 leading-none">{d.clients?.active ?? 0}</p>
              <p className="text-[10px] font-semibold text-emerald-600/70 dark:text-emerald-500 uppercase tracking-wider mt-1">Active</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
              <p className="font-display font-bold text-lg text-red-500 dark:text-red-400 leading-none">{d.clients?.inactive ?? 0}</p>
              <p className="text-[10px] font-semibold text-red-500/70 dark:text-red-500 uppercase tracking-wider mt-1">Inactive</p>
            </div>
          </div>
        </SectionCard>

        {/* Project Breakdown */}
        <SectionCard title="Projects" href="/projects" icon={FolderKanban}>
          <div className="px-5 py-4 space-y-3.5">
            <BreakdownRow label="Active"    value={d.projects?.active}    total={d.projects?.total} color="#10b981" icon={CheckCircle2} />
            <BreakdownRow label="Completed" value={d.projects?.completed} total={d.projects?.total} color="#3b82f6" icon={CheckSquare}  />
            <BreakdownRow label="On Hold"   value={d.projects?.onHold}    total={d.projects?.total} color="#f59e0b" icon={Clock}        />
          </div>
          <div className="px-5 pb-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Active',  val: d.projects?.active,    bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', sub: 'text-emerald-600/70 dark:text-emerald-500' },
              { label: 'Done',    val: d.projects?.completed, bg: 'bg-blue-50 dark:bg-blue-900/20',       text: 'text-blue-600 dark:text-blue-400',       sub: 'text-blue-600/70 dark:text-blue-500' },
              { label: 'On Hold', val: d.projects?.onHold,    bg: 'bg-amber-50 dark:bg-amber-900/20',     text: 'text-amber-600 dark:text-amber-400',     sub: 'text-amber-600/70 dark:text-amber-500' },
            ].map(({ label, val, bg, text, sub }) => (
              <div key={label} className={`${bg} rounded-lg p-3 text-center`}>
                <p className={`font-display font-bold text-lg ${text} leading-none`}>{val ?? 0}</p>
                <p className={`text-[10px] font-semibold ${sub} uppercase tracking-wider mt-1`}>{label}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Revenue Breakdown */}
        <SectionCard title="Revenue" href="/payments" icon={TrendingUp}>
          <div className="px-5 py-4">
            <div className="flex items-center gap-4 mb-4">
              {/* Donut */}
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0c00002a" strokeWidth="4" className="text-gray-200 dark:text-white/[0.06]" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="4"
                    strokeDasharray={`${paidPct} 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[10px] font-bold text-gray-700 dark:text-white">{paidPct}%</p>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {[
                  { label: 'Billed',  val: d.payments?.totalRevenue, dot: 'bg-gray-300 dark:bg-white/20' },
                  { label: 'Paid',    val: d.payments?.totalPaid,    dot: 'bg-emerald-400' },
                  { label: 'Pending', val: d.payments?.totalPending, dot: 'bg-amber-400' },
                ].map(({ label, val, dot }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                      <span className="text-[12px] text-gray-500 dark:text-gray-400">{label}</span>
                    </div>
                    <span className="text-[12px] font-semibold text-gray-800 dark:text-gray-200">{fmt(val)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-white/[0.05] flex items-center gap-2">
              <RefreshCw size={11} className="text-amber-500" />
              <span className="text-[11px] text-gray-400 dark:text-gray-500">MRR</span>
              <span className="text-[12px] font-semibold" style={{ color: 'var(--gold)' }}>{fmt(d.recurring?.monthlyRevenue)}</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-3 gap-3">

        {/* Today's Meetings */}
        <SectionCard title="Today's Meetings" href="/calendar" linkLabel="Calendar" icon={CalendarDays}>
          {meetLoad ? (
            <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-white/[0.06] animate-pulse flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-white/[0.06] animate-pulse mb-1.5" />
                    <div className="h-2.5 w-1/3 rounded bg-gray-200 dark:bg-white/[0.06] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : meetings.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center px-5">
              <CalendarDays size={22} className="text-gray-300 dark:text-gray-600 mb-2.5" />
              <p className="text-[13px] font-medium text-gray-400 dark:text-gray-500">No meetings today</p>
              <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-0.5">Your schedule is clear</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {meetings.map(m => (
                <div key={m._id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-100/80 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-gray-200 dark:bg-white/[0.06]">
                    <MeetingTypeIcon type={m.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 dark:text-white truncate">{m.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {m.startTime && (
                        <span className="text-[11px] font-medium" style={{ color: 'var(--gold)' }}>
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
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                    m.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                    m.status === 'Cancelled' ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400' :
                    'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  }`}>
                    {m.status || 'Scheduled'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Recent Clients */}
        <SectionCard title="Recent Clients" href="/clients" icon={Users}>
          {loading ? (
            <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/[0.06] animate-pulse flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-2/5 rounded bg-gray-200 dark:bg-white/[0.06] animate-pulse mb-1.5" />
                    <div className="h-2.5 w-1/4 rounded bg-gray-200 dark:bg-white/[0.06] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : d.recentClients?.length ? (
            <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {d.recentClients.map((c, i) => (
                <Link key={i} href={`/clients/${c._id}`}
                  className="flex items-center gap-3 px-5 py-3 no-underline hover:bg-gray-100/80 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-[12px] text-white bg-indigo-500">
                    {c.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 dark:text-gray-100 truncate">{c.name}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{c.company || c.email}</p>
                  </div>
                  <StatusBadge status={c.isActive} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-gray-400 dark:text-gray-600 text-center py-10">No clients yet</p>
          )}
        </SectionCard>

        {/* Recent Projects */}
        <SectionCard title="Recent Projects" href="/projects" icon={FolderKanban}>
          {loading ? (
            <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/[0.06] animate-pulse flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-2/5 rounded bg-gray-200 dark:bg-white/[0.06] animate-pulse mb-1.5" />
                    <div className="h-2.5 w-1/4 rounded bg-gray-200 dark:bg-white/[0.06] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : d.recentProjects?.length ? (
            <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {d.recentProjects.map((p, i) => (
                <Link key={i} href={`/projects/${p._id}`}
                  className="flex items-center gap-3 px-5 py-3 no-underline hover:bg-gray-100/80 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-[12px] text-white"
                    style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' }}>
                    {p.title[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 dark:text-gray-100 truncate">{p.title}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{p.client?.name || '—'}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-gray-400 dark:text-gray-600 text-center py-10">No projects yet</p>
          )}
        </SectionCard>

      </div>
    </div>
  );
}