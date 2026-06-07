'use client';
import { useEffect, useState, useCallback } from 'react';
import { payrollApi, employeesApi } from '@/lib/api';
import {
  Banknote, Plus, Search, CheckCircle2, Clock, PauseCircle,
  Users, DollarSign, Zap, X, Pencil, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import {
  PayrollFormModal, CustomSelect,
  MONTHS, fmt, curYear, curMonth, inputCls, labelCls,
} from '@/components/Payroll/PayrollForm';

const STATUS_CFG = {
  Pending: { cls: 'bg-amber-50 dark:bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30', dot: 'bg-amber-400', icon: Clock },
  Paid: { cls: 'bg-emerald-50 dark:bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30', dot: 'bg-emerald-500', icon: CheckCircle2 },
  'On Hold': { cls: 'bg-red-50 dark:bg-red-500/12 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30', dot: 'bg-red-400', icon: PauseCircle },
};

// ── Bulk Modal ────────────────────────────────────────────────────────────────
function BulkModal({ open, onClose, onGenerate }) {
  const [month, setMonth] = useState(curMonth);
  const [year, setYear] = useState(curYear);
  const [loading, setLoading] = useState(false);
  const monthOptions = MONTHS.map((m, i) => ({ value: i + 1, label: m }));
  const yearOptions = [curYear - 1, curYear, curYear + 1].map(y => ({ value: y, label: String(y) }));
  const handle = async () => {
    setLoading(true);
    try { await onGenerate({ month, year }); onClose(); } catch { } finally { setLoading(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Bulk Generate Payroll" size="sm">
      <div className="p-6 space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Generate payroll for <strong>all active employees</strong> using their base salary. Existing records will be skipped.</p>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Month</label><CustomSelect value={month} onChange={setMonth} options={monthOptions} /></div>
          <div><label className={labelCls}>Year</label><CustomSelect value={year} onChange={setYear} options={yearOptions} /></div>
        </div>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-white/08">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/12 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/06 transition-colors">Cancel</button>
        <button onClick={handle} disabled={loading} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50">
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>
    </Modal>
  );
}

// ── Mark Paid Modal ───────────────────────────────────────────────────────────
function MarkPaidModal({ open, onClose, record, onPaid }) {
  const [mode, setMode] = useState('Bank Transfer');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const modeOpts = ['Bank Transfer', 'Cash', 'Cheque', 'UPI'].map(s => ({ value: s, label: s }));
  const handle = async () => {
    setSaving(true);
    try { await onPaid(record._id, { paymentMode: mode, paymentDate: date }); onClose(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Mark as Paid" size="sm">
      <div className="p-6 space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Record payment for <strong>{record?.employee?.name}</strong> — Net: <strong className="text-emerald-600">{fmt(record?.netSalary)}</strong></p>
        <div><label className={labelCls}>Payment Mode</label><CustomSelect value={mode} onChange={setMode} options={modeOpts} /></div>
        <div><label className={labelCls}>Payment Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} /></div>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-white/08">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/12 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/06 transition-colors">Cancel</button>
        <button onClick={handle} disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : 'Confirm Payment'}
        </button>
      </div>
    </Modal>
  );
}

// ── Payslip Modal ─────────────────────────────────────────────────────────────
function PayslipModal({ open, onClose, record }) {
  if (!record) return null;
  const emp = record.employee || {};
  return (
    <Modal open={open} onClose={onClose} title="Payslip" size="md">
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-white/08">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {emp.name?.[0] || '?'}
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-lg">{emp.name}</p>
            <p className="text-sm text-gray-500">{emp.role} · {emp.department}</p>
            <p className="text-xs text-gray-400">ID: {emp.employeeId || 'N/A'}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-500">Pay Period</p>
            <p className="font-bold text-gray-900 dark:text-white">{MONTHS[record.month - 1]} {record.year}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Earnings</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Base Salary</span><span className="font-medium">{fmt(record.baseSalary)}</span></div>
              {(record.allowances || []).map((a, i) => (
                <div key={i} className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">{a.label}</span><span className="font-medium">{fmt(a.amount)}</span></div>
              ))}
              <div className="flex justify-between text-sm font-bold border-t border-gray-200 dark:border-white/10 pt-1.5 mt-1.5">
                <span>Gross</span><span className="text-indigo-600 dark:text-indigo-400">{fmt(record.grossSalary)}</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Deductions</p>
            <div className="space-y-1.5">
              {(record.deductions || []).map((d, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{d.label}{d.type === 'percent' ? ` (${d.amount}%)` : ''}</span>
                  <span className="font-medium text-red-600 dark:text-red-400">-{d.type === 'percent' ? fmt(Math.round(record.grossSalary * d.amount / 100)) : fmt(d.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold border-t border-gray-200 dark:border-white/10 pt-1.5 mt-1.5">
                <span>Total</span><span className="text-red-600 dark:text-red-400">-{fmt(record.totalDeductions)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 p-4 flex justify-between items-center">
          <span className="font-bold text-emerald-800 dark:text-emerald-300 text-lg">Net Pay</span>
          <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-2xl">{fmt(record.netSalary)}</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          {[
            { label: 'Days Worked', value: `${record.daysWorked}/${record.workingDays}` },
            { label: 'Payment Mode', value: record.paymentMode || '—' },
            { label: 'Status', value: record.paymentStatus, colored: true },
          ].map(({ label, value, colored }) => (
            <div key={label} className="rounded-xl bg-gray-50 dark:bg-white/04 p-3">
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className={`font-bold ${colored ? (value === 'Paid' ? 'text-emerald-600 dark:text-emerald-400' : value === 'On Hold' ? 'text-red-500' : 'text-amber-600 dark:text-amber-400') : 'text-gray-900 dark:text-white'}`}>{value}</p>
            </div>
          ))}
        </div>
        {record.notes && <p className="text-xs text-gray-400 italic">Note: {record.notes}</p>}
      </div>
    </Modal>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ payrolls }) {
  const paid = payrolls.filter(p => p.paymentStatus === 'Paid');
  const paidNet = paid.reduce((s, p) => s + (p.netSalary || 0), 0);
  const totalNet = payrolls.reduce((s, p) => s + (p.netSalary || 0), 0);
  const cards = [
    { label: 'Total Records', value: payrolls.length, icon: Users, color: 'indigo' },
    { label: 'Total Payroll', value: fmt(totalNet), icon: DollarSign, color: 'purple' },
    { label: 'Paid', value: `${paid.length} · ${fmt(paidNet)}`, icon: CheckCircle2, color: 'emerald' },
    { label: 'Pending', value: payrolls.filter(p => p.paymentStatus === 'Pending').length, icon: Clock, color: 'amber' },
  ];
  const colMap = {
    indigo: 'bg-indigo-50 dark:bg-indigo-500/12 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-purple-50 dark:bg-purple-500/12 text-purple-600 dark:text-purple-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-500/12 text-amber-600 dark:text-amber-400',
  };
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map(c => (
        <div key={c.label} className="bg-white dark:bg-[#161410] border border-gray-200 dark:border-white/08 rounded-2xl p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colMap[c.color]}`}><c.icon size={18} /></div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{c.label}</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState(curMonth);
  const [filterYear, setFilterYear] = useState(curYear);
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [markingPaid, setMarkingPaid] = useState(null);
  const [viewSlip, setViewSlip] = useState(null);
  const [apiError, setApiError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const em = await employeesApi.getAll({}); setEmployees(em.data.data.employees || []); } catch { }
    try {
      const params = { month: filterMonth, year: filterYear };
      if (filterStatus) params.status = filterStatus;
      const pr = await payrollApi.getAll(params);
      setPayrolls(pr.data.data.payrolls || []);
      setApiError(null);
    } catch (e) {
      setApiError(e);
      const s = e.response?.status;
      if (s === 404) toast.error('Payroll API not found (404)');
      else if (s === 401) toast.error('Not authenticated');
      else if (!s) toast.error('Cannot reach backend');
      else toast.error(`Error ${s}: ${e.response?.data?.message || 'Failed'}`);
      setPayrolls([]);
    } finally { setLoading(false); }
  }, [filterMonth, filterYear, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form) => {
    if (editing) {
      const res = await payrollApi.update(editing._id, form);
      toast.success('Updated');
      setPayrolls(p => p.map(x => x._id === editing._id ? res.data.data.payroll : x));
    } else {
      const res = await payrollApi.create(form);
      toast.success('Created');
      setPayrolls(p => [res.data.data.payroll, ...p]);
    }
    setEditing(null);
  };

  const handleBulk = async (data) => {
    const res = await payrollApi.bulkGenerate(data);
    const r = res.data.data.results;
    toast.success(`${r.created} created, ${r.skipped} skipped`);
    load();
  };

  const handleDelete = async () => {
    await payrollApi.delete(deleting._id);
    toast.success('Deleted');
    setPayrolls(p => p.filter(x => x._id !== deleting._id));
    setDeleting(null);
  };

  const handleMarkPaid = async (id, data) => {
    const res = await payrollApi.markAsPaid(id, data);
    toast.success('Marked as paid');
    setPayrolls(p => p.map(x => x._id === id ? res.data.data.payroll : x));
  };

  const filtered = payrolls.filter(p => {
    if (!search) return true;
    const name = p.employee?.name?.toLowerCase() || '';
    const dept = p.employee?.department?.toLowerCase() || '';
    return name.includes(search.toLowerCase()) || dept.includes(search.toLowerCase());
  });

  const monthOptions = MONTHS.map((m, i) => ({ value: i + 1, label: m }));
  const yearOptions = [curYear - 2, curYear - 1, curYear, curYear + 1].map(y => ({ value: y, label: String(y) }));
  const statusOptions = [{ value: '', label: 'All Statuses' }, ...['Pending', 'Paid', 'On Hold'].map(s => ({ value: s, label: s }))];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <PageHeader title="Payroll" subtitle="Manage employee salaries, deductions & payslips" />
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-500 hover:bg-indigo-700 text-white transition-colors shadow-lg shadow-indigo-500/25 shrink-0">
          <Plus size={16} /> Add Record
        </button>
      </div>

      {/* Filters — FIX 1: wrapper is relative so Search icon positions correctly */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-[#1a1714] border border-gray-200 dark:border-white/12 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 dark:focus:border-[#e8b84b] focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <div className="w-32"><CustomSelect value={filterMonth} onChange={setFilterMonth} options={monthOptions} /></div>
        <div className="w-28"><CustomSelect value={filterYear} onChange={setFilterYear} options={yearOptions} /></div>
        <div className="w-36"><CustomSelect value={filterStatus} onChange={setFilterStatus} options={statusOptions} /></div>
        <button onClick={() => { setEditing(null); setShowBulk(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/12 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/06 transition-colors">
          <Zap size={14} /> Bulk Generate
        </button>
      </div>

      {/* API Error */}
      {apiError && (
        <div className="mb-5 rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/08 p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <X size={16} className="text-red-500" />
          </div>
          <div>
            <p className="font-bold text-red-700 dark:text-red-400 text-sm">
              {apiError.response?.status === 404 ? 'Payroll route not found (404) — backend needs restart'
                : apiError.response?.status === 401 ? 'Not authenticated — please log in again'
                  : !apiError.response?.status ? 'Cannot reach backend server — is it running?'
                    : `Backend error ${apiError.response?.status}`}
            </p>
            <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">{apiError.message}</p>
          </div>
        </div>
      )}

      {!loading && payrolls.length > 0 && <StatsBar payrolls={filtered} />}

      {/* Table */}
      {loading ? <TableSkeleton /> : filtered.length === 0 ? (
        <EmptyState
          icon={<Banknote size={32} className="text-gray-400" />}
          title="No payroll records"
          description={`No records for ${MONTHS[filterMonth - 1]} ${filterYear}. Add one or use bulk generate.`}
        />
      ) : (
        <div className="bg-white dark:bg-[#161410] border border-gray-200 dark:border-white/08 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#1e1b16] border-b border-gray-200 dark:border-white/[0.09]">
                  {['Employee', 'Period', 'Base Salary', 'Gross', 'Deductions', 'Net Pay', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-50 dark:bg-[#161410] divide-y divide-gray-100 dark:divide-white/[0.06]">
                {filtered.map(p => {
                  const emp = p.employee || {};
                  const scfg = STATUS_CFG[p.paymentStatus] || STATUS_CFG.Pending;
                  return (
                    // FIX 2: use CSS :hover via style tag approach → use onMouseEnter/Leave state, OR
                    // keep group but add [&:hover_button]:opacity-100 on tr — simpler: just show actions always
                    // BEST FIX: use Tailwind group on <tr> + target with group-hover (requires Tailwind JIT)
                    // wrap actions in a named group to ensure it works
                    <tr key={p._id} className="hover:bg-white dark:hover:bg-white/[0.03] transition-colors" style={{ '--show': 0 }}>
                      {/* FIX 3: Employee — remove avatar, just show initials badge inline, no extra left pad */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {/* small initials badge — compact, no large gap */}
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500 text-white font-bold text-xs flex-shrink-0">
                            {emp.name?.[0]?.toUpperCase() || '?'}
                          </span>
                          <div className="min-w-0">
                            <button
                              onClick={() => setViewSlip(p)}
                              className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left leading-tight block"
                            >
                              {emp.name || 'Unknown'}
                            </button>
                            <p className="text-xs text-gray-500 truncate">{emp.role}{emp.department ? ` · ${emp.department}` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 whitespace-nowrap font-medium">{MONTHS[p.month - 1]} {p.year}</td>
                      <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300">{fmt(p.baseSalary)}</td>
                      <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300">{fmt(p.grossSalary)}</td>
                      <td className="px-4 py-3.5 text-red-600 dark:text-red-400">-{fmt(p.totalDeductions)}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">{fmt(p.netSalary)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${scfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${scfg.dot}`} />
                          {p.paymentStatus}
                        </span>
                      </td>
                      {/* FIX 2: Actions always visible (no opacity trick that breaks on tr) */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          {p.paymentStatus !== 'Paid' && (
                            <button
                              onClick={() => setMarkingPaid(p)}
                              title="Mark Paid"
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => { setEditing(p); setShowForm(true); }}
                            title="Edit"
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleting(p)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <PayrollFormModal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }}
        onSave={handleSave} employees={employees} editing={editing} />
      <BulkModal open={showBulk} onClose={() => setShowBulk(false)} onGenerate={handleBulk} />
      {markingPaid && <MarkPaidModal open={!!markingPaid} onClose={() => setMarkingPaid(null)} record={markingPaid} onPaid={handleMarkPaid} />}
      {viewSlip && <PayslipModal open={!!viewSlip} onClose={() => setViewSlip(null)} record={viewSlip} />}
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete}
        title="Delete Payroll Record"
        message={`Delete payroll for ${deleting?.employee?.name} (${deleting ? MONTHS[deleting.month - 1] : ''} ${deleting?.year})?`} />
    </div>
  );
}