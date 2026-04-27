'use client';
import { useEffect, useState, useCallback } from 'react';
import { projectsApi } from '@/lib/api';
import { RefreshCw, AlertCircle, Calendar, TrendingUp, Users, Clock, Pencil, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import ProjectForm from '@/components/projects/ProjectForm';

const fmt  = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtD = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

const CYCLE_CFG = {
  Monthly:       { color:'#60a5fa', bg:'rgba(96,165,250,0.12)',  border:'rgba(96,165,250,0.35)'  },
  Quarterly:     { color:'#a78bfa', bg:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.35)' },
  'Half-yearly': { color:'#fbbf24', bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.35)'  },
  Yearly:        { color:'#34d399', bg:'rgba(52,211,153,0.12)',  border:'rgba(52,211,153,0.35)'  },
};

const multiplier = { Monthly:1, Quarterly:1/3, 'Half-yearly':1/6, Yearly:1/12 };

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, gradient, sub, loading }) {
  return (
    <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 relative overflow-hidden shadow-card dark:shadow-card-dark">
      <div style={{ position:'absolute', top:-16, right:-16, width:70, height:70, borderRadius:'50%', background:gradient, opacity:0.15, filter:'blur(18px)' }}/>
      <div style={{ width:42, height:42, borderRadius:12, background:gradient, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, boxShadow:'0 4px 12px rgba(0,0,0,0.15)' }}>
        <Icon size={19} color="#fff" strokeWidth={2.5}/>
      </div>
      {loading ? (
        <>
          <div className="skeleton" style={{ height:28, width:90, borderRadius:8, marginBottom:6 }}/>
          <div className="skeleton" style={{ height:13, width:120, borderRadius:6 }}/>
        </>
      ) : (
        <>
          <p className="font-display font-black text-2xl text-gray-900 dark:text-white tracking-tight mb-1">{value}</p>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">{label}</p>
          {sub && <p className="text-[11px] text-red-500 mt-1 font-semibold">{sub}</p>}
        </>
      )}
    </div>
  );
}

// ── Recurring Card ────────────────────────────────────────────────────────────
function RecurringCard({ project, onEdit, isOverdue }) {
  const daysUntil = project.nextBillingDate
    ? Math.ceil((new Date(project.nextBillingDate) - new Date()) / (1000*60*60*24))
    : null;
  const cycleCfg = CYCLE_CFG[project.billingCycle] || CYCLE_CFG.Monthly;

  return (
    <div
      className="bg-gray-50 dark:bg-[#161410] rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark"
      style={{ border: `1.5px solid ${isOverdue ? 'rgba(248,113,113,0.4)' : 'rgb(229,231,235)'}` }}
    >
      {/* Top accent bar */}
      <div style={{ height:3, background: isOverdue ? 'linear-gradient(90deg,#ef4444,#f87171)' : 'linear-gradient(90deg,var(--gold-dark),var(--gold),var(--gold-light))' }}/>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Link
                href={`/projects/${project._id}`}
                className="font-display font-bold text-[15px] text-gray-900 dark:text-white no-underline hover:underline tracking-tight"
              >
                {project.title}
              </Link>
              {project.priority && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background:'rgba(232,184,75,0.12)', border:'1px solid rgba(232,184,75,0.3)', color:'var(--gold,#e8b84b)' }}>
                  {project.priority}
                </span>
              )}
            </div>
            {project.client && (
              <Link href={`/clients/${project.client._id}`} className="text-xs text-gray-500 dark:text-gray-400 no-underline flex items-center gap-1">
                <Users size={11}/>{project.client.name}
              </Link>
            )}
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ background:cycleCfg.bg, border:`1.5px solid ${cycleCfg.border}`, color:cycleCfg.color }}>
            {project.billingCycle}
          </span>
        </div>

        {/* Amount */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="font-display font-black text-2xl text-gray-900 dark:text-white tracking-tight m-0">{fmt(project.recurringAmount)}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">per {project.billingCycle?.toLowerCase()}</p>
          </div>
          {project.serviceType && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl"
              style={{ background:'rgba(232,184,75,0.1)', border:'1px solid rgba(232,184,75,0.25)', color:'var(--gold,#e8b84b)' }}>
              {project.serviceType}
            </span>
          )}
        </div>

        {/* Next billing row */}
        <div
          className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-4"
          style={{
            background: isOverdue ? 'rgba(239,68,68,0.08)' : daysUntil !== null && daysUntil <= 7 ? 'rgba(245,158,11,0.08)' : 'transparent',
            border: `1.5px solid ${isOverdue ? 'rgba(239,68,68,0.25)' : 'rgb(229,231,235)'}`,
          }}
        >
          <div className="flex items-center gap-2">
            {isOverdue
              ? <AlertCircle size={14} className="text-red-400"/>
              : <Calendar size={14} className="text-gray-400"/>
            }
            <div>
              <p className={`text-[11px] font-bold m-0 ${isOverdue ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                {isOverdue ? '⚠️ Overdue' : 'Next billing'}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 m-0">
                {project.nextBillingDate ? fmtD(project.nextBillingDate) : 'Not set'}
              </p>
            </div>
          </div>
          {daysUntil !== null && (
            <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg"
              style={{
                background: isOverdue ? 'rgba(239,68,68,0.12)' : daysUntil <= 7 ? 'rgba(245,158,11,0.12)' : 'rgb(243,244,246)',
                color: isOverdue ? '#ef4444' : daysUntil <= 7 ? '#f59e0b' : '#6b7280',
              }}>
              {isOverdue ? `${Math.abs(daysUntil)}d overdue` : `${daysUntil}d left`}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(project)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold cursor-pointer transition-all bg-white dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] text-gray-600 dark:text-gray-300 hover:border-yellow-400 dark:hover:border-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400"
          >
            <Pencil size={13}/> Update Billing
          </button>
          <Link
            href={`/projects/${project._id}`}
            className="w-9 flex items-center justify-center rounded-xl no-underline transition-all bg-white dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] text-gray-400 hover:border-yellow-400 dark:hover:border-yellow-500 hover:text-yellow-500"
          >
            <ExternalLink size={14}/>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RecurringPage() {
  const [data,        setData]        = useState(null);
  const [clients,     setClients]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [editProject, setEditProject] = useState(null);
  const [activeTab,   setActiveTab]   = useState('all');

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

  const allRecurring     = data ? [...(data.overdue||[]), ...(data.upcoming||[])] : [];
  const overdueProjects  = data?.overdue  || [];
  const upcomingProjects = data?.upcoming || [];
  const totalMonthly     = data?.byBillingCycle?.reduce((s,g) => s + g.total*(multiplier[g._id]||1), 0) || 0;

  const tabs = [
    { key:'all',      label:'All Renewals' },
    { key:'overdue',  label:`🔴 Overdue (${overdueProjects.length})` },
    { key:'upcoming', label:`🟡 This Week (${upcomingProjects.length})` },
    { key:'clients',  label:'By Client' },
  ];

  const displayProjects = activeTab==='overdue' ? overdueProjects : activeTab==='upcoming' ? upcomingProjects : allRecurring;

  return (
    <div>
      <PageHeader title="Recurring Payments" subtitle="Manage retainer clients and renewal schedules"/>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        {loading
          ? Array.from({length:4}).map((_,i) => <div key={i} className="skeleton rounded-2xl h-32"/>)
          : <>
              <StatCard label="Monthly Recurring Revenue" value={fmt(Math.round(totalMonthly))} icon={RefreshCw}   gradient="linear-gradient(135deg,#e8b84b,#9a7020)" loading={false}/>
              <StatCard label="Active Retainers"          value={allRecurring.length}            icon={TrendingUp}  gradient="linear-gradient(135deg,#34d399,#065f46)" loading={false}/>
              <StatCard label="Overdue Renewals"          value={overdueProjects.length}         icon={AlertCircle} gradient={overdueProjects.length>0 ? "linear-gradient(135deg,#f87171,#b91c1c)" : "linear-gradient(135deg,#6b7280,#374151)"} sub={overdueProjects.length>0?'Action required':undefined} loading={false}/>
              <StatCard label="Due This Week"             value={upcomingProjects.length}        icon={Clock}       gradient="linear-gradient(135deg,#fbbf24,#92400e)" loading={false}/>
            </>
        }
      </div>

      {/* ── Billing Cycle Breakdown ── */}
      {!loading && data?.byBillingCycle?.length > 0 && (
        <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 mb-6 shadow-card dark:shadow-card-dark">
          <p className="font-display font-bold text-[15px] text-gray-900 dark:text-white mb-4">Revenue by Billing Cycle</p>
          <div className="grid grid-cols-4 gap-3">
            {['Monthly','Quarterly','Half-yearly','Yearly'].map(cycle => {
              const found = data.byBillingCycle.find(b => b._id === cycle);
              if (!found) return null;
              const cfg = CYCLE_CFG[cycle];
              return (
                <div key={cycle} className="rounded-2xl p-4" style={{ background:cfg.bg, border:`1.5px solid ${cfg.border}` }}>
                  <p className="font-display font-black text-xl m-0" style={{ color:cfg.color }}>{fmt(found.total)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-1 mb-0.5" style={{ color:cfg.color, opacity:0.8 }}>{cycle}</p>
                  <p className="text-[11px] m-0" style={{ color:cfg.color, opacity:0.7 }}>{found.count} project{found.count>1?'s':''}</p>
                  <p className="text-[12px] font-bold mt-1.5 m-0" style={{ color:cfg.color }}>≈ {fmt(Math.round(found.total*(multiplier[cycle]||1)))}/mo</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tabs ── same pattern as leads page ── */}
      <div className="flex gap-1 bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] p-1 rounded-xl mb-5 w-fit flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className="px-4 py-2 rounded-lg text-[13px] font-bold cursor-pointer border-none transition-all"
            style={activeTab === t.key
              ? { background:'var(--gold,#e8b84b)', color:'#0a0a0a' }
              : { background:'transparent', color:'#6b7280' }
            }>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Project Cards Grid ── */}
      {activeTab !== 'clients' && (
        loading ? (
          <div className="grid gap-3.5" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
            {Array.from({length:6}).map((_,i) => <div key={i} className="skeleton rounded-2xl h-60"/>)}
          </div>
        ) : displayProjects.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-[#161410] border-2 border-dashed border-gray-200 dark:border-white/[0.09] rounded-2xl">
            <RefreshCw size={28} className="text-gray-300 dark:text-gray-600 mx-auto mb-3"/>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              No {activeTab==='overdue'?'overdue':activeTab==='upcoming'?'upcoming':''} recurring projects
            </p>
          </div>
        ) : (
          <div className="grid gap-3.5" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))' }}>
            {displayProjects.map(p => (
              <RecurringCard key={p._id} project={p} onEdit={setEditProject} isOverdue={overdueProjects.some(o=>o._id===p._id)}/>
            ))}
          </div>
        )
      )}

      {/* ── Client Summary Tab ── */}
      {activeTab === 'clients' && (
        <div className="flex flex-col gap-3">
          {loading
            ? Array.from({length:3}).map((_,i) => <div key={i} className="skeleton rounded-2xl h-24"/>)
            : clients.length === 0
              ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-[#161410] border-2 border-dashed border-gray-200 dark:border-white/[0.09] rounded-2xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No recurring projects yet</p>
                </div>
              )
              : clients.map(c => (
                <div key={c._id} className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 shadow-card dark:shadow-card-dark">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-base text-[#0a0a0a] flex-shrink-0"
                        style={{ background:'linear-gradient(135deg,var(--gold,#e8b84b),#9a7020)' }}>
                        {c.client.name[0]}
                      </div>
                      <div>
                        <Link href={`/clients/${c.client._id}`} className="font-display font-bold text-[15px] text-gray-900 dark:text-white no-underline hover:underline tracking-tight">
                          {c.client.name}
                        </Link>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{c.count} retainer{c.count>1?'s':''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-black text-lg m-0" style={{ color:'var(--gold,#e8b84b)' }}>
                        {fmt(Math.round(c.totalMonthly))}<span className="text-[11px] text-gray-400 font-normal">/mo</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.projects.map((p,i) => {
                      const cfg = CYCLE_CFG[p.billingCycle] || CYCLE_CFG.Monthly;
                      return (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
                          style={{ background:cfg.bg, border:`1.5px solid ${cfg.border}`, color:cfg.color }}>
                          <span>{p.title}</span>
                          <span style={{ opacity:0.7 }}>· {fmt(p.recurringAmount)}/{p.billingCycle?.toLowerCase()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
          }
        </div>
      )}

      <Modal open={!!editProject} onClose={() => setEditProject(null)} title="Update Recurring Project" size="lg">
        <ProjectForm project={editProject} onSuccess={() => { setEditProject(null); fetchData(); }} onCancel={() => setEditProject(null)}/>
      </Modal>
    </div>
  );
}