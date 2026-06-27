'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectsApi, notesApi, tasksApi } from '@/lib/api';
import {
  ArrowLeft, Pencil, StickyNote, Plus, Trash2,
  CreditCard, Calendar, User, FileText, Upload,
  CheckSquare, CheckCircle2, UserCheck
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProjectForm from '@/components/projects/ProjectForm';
import NoteForm from '@/components/notes/NoteForm';
import PaymentForm from '@/components/payments/PaymentForm';
import MilestoneManager from '@/components/payments/MilestoneManager';
import InvoiceUploader from '@/components/payments/InvoiceUploader';
import TaskManager from '@/components/tasks/TaskManager';
import MeetingsList from '@/components/meetings/MeetingsList';
import { Skeleton } from '@/components/ui/Skeleton';
import ActivityLog from '@/components/ui/ActivityLog';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [payment, setPayment] = useState(null);
  const [taskStats, setTaskStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showEdit, setShowEdit] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [deleteNoteId, setDeleteNoteId] = useState(null);
  const [deletingNote, setDeletingNote] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        projectsApi.getById(id),
        tasksApi.getByProject(id),
      ]);
      setProject(pRes.data.data.project);
      setPayment(pRes.data.data.project?.payment || null);
      setTaskStats(tRes.data.data?.stats || null);

      try {
        const nRes = await notesApi.getByProject(id);
        setNotes(Array.isArray(nRes.data.data?.notes) ? nRes.data.data.notes : nRes.data.data || []);
      } catch { setNotes([]); }

    } catch (e) {
      console.error('fetchData error:', e);
      toast.error('Failed to load project');
      router.push('/projects');
    }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [id]);

  const handleDeleteNote = async () => {
    setDeletingNote(true);
    try {
      await notesApi.delete(deleteNoteId);
      toast.success('Note deleted');
      setDeleteNoteId(null);
      fetchData();
    } catch { toast.error('Failed to delete'); }
    finally { setDeletingNote(false); }
  };

  if (loading) return <div className="space-y-4 animate-fade-in"><Skeleton className="h-10 w-64" /></div>;
  if (!project) return null;

  const tabs = [
    { key: 'tasks',      label: `✅ Tasks${taskStats ? ` (${taskStats.done}/${taskStats.total})` : ''}` },
    { key: 'milestones', label: '💰 Milestones' },
    { key: 'invoices',   label: '📄 Invoices'   },
    { key: 'meetings',   label: '📅 Meetings'   },
    { key: 'notes',      label: `📝 Notes (${notes.length})` },
    { key: 'overview',   label: '📋 Overview'   },
    { key: 'activity',   label: '📜 Activity'   },
  ];

  const SERVICE_EMOJI  = { "Website Development":"🌐","App Development":"📱","SEO":"🔍","Social Media Marketing":"📣","Google Ads":"🔎","Meta Ads":"📘","Branding / Design":"🎨","Content Writing":"✍️" };
  const PRIORITY_EMOJI = { "Urgent":"🔴","Long-term":"🔵","One-time":"⚪","Retainer":"🟣" };

  const fmtDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    const day = dt.getDate();
    const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()];
    return `${day} ${mon} ${dt.getFullYear()}`;
  };
  const fmtDateTime = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    const h = dt.getHours().toString().padStart(2,'0');
    const m = dt.getMinutes().toString().padStart(2,'0');
    return `${fmtDate(d)}, ${h}:${m}`;
  };

  // Normalize assignedTo to always be an array
  const assignedToList = project.assignedTo
    ? (Array.isArray(project.assignedTo) ? project.assignedTo : [project.assignedTo]).filter(Boolean)
    : [];

  return (
    <div className="animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start gap-3 mb-6">
        <Link
          href="/projects"
          className="p-2 rounded-xl border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#1e1b16] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all mt-1"
        >
          <ArrowLeft size={16} />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h1 className="font-display font-black text-xl text-gray-900 dark:text-white tracking-tight">
              {project.title}
            </h1>
            {project.serviceType && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl border whitespace-nowrap flex-shrink-0"
                style={{
                  background: 'var(--gold-glass, rgba(232,184,75,0.12))',
                  border: '1px solid rgba(232,184,75,0.4)',
                  color: 'var(--gold, #e8b84b)',
                }}>
                {SERVICE_EMOJI[project.serviceType]} {project.serviceType}
              </span>
            )}
            {project.priority && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-[#1e1b16] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/[0.09] whitespace-nowrap flex-shrink-0">
                {PRIORITY_EMOJI[project.priority]} {project.priority}
              </span>
            )}
          </div>

          {project.client && (
            <Link
              href={`/clients/${project.client._id}`}
              className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 hover:underline flex items-center gap-1 mt-0.5"
            >
              <User size={12} />{project.client.name}
            </Link>
          )}

          {taskStats && taskStats.total > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1.5 w-32 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
                  style={{ width: `${taskStats.completionPct}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {taskStats.completionPct}% tasks done
              </span>
              {taskStats.overdue > 0 && (
                <span className="text-xs text-red-500 font-semibold">· {taskStats.overdue} overdue</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={project.status} />
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#1e1b16] text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer"
          >
            <Pencil size={13} /> Edit
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] p-1 rounded-xl mb-6 w-fit max-w-full overflow-x-auto flex-nowrap" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="px-4 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer border-none whitespace-nowrap"
            style={activeTab === t.key
              ? { background: 'var(--gold, #e8b84b)', color: '#0a0a0a' }
              : { background: 'transparent', color: 'var(--text-muted, #6b7280)' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tasks Tab ── */}
      {activeTab === 'tasks' && (
        <div className="max-w-3xl">
          <TaskManager projectId={id} />
        </div>
      )}

      {/* ── Milestones Tab ── */}
      {activeTab === 'milestones' && (
        <div className="max-w-2xl">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-800 dark:text-white">Installment Plan</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Split project payment into milestones with due dates</p>
          </div>
          <MilestoneManager projectId={id} totalAmount={payment?.totalAmount} />
        </div>
      )}

      {/* ── Invoices Tab ── */}
      {activeTab === 'invoices' && (
        <div className="max-w-2xl">
          <InvoiceUploader projectId={id} />
        </div>
      )}

      {/* ── Meetings Tab ── */}
      {activeTab === 'meetings' && (
        <div className="max-w-2xl">
          <MeetingsList projectId={id} />
        </div>
      )}

      {/* ── Notes Tab ── */}
      {activeTab === 'notes' && (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800 dark:text-white">Activity Notes</h2>
            <button
              onClick={() => setShowNote(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold cursor-pointer border-none transition-all"
              style={{ background: 'var(--gold, #e8b84b)', color: '#0a0a0a' }}
            >
              <Plus size={13} /> Add Note
            </button>
          </div>
          <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark">
            {notes.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] flex items-center justify-center mb-3">
                  <StickyNote size={22} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">No notes yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                {notes.map(note => (
                  <div key={note._id} className="flex items-start gap-4 px-5 py-4 hover:bg-white dark:hover:bg-[#1e1b16] group transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <StickyNote size={14} className="text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{note.content}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{fmtDateTime(note.createdAt)}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditNote(note)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-white dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all cursor-pointer">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => setDeleteNoteId(note._id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-white dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">

          {/* Project Info card */}
          <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 shadow-card dark:shadow-card-dark space-y-3">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Project Info</h3>

            {project.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{project.description}</p>
            )}

            {/* ── Assigned To (array-safe) ── */}
            {assignedToList.length > 0 && (
              <div className="flex flex-col gap-2">
                {assignedToList.map((person, i) => (
                  <div
                    key={person._id || i}
                    className="flex items-center gap-2.5 p-3 rounded-xl"
                    style={{ background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.2)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs text-[#0a0a0a]"
                      style={{ background: 'linear-gradient(135deg,#e8b84b,#b88c2a)' }}
                    >
                      {person.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-gray-800 dark:text-white leading-none truncate">
                        {person.name}
                      </p>
                      {person.role && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{person.role}</p>
                      )}
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(232,184,75,0.15)', color: '#b8860b' }}
                    >
                      Assigned
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Dates */}
            {(project.startDate || project.endDate) && (
              <div className="space-y-1.5">
                {project.startDate && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar size={13} className="text-gray-400" />
                    Start: {fmtDate(project.startDate)}
                  </div>
                )}
                {project.endDate && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar size={13} className="text-gray-400" />
                    End: {fmtDate(project.endDate)}
                  </div>
                )}
              </div>
            )}

            {/* Budget */}
            {project.budget > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="text-gray-400 font-bold">₹</span>
                Budget: <span className="font-bold text-gray-700 dark:text-gray-200">₹{Number(project.budget).toLocaleString('en-IN')}</span>
              </div>
            )}

            {/* Recurring */}
            {project.isRecurring && (
              <div className="rounded-xl p-3" style={{
                background: 'var(--gold-glass, rgba(232,184,75,0.1))',
                border: '1.5px solid rgba(232,184,75,0.3)',
              }}>
                <p className="text-xs font-bold" style={{ color: 'var(--gold, #e8b84b)' }}>
                  🔄 Recurring — {project.billingCycle}
                </p>
                <p className="text-sm font-black mt-0.5" style={{ color: 'var(--gold, #e8b84b)' }}>
                  ₹{Number(project.recurringAmount || 0).toLocaleString('en-IN')}
                </p>
                {project.nextBillingDate && (
                  <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">
                    Next: {fmtDate(project.nextBillingDate)}
                  </p>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 dark:border-white/[0.06]">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Created {fmtDate(project.createdAt)}
              </p>
            </div>
          </div>

          {/* Payment card */}
          <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 shadow-card dark:shadow-card-dark">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard size={15} className="text-gray-500 dark:text-gray-400" />
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Payment Total</h3>
              </div>
              <button
                onClick={() => setShowPayment(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition-all border"
                style={payment
                  ? { border: '1.5px solid #d1d5db', background: 'transparent', color: '#374151' }
                  : { background: 'var(--gold, #e8b84b)', border: '1.5px solid rgba(232,184,75,0.6)', color: '#0a0a0a' }
                }
              >
                {payment ? <><Pencil size={11} />Update</> : <><Plus size={11} />Set Total</>}
              </button>
            </div>
            {payment ? (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total',   val: payment.totalAmount,   color: 'text-gray-800 dark:text-white' },
                  { label: 'Paid',    val: payment.paidAmount,    color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Pending', val: payment.pendingAmount, color: 'text-amber-600 dark:text-amber-400' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="bg-white dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] rounded-xl p-2.5 text-center">
                    <p className={`text-base font-bold ${color}`}>₹{Number(val || 0).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No total set yet</p>
            )}
          </div>
        </div>
      )}

      {/* ── Activity Tab ── */}
      {activeTab === 'activity' && (
        <ActivityLog mode="project" id={id} maxHeight="500px" />
      )}

      {/* ── Modals ── */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Project" size="lg">
        <ProjectForm project={project} onSuccess={() => { setShowEdit(false); fetchData(); }} onCancel={() => setShowEdit(false)} />
      </Modal>
      <Modal open={showNote} onClose={() => setShowNote(false)} title="Add Note">
        <NoteForm projectId={id} onSuccess={() => { setShowNote(false); fetchData(); }} onCancel={() => setShowNote(false)} />
      </Modal>
      <Modal open={!!editNote} onClose={() => setEditNote(null)} title="Edit Note">
        <NoteForm note={editNote} projectId={id} onSuccess={() => { setEditNote(null); fetchData(); }} onCancel={() => setEditNote(null)} />
      </Modal>
      <Modal open={showPayment} onClose={() => setShowPayment(false)} title={payment ? 'Update Payment Total' : 'Set Payment Total'}>
        <PaymentForm projectId={id} payment={payment} onSuccess={() => { setShowPayment(false); fetchData(); }} onCancel={() => setShowPayment(false)} />
      </Modal>
      <ConfirmDialog
        open={!!deleteNoteId}
        onClose={() => setDeleteNoteId(null)}
        onConfirm={handleDeleteNote}
        loading={deletingNote}
        title="Delete Note"
        message="Delete this note permanently?"
      />
    </div>
  );
}