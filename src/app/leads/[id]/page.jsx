'use client';
import { useEffect, useState } from 'react';
import { use } from 'react';
import { leadsApi } from '@/lib/api';
import {
  ArrowLeft, Phone, Mail, Calendar, AlertCircle, CheckCircle2,
  Pencil, Clock, User, Tag, DollarSign,
  StickyNote, Plus, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LeadForm from '@/components/leads/LeadForm';
import { Skeleton } from '@/components/ui/Skeleton';

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
const fmtD = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

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

export default function LeadDetailPage({ params }) {
  const { id } = use(params);
  const router  = useRouter();
  const [lead, setLead]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [showEdit, setShowEdit]       = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [converting, setConverting]   = useState(false);
  const [activityNote, setActivityNote] = useState('');
  const [addingNote, setAddingNote]     = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [lostReason, setLostReason]       = useState('');

  const fetchLead = async () => {
    try {
      const res = await leadsApi.getById(id);
      setLead(res.data.data.lead);
    } catch { toast.error('Failed to load lead'); router.push('/leads'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLead(); }, [id]);

  const handleStageChange = async (newStage) => {
    if (newStage === 'Lost')      { setShowLostModal(true); return; }
    if (newStage === 'Converted') { setShowConvert(true);   return; }
    try {
      await leadsApi.update(id, { stage: newStage });
      toast.success(`Moved to "${newStage}"`);
      fetchLead();
    } catch { toast.error('Failed to update stage'); }
  };

  const handleConvert = async () => {
    setConverting(true);
    try {
      const res = await leadsApi.convert(id);
      toast.success('Lead converted to client! 🎉');
      setShowConvert(false);
      router.push(`/clients/${res.data.data.client._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Conversion failed');
    } finally { setConverting(false); }
  };

  const handleMarkLost = async () => {
    try {
      await leadsApi.update(id, { stage: 'Lost', lostReason });
      toast.success('Lead marked as lost');
      setShowLostModal(false);
      fetchLead();
    } catch { toast.error('Failed to update'); }
  };

  // ── FIX: no event param needed since we removed the <form> wrapper ──
  const handleAddNote = async () => {
    if (!activityNote.trim()) return;
    setAddingNote(true);
    try {
      await leadsApi.addActivity(id, activityNote.trim());
      toast.success('Note added');
      setActivityNote('');
      fetchLead();
    } catch { toast.error('Failed to add note'); }
    finally { setAddingNote(false); }
  };

  if (loading) return (
    <div className="space-y-4 animate-fade-in">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64 col-span-2" />
      </div>
    </div>
  );
  if (!lead) return null;

  const stageIndex = STAGES.indexOf(lead.stage);
  const isOverdue  = lead.followUpDate && new Date(lead.followUpDate) < new Date() && !['Converted', 'Lost'].includes(lead.stage);
  const isDone     = ['Converted', 'Lost'].includes(lead.stage);

  return (
    <div className="animate-fade-in">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4 mb-6">
        <Link
          href="/leads"
          className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] transition-all mt-1"
        >
          <ArrowLeft size={16} />
        </Link>

        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display font-black text-xl text-gray-900 dark:text-white tracking-tight">
              {lead.name}
            </h1>
            <StageBadge stage={lead.stage} />
            {isOverdue && (
              <span className="flex items-center gap-1 text-xs font-bold text-red-600 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.5)' }}>
                <AlertCircle size={11} /> Follow-up Overdue
              </span>
            )}
          </div>
          {lead.referenceName && (
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 mt-0.5">{lead.referenceName}</p>
          )}
        </div>

        <div className="flex gap-2">
          {lead.convertedTo && (
            <Link
              href={`/clients/${lead.convertedTo._id}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold no-underline bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e1b16] transition-all"
            >
              <ExternalLink size={13} /> View Client
            </Link>
          )}
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold cursor-pointer bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e1b16] transition-all"
          >
            <Pencil size={14} /> Edit
          </button>
          {!isDone && (
            <button
              onClick={() => setShowConvert(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold cursor-pointer bg-yellow-600 hover:bg-emerald-600 text-white border border-emerald-600 transition-all"
            >
              <CheckCircle2 size={14} /> Convert
            </button>
          )}
        </div>
      </div>

      {/* ── Pipeline Progress ───────────────────────────────────────── */}
      {!isDone && (
        <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 mb-6 shadow-card dark:shadow-card-dark animate-slide-up">
          <p className="text-xs font-bold text-gray-600 dark:text-gray-100 uppercase tracking-widest mb-4">
            Pipeline Progress
          </p>
          <div className="flex items-center gap-0">
            {STAGES.filter(s => !['Converted', 'Lost'].includes(s)).map((s, i, arr) => {
              const done    = STAGES.indexOf(s) <= stageIndex;
              const current = s === lead.stage;
              const sCfg    = STAGE_CFG[s];
              return (
                <div key={s} className="flex items-center flex-1">
                  <button
                    onClick={() => handleStageChange(s)}
                    className={`flex flex-col items-center gap-1.5 flex-shrink-0 transition-all cursor-pointer ${current ? 'scale-110' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${current ? 'ring-4 ring-offset-1' : ''}`}
                      style={done ? {
                        background: sCfg.dot, borderColor: 'transparent',
                        ...(current ? { ringColor: sCfg.bg } : {})
                      } : {
                        background: 'transparent',
                        borderColor: '#e5e7eb',
                      }}
                    >
                      {done
                        ? <CheckCircle2 size={14} className="text-white" />
                        : <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{i + 1}</span>
                      }
                    </div>
                    <p className="text-[11px] font-bold text-center whitespace-nowrap"
                      style={{ color: current ? sCfg.text : done ? '#6b7280' : '#9ca3af' }}>
                      {s}
                    </p>
                  </button>
                  {i < arr.length - 1 && (
                    <div
                      className="flex-1 h-0.5 mx-1 rounded-full"
                      style={{ background: STAGES.indexOf(arr[i + 1]) <= stageIndex ? sCfg.dot : '#e5e7eb' }}
                    />
                  )}
                </div>
              );
            })}

            {/* Connector to Convert / Lost */}
            <div className="flex-1 h-0.5 mx-1 rounded-full bg-gray-200 dark:bg-white/[0.06]" />
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button
                onClick={() => setShowConvert(true)}
                className="px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.5)', color: '#059669' }}
              >
                ✅ Convert
              </button>
              <button
                onClick={() => setShowLostModal(true)}
                className="px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                style={{ background: 'rgba(248,113,113,0.12)', border: '1.5px solid rgba(248,113,113,0.5)', color: '#dc2626' }}
              >
                ❌ Lost
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column ─────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Lead Info */}
          <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 shadow-card dark:shadow-card-dark space-y-1">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Lead Info</h3>
            {[
              { icon: Phone,      label: 'Phone',     val: <a href={`tel:${lead.phone}`} className="text-gray-500 dark:text-gray-200 hover:underline font-bold text-sm">{lead.phone}</a> },
              { icon: Mail,       label: 'Email',     val: lead.email ? <a href={`mailto:${lead.email}`} className="text-gray-500 dark:text-gray-200 hover:underline font-bold text-sm">{lead.email}</a> : null },
              { icon: User,       label: 'Reference', val: lead.referenceName },
              { icon: Tag,        label: 'Source',    val: lead.source ? `${SOURCE_EMOJI[lead.source]} ${lead.source}` : null },
              { icon: DollarSign, label: 'Budget',    val: lead.budget ? <span className="text-gray-500 dark:text-gray-200 font-bold text-sm">{fmt(lead.budget)}</span> : null },
              { icon: Calendar,   label: 'Follow-up', val: lead.followUpDate ? fmtD(lead.followUpDate) : null, alert: isOverdue },
            ].filter(r => r.val).map(({ icon: Icon, label, val, alert }) => (
              <div
                key={label}
                className={`flex items-start gap-3 py-2.5 border-b border-gray-100 dark:border-white/[0.06] last:border-0 ${
                  alert ? 'bg-red-50 dark:bg-red-900/10 -mx-2 px-2 rounded-xl' : ''
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                  alert
                    ? 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800/40'
                    : 'bg-white dark:bg-[#1e1b16] border-gray-200 dark:border-white/[0.09]'
                }`}>
                  <Icon size={13} className={alert ? 'text-red-500' : 'text-gray-400 dark:text-gray-300'} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-400 font-bold uppercase tracking-widest">{label}</p>
                  <p className={`text-sm font-bold mt-0.5 ${alert ? 'text-red-700 dark:text-red-400' : 'text-gray-500 dark:text-gray-200'}`}>
                    {val}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Services */}
          {lead.services?.length > 0 && (
            <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 shadow-card dark:shadow-card-dark">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Interested In</h3>
              <div className="flex flex-wrap gap-2">
                {lead.services.map(s => (
                  <span key={s} className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ background: 'var(--gold-glass,rgba(232,184,75,0.12))', border: '1px solid rgba(232,184,75,0.4)', color: 'var(--gold,#e8b84b)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Lost reason */}
          {lead.stage === 'Lost' && lead.lostReason && (
            <div className="bg-gray-50 dark:bg-[#161410] border border-red-200 dark:border-red-800/40 rounded-2xl p-4">
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Lost Reason</p>
              <p className="text-sm text-red-700 dark:text-red-400">{lead.lostReason}</p>
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 shadow-card dark:shadow-card-dark">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Notes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* ── Right column — Activity Timeline ──────────────────────── */}
        <div className="lg:col-span-2 bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark">

          {/* Timeline header */}
          <div className="px-5 py-4 border-b border-gray-200 dark:border-white/[0.09]">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">Activity Timeline</h3>
            <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">All interactions and stage changes</p>
          </div>

          {/* ── Add note — no <form> wrapper to avoid submit conflicts ── */}
          <div className="px-5 py-4 border-b border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#1e1b16]">
            <div className="flex gap-3">
              <textarea
                className="flex-1 resize-none text-sm px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 transition-colors"
                rows={2}
                placeholder="Add a call note, meeting summary, follow-up detail…"
                value={activityNote}
                onChange={e => setActivityNote(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddNote}
                disabled={!activityNote.trim() || addingNote}
                className="btn-primary self-end disabled:opacity-60 text-xs py-2.5 flex items-center gap-1.5 border border-gray-200 dark:border-white/[0.09] cursor-pointer"
              >
                <Plus size={13} /> {addingNote ? '…' : 'Add'}
              </button>
            </div>
          </div>

          {/* Timeline entries */}
          <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
            {lead.activities?.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={24} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-400">No activity yet. Add the first note above.</p>
              </div>
            ) : (
              [...(lead.activities || [])].reverse().map((a, i) => (
                <div key={i} className="flex gap-3 animate-slide-up">
                  <div className="w-7 h-7 rounded-full bg-white dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <StickyNote size={11} className="text-yellow-500" />
                  </div>
                  <div className="flex-1 bg-white dark:bg-[#1e1b16] rounded-2xl border border-gray-200 dark:border-white/[0.09] p-3.5 hover:border-gray-300 dark:hover:border-white/20 transition-all">
                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{a.note}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {a.stage && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: STAGE_CFG[a.stage]?.bg, border: `1px solid ${STAGE_CFG[a.stage]?.border}`, color: STAGE_CFG[a.stage]?.text }}>
                          {a.stage}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {new Date(a.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title={<span className="text-blue-500">Edit Lead</span>} size="lg">
        <LeadForm lead={lead} onSuccess={() => { setShowEdit(false); fetchLead(); }} onCancel={() => setShowEdit(false)} />
      </Modal>

      <ConfirmDialog
        open={showConvert}
        onClose={() => setShowConvert(false)}
        onConfirm={handleConvert}
        loading={converting}
        title="Convert Lead to Client"
        message={`This will create a new client profile for "${lead.name}" and mark this lead as Converted. Continue?`}
      />

      <Modal open={showLostModal} onClose={() => setShowLostModal(false)} title="Mark as Lost" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">Why was this lead lost? (optional)</p>
          <textarea
            className="w-full resize-none text-sm px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 transition-colors"
            rows={3}
            placeholder="Budget too high, chose a competitor, not interested…"
            value={lostReason}
            onChange={e => setLostReason(e.target.value)}
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowLostModal(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e1b16] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleMarkLost}
              className="px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all"
              style={{ background: 'rgba(248,113,113,0.15)', border: '1.5px solid rgba(248,113,113,0.5)', color: '#dc2626' }}
            >
              Mark as Lost
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}