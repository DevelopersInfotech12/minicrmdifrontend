'use client';
import { useEffect, useState } from 'react';

import { clientsApi } from '@/lib/api';
import {
  ArrowLeft, Mail, Phone, Building2, MapPin, Pencil,
  FolderKanban, CreditCard, StickyNote, FileText, TrendingUp,
  AlertCircle, Calendar, CheckCircle2, Clock, Plus, ChevronRight,
  Download, ExternalLink, BarChart3, Activity
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import ClientForm from '@/components/clients/ClientForm';
import ProjectForm from '@/components/projects/ProjectForm';
import { Skeleton } from '@/components/ui/Skeleton';
import MeetingsList from '@/components/meetings/MeetingsList';
import ActivityLog from '@/components/ui/ActivityLog';
import api, { invoicesApi } from '@/lib/api'; // ← api default import for download

const fmt  = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtD = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_CFG = {
  Paid:    { bar: 'from-emerald-400 to-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50', dot: '#10b981' },
  Partial: { bar: 'from-amber-400 to-amber-500',    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',    dot: '#f59e0b' },
  Overdue: { bar: 'from-red-400 to-red-500',        badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',        dot: '#ef4444' },
  Pending: { bar: 'from-gray-300 to-gray-400',      badge: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/[0.06] dark:text-gray-400 dark:border-white/[0.09]', dot: '#9ca3af' },
};

const PROJECT_GRADIENT = {
  Active:    'from-emerald-500 to-emerald-700',
  Completed: 'from-blue-500 to-blue-700',
  'On Hold': 'from-amber-500 to-amber-700',
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, gradient }) {
  return (
    <div className="bg-gray-10 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 relative overflow-hidden shadow-card dark:shadow-card-dark group hover:border-gray-300 dark:hover:border-white/20 transition-all">
      <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%',  }}/>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 flex-shrink-0"
        style={{ background:`linear-gradient(135deg,${gradient})` }}>
        <Icon size={17} className="text-white"/>
      </div>
      <p className="font-display font-black text-2xl text-gray-900 dark:text-white tracking-tight leading-none">{value}</p>
      <p className="font-display font-semibold text-[13px] text-gray-500 dark:text-gray-100 mt-2">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, action, children, className = '' }) {
  return (
    <div className={`bg-gray-10 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/[0.06]">
          {title && <h3 className="font-poppins text-[14.5px] font-bold text-gray-800 dark:text-white">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Notes Timeline ────────────────────────────────────────────────────────────
function NotesTimeline({ notes }) {
  const [show, setShow] = useState(5);
  if (!notes?.length) return (
    <div className="text-center py-10 bg-gray-10 dark:bg-[#161410] border-2 border-dashed border-gray-200 dark:border-white/[0.09] rounded-2xl">
      <StickyNote size={24} className="text-gray-300 dark:text-gray-600 mx-auto mb-2"/>
      <p className="text-sm text-gray-400 dark:text-gray-500">No notes yet across any project</p>
    </div>
  );
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-white/[0.06]"/>
      <div className="space-y-3">
        {notes.slice(0, show).map(note => (
          <div key={note._id} className="flex gap-3 relative">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1e1b16] border-2 flex items-center justify-center flex-shrink-0 z-10"
              style={{ borderColor:'rgba(232,184,75,0.5)' }}>
              <StickyNote size={12} color="var(--gold,#e8b84b)"/>
            </div>
            <div className="flex-1 bg-white dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-4 hover:border-gray-300 dark:hover:border-white/20 transition-all">
              <p className="text-[13px] text-gray-700 dark:text-gray-200 leading-relaxed">{note.content}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {note.project && (
                  <Link href={`/projects/${note.project._id}`}
                    className="flex items-center gap-1 text-[11px] font-semibold no-underline transition-colors"
                    style={{ color:'var(--gold,#e8b84b)' }}>
                    <FolderKanban size={10}/>{note.project.title}
                  </Link>
                )}
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  {new Date(note.createdAt).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {notes.length > show && (
        <button onClick={() => setShow(s => s + 10)}
          className="mt-4 ml-11 text-[12px] font-semibold flex items-center gap-1 cursor-pointer border-none bg-transparent transition-colors"
          style={{ color:'var(--gold,#e8b84b)' }}>
          Show {Math.min(10, notes.length - show)} more <ChevronRight size={12}/>
        </button>
      )}
    </div>
  );
}

// ── Payment Row ───────────────────────────────────────────────────────────────
function PaymentRow({ payment }) {
  const pct     = payment.totalAmount > 0 ? Math.round((payment.paidAmount / payment.totalAmount) * 100) : 0;
  const pending = payment.totalAmount - payment.paidAmount;
  const isOverdue = payment.dueDate && new Date(payment.dueDate) < new Date() && pct < 100;
  const status = pct === 100 ? 'Paid' : isOverdue ? 'Overdue' : pending > 0 ? 'Partial' : 'Pending';
  const cfg = STATUS_CFG[status] || STATUS_CFG.Pending;

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-white dark:hover:bg-[#1e1b16] transition-colors border-b border-gray-100 dark:border-white/[0.06] last:border-0">
      <div className="flex-1 min-w-0">
        <Link href={`/projects/${payment.project?._id}`}
          className="text-[13px] font-semibold no-underline hover:underline truncate block"
          style={{ color:'var(--gold,#e8b84b)' }}>
          {payment.project?.title}
        </Link>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden max-w-[100px]">
            <div className={`h-full rounded-full bg-gradient-to-r ${cfg.bar}`} style={{ width:`${pct}%` }}/>
          </div>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{pct}%</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[13px] font-bold text-gray-800 dark:text-white">{fmt(payment.totalAmount)}</p>
        <div className="flex items-center gap-2 mt-0.5 justify-end">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{fmt(payment.paidAmount)} paid</span>
          {pending > 0 && <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">{fmt(pending)} due</span>}
        </div>
      </div>
      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.badge}`}>
        {status}
      </span>
    </div>
  );
}

// ── Invoices Section ──────────────────────────────────────────────────────────
function InvoicesSection({ invoices }) {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (inv) => {
    setDownloading(inv._id);
    try {
      // ← FIXED: use api directly with responseType blob
      const res = await api.get(`/invoices/${inv._id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = inv.fileName; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    } catch { toast.error('Download failed'); }
    finally { setDownloading(null); }
  };

  if (!invoices?.length) return (
    <div className="text-center py-10 bg-gray-10 dark:bg-[#161410] border-2 border-dashed border-gray-200 dark:border-white/[0.09] rounded-2xl">
      <FileText size={22} className="text-gray-300 dark:text-gray-600 mx-auto mb-2"/>
      <p className="text-sm text-gray-400 dark:text-gray-500">No invoices uploaded yet</p>
    </div>
  );

  return (
    <div className="space-y-2.5">
      {invoices.map(inv => (
        <div key={inv._id}
          className="flex items-center gap-3 p-4 bg-gray-10 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl hover:border-gray-300 dark:hover:border-white/20 transition-all group shadow-card dark:shadow-card-dark">
          <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 flex items-center justify-center flex-shrink-0">
            <FileText size={15} className="text-red-500 dark:text-red-400"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-800 dark:text-white truncate">{inv.label || inv.fileName}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {inv.project && <span className="text-[11px] font-semibold" style={{ color:'var(--gold,#e8b84b)' }}>{inv.project.title}</span>}
              {inv.milestone && <span className="text-[11px] text-gray-400 dark:text-gray-500">· {inv.milestone.title}</span>}
              <span className="text-[11px] text-gray-400 dark:text-gray-500">· {fmtD(inv.createdAt)}</span>
            </div>
          </div>
          <button
            onClick={() => handleDownload(inv)}
            disabled={downloading === inv._id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold cursor-pointer transition-all border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#1e1b16] text-gray-500 dark:text-gray-300 hover:border-yellow-400 dark:hover:border-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400 disabled:opacity-50 opacity-0 group-hover:opacity-100"
          >
            <Download size={12}/>{downloading === inv._id ? '…' : 'Download'}
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientProfilePage() {
  const { id } = useParams();
  const router    = useRouter();
  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('overview');
  const [showEdit, setShowEdit]       = useState(false);
  const [showProject, setShowProject] = useState(false);

  const fetchProfile = async () => {
    try {
      // ← FIXED: use getProfile which calls /clients/:id/profile
      const res = await clientsApi.getProfile(id);
      setProfile(res.data.data);
    } catch { toast.error('Failed to load profile'); router.push('/clients'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, [id]);

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3"><Skeleton className="w-8 h-8 rounded-xl"/><Skeleton className="h-7 w-48"/></div>
      <div className="grid grid-cols-4 gap-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-32 rounded-2xl"/>)}</div>
      <Skeleton className="h-64 rounded-2xl"/>
    </div>
  );
  if (!profile) return null;

  const { client, projects, payments, notes, invoices, stats, overdueMilestones, upcomingMilestones } = profile;

  const tabs = [
    { key:'overview',  label:'📊 Overview' },
    { key:'projects',  label:`📁 Projects (${projects.length})` },
    { key:'payments',  label:`💰 Payments (${payments.length})` },
    { key:'meetings',  label:'📅 Meetings' },
    { key:'notes',     label:`📝 Notes (${notes.length})` },
    { key:'invoices',  label:`📄 Invoices (${invoices.length})` },
    { key:'activity',  label:'📜 Activity' },
  ];

  const initials = client.name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();

  return (
    <div className="animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start gap-4 mb-6">
        <Link href="/clients"
          className="p-2 rounded-xl border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#1e1b16] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all mt-1 flex-shrink-0">
          <ArrowLeft size={16}/>
        </Link>

        {/* Avatar */}
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-[18px] text-white flex-shrink-0 mt-0.5 bg-indigo-500 "
         >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-display font-black text-xl text-gray-900 dark:text-white tracking-tight">{client.name}</h1>
            <StatusBadge status={client.isActive}/>
          </div>
          {client.company && (
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
              <Building2 size={12}/>{client.company}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setShowProject(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#1e1b16] text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer">
            <Plus size={13}/> New Project
          </button>
          <button onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold cursor-pointer transition-all bg-indigo-500 text-[#fff]"
            >
            <Pencil size={13}/> Edit
          </button>
        </div>
      </div>

      {/* ── Alert banners ── */}
      {overdueMilestones.length > 0 && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl px-4 py-3 mb-3">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0"/>
          <p className="text-[13px] font-semibold text-red-700 dark:text-red-400">
            {overdueMilestones.length} overdue payment{overdueMilestones.length>1?'s':''}
          </p>
          <div className="flex gap-2 flex-wrap">
            {overdueMilestones.slice(0,3).map(m => (
              <Link key={m._id} href={`/projects/${m.project?._id}`}
                className="text-[11px] bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-2.5 py-0.5 rounded-full font-bold hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors no-underline">
                {m.title} · {fmt(m.amount - m.paidAmount)} due
              </Link>
            ))}
          </div>
        </div>
      )}

      {upcomingMilestones.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl px-4 py-3 mb-4">
          <Calendar size={15} className="text-amber-500 flex-shrink-0"/>
          <p className="text-[13px] font-semibold text-amber-700 dark:text-amber-400">
            {upcomingMilestones.length} payment{upcomingMilestones.length>1?'s':''} due this week
          </p>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <StatCard label="Total Revenue"  value={fmt(stats.totalRevenue)}  sub={`${fmt(stats.totalPaid)} received`}          icon={TrendingUp}   gradient="#10b981,#065f46"/>
        <StatCard label="Outstanding"    value={fmt(stats.totalPending)}  sub={`${payments.length} payment records`}        icon={CreditCard}   gradient={stats.totalPending > 0 ? '#f59e0b,#92400e' : '#6b7280,#374151'}/>
        <StatCard label="Projects"       value={stats.projectStats.total} sub={`${stats.projectStats.active} active · ${stats.projectStats.completed} done`} icon={FolderKanban} gradient="#8b5cf6,#4c1d95"/>
        <StatCard label="Notes"          value={notes.length}             sub={`Across ${projects.length} project${projects.length!==1?'s':''}`} icon={StickyNote}   gradient="#e8b84b,#9a7020"/>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-10 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] p-1 rounded-xl mb-6 w-fit flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className="px-4 py-2 rounded-lg text-[13px] font-bold cursor-pointer border-none transition-all"
            style={activeTab === t.key
              ? { background:'#6366F1', color:'#fff' }
              : { background:'transparent', color:'#6b7280' }
            }>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW TAB ══ */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Project Summary */}
          <SectionCard
            title="Project Summary"
            action={
              <button onClick={() => setShowProject(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-bold cursor-pointer border-none transition-all"
                style={{ background:'#6366F1', color:'#ffffff' }}>
                <Plus size={12}/> Add
              </button>
            }
          >
            {projects.length === 0 ? (
              <div className="py-10 text-center">
                <FolderKanban size={24} className="text-gray-300 dark:text-gray-600 mx-auto mb-2"/>
                <p className="text-sm text-gray-400 dark:text-gray-500">No projects yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                {projects.slice(0,5).map(p => (
                  <Link key={p._id} href={`/projects/${p._id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-white dark:hover:bg-[#1e1b16] group transition-colors no-underline">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${PROJECT_GRADIENT[p.status]||'from-gray-400 to-gray-600'} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-[12px] font-black">{p.title[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 dark:text-white truncate group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors">{p.title}</p>
                      {p.description && <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{p.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={p.status}/>
                      <ChevronRight size={13} className="text-gray-300 dark:text-gray-600 group-hover:text-yellow-400 transition-colors"/>
                    </div>
                  </Link>
                ))}
                {projects.length > 5 && (
                  <button onClick={() => setActiveTab('projects')}
                    className="w-full text-[12px] font-semibold py-3 cursor-pointer border-none bg-transparent hover:bg-white dark:hover:bg-[#1e1b16] transition-colors"
                    style={{ color:'var(--gold,#e8b84b)' }}>
                    View all {projects.length} projects →
                  </button>
                )}
              </div>
            )}
          </SectionCard>

          {/* Revenue Breakdown */}
          <SectionCard title="Revenue Breakdown">
            {payments.length === 0 ? (
              <div className="py-10 text-center">
                <BarChart3 size={24} className="text-gray-300 dark:text-gray-600 mx-auto mb-2"/>
                <p className="text-sm text-gray-400 dark:text-gray-500">No payment records</p>
              </div>
            ) : (
              <div className="p-5">
                <div className="flex items-center gap-5 mb-5">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3"
                        className="text-gray-100 dark:text-white/10"/>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                        strokeDasharray={`${stats.totalRevenue > 0 ? (stats.totalPaid/stats.totalRevenue)*100 : 0} 100`}
                        strokeLinecap="round"/>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-[16px] font-black text-gray-900 dark:text-white leading-none">
                        {stats.totalRevenue > 0 ? Math.round((stats.totalPaid/stats.totalRevenue)*100) : 0}%
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">collected</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2.5">
                    {[
                      { label:'Total Billed', val:stats.totalRevenue, color:'bg-gray-300 dark:bg-white/20' },
                      { label:'Received',     val:stats.totalPaid,    color:'bg-emerald-400' },
                      { label:'Pending',      val:stats.totalPending, color:'bg-amber-400' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`}/>
                          <span className="text-[12px] text-gray-500 dark:text-gray-400">{label}</span>
                        </div>
                        <span className="text-[12px] font-bold text-gray-800 dark:text-white">{fmt(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 dark:border-white/[0.06] -mx-5">
                  {payments.slice(0,3).map(p => <PaymentRow key={p._id} payment={p}/>)}
                  {payments.length > 3 && (
                    <button onClick={() => setActiveTab('payments')}
                      className="w-full text-[12px] font-semibold py-3 cursor-pointer border-none bg-transparent hover:bg-white dark:hover:bg-[#1e1b16] transition-colors"
                      style={{ color:'var(--gold,#e8b84b)' }}>
                      View all {payments.length} payments →
                    </button>
                  )}
                </div>
              </div>
            )}
          </SectionCard>

          {/* Recent Notes */}
          <SectionCard
            title="Recent Activity Notes"
            className="lg:col-span-2"
            action={
              <button onClick={() => setActiveTab('notes')}
                className="text-[12px] font-semibold cursor-pointer border-none bg-transparent"
                style={{ color:'var(--gold,#e8b84b)' }}>
                View timeline →
              </button>
            }
          >
            <div className="p-5">
              <NotesTimeline notes={notes.slice(0, 3)}/>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ══ PROJECTS TAB ══ */}
      {activeTab === 'projects' && (
        <div className="space-y-3 max-w-3xl">
          <div className="flex justify-end mb-1">
            <button onClick={() => setShowProject(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer border-none transition-all"
              style={{ background:'var(--gold,#e8b84b)', color:'#0a0a0a', border:'1.5px solid rgba(232,184,75,0.6)', boxShadow:'0 2px 8px rgba(232,184,75,0.25)' }}>
              <Plus size={14}/> New Project
            </button>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-[#161410] border-2 border-dashed border-gray-200 dark:border-white/[0.09] rounded-2xl">
              <FolderKanban size={28} className="text-gray-300 dark:text-gray-600 mx-auto mb-2"/>
              <p className="text-sm text-gray-400 dark:text-gray-500">No projects yet for this client</p>
            </div>
          ) : projects.map(p => (
            <Link key={p._id} href={`/projects/${p._id}`}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl hover:border-gray-300 dark:hover:border-white/20 shadow-card dark:shadow-card-dark transition-all group no-underline block">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${PROJECT_GRADIENT[p.status]||'from-gray-400 to-gray-600'} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-black text-[14px]">{p.title[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-gray-800 dark:text-white group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors">{p.title}</p>
                {p.description && <p className="text-[12px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{p.description}</p>}
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {p.startDate && <span className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1"><Calendar size={10}/>{fmtD(p.startDate)}</span>}
                  {p.endDate && <span className="text-[11px] text-gray-400 dark:text-gray-500">→ {fmtD(p.endDate)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={p.status}/>
                <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-yellow-400 transition-colors"/>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ══ PAYMENTS TAB ══ */}
      {activeTab === 'payments' && (
        <div className="max-w-3xl">
          <div className="grid grid-cols-3 gap-3.5 mb-5">
            {[
              { label:'Total Billed', val:stats.totalRevenue, cls:'bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09]',               color:'text-gray-900 dark:text-white' },
              { label:'Received',     val:stats.totalPaid,    cls:'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40', color:'text-emerald-700 dark:text-emerald-400' },
              { label:'Pending',      val:stats.totalPending, cls:'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40',         color:'text-amber-700 dark:text-amber-400' },
            ].map(({ label, val, cls, color }) => (
              <div key={label} className={`rounded-2xl p-4 text-center ${cls}`}>
                <p className={`font-display font-black text-xl ${color}`}>{fmt(val)}</p>
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">{label}</p>
              </div>
            ))}
          </div>
          <SectionCard>
            {payments.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-400 dark:text-gray-500">No payment records yet</p>
              </div>
            ) : payments.map(p => <PaymentRow key={p._id} payment={p}/>)}
          </SectionCard>
        </div>
      )}

      {/* ══ MEETINGS TAB ══ */}
      {activeTab === 'meetings' && (
        <div className="max-w-2xl">
          <MeetingsList clientId={id} />
        </div>
      )}

      {/* ══ NOTES TAB ══ */}
      {activeTab === 'notes' && (
        <div className="max-w-2xl">
          <div className="mb-5">
            <h2 className="text-base font-bold text-gray-800 dark:text-white">Activity Timeline</h2>
            <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">All notes across every project for this client</p>
          </div>
          <NotesTimeline notes={notes}/>
        </div>
      )}

      {/* ══ INVOICES TAB ══ */}
      {activeTab === 'invoices' && (
        <div className="max-w-2xl">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-800 dark:text-white">All Invoices</h2>
            <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">Invoices across all projects for {client.name}</p>
          </div>
          <InvoicesSection invoices={invoices}/>
        </div>
      )}

      {/* ══ ACTIVITY TAB ══ */}
      {activeTab === 'activity' && (
        <ActivityLog mode="client" id={id} maxHeight="520px" />
      )}

      {/* ── Modals ── */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Client">
        <ClientForm client={client} onSuccess={() => { setShowEdit(false); fetchProfile(); }} onCancel={() => setShowEdit(false)}/>
      </Modal>
      <Modal open={showProject} onClose={() => setShowProject(false)} title="New Project" size="lg">
        <ProjectForm defaultClientId={client._id} onSuccess={() => { setShowProject(false); fetchProfile(); }} onCancel={() => setShowProject(false)}/>
      </Modal>
    </div>
  );
}