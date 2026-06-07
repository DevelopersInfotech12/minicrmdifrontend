'use client';
import { useEffect, useState, useRef } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

// ── helpers ──────────────────────────────────────────────────────────────────
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const curYear = new Date().getFullYear();
export const curMonth = new Date().getMonth() + 1;

export const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-[#1a1714] border border-gray-200 dark:border-white/12 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 dark:focus:border-[#e8b84b] focus:ring-2 focus:ring-indigo-500/20 transition-all";
export const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#c8b896] mb-1.5";

// ── CustomSelect ─────────────────────────────────────────────────────────────
export function CustomSelect({ value, onChange, options, placeholder = 'Select…' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const sel = options.find(o => (o.value ?? o) === value);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`${inputCls} flex items-center justify-between gap-2 text-left ${!sel ? 'text-gray-400 dark:text-gray-600' : ''}`}>
        <span className="truncate flex-1">{sel ? (sel.label ?? sel) : placeholder}</span>
        <ChevronDown size={14} className="flex-shrink-0 text-gray-400 transition-transform" style={{ transform: open ? 'rotate(180deg)' : '' }} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 dark:border-white/12 bg-white dark:bg-[#1e1b16] shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {options.map(o => {
            const v = o.value ?? o; const l = o.label ?? o;
            return (
              <button key={v} type="button" onClick={() => { onChange(v); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/06">
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${v === value ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  {v === value && <Check size={10} color="#fff" strokeWidth={3} />}
                </span>
                {l}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── ItemList (allowances / deductions) ───────────────────────────────────────
export function ItemList({ items, onChange, type }) {
  const add = () => onChange([...items, type === 'deduction' ? { label: '', amount: 0, type: 'fixed' } : { label: '', amount: 0 }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, field, val) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: field === 'amount' ? Number(val) : val };
    onChange(copy);
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input placeholder="Label" value={item.label} onChange={e => update(i, 'label', e.target.value)}
            className={`${inputCls} flex-1`} />
          <input type="number" placeholder="Amount" value={item.amount} onChange={e => update(i, 'amount', e.target.value)}
            className={`${inputCls} w-28`} />
          {type === 'deduction' && (
            <select value={item.type} onChange={e => update(i, 'type', e.target.value)}
              className={`${inputCls} w-24`}>
              <option value="fixed">Fixed</option>
              <option value="percent">%</option>
            </select>
          )}
          <button type="button" onClick={() => remove(i)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors">
            <X size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add}
        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold mt-1">
        + Add {type === 'deduction' ? 'Deduction' : 'Allowance'}
      </button>
    </div>
  );
}

// ── EMPTY_FORM ────────────────────────────────────────────────────────────────
export const EMPTY_FORM = {
  employee: '', month: curMonth, year: curYear,
  baseSalary: 0, daysWorked: 26, workingDays: 26,
  allowances: [{ label: 'HRA', amount: 0 }],
  deductions: [
    { label: 'PF (Employee)', amount: 12, type: 'percent' },
    { label: 'Professional Tax', amount: 200, type: 'fixed' },
  ],
  paymentStatus: 'Pending', paymentMode: 'Bank Transfer', paymentDate: '', notes: '',
};

// ── PayrollFormModal ──────────────────────────────────────────────────────────
export function PayrollFormModal({ open, onClose, onSave, employees, editing }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        employee: editing.employee?._id || editing.employee,
        month: editing.month, year: editing.year,
        baseSalary: editing.baseSalary,
        daysWorked: editing.daysWorked, workingDays: editing.workingDays,
        allowances: editing.allowances || [],
        deductions: editing.deductions || [],
        paymentStatus: editing.paymentStatus,
        paymentMode: editing.paymentMode || 'Bank Transfer',
        paymentDate: editing.paymentDate ? editing.paymentDate.slice(0, 10) : '',
        notes: editing.notes || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editing, open]);

  const onEmpChange = (id) => {
    const emp = employees.find(e => e._id === id);
    setForm(f => ({ ...f, employee: id, baseSalary: emp?.salary || 0 }));
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // salary preview
  const ratio = form.workingDays > 0 ? form.daysWorked / form.workingDays : 1;
  const effectiveBase = form.baseSalary * ratio;
  const totalAllow = (form.allowances || []).reduce((s, a) => s + (Number(a.amount) || 0), 0);
  const gross = effectiveBase + totalAllow;
  const totalDed = (form.deductions || []).reduce((s, d) => {
    if (d.type === 'percent') return s + (gross * ((Number(d.amount) || 0) / 100));
    return s + (Number(d.amount) || 0);
  }, 0);
  const net = gross - totalDed;

  const handleSave = async () => {
    if (!form.employee) return toast.error('Select employee');
    if (!form.baseSalary) return toast.error('Enter base salary');
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const empOptions = employees.map(e => ({ value: e._id, label: `${e.name} (${e.role})` }));
  const monthOptions = MONTHS.map((m, i) => ({ value: i + 1, label: m }));
  const yearOptions = [curYear - 1, curYear, curYear + 1].map(y => ({ value: y, label: String(y) }));

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Payroll Record' : 'New Payroll Record'} size="lg">
      <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
        {/* Employee + Period */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className={labelCls}>Employee *</label>
            <CustomSelect value={form.employee} onChange={onEmpChange} options={empOptions} placeholder="Select employee…" />
          </div>
          <div>
            <label className={labelCls}>Month *</label>
            <CustomSelect value={form.month} onChange={v => set('month', v)} options={monthOptions} />
          </div>
          <div>
            <label className={labelCls}>Year *</label>
            <CustomSelect value={form.year} onChange={v => set('year', v)} options={yearOptions} />
          </div>
          <div>
            <label className={labelCls}>Base Salary (₹)</label>
            <input type="number" value={form.baseSalary} onChange={e => set('baseSalary', Number(e.target.value))} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Working Days</label>
            <input type="number" value={form.workingDays} onChange={e => set('workingDays', Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Days Worked</label>
            <input type="number" value={form.daysWorked} onChange={e => set('daysWorked', Number(e.target.value))} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Allowances</label>
          <ItemList items={form.allowances} onChange={v => set('allowances', v)} type="allowance" />
        </div>

        <div>
          <label className={labelCls}>Deductions</label>
          <ItemList items={form.deductions} onChange={v => set('deductions', v)} type="deduction" />
        </div>

        {/* Salary Preview */}
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/25 bg-indigo-50 dark:bg-indigo-500/08 p-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gross Salary</p>
            <p className="font-bold text-lg text-gray-900 dark:text-white">{fmt(Math.round(gross))}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Deductions</p>
            <p className="font-bold text-lg text-red-600 dark:text-red-400">{fmt(Math.round(totalDed))}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Salary</p>
            <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{fmt(Math.round(net))}</p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Payment Status</label>
            <CustomSelect value={form.paymentStatus} onChange={v => set('paymentStatus', v)}
              options={['Pending', 'Paid', 'On Hold'].map(s => ({ value: s, label: s }))} />
          </div>
          <div>
            <label className={labelCls}>Payment Mode</label>
            <CustomSelect value={form.paymentMode} onChange={v => set('paymentMode', v)}
              options={['Bank Transfer', 'Cash', 'Cheque', 'UPI'].map(s => ({ value: s, label: s }))} />
          </div>
          <div>
            <label className={labelCls}>Payment Date</label>
            <input type="date" value={form.paymentDate} onChange={e => set('paymentDate', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            rows={2} className={`${inputCls} resize-none`} placeholder="Optional notes…" />
        </div>
      </div>

      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-white/08">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/12 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/06 transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-500 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : (editing ? 'Update' : 'Create')}
        </button>
      </div>
    </Modal>
  );
}