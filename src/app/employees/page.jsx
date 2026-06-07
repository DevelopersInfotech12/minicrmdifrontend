'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { employeesApi } from '@/lib/api';
import { Users, Plus, Search, Mail, Phone, Pencil, Trash2, ToggleLeft, Briefcase, Building2, DollarSign, ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';

const fmt = (n) => '₹' + Number(n||0).toLocaleString('en-IN');

const STATUS_CFG = {
  Active:    { cls:'bg-emerald-50 dark:bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30', dot:'bg-emerald-500' },
  Inactive:  { cls:'bg-gray-100 dark:bg-white/08 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/12', dot:'bg-gray-400' },
  'On Leave':{ cls:'bg-amber-50 dark:bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30', dot:'bg-amber-400' },
};

const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-[#1a1714] border border-gray-200 dark:border-white/12 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 dark:focus:border-[#e8b84b] focus:ring-2 focus:ring-indigo-500/20 transition-all";
const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#c8b896] mb-1.5";

// ── Custom Select ─────────────────────────────────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder = 'Select…' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => (o.value ?? o) === value);
  const displayLabel = selected ? (selected.label ?? selected) : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`${inputCls} flex items-center justify-between gap-2 text-left ${!displayLabel ? 'text-gray-400 dark:text-gray-600' : ''}`}
      >
        <span className="truncate flex-1">{displayLabel || placeholder}</span>
        <ChevronDown
          size={14}
          className="flex-shrink-0 text-gray-400 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1.5 w-full rounded-xl overflow-hidden shadow-lg"
          style={{
            border: '1.5px solid rgba(99,102,241,0.3)',
            background: 'var(--dropdown-bg, #fff)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          <style>{`:root { --dropdown-bg: #fff; } .dark { --dropdown-bg: #1a1714; }`}</style>
          <div className="py-1 max-h-52 overflow-y-auto">
            {options.map((opt) => {
              const val = opt.value ?? opt;
              const lbl = opt.label ?? opt;
              const isActive = val === value;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => { onChange(val); setOpen(false); }}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-[13px] font-medium text-left transition-colors hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                  style={{
                    background: isActive ? 'rgba(99,102,241,0.1)' : undefined,
                    color: isActive ? '#6366f1' : 'inherit',
                  }}
                >
                  <span className="truncate">{lbl}</span>
                  {isActive && <Check size={13} className="flex-shrink-0 text-indigo-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeeForm({ employee, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    name: employee?.name||'', email: employee?.email||'', phone: employee?.phone||'',
    role: employee?.role||'', department: employee?.department||'',
    employeeId: employee?.employeeId||'', joinDate: employee?.joinDate?.split('T')[0]||'',
    salary: employee?.salary||'', salaryType: employee?.salaryType||'Monthly',
    status: employee?.status||'Active', address: employee?.address||'',
    skills: employee?.skills?.join(', ')||'', notes: employee?.notes||'',
  });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name||!form.email||!form.role) return toast.error('Name, email and role are required');
    setLoading(true);
    try {
      const payload = { ...form, skills: form.skills ? form.skills.split(',').map(s=>s.trim()).filter(Boolean) : [] };
      if (employee) { await employeesApi.update(employee._id, payload); toast.success('Employee updated!'); }
      else          { await employeesApi.create(payload);               toast.success('Employee added!'); }
      onSuccess();
    } catch (err) { toast.error(err?.response?.data?.message||'Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Full Name *</label><input className={inputCls} placeholder="John Doe" value={form.name} onChange={e=>set('name',e.target.value)} /></div>
        <div><label className={labelCls}>Email *</label><input type="email" className={inputCls} placeholder="john@company.com" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Phone</label><input className={inputCls} placeholder="+91 98765 43210" value={form.phone} onChange={e=>set('phone',e.target.value)} /></div>
        <div><label className={labelCls}>Employee ID</label><input className={inputCls} placeholder="EMP-001" value={form.employeeId} onChange={e=>set('employeeId',e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Role / Designation *</label><input className={inputCls} placeholder="Senior Developer" value={form.role} onChange={e=>set('role',e.target.value)} /></div>
        <div><label className={labelCls}>Department</label><input className={inputCls} placeholder="Engineering" value={form.department} onChange={e=>set('department',e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Join Date</label><input type="date" className={inputCls} value={form.joinDate} onChange={e=>set('joinDate',e.target.value)} /></div>
        <div><label className={labelCls}>Salary (₹)</label><input type="number" className={inputCls} placeholder="50000" value={form.salary} onChange={e=>set('salary',e.target.value)} /></div>
        <div>
          <label className={labelCls}>Salary Type</label>
          <CustomSelect
            value={form.salaryType}
            onChange={v => set('salaryType', v)}
            options={['Monthly','Hourly','Contract']}
            placeholder="Select type…"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Status</label>
          <CustomSelect
            value={form.status}
            onChange={v => set('status', v)}
            options={['Active','Inactive','On Leave']}
            placeholder="Select status…"
          />
        </div>
        <div><label className={labelCls}>Skills (comma separated)</label><input className={inputCls} placeholder="React, Node.js, MongoDB" value={form.skills} onChange={e=>set('skills',e.target.value)} /></div>
      </div>
      <div><label className={labelCls}>Address</label><input className={inputCls} placeholder="City, State" value={form.address} onChange={e=>set('address',e.target.value)} /></div>
      <div><label className={labelCls}>Notes</label><textarea className={inputCls} rows={2} placeholder="Additional notes…" value={form.notes} onChange={e=>set('notes',e.target.value)} /></div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-white/08 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/12 cursor-pointer hover:border-indigo-400 transition-all">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-60 transition-all bg-indigo-500 dark:bg-[#e8b84b] text-white dark:text-black border-none">
          {loading ? 'Saving…' : employee ? 'Update' : 'Add Employee'}
        </button>
      </div>
    </form>
  );
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [editEmp,   setEditEmp]   = useState(null);
  const [deleteId,  setDeleteId]  = useState(null);
  const [deleting,  setDeleting]  = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeesApi.getAll({ search:search||undefined, status:filterStatus||undefined });
      setEmployees(res.data.data.employees);
      setTotal(res.data.data.total);
    } catch { toast.error('Failed to load employees'); }
    finally { setLoading(false); }
  }, [search, filterStatus]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleDelete = async () => {
    setDeleting(true);
    try { await employeesApi.delete(deleteId); toast.success('Employee removed'); setDeleteId(null); fetchEmployees(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const handleToggle = async (id) => {
    try { await employeesApi.toggleStatus(id); toast.success('Status updated'); fetchEmployees(); }
    catch { toast.error('Failed'); }
  };

  const active      = employees.filter(e=>e.status==='Active').length;
  const onLeave     = employees.filter(e=>e.status==='On Leave').length;
  const totalSalary = employees.filter(e=>e.status==='Active').reduce((s,e)=>s+e.salary,0);

  const statusFilterOptions = [
    { value: '', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'On Leave', label: 'On Leave' },
  ];

  return (
    <div>
      <PageHeader title="Employees" subtitle={`${total} team member${total!==1?'s':''}`}
        action={
          <button onClick={()=>{setEditEmp(null);setShowForm(true);}}
            className="bg-indigo-500 dark:bg-[#e8b84b] text-white dark:text-black inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all">
            <Plus size={15} strokeWidth={2.5}/> Add Employee
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        {[
          { label:'Total',         value:total,            color:'#6366f1', icon:Users },
          { label:'Active',        value:active,           color:'#10b981', icon:Users },
          { label:'On Leave',      value:onLeave,          color:'#f59e0b', icon:Users },
          { label:'Monthly Salary',value:fmt(totalSalary), color:'#e8b84b', icon:DollarSign },
        ].map(({label,value,color,icon:Icon})=>(
          <div key={label} className=" dark:bg-[#161410] border border-gray-200 dark:border-white/09 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
              style={{ background:`${color}15`, borderColor:`${color}25` }}>
              <Icon size={18} color={color}/>
            </div>
            <div>
              <p className="font-display font-extrabold text-xl text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-[#1a1714] border border-gray-200 dark:border-white/12 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="Search by name, email, role…" value={search} onChange={e=>setSearch(e.target.value)}
          />
        </div>
        <div className="w-40">
          <CustomSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={statusFilterOptions}
            placeholder="All Status"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-100 dark:bg-[#161410] border border-gray-200 dark:border-white/09 rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark">
        {loading ? <TableSkeleton rows={5}/> : employees.length===0 ? (
          <EmptyState icon={Users} title="No employees found" description="Add your first team member."
            action={
              <button onClick={()=>setShowForm(true)}
                className="bg-indigo-500 dark:bg-[#e8b84b] text-white dark:text-black inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer border-none">
                <Plus size={14}/> Add Employee
              </button>
            }
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#0f0e0c] border-b border-gray-300 dark:border-white/08">
                {['Employee','Contact','Role','Salary','Status','Actions'].map(h=>(
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 dark:text-white uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y bg-white dark:bg-[#161410] divide-gray-200 dark:divide-white/06">
              {employees.map(emp=>{
                const sc = STATUS_CFG[emp.status]||STATUS_CFG.Active;
                const initials = emp.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
                return (
                  <tr key={emp._id} className="hover:bg-gray-50 dark:hover:bg-[#1e1b16] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-sm text-white"
                          style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>{initials}</div>
                        <div>
                          <p className="text-[15px] font-bold text-gray-900 dark:text-white leading-none">{emp.name}</p>
                          {emp.employeeId && <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{emp.employeeId}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <a href={`mailto:${emp.email}`} className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 dark:text-gray-300 no-underline hover:text-indigo-500 transition-colors">
                          <Mail size={11} className="text-gray-400"/>{emp.email}
                        </a>
                        {emp.phone && <a href={`tel:${emp.phone}`} className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 dark:text-gray-300 no-underline hover:text-indigo-500 transition-colors">
                          <Phone size={11} className="text-gray-400"/>{emp.phone}
                        </a>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"><Briefcase size={11} className="text-gray-400"/>{emp.role}</p>
                      {emp.department && <p className="text-[12px] text-gray-400 mt-1 flex items-center gap-1.5"><Building2 size={10}/>{emp.department}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[14px] font-bold text-gray-900 dark:text-white">{emp.salary ? fmt(emp.salary) : '—'}</p>
                      {emp.salary>0 && <p className="text-[11px] text-gray-400 mt-0.5">{emp.salaryType}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sc.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}/>{emp.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={()=>{setEditEmp(emp);setShowForm(true);}}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/08 border border-gray-200 dark:border-white/12 text-gray-500 dark:text-gray-400 cursor-pointer hover:border-indigo-400 hover:text-indigo-500 transition-all">
                          <Pencil size={13}/>
                        </button>
                        <button onClick={()=>handleToggle(emp._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/08 border border-gray-200 dark:border-white/12 text-gray-500 dark:text-gray-400 cursor-pointer hover:border-indigo-400 hover:text-indigo-500 transition-all">
                          <ToggleLeft size={13}/>
                        </button>
                        <button onClick={()=>setDeleteId(emp._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/08 border border-gray-200 dark:border-white/12 text-red-400 cursor-pointer hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showForm} onClose={()=>{setShowForm(false);setEditEmp(null);}} title={editEmp?'Edit Employee':'Add Employee'} size="lg">
        <EmployeeForm employee={editEmp} onSuccess={()=>{setShowForm(false);setEditEmp(null);fetchEmployees();}} onCancel={()=>{setShowForm(false);setEditEmp(null);}}/>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Remove Employee" message="Remove this employee permanently?"/>
    </div>
  );
}