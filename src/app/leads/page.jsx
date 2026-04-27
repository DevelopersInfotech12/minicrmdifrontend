'use client';
import { useEffect, useState, useCallback } from 'react';
import { leadsApi } from '@/lib/api';
import { Users, Plus, Search, Phone, Mail, Calendar, AlertCircle, Pencil, Trash2, Eye, ArrowRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import LeadForm from '@/components/leads/LeadForm';

const STAGES = ["New", "Called", "Meeting Done", "Proposal Sent", "Converted", "Lost"];

const STAGE_CFG = {
  "New":           { dot: '#9ca3af', bg: 'rgba(156,163,175,0.12)', border: '#9ca3af', text: '#6b7280' },
  "Called":        { dot: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: '#60a5fa', text: '#3b82f6' },
  "Meeting Done":  { dot: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: '#a78bfa', text: '#8b5cf6' },
  "Proposal Sent": { dot: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: '#fbbf24', text: '#d97706' },
  "Converted":     { dot: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: '#34d399', text: '#059669' },
  "Lost":          { dot: '#f87171', bg: 'rgba(248,113,113,0.12)', border: '#f87171', text: '#dc2626' },
};

const SOURCE_EMOJI = {
  "LinkedIn": "💼", "Instagram": "📸", "Facebook": "👥", "Referral": "🤝",
  "Google Ads": "🔍", "Walk-in": "🚶", "Cold Call": "📞", "Website Form": "🌐", "WhatsApp": "💬"
};

const fmt  = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtD = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

function StageBadge({ stage }) {
  const cfg = STAGE_CFG[stage] || STAGE_CFG["New"];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
      background: cfg.bg, border: `1.5px solid ${cfg.border}`,
      color: cfg.text, whiteSpace: 'nowrap'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {stage}
    </span>
  );
}

function PipelineBar({ pipeline, onFilter, activeStage }) {
  if (!pipeline) return null;
  const total = Object.values(pipeline.stages).reduce((s, v) => s + v, 0);

  return (
    // ← Same pattern as dashboard StatCard / recent tables:
    //   bg-gray-50 dark:bg-[#161410]  border border-gray-200 dark:border-white/[0.09]
    <div className="animate-fade-up bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 mb-5 shadow-card dark:shadow-card-dark">

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-display font-bold text-base text-gray-900 dark:text-white tracking-tight">
            Lead Pipeline
          </p>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-100 mt-1">
            {total} lead{total !== 1 ? 's' : ''} · {fmt(pipeline.totalPipelineBudget)} pipeline value
          </p>
        </div>
        {pipeline.followUpsDue > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.5)' }}>
            <AlertCircle size={13} />
            {pipeline.followUpsDue} follow-up{pipeline.followUpsDue > 1 ? 's' : ''} overdue
          </div>
        )}
      </div>

      {/* Progress strip */}
      {total > 0 && (
        <div className="flex h-1 rounded-full overflow-hidden gap-0.5 mb-4">
          {STAGES.map(s => {
            const count = pipeline.stages[s] || 0;
            const pct   = total > 0 ? (count / total) * 100 : 0;
            if (pct === 0) return null;
            const colors = { "New":"#9ca3af","Called":"#60a5fa","Meeting Done":"#a78bfa","Proposal Sent":"#fbbf24","Converted":"#34d399","Lost":"#f87171" };
            return <div key={s} style={{ width:`${pct}%`, background:colors[s], borderRadius:99, transition:'width 0.5s ease' }} />;
          })}
        </div>
      )}

      {/* Stage filter buttons */}
      <div className="grid grid-cols-6 gap-2">
        {STAGES.map(s => {
          const count    = pipeline.stages[s] || 0;
          const cfg      = STAGE_CFG[s];
          const isActive = activeStage === s;
          return (
            <button
              key={s}
              onClick={() => onFilter(isActive ? '' : s)}
              // light: white bg inactive / dark: dark elevated
              className={`text-left rounded-xl p-2.5 transition-all cursor-pointer border ${
                isActive
                  ? ''
                  : 'bg-white dark:bg-[#1e1b16] border-gray-200 dark:border-white/[0.09]'
              }`}
              style={isActive ? {
                background: cfg.bg,
                border: `2px solid ${cfg.border}`,
                boxShadow: `0 0 0 1px ${cfg.border}20`,
              } : {}}
            >
              <p className="font-display font-extrabold text-2xl leading-none mb-1"
                style={{ color: isActive ? cfg.text : undefined }}
                // Use Tailwind for inactive color to respect dark mode
              >
                <span className={isActive ? '' : 'text-gray-800 dark:text-white'}>{count}</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: isActive ? cfg.text : undefined }}>
                <span className={isActive ? '' : 'text-gray-400 dark:text-gray-500'}>{s}</span>
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const [leads,        setLeads]        = useState([]);
  const [total,        setTotal]        = useState(0);
  const [pipeline,     setPipeline]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [view,         setView]         = useState('list');
  const [search,       setSearch]       = useState('');
  const [filterStage,  setFilterStage]  = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [page,         setPage]         = useState(1);
  const [showCreate,   setShowCreate]   = useState(false);
  const [editLead,     setEditLead]     = useState(null);
  const [deleteId,     setDeleteId]     = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [lRes, pRes] = await Promise.all([
        leadsApi.getAll({ page, limit, search: search || undefined, stage: filterStage || undefined, source: filterSource || undefined }),
        leadsApi.getPipeline(),
      ]);
      setLeads(lRes.data.data.leads);
      setTotal(lRes.data.data.pagination.total);
      setPipeline(pRes.data.data);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  }, [page, search, filterStage, filterSource]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStageChange = async (id, newStage) => {
    try { await leadsApi.update(id, { stage: newStage }); toast.success(`Moved to ${newStage}`); fetchData(); }
    catch { toast.error('Failed to update stage'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await leadsApi.delete(deleteId); toast.success('Lead deleted'); setDeleteId(null); fetchData(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PageHeader
        title="Lead Management"
        subtitle={`${total} lead${total !== 1 ? 's' : ''} in pipeline`}
        action={
          <div className="flex items-center gap-2.5">
            {/* View toggle — same bg/border pattern as dashboard secondary cards */}
            <div className="flex bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-xl p-0.5 gap-0.5">
              {['list', 'kanban'].map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer border-none transition-all ${
                    view === v
                      ? 'text-[#0a0a0a]'
                      : 'bg-transparent text-gray-500 dark:text-gray-400'
                  }`}
                  style={view === v ? { background: 'var(--gold, #e8b84b)' } : {}}
                >
                  {v === 'list' ? '☰ List' : '⊞ Board'}
                </button>
              ))}
            </div>

            {/* Add Lead button — bordered like dashboard card style */}
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer border border-gray-200 dark:border-white/[0.09]"
            >
              <Plus size={15} strokeWidth={2.5} /> Add Lead
            </button>
          </div>
        }
      />

      <PipelineBar pipeline={pipeline} onFilter={s => { setFilterStage(s); setPage(1); }} activeStage={filterStage} />

      {/* Filters */}
      <div className="flex gap-2.5 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[13px] font-medium bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 transition-colors"
            placeholder="Search by name, phone, email…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="min-w-[160px] px-3 py-2.5 rounded-xl text-[13px] font-medium bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] text-gray-500 dark:text-gray-300 outline-none focus:border-yellow-400 transition-colors cursor-pointer"
          value={filterSource}
          onChange={e => { setFilterSource(e.target.value); setPage(1); }}
        >
          <option value="">All Sources</option>
          {Object.keys(SOURCE_EMOJI).map(s => (
            <option key={s} value={s}>{SOURCE_EMOJI[s]} {s}</option>
          ))}
        </select>
        {(filterStage || filterSource || search) && (
          <button
            onClick={() => { setFilterStage(''); setFilterSource(''); setSearch(''); setPage(1); }}
            className="btn-secondary flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            <RefreshCw size={13} /> Clear
          </button>
        )}
      </div>

      {/* ── LIST VIEW ────────────────────────────────────────────────── */}
      {view === 'list' && (
        // Outer wrapper: bg-gray-50 (light) / dark bg — same as dashboard recent tables
        <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark">

          {loading ? (
            <div className="p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                  <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <div className="skeleton h-3.5 w-2/5 rounded mb-1.5" />
                    <div className="skeleton h-3 w-1/4 rounded" />
                  </div>
                  <div className="skeleton h-6 w-24 rounded-full" />
                </div>
              ))}
            </div>
          ) : leads.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No leads found"
              description="Add your first lead to start tracking your pipeline."
              action={
                <button
                  onClick={() => setShowCreate(true)}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer border border-gray-200 dark:border-white/[0.09]"
                >
                  <Plus size={14} /> Add Lead
                </button>
              }
            />
          ) : (
            <>
              <table className="w-full border-collapse">
                <thead>
                  {/* Table head: bg-gray-100 light / slightly elevated dark — matches dashboard table header pattern */}
                  <tr className="bg-gray-100 dark:bg-[#1e1b16] border-b border-gray-200 dark:border-white/[0.09]">
                    {['Lead', 'Contact', 'Services', 'Source', 'Budget', 'Follow-up', 'Stage', 'Actions'].map(h => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[12px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-100 font-sans border-r border-gray-200 dark:border-white/[0.06] last:border-r-0"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => {
                    const isOverdue = lead.followUpDate && new Date(lead.followUpDate) < new Date() && !['Converted', 'Lost'].includes(lead.stage);
                    return (
                      <tr
                        key={lead._id}
                        className={`border-b border-gray-100 dark:border-white/[0.06] transition-colors hover:bg-white dark:hover:bg-[#1e1b16] ${
                          isOverdue ? 'bg-red-50/40 dark:bg-red-900/10' : ''
                        }`}
                      >
                        {/* Lead */}
                        <td className="px-4 py-3.5 border-r border-gray-100 dark:border-white/[0.06]">
                          <p className="font-display font-bold text-[15px] text-gray-800 dark:text-white tracking-tight leading-none">{lead.name}</p>
                          {lead.referenceName && <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">{lead.referenceName}</p>}
                          {isOverdue && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-1.5 py-0.5 rounded-full">
                              OVERDUE
                            </span>
                          )}
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3.5 border-r border-gray-100 dark:border-white/[0.06]">
                          <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 no-underline mb-1">
                            <Phone size={10} className="text-gray-400" />{lead.phone}
                          </a>
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-400 no-underline max-w-[160px] truncate">
                              <Mail size={10} />{lead.email}
                            </a>
                          )}
                        </td>

                        {/* Services */}
                        <td className="px-4 py-3.5 border-r border-gray-100 dark:border-white/[0.06]">
                          <div className="flex flex-wrap gap-1">
                            {lead.services?.slice(0, 2).map(s => (
                              <span key={s} className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ background:'var(--gold-glass,rgba(232,184,75,0.12))', border:'1px solid rgba(232,184,75,0.4)', color:'var(--gold,#e8b84b)' }}>
                                {s}
                              </span>
                            ))}
                            {lead.services?.length > 2 && <span className="text-[10px] text-gray-400 dark:text-gray-600">+{lead.services.length - 2}</span>}
                          </div>
                        </td>

                        {/* Source */}
                        <td className="px-4 py-3.5 border-r border-gray-100 dark:border-white/[0.06]">
                          <span className="text-[13px] font-semibold text-gray-600 dark:text-gray-300">
                            {SOURCE_EMOJI[lead.source]} {lead.source}
                          </span>
                        </td>

                        {/* Budget */}
                        <td className="px-4 py-3.5 border-r border-gray-100 dark:border-white/[0.06]">
                          {lead.budget
                            ? <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">{fmt(lead.budget)}</span>
                            : <span className="text-gray-300 dark:text-gray-600 text-[13px]">—</span>}
                        </td>

                        {/* Follow-up */}
                        <td className="px-4 py-3.5 border-r border-gray-100 dark:border-white/[0.06]">
                          {lead.followUpDate ? (
                            <span className={`flex items-center gap-1 text-[13px] font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-500 dark:text-gray-300'}`}>
                              {isOverdue && <AlertCircle size={11} />}
                              <Calendar size={11} />
                              {fmtD(lead.followUpDate)}
                            </span>
                          ) : <span className="text-gray-300 dark:text-gray-400 text-[13px]">—</span>}
                        </td>

                        {/* Stage */}
                        <td className="px-4 py-3.5 border-r border-gray-100 dark:border-white/[0.06]">
                          <StageBadge stage={lead.stage} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            {[
                              { icon: Eye,    href: `/leads/${lead._id}`, cls: 'text-yellow-600 dark:text-yellow-400' },
                              { icon: Pencil, onClick: () => setEditLead(lead), cls: 'text-gray-500 dark:text-gray-400' },
                              { icon: Trash2, onClick: () => setDeleteId(lead._id), cls: 'text-red-500' },
                            ].map(({ icon: Icon, href, onClick, cls }, i) => {
                              const base = `w-7 h-7 rounded-lg flex items-center justify-center bg-white dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] transition-all hover:border-gray-300 dark:hover:border-white/20 cursor-pointer ${cls}`;
                              return href
                                ? <Link key={i} href={href} className={base}><Icon size={13} /></Link>
                                : <button key={i} onClick={onClick} className={base}><Icon size={13} /></button>;
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3.5 border-t border-gray-200 dark:border-white/[0.09]">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <button disabled={page <= 1}          onClick={() => setPage(p => p-1)} className="btn-secondary px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-40">Previous</button>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p+1)} className="btn-secondary px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-40">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── KANBAN VIEW ──────────────────────────────────────────────── */}
      {view === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {STAGES.map(stage => {
            const cards = leads.filter(l => l.stage === stage);
            const cfg   = STAGE_CFG[stage];
            return (
              <div
                key={stage}
                className="flex-shrink-0 w-60 bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-2.5"
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl mb-2.5"
                  style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                    <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: cfg.text }}>{stage}</span>
                  </div>
                  <span className="text-[13px] font-extrabold" style={{ color: cfg.text }}>{pipeline?.stages?.[stage] || 0}</span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2">
                  {cards.length === 0 ? (
                    <div className="h-14 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/[0.09] flex items-center justify-center">
                      <p className="text-xs font-medium text-gray-400 dark:text-gray-600">Empty</p>
                    </div>
                  ) : cards.map(lead => {
                    const isOverdue = lead.followUpDate && new Date(lead.followUpDate) < new Date() && !['Converted', 'Lost'].includes(lead.stage);
                    return (
                      <div
                        key={lead._id}
                        className="bg-white dark:bg-[#1e1b16] rounded-xl p-3"
                        style={{ border: `1px solid ${isOverdue ? 'rgba(220,38,38,0.4)' : ''}` }}
                      >
                        {!isOverdue && <div className="absolute inset-0 rounded-xl pointer-events-none" />}
                        {/* use className for border to get dark mode */}
                        <div className={`rounded-xl p-3 -m-3 ${isOverdue ? '' : 'border border-gray-200 dark:border-white/[0.09]'}`}
                          style={isOverdue ? { border:'1px solid rgba(220,38,38,0.4)', borderRadius:12, padding:12 } : {}}>
                          <p className="font-display font-bold text-[15px] text-gray-800 dark:text-white tracking-tight leading-none mb-1">{lead.name}</p>
                          {lead.referenceName && <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{lead.referenceName}</p>}
                          <div className="flex items-center justify-between mt-2">
                            {lead.budget && <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmt(lead.budget)}</span>}
                            {lead.followUpDate && (
                              <span className={`flex items-center gap-1 text-[11px] font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-400 dark:text-gray-500'}`}>
                                <Calendar size={10} />{fmtD(lead.followUpDate)}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1 mt-2">
                            <Link href={`/leads/${lead._id}`}
                              className="flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs font-bold no-underline transition-colors"
                              style={{ background:'var(--gold-glass,rgba(232,184,75,0.12))', border:'1.5px solid rgba(232,184,75,0.5)', color:'var(--gold,#e8b84b)' }}>
                              View
                            </Link>
                            <button
                              onClick={() => {
                                const idx  = STAGES.indexOf(lead.stage);
                                const next = STAGES[idx + 1];
                                if (next && !['Converted','Lost'].includes(next)) handleStageChange(lead._id, next);
                              }}
                              className="flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs font-bold bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] text-gray-500 dark:text-gray-400 cursor-pointer transition-colors"
                            >
                              <ArrowRight size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add New Lead" size="lg">
        <LeadForm onSuccess={() => { setShowCreate(false); fetchData(); }} onCancel={() => setShowCreate(false)} />
      </Modal>
      <Modal open={!!editLead} onClose={() => setEditLead(null)} title="Edit Lead" size="lg">
        <LeadForm lead={editLead} onSuccess={() => { setEditLead(null); fetchData(); }} onCancel={() => setEditLead(null)} />
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Lead"
        message="Delete this lead permanently? This cannot be undone."
      />
    </div>
  );
}