'use client';
import { useState, useEffect } from 'react';
import { milestoneApi } from '@/lib/api';
import {
  Plus, Trash2, Pencil, CheckCircle2, Clock,
  AlertCircle, Calendar, ChevronDown, ChevronUp, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const STATUS_CFG = {
  Paid:    { icon: CheckCircle2, dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-100', bar: 'from-emerald-400 to-emerald-500' },
  Partial: { icon: Clock,        dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border border-amber-100',       bar: 'from-amber-400 to-amber-500' },
  Overdue: { icon: AlertCircle,  dot: 'bg-red-500',     badge: 'bg-red-50 text-red-700 border border-red-100',             bar: 'from-red-400 to-red-500' },
  Pending: { icon: Clock,        dot: 'bg-slate-400',   badge: 'bg-slate-100 text-slate-600 border border-slate-200',      bar: 'from-slate-300 to-slate-400' },
};

function MilestoneForm({ milestone, projectId, totalProjectAmount, onSuccess, onCancel }) {
  const [title, setTitle]           = useState(milestone?.title || '');
  const [percentage, setPercentage] = useState(milestone?.percentage || '');
  const [amount, setAmount]         = useState(milestone?.amount || '');
  const [dueDate, setDueDate]       = useState(milestone?.dueDate ? milestone.dueDate.substring(0, 10) : '');
  const [paidAmount, setPaidAmount] = useState(milestone?.paidAmount || 0);
  const [notes, setNotes]           = useState(milestone?.notes || '');
  const [loading, setLoading]       = useState(false);

  // Auto-calculate amount from percentage
  const handlePctChange = (val) => {
    setPercentage(val);
    if (totalProjectAmount && val) {
      setAmount(((Number(val) / 100) * Number(totalProjectAmount)).toFixed(2));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    if (!percentage || !amount) return toast.error('Percentage and amount are required');
    setLoading(true);
    try {
      const payload = {
        title, percentage: Number(percentage),
        amount: Number(amount), dueDate: dueDate || undefined,
        paidAmount: Number(paidAmount), notes,
      };
      if (milestone) {
        await milestoneApi.update(milestone._id, payload);
        toast.success('Milestone updated!');
      } else {
        await milestoneApi.create({ ...payload, project: projectId });
        toast.success('Milestone created!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const pct = amount && paidAmount ? Math.min(100, Math.round((Number(paidAmount) / Number(amount)) * 100)) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Milestone Title *</label>
        <input className="input" placeholder="e.g. 30% Upfront / Mid Delivery / Final Payment" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Percentage (%) *</label>
          <input type="number" min="1" max="100" className="input" placeholder="30" value={percentage} onChange={e => handlePctChange(e.target.value)} />
        </div>
        <div>
          <label className="label">Amount (₹) *</label>
          <input type="number" min="0" step="0.01" className="input" placeholder="15000" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Due Date</label>
          <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
        <div>
          <label className="label">Paid Amount (₹)</label>
          <input type="number" min="0" step="0.01" className="input" placeholder="0" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
        </div>
      </div>

      {/* Live progress preview */}
      {amount > 0 && (
        <div className="bg-slate-50 rounded-xl p-3 space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{fmt(paidAmount)} paid of {fmt(amount)}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-amber-600 font-medium">Pending: {fmt(Math.max(0, Number(amount) - Number(paidAmount || 0)))}</p>
        </div>
      )}

      <div>
        <label className="label">Notes (optional)</label>
        <input className="input" placeholder="e.g. Paid via bank transfer" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      <div className="flex gap-3 pt-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? 'Saving…' : milestone ? 'Update' : 'Add Milestone'}
        </button>
      </div>
    </form>
  );
}

export default function MilestoneManager({ projectId, totalAmount }) {
  const [milestones, setMilestones]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showCreate, setShowCreate]   = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [deleteId, setDeleteId]       = useState(null);
  const [deleting, setDeleting]       = useState(false);
  const [expanded, setExpanded]       = useState({});

  const fetchMilestones = async () => {
    try {
      const res = await milestoneApi.getByProject(projectId);
      setMilestones(res.data.data.milestones);
    } catch { toast.error('Failed to load milestones'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (projectId) fetchMilestones(); }, [projectId]);

  const handleMarkPaid = async (id) => {
    try {
      await milestoneApi.markPaid(id);
      toast.success('Marked as paid!');
      fetchMilestones();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await milestoneApi.delete(deleteId);
      toast.success('Milestone deleted');
      setDeleteId(null);
      fetchMilestones();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const totalAllocated  = milestones.reduce((s, m) => s + m.amount, 0);
  const totalPaidSoFar  = milestones.reduce((s, m) => s + m.paidAmount, 0);
  const totalPending    = totalAllocated - totalPaidSoFar;
  const overallPct      = totalAllocated > 0 ? Math.round((totalPaidSoFar / totalAllocated) * 100) : 0;

  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  if (loading) return <div className="py-8 text-center text-sm text-slate-400">Loading milestones…</div>;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      {milestones.length > 0 && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Payment Progress</p>
              <p className="text-2xl font-bold mt-0.5">{fmt(totalPaidSoFar)} <span className="text-slate-400 text-base font-normal">/ {fmt(totalAllocated)}</span></p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-emerald-400">{overallPct}%</p>
              <p className="text-xs text-slate-400">collected</p>
            </div>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <p className="text-sm font-bold text-white">{fmt(totalAllocated)}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total</p>
            </div>
            <div className="text-center border-x border-slate-700">
              <p className="text-sm font-bold text-emerald-400">{fmt(totalPaidSoFar)}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Received</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-amber-400">{fmt(totalPending)}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Pending</p>
            </div>
          </div>
        </div>
      )}

      {/* Milestone cards */}
      {milestones.map((m, idx) => {
        const cfg  = STATUS_CFG[m.status] || STATUS_CFG.Pending;
        const Icon = cfg.icon;
        const pct  = m.amount > 0 ? Math.min(100, Math.round((m.paidAmount / m.amount) * 100)) : 0;
        const isOverdue = m.status === 'Overdue';
        const isExp = expanded[m._id];

        return (
          <div key={m._id} className={`bg-white rounded-2xl border shadow-card overflow-hidden ${isOverdue ? 'border-red-200' : 'border-slate-100'}`}>
            {/* Top strip color */}
            <div className={`h-1 w-full bg-gradient-to-r ${cfg.bar}`} />

            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Order badge */}
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-500">
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800">{m.title}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {m.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{m.percentage}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5 mb-1">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{fmt(m.paidAmount)} paid</span>
                      <span className="font-semibold text-slate-700">{fmt(m.amount)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${cfg.bar} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Due date */}
                  {m.dueDate && (
                    <div className={`inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium px-2 py-0.5 rounded-lg ${isOverdue ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Calendar size={10} />
                      {isOverdue ? '⚠️ Overdue: ' : 'Due: '}
                      {new Date(m.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                  {m.paidDate && (
                    <div className="inline-flex items-center gap-1.5 mt-1.5 ml-2 text-xs font-medium px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={10} />
                      Paid: {new Date(m.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {m.status !== 'Paid' && (
                    <button
                      onClick={() => handleMarkPaid(m._id)}
                      title="Mark as fully paid"
                      className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-all"
                    >
                      <CheckCircle2 size={15} />
                    </button>
                  )}
                  <button onClick={() => setEditItem(m)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setDeleteId(m._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <Trash2 size={13} />
                  </button>
                  <button onClick={() => toggleExpand(m._id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-all">
                    {isExp ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                </div>
              </div>

              {/* Expanded notes */}
              {isExp && m.notes && (
                <div className="mt-3 ml-10 pl-3 border-l-2 border-slate-200">
                  <p className="text-xs text-slate-500 italic">{m.notes}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {milestones.length === 0 && (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <DollarSign size={28} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-500">No milestones yet</p>
          <p className="text-xs text-slate-400 mt-0.5">Add installment milestones to track partial payments</p>
        </div>
      )}

      {/* Add button */}
      <button onClick={() => setShowCreate(true)} className="btn-secondary w-full justify-center gap-2">
        <Plus size={15} /> Add Milestone
      </button>

      {/* Modals */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Milestone">
        <MilestoneForm
          projectId={projectId}
          totalProjectAmount={totalAmount}
          onSuccess={() => { setShowCreate(false); fetchMilestones(); }}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Milestone">
        <MilestoneForm
          milestone={editItem}
          projectId={projectId}
          totalProjectAmount={totalAmount}
          onSuccess={() => { setEditItem(null); fetchMilestones(); }}
          onCancel={() => setEditItem(null)}
        />
      </Modal>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Milestone"
        message="Delete this milestone permanently?"
      />
    </div>
  );
}
