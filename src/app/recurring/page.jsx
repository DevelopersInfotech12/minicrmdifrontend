'use client';
import { useEffect, useState, useCallback } from 'react';
import { projectsApi } from '@/lib/api';
import { RefreshCw, AlertCircle, Calendar, TrendingUp, Users, Clock, Pencil, ExternalLink, Search } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ProjectForm from '@/components/projects/ProjectForm';
import ActivityLog from '@/components/ui/ActivityLog';

const fmt  = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtD = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const CYCLE_CFG = {
  Monthly:       { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.35)'  },
  Quarterly:     { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)' },
  'Half-yearly': { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.35)'  },
  Yearly:        { color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.35)'  },
};

const multiplier = { Monthly: 1, Quarterly: 1 / 3, 'Half-yearly': 1 / 6, Yearly: 1 / 12 };

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, gradient, sub, loading }) {
  return (
    <div className="relative rounded-xl overflow-hidden bg-white dark:bg-[#1c1917] border border-gray-200/80 dark:border-white/[0.07] p-5 hover:border-gray-300 dark:hover:border-white/[0.14] transition-all duration-200">
      <div className="flex items-start justify-between mb-5">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: gradient }}>
          <Icon size={18} color="#fff" strokeWidth={2} />
        </div>
        {sub && <span className="text-[11px] font-semibold text-red-500 tracking-wide">{sub}</span>}
      </div>
      {loading ? (
        <>
          <div className="h-7 w-20 rounded bg-gray-100 dark:bg-white/[0.06] animate-pulse mb-2" />
          <div className="h-3.5 w-24 rounded bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
        </>
      ) : (
        <>
          <p className="font-display font-bold text-[26px] text-gray-900 dark:text-white tracking-tight leading-none mb-1.5">{value}</p>
          <p className="font-display font-semibold text-[13px] text-gray-500 dark:text-gray-100">{label}</p>
        </>
      )}
    </div>
  );
}

// ── Recurring Row ─────────────────────────────────────────────────────────────
function RecurringRow({ project, onEdit, isOverdue }) {
  const daysUntil = project.nextBillingDate
    ? Math.ceil((new Date(project.nextBillingDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const cycleCfg = CYCLE_CFG[project.billingCycle] || CYCLE_CFG.Monthly;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
      {/* Project */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-sm text-white"
            style={{ background: isOverdue ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
            {project.title[0]?.toUpperCase()}
          </div>
          <div>
            <Link href={`/projects/${project._id}`}
              className="font-display font-bold text-[14px] text-gray-900 dark:text-white no-underline hover:underline tracking-tight">
              {project.title}
            </Link>
            {project.client && (
              <Link href={`/clients/${project.client._id}`}
                className="flex items-center gap-1 text-[11px] font-medium text-gray-400 dark:text-gray-500 no-underline mt-1">
                <Users size={10} />{project.client.name}
              </Link>
            )}
          </div>
        </div>
      </td>

      {/* Cycle */}
      <td className="px-5 py-4">
        <span className="font-display font-semibold text-[11px] px-2.5 py-1 rounded-full"
          style={{ background: cycleCfg.bg, border: `1.5px solid ${cycleCfg.border}`, color: cycleCfg.color }}>
          {project.billingCycle}
        </span>
      </td>

      {/* Amount */}
      <td className="px-5 py-4">
        <p className="font-display font-bold text-[15px] text-gray-900 dark:text-white">{fmt(project.recurringAmount)}</p>
        <p className="font-display text-[11px] text-gray-400 dark:text-gray-500">per {project.billingCycle?.toLowerCase()}</p>
      </td>

      {/* Next Billing */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          {isOverdue
            ? <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
            : <Calendar size={13} className="text-gray-400 flex-shrink-0" />
          }
          <div>
            <p className={`font-display font-semibold text-[12px] ${isOverdue ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
              {project.nextBillingDate ? fmtD(project.nextBillingDate) : 'Not set'}
            </p>
            {daysUntil !== null && (
              <p className={`font-display text-[11px] ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
                {isOverdue ? `${Math.abs(daysUntil)}d overdue` : `${daysUntil}d left`}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Service */}
      <td className="px-5 py-4">
        {project.serviceType ? (
          <span className="font-display font-semibold text-[11px] px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.25)', color: 'var(--gold,#e8b84b)' }}>
            {project.serviceType}
          </span>
        ) : <span className="text-gray-300 dark:text-gray-600">—</span>}
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <button onClick={() => onEdit(project)}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.07]
              text-gray-500 dark:text-gray-400 hover:border-[#e8b84b] transition-all cursor-pointer">
            <Pencil size={13} />
          </button>
          <Link href={`/projects/${project._id}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center no-underline
              bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.07]
              text-gray-500 dark:text-gray-400 hover:border-[#e8b84b] transition-all">
            <ExternalLink size={13} />
          </Link>
        </div>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RecurringPage() {
  const [data,        setData]        = useState(null);
  const [clients,     setClients]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [editProject, setEditProject] = useState(null);
  const [activeTab,   setActiveTab]   = useState('all');
  const [search,      setSearch]      = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dueRes, clientRes] = await Promise.all([
        projectsApi.getRecurringDue(),
        projectsApi.getClientRecurring(),
      ]);
      setData(dueRes.data.data);
      setClients(clientRes.data.data.summary);
    } catch { toast.error('Failed to load recurring data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const allRecurring    = data ? [...(data.overdue || []), ...(data.upcoming || [])] : [];
  const overdueProjects = data?.overdue  || [];
  const upcomingProjects= data?.upcoming || [];
  const totalMonthly    = data?.byBillingCycle?.reduce((s, g) => s + g.total * (multiplier[g._id] || 1), 0) || 0;

  const tabs = [
    { key: 'all',     label: 'All Renewals' },
    { key: 'overdue', label: `🔴 Overdue (${overdueProjects.length})` },
    { key: 'upcoming',label: `🟡 This Week (${upcomingProjects.length})` },
    { key: 'clients', label: 'By Client' },
  ];

  const baseProjects = activeTab === 'overdue' ? overdueProjects : activeTab === 'upcoming' ? upcomingProjects : allRecurring;

  const displayProjects = baseProjects.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.title?.toLowerCase().includes(q) || p.client?.name?.toLowerCase().includes(q) || p.serviceType?.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader title="Recurring Payments" subtitle="Manage retainer clients and renewal schedules" />

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Monthly Recurring Revenue" value={fmt(Math.round(totalMonthly))} icon={RefreshCw}   gradient="linear-gradient(135deg,#f59e0b,#d97706)" loading={loading} />
        <StatCard label="Active Retainers"          value={allRecurring.length}           icon={TrendingUp}  gradient="linear-gradient(135deg,#10b981,#059669)" loading={loading} />
        <StatCard label="Overdue Renewals"          value={overdueProjects.length}        icon={AlertCircle} gradient={overdueProjects.length > 0 ? 'linear-gradient(135deg,#f43f5e,#e11d48)' : 'linear-gradient(135deg,#6b7280,#374151)'} sub={overdueProjects.length > 0 ? 'Action required' : undefined} loading={loading} />
        <StatCard label="Due This Week"             value={upcomingProjects.length}       icon={Clock}       gradient="linear-gradient(135deg,#8b5cf6,#6d28d9)" loading={loading} />
      </div>

      {/* Billing Cycle Breakdown */}
      {!loading && data?.byBillingCycle?.length > 0 && (
        <div className="bg-white dark:bg-[#1c1917] border border-gray-200/80 dark:border-white/[0.07] rounded-xl overflow-hidden mb-5">
          <div className="flex items-center px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.05]">
            <p className="font-display font-semibold text-[13px] text-gray-800 dark:text-gray-100">Revenue by Billing Cycle</p>
          </div>
          <div className="p-5 grid grid-cols-4 gap-3">
            {['Monthly', 'Quarterly', 'Half-yearly', 'Yearly'].map(cycle => {
              const found = data.byBillingCycle.find(b => b._id === cycle);
              if (!found) return null;
              const cfg = CYCLE_CFG[cycle];
              return (
                <div key={cycle} className="rounded-xl p-4" style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }}>
                  <p className="font-display font-bold text-[22px] leading-none m-0" style={{ color: cfg.color }}>{fmt(found.total)}</p>
                  <p className="font-display font-semibold text-[10px] uppercase tracking-widest mt-1 mb-0.5" style={{ color: cfg.color, opacity: 0.8 }}>{cycle}</p>
                  <p className="font-display text-[11px] m-0" style={{ color: cfg.color, opacity: 0.7 }}>{found.count} project{found.count > 1 ? 's' : ''}</p>
                  <p className="font-display font-bold text-[13px] mt-1.5 m-0" style={{ color: cfg.color }}>≈ {fmt(Math.round(found.total * (multiplier[cycle] || 1)))}/mo</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="flex gap-1 bg-gray-50 dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/[0.07] p-1 rounded-xl flex-shrink-0">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="px-4 py-2 rounded-lg font-display font-semibold text-[13px] cursor-pointer border-none transition-all"
              style={activeTab === t.key
                ? { background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff' }
                : { background: 'transparent', color: '#6b7280' }
              }>
              {t.label}
            </button>
          ))}
        </div>
        {activeTab !== 'clients' && (
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium
                bg-white dark:bg-[#1a1714] border border-gray-200 dark:border-white/[0.07]
                text-gray-900 dark:text-white placeholder:text-gray-400
                focus:outline-none focus:border-[#e8b84b] dark:focus:border-[#e8b84b]
                focus:ring-2 focus:ring-[#e8b84b]/20 transition-all"
              placeholder="Search project, client, service…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Table — projects */}
      {activeTab !== 'clients' && (
        <div className="bg-white dark:bg-[#1c1917] border border-gray-200/80 dark:border-white/[0.07] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
              ))}
            </div>
          ) : displayProjects.length === 0 ? (
            <div className="text-center py-16">
              <RefreshCw size={22} className="text-gray-300 dark:text-gray-600 mx-auto mb-2.5" />
              <p className="font-display font-semibold text-[13px] text-gray-400 dark:text-gray-500">
                No {activeTab === 'overdue' ? 'overdue' : activeTab === 'upcoming' ? 'upcoming' : ''} recurring projects
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 780 }}>
                <thead>
                  <tr className="bg-gray-100/50 dark:bg-[#161410] border-b border-gray-100 dark:border-white/[0.05]">
                    {['Project', 'Cycle', 'Amount', 'Next Billing', 'Service', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {displayProjects.map(p => (
                    <RecurringRow
                      key={p._id}
                      project={p}
                      onEdit={setEditProject}
                      isOverdue={overdueProjects.some(o => o._id === p._id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Client Summary Tab */}
      {activeTab === 'clients' && (
        <div className="bg-white dark:bg-[#1c1917] border border-gray-200/80 dark:border-white/[0.07] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
              ))}
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-16">
              <Users size={22} className="text-gray-300 dark:text-gray-600 mx-auto mb-2.5" />
              <p className="font-display font-semibold text-[13px] text-gray-400 dark:text-gray-500">No recurring projects yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {clients.map(c => (
                <div key={c._id} className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-[13px] text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                        {c.client.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <Link href={`/clients/${c.client._id}`} className="font-display font-bold text-[14px] text-gray-900 dark:text-white no-underline hover:underline tracking-tight">
                          {c.client.name}
                        </Link>
                        <p className="font-display text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">{c.count} retainer{c.count > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <p className="font-display font-bold text-[20px] leading-none" style={{ color: 'var(--gold,#e8b84b)' }}>
                      {fmt(Math.round(c.totalMonthly))}<span className="font-display font-medium text-[12px] text-gray-400">/mo</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.projects.map((p, i) => {
                      const cfg = CYCLE_CFG[p.billingCycle] || CYCLE_CFG.Monthly;
                      return (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display font-semibold text-[12px]"
                          style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, color: cfg.color }}>
                          <span>{p.title}</span>
                          <span style={{ opacity: 0.7 }}>· {fmt(p.recurringAmount)}/{p.billingCycle?.toLowerCase()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={!!editProject} onClose={() => setEditProject(null)} title="Update Recurring Project" size="lg">
        <ProjectForm project={editProject} onSuccess={() => { setEditProject(null); fetchData(); }} onCancel={() => setEditProject(null)} />
      </Modal>

      {/* ── Activity Log ── */}
      <div className="mt-8">
        <ActivityLog mode="page" id="recurring" maxHeight="400px" />
      </div>
    </div>
  );
}