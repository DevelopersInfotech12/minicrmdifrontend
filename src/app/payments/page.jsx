'use client';
import { useEffect, useState, useCallback } from 'react';
import { paymentsApi, projectsApi } from '@/lib/api';
import { CreditCard, Plus, Pencil, Trash2, CheckCircle2, Clock, AlertCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import PaymentForm from '@/components/payments/PaymentForm';

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

function getPaymentStatus(payment) {
  const pct     = payment.totalAmount > 0 ? Math.round((payment.paidAmount / payment.totalAmount) * 100) : 0;
  const overdue = payment.dueDate && new Date(payment.dueDate) < new Date() && pct < 100;
  if (pct === 100) return { label:'Paid',    dot:'#10b981', badgeBg:'rgba(16,185,129,0.12)',  badgeBorder:'rgba(16,185,129,0.35)',  badgeText:'#10b981', bar:'linear-gradient(90deg,#10b981,#34d399)' };
  if (overdue)    return { label:'Overdue',  dot:'#ef4444', badgeBg:'rgba(239,68,68,0.12)',   badgeBorder:'rgba(239,68,68,0.35)',   badgeText:'#ef4444', bar:'linear-gradient(90deg,#ef4444,#f87171)' };
  if (pct > 0)    return { label:'Partial',  dot:'#f59e0b', badgeBg:'rgba(245,158,11,0.12)',  badgeBorder:'rgba(245,158,11,0.35)',  badgeText:'#f59e0b', bar:'linear-gradient(90deg,#f59e0b,#fbbf24)' };
  return            { label:'Pending',  dot:'#6b7280', badgeBg:'rgba(107,114,128,0.12)', badgeBorder:'rgba(107,114,128,0.35)', badgeText:'#6b7280', bar:'linear-gradient(90deg,#6b7280,#9ca3af)' };
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ paid, pending, overdue, size = 120 }) {
  const total      = paid + pending + overdue || 1;
  const r          = 45;
  const circ       = 2 * Math.PI * r;
  const paidArc    = (paid    / total) * circ;
  const partialArc = (pending / total) * circ;
  const overdueArc = (overdue / total) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="10"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#ef4444" strokeWidth="10"
        strokeDasharray={`${overdueArc} ${circ}`} strokeDashoffset={circ*0.25} strokeLinecap="round"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#f59e0b" strokeWidth="10"
        strokeDasharray={`${partialArc} ${circ}`} strokeDashoffset={circ*0.25-overdueArc} strokeLinecap="round"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#10b981" strokeWidth="10"
        strokeDasharray={`${paidArc} ${circ}`} strokeDashoffset={circ*0.25-overdueArc-partialArc} strokeLinecap="round"/>
      <text x="50" y="46" textAnchor="middle" fontSize="12" fontWeight="700" fill="#111827"
        className="dark:fill-white">
        {total > 1 ? Math.round((paid/total)*100) : 0}%
      </text>
      <text x="50" y="58" textAnchor="middle" fontSize="7" fill="#6b7280">collected</text>
    </svg>
  );
}

// ── Payment Card ──────────────────────────────────────────────────────────────
function PaymentCard({ payment, onEdit, onDelete, onAdd, project }) {
  const [expanded, setExpanded] = useState(false);

  /* ── No payment record yet ── */
  if (!payment) {
    return (
      <div className="bg-gray-50 dark:bg-[#161410] border-2 border-dashed border-gray-200 dark:border-white/[0.09] rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-[15px] text-white flex-shrink-0"
              style={{ background:'linear-gradient(135deg,#a78bfa,#6d28d9)' }}>
              {project.title[0]}
            </div>
            <div>
              <Link href={`/projects/${project._id}`}
                className="text-[14px] font-bold text-gray-900 dark:text-white no-underline hover:underline font-display">
                {project.title}
              </Link>
              {project.client && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 m-0">{project.client.name}</p>}
            </div>
          </div>
          <button onClick={() => onAdd(project)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold cursor-pointer border-none transition-all"
            style={{ background:'var(--gold,#e8b84b)', color:'#0a0a0a', border:'1.5px solid rgba(232,184,75,0.6)' }}>
            <Plus size={13}/> Add Payment
          </button>
        </div>
      </div>
    );
  }

  const pct       = payment.totalAmount > 0 ? Math.round((payment.paidAmount/payment.totalAmount)*100) : 0;
  const pending   = payment.totalAmount - payment.paidAmount;
  const status    = getPaymentStatus(payment);
  const isOverdue = payment.dueDate && new Date(payment.dueDate) < new Date() && pct < 100;

  return (
    <div
      className="bg-gray-50 dark:bg-[#161410] rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark"
      style={{ border:`1.5px solid ${isOverdue ? 'rgba(239,68,68,0.35)' : 'rgb(229,231,235)'}` }}
    >
      {/* Header row */}
      <div className="flex items-center gap-3.5 px-5 py-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-[15px] text-white flex-shrink-0"
          style={{ background:'linear-gradient(135deg,#a78bfa,#6d28d9)' }}>
          {project.title[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/projects/${project._id}`}
              className="text-[14px] font-bold text-gray-900 dark:text-white no-underline hover:underline font-display">
              {project.title}
            </Link>
            {/* Status badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{ background:status.badgeBg, border:`1.5px solid ${status.badgeBorder}`, color:status.badgeText }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:status.dot }}/>
              {status.label}
            </span>
          </div>
          {project.client && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 m-0">{project.client.name}</p>}
        </div>

        {/* Due date pill */}
        {payment.dueDate && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold flex-shrink-0"
            style={{
              background: isOverdue ? 'rgba(239,68,68,0.1)' : 'transparent',
              border: `1.5px solid ${isOverdue ? 'rgba(239,68,68,0.3)' : 'rgb(229,231,235)'}`,
              color: isOverdue ? '#ef4444' : '#6b7280',
            }}>
            <Calendar size={11}/>
            {new Date(payment.dueDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
          </div>
        )}

        {/* Action icon buttons — same style as leads */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => onEdit(payment, project)}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#1e1b16] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all cursor-pointer">
            <Pencil size={13}/>
          </button>
          <button onClick={() => onDelete(payment._id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#1e1b16] text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer">
            <Trash2 size={13}/>
          </button>
          <button onClick={() => setExpanded(e => !e)}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#1e1b16] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all cursor-pointer">
            {expanded ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-4">
        <div className="flex justify-between mb-2">
          <span className="text-[13px] text-gray-800 dark:text-white font-semibold">{fmt(payment.paidAmount)} received</span>
          <span className="text-[13px] text-gray-500 dark:text-gray-400 font-semibold">{pct}% of {fmt(payment.totalAmount)}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div style={{ height:'100%', width:`${pct}%`, background:status.bar, borderRadius:99, transition:'width 0.7s ease' }}/>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-white/[0.06] px-5 py-4 bg-white dark:bg-[#1e1b16]">
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              { label:'Total',   val:fmt(payment.totalAmount), color:'text-gray-800 dark:text-white' },
              { label:'Paid',    val:fmt(payment.paidAmount),  color:'text-emerald-500' },
              { label:'Pending', val:fmt(pending),             color: isOverdue ? 'text-red-500' : 'text-amber-500' },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center p-3 bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-xl">
                <p className={`font-display font-bold text-[15px] m-0 ${color}`}>{val}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1 m-0">{label}</p>
              </div>
            ))}
          </div>
          {payment.dueDate && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold"
              style={{
                background: isOverdue ? 'rgba(239,68,68,0.08)' : 'transparent',
                border: `1.5px solid ${isOverdue ? 'rgba(239,68,68,0.25)' : 'rgb(229,231,235)'}`,
                color: isOverdue ? '#ef4444' : '#6b7280',
              }}>
              <Calendar size={12}/>
              {isOverdue ? '⚠️ Overdue since' : 'Due on'} {new Date(payment.dueDate).toLocaleDateString('en-IN',{dateStyle:'long'})}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const [projects,     setProjects]     = useState([]);
  const [payments,     setPayments]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [editData,     setEditData]     = useState(null);
  const [addProject,   setAddProject]   = useState(null);
  const [deleteId,     setDeleteId]     = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pjRes, pyRes] = await Promise.all([
        projectsApi.getAll({ limit:100 }),
        paymentsApi.getAll({ limit:100 }),
      ]);
      setProjects(pjRes.data.data.projects);
      setPayments(pyRes.data.data.payments);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async () => {
    setDeleting(true);
    try { await paymentsApi.delete(deleteId); toast.success('Payment deleted'); setDeleteId(null); fetchAll(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const paymentMap = {};
  payments.forEach(p => { if (p.project?._id) paymentMap[p.project._id] = p; });

  const totalBilled  = payments.reduce((s,p) => s + p.totalAmount, 0);
  const totalPaid    = payments.reduce((s,p) => s + p.paidAmount, 0);
  const totalPending = totalBilled - totalPaid;
  const overdueCount = payments.filter(p => {
    const pct = p.totalAmount>0?(p.paidAmount/p.totalAmount)*100:0;
    return p.dueDate && new Date(p.dueDate)<new Date() && pct<100;
  }).length;
  const paidCount = payments.filter(p => p.paidAmount>=p.totalAmount && p.totalAmount>0).length;

  const filteredProjects = projects.filter(p => {
    const pay = paymentMap[p._id];
    if (filterStatus==='no-payment') return !pay;
    if (!pay) return false;
    const pct = pay.totalAmount>0 ? Math.round((pay.paidAmount/pay.totalAmount)*100) : 0;
    const isOverdue = pay.dueDate && new Date(pay.dueDate)<new Date() && pct<100;
    if (filterStatus==='paid')    return pct===100;
    if (filterStatus==='overdue') return isOverdue;
    if (filterStatus==='partial') return pct>0 && pct<100 && !isOverdue;
    if (filterStatus==='pending') return pct===0;
    return true;
  });

  const FILTERS = [
    { key:'all',        label:'All Projects' },
    { key:'paid',       label:'🟢 Paid' },
    { key:'partial',    label:'🟡 Partial' },
    { key:'overdue',    label:'🔴 Overdue' },
    { key:'pending',    label:'⚪ Not Started' },
    { key:'no-payment', label:'➕ No Record' },
  ];

  const STATS = [
    { label:'Total Billed', val:fmt(totalBilled), sub:`${payments.length} projects`, gradient:'linear-gradient(135deg,#6b7280,#374151)', icon:CreditCard },
    { label:'Collected',    val:fmt(totalPaid),   sub:`${paidCount} fully paid`,     gradient:'linear-gradient(135deg,#10b981,#065f46)', icon:CheckCircle2 },
    { label:'Outstanding',  val:fmt(totalPending),sub:`${overdueCount} overdue`,      gradient: overdueCount>0?'linear-gradient(135deg,#ef4444,#b91c1c)':'linear-gradient(135deg,#f59e0b,#92400e)', icon:AlertCircle },
  ];

  return (
    <div>
      <PageHeader title="Payments" subtitle="Project-wise payment tracking"/>

      {/* ── Summary ── */}
      <div className="grid gap-3.5 mb-6" style={{ gridTemplateColumns:'1fr 2fr' }}>

        {/* Donut card */}
        <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 flex items-center gap-5 shadow-card dark:shadow-card-dark">
          <DonutChart
            paid={totalPaid}
            pending={totalPending>0 && overdueCount===0 ? totalPending : 0}
            overdue={totalBilled>0 ? (overdueCount/Math.max(payments.length,1))*totalBilled : 0}
          />
          <div className="flex flex-col gap-2">
            {[
              { color:'#10b981', label:'Paid' },
              { color:'#f59e0b', label:'Partial' },
              { color:'#ef4444', label:'Overdue' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span style={{ width:10, height:10, borderRadius:'50%', background:color, flexShrink:0 }}/>
                <span className="text-[13px] text-gray-600 dark:text-gray-300 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3.5">
          {STATS.map(({ label, val, sub, gradient, icon:Icon }) => (
            <div key={label}
              className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 relative overflow-hidden shadow-card dark:shadow-card-dark">
              <div style={{ position:'absolute', top:-12, right:-12, width:60, height:60, borderRadius:'50%', background:gradient, opacity:0.15, filter:'blur(14px)' }}/>
              <div style={{ width:40, height:40, borderRadius:12, background:gradient, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                <Icon size={18} color="#fff" strokeWidth={2.5}/>
              </div>
              <p className="font-display font-black text-2xl text-gray-900 dark:text-white tracking-tight m-0">{val}</p>
              <p className="text-[13px] text-gray-600 dark:text-gray-400 font-medium mt-1">{label}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter tabs — same pill container as leads/projects ── */}
      <div className="flex gap-1 bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] p-1 rounded-xl mb-5 w-fit flex-wrap">
        {FILTERS.map(({ key, label }) => (
          <button key={key} onClick={() => setFilterStatus(key)}
            className="px-4 py-2 rounded-lg text-[13px] font-bold cursor-pointer border-none transition-all"
            style={filterStatus === key
              ? { background:'var(--gold,#e8b84b)', color:'#0a0a0a' }
              : { background:'transparent', color:'#6b7280' }
            }>
            {label}
          </button>
        ))}
      </div>

      {/* ── Payment Cards ── */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({length:3}).map((_,i) => <div key={i} className="skeleton rounded-2xl h-24"/>)}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState icon={CreditCard} title="No projects found" description="No projects match the selected filter."/>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredProjects.map(project => (
            <PaymentCard
              key={project._id}
              project={project}
              payment={paymentMap[project._id]}
              onEdit={(payment,proj) => setEditData({ payment, project:proj })}
              onDelete={setDeleteId}
              onAdd={setAddProject}
            />
          ))}
        </div>
      )}

      <Modal open={!!editData} onClose={() => setEditData(null)} title="Update Payment">
        <PaymentForm payment={editData?.payment} projectId={editData?.project?._id} onSuccess={() => { setEditData(null); fetchAll(); }} onCancel={() => setEditData(null)}/>
      </Modal>
      <Modal open={!!addProject} onClose={() => setAddProject(null)} title={`Add Payment — ${addProject?.title}`}>
        <PaymentForm projectId={addProject?._id} onSuccess={() => { setAddProject(null); fetchAll(); }} onCancel={() => setAddProject(null)}/>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Payment" message="Delete this payment record permanently?"/>
    </div>
  );
}