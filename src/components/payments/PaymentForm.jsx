'use client';
import { useState, useEffect, useRef } from 'react';
import { paymentsApi, projectsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { CreditCard, FolderKanban, ChevronDown, Check, Calendar } from 'lucide-react';

const poppins  = "'Poppins', 'system-ui', sans-serif";
const labelCls = "block text-[13px] text-gray-500 dark:text-gray-300 mb-1.5";
const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-[13px] font-medium bg-gray-50 dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] text-gray-500 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/20 dark:focus:ring-yellow-500/20 transition-all";

// ── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, children, error }) {
  return (
    <div>
      <label className={labelCls} style={{ fontFamily: poppins }}>{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1.5 font-medium">{error}</p>}
    </div>
  );
}

// ── Custom Dropdown ──────────────────────────────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder = 'Select…', icon: Icon, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected      = options.find(o => (o.value ?? o) === value);
  const displayLabel  = selected ? (selected.label ?? selected) : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        className={`${inputCls} flex items-center justify-between gap-2 text-left ${!displayLabel ? 'text-gray-400 dark:text-gray-600' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        style={{ paddingLeft: Icon ? '2.25rem' : undefined }}
      >
        {Icon && <Icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
        <span className="truncate flex-1">{displayLabel || placeholder}</span>
        {!disabled && (
          <ChevronDown
            size={14}
            className="flex-shrink-0 text-gray-400 transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        )}
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1.5 w-full rounded-xl overflow-hidden shadow-lg"
          style={{
            border: '1.5px solid rgba(232,184,75,0.3)',
            background: 'var(--dropdown-bg, #fff)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          <div className="py-1 max-h-52 overflow-y-auto">
            {options.map((opt) => {
              const val      = opt.value ?? opt;
              const lbl      = opt.label  ?? opt;
              const isActive = val === value;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => { onChange(val); setOpen(false); }}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-[13px] font-medium text-left transition-colors hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                  style={{
                    background: isActive ? 'rgba(232,184,75,0.1)' : undefined,
                    color:      isActive ? 'var(--gold, #e8b84b)' : 'inherit',
                    fontFamily: poppins,
                  }}
                >
                  <span className="truncate">{lbl}</span>
                  {isActive && <Check size={13} className="flex-shrink-0" style={{ color: 'var(--gold, #e8b84b)' }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Form ────────────────────────────────────────────────────────────────
export default function PaymentForm({ payment, projectId: propProjectId, onSuccess, onCancel }) {
  const [projects,     setProjects]     = useState([]);
  const [projectId,    setProjectId]    = useState(propProjectId || payment?.project?._id || '');
  const [totalAmount,  setTotalAmount]  = useState(payment?.totalAmount  ?? '');
  const [paidAmount,   setPaidAmount]   = useState(payment?.paidAmount   ?? '');
  const [dueDate,      setDueDate]      = useState(payment?.dueDate ? payment.dueDate.substring(0, 10) : '');
  const [notes,        setNotes]        = useState(payment?.notes        ?? '');
  const [loading,      setLoading]      = useState(false);
  const [errors,       setErrors]       = useState({});

  // If projectId came from prop (opened via "Add Payment" on a card), lock the dropdown
  const isProjectLocked = !!propProjectId;

  useEffect(() => {
    projectsApi.getAll({ limit: 100 })
      .then(r => setProjects(r.data.data.projects))
      .catch(() => {});
  }, []);

  const projectOptions = projects.map(p => ({
    value: p._id,
    label: p.title + (p.client?.name ? ` — ${p.client.name}` : ''),
  }));

  const validate = () => {
    const e = {};
    if (!projectId)                         e.project     = 'Project is required';
    if (totalAmount === '' || totalAmount < 0) e.totalAmount = 'Total amount is required';
    if (paidAmount  !== '' && Number(paidAmount) > Number(totalAmount))
      e.paidAmount = 'Paid cannot exceed total';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = {
        project:     projectId,
        totalAmount: Number(totalAmount),
        paidAmount:  paidAmount !== '' ? Number(paidAmount) : 0,
        dueDate:     dueDate || undefined,
        notes:       notes   || undefined,
      };
      if (payment) {
        await paymentsApi.update(payment._id, payload);
        toast.success('Payment updated!');
      } else {
        await paymentsApi.create(payload);
        toast.success('Payment added!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Derived helpers
  const pending = totalAmount !== '' && paidAmount !== ''
    ? Number(totalAmount) - Number(paidAmount)
    : null;
  const pct = totalAmount > 0 && paidAmount !== ''
    ? Math.round((Number(paidAmount) / Number(totalAmount)) * 100)
    : 0;

  return (
    <>
      <style>{`
        :root { --dropdown-bg: #fff; }
        .dark { --dropdown-bg: #1e1b16; }
      `}</style>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* ── Project ── */}
        <Field label="Project *" error={errors.project}>
          {isProjectLocked ? (
            /* Locked: project pre-selected from context — show read-only pill */
            <div
              className={`${inputCls} flex items-center gap-2 opacity-70 cursor-not-allowed`}
              style={{ paddingLeft: '2.25rem', position: 'relative' }}
            >
              <FolderKanban size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <span className="truncate">
                {projectOptions.find(o => o.value === projectId)?.label || 'Loading…'}
              </span>
            </div>
          ) : (
            <CustomSelect
              value={projectId}
              onChange={v => { setProjectId(v); setErrors(er => ({ ...er, project: undefined })); }}
              options={projectOptions}
              placeholder="Select a project…"
              icon={FolderKanban}
            />
          )}
        </Field>

        {/* ── Amounts ── */}
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Total amount (₹) *" error={errors.totalAmount}>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[13px] font-semibold pointer-events-none">₹</span>
              <input
                type="number"
                min="0"
                className={`${inputCls} pl-7`}
                placeholder="e.g. 50000"
                value={totalAmount}
                onChange={e => setTotalAmount(e.target.value)}
              />
            </div>
          </Field>

          <Field label="Paid so far (₹)" error={errors.paidAmount}>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[13px] font-semibold pointer-events-none">₹</span>
              <input
                type="number"
                min="0"
                className={`${inputCls} pl-7`}
                placeholder="0"
                value={paidAmount}
                onChange={e => setPaidAmount(e.target.value)}
              />
            </div>
          </Field>
        </div>

        {/* ── Progress preview ── */}
        {totalAmount > 0 && (
          <div className="-mt-1">
            <div className="flex justify-between mb-1.5">
              <span className="text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                {pct}% collected
              </span>
              {pending !== null && (
                <span className="text-[12px] font-semibold" style={{ color: pending > 0 ? '#f59e0b' : '#10b981' }}>
                  {pending > 0 ? `₹${Number(pending).toLocaleString('en-IN')} pending` : '✅ Fully paid'}
                </span>
              )}
            </div>
            <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(pct, 100)}%`,
                  background: pct === 100
                    ? 'linear-gradient(90deg,#10b981,#34d399)'
                    : pct > 0
                    ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                    : 'linear-gradient(90deg,#6b7280,#9ca3af)',
                  borderRadius: 99,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* ── Due date ── */}
        <Field label="Due date">
          <div className="relative">
            <Calendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              className={`${inputCls} pl-8`}
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
        </Field>

        {/* ── Notes ── */}
        <Field label="Notes">
          <textarea
            className={`${inputCls} resize-none leading-relaxed`}
            rows={3}
            placeholder="Payment terms, milestones, remarks…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </Field>

        {/* ── Buttons ── */}
        <div className="flex gap-2.5 justify-end pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all bg-white dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] text-gray-600 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white/20"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="dark:bg-[#e8b84b] bg-indigo-500 dark:text-black text-white flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              border:      '1.5px solid rgba(232,184,75,0.6)',
              boxShadow:   '0 2px 8px rgba(232,184,75,0.25)',
            }}
          >
            <CreditCard size={13} />
            {loading ? 'Saving…' : payment ? 'Update payment' : 'Add payment'}
          </button>
        </div>

      </form>
    </>
  );
}