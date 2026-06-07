'use client';
import { useState, useEffect, useRef } from 'react';
import { projectsApi, clientsApi, employeesApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { RefreshCw, FolderKanban, UserCheck, ChevronDown, Check } from 'lucide-react';

const SERVICE_TYPES  = ["Website Development","App Development","SEO","Social Media Marketing","Google Ads","Meta Ads","Branding / Design","Content Writing","Other"];
const PRIORITY_TYPES = ["Urgent","Long-term","One-time","Retainer"];
const BILLING_CYCLES = ["Monthly","Quarterly","Half-yearly","Yearly"];
const STATUS_TYPES   = ["Active","Completed","On Hold"];

const PRIORITY_CFG = {
  "Urgent":    { emoji:'🔴', active:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.45)',   text:'#ef4444' },
  "Long-term": { emoji:'🔵', active:'rgba(96,165,250,0.12)',  border:'rgba(96,165,250,0.45)',  text:'#60a5fa' },
  "One-time":  { emoji:'⚪', active:'rgba(160,160,160,0.12)', border:'rgba(160,160,160,0.45)', text:'#6b7280' },
  "Retainer":  { emoji:'🟣', active:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.45)', text:'#a78bfa' },
};

const poppins = "'Poppins', 'system-ui', sans-serif";
const labelCls = "block text-[13px] text-gray-500 dark:text-gray-300 mb-1.5";
const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-[13px] font-medium bg-gray-50 dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] text-gray-500 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/20 dark:focus:ring-yellow-500/20 transition-all";

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
function CustomSelect({ value, onChange, options, placeholder = 'Select…', icon: Icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => (o.value ?? o) === value);
  const displayLabel = selected ? (selected.label ?? selected) : null;

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`${inputCls} flex items-center justify-between gap-2 text-left ${!displayLabel ? 'text-gray-400 dark:text-gray-600' : ''}`}
        style={{ paddingLeft: Icon ? '2.25rem' : undefined }}
      >
        {Icon && <Icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
        <span className="truncate flex-1">{displayLabel || placeholder}</span>
        <ChevronDown
          size={14}
          className="flex-shrink-0 text-gray-400 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Dropdown list */}
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
              const val = opt.value ?? opt;
              const lbl = opt.label ?? opt;
              const isActive = val === value;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => { onChange(val); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-[13px] font-medium text-left transition-colors hover:bg-gray-200 ${isActive ? '' : 'hover:bg-[rgb(5, 4, 0)]'}`}
                  style={{
                    background: isActive ? 'rgba(232,184,75,0.1)' : undefined,
                    color: isActive ? 'var(--gold, #e8b84b)' : 'inherit',
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
export default function ProjectForm({ project, defaultClientId, onSuccess, onCancel }) {
  const [title,           setTitle]           = useState(project?.title || '');
  const [description,     setDescription]     = useState(project?.description || '');
  const [clientId,        setClientId]        = useState(project?.client?._id || project?.client || defaultClientId || '');
  const [status,          setStatus]          = useState(project?.status || 'Active');
  const [serviceType,     setServiceType]     = useState(project?.serviceType || '');
  const [priority,        setPriority]        = useState(project?.priority || '');
  const [startDate,       setStartDate]       = useState(project?.startDate ? project.startDate.substring(0,10) : '');
  const [endDate,         setEndDate]         = useState(project?.endDate   ? project.endDate.substring(0,10)   : '');
  const [isRecurring,     setIsRecurring]     = useState(project?.isRecurring || false);
  const [billingCycle,    setBillingCycle]    = useState(project?.billingCycle || '');
  const [recurringAmount, setRecurringAmount] = useState(project?.recurringAmount || '');
  const [nextBillingDate, setNextBillingDate] = useState(project?.nextBillingDate ? project.nextBillingDate.substring(0,10) : '');
  const [budget,          setBudget]          = useState(project?.budget ?? '');
  const [assignedTo,      setAssignedTo]      = useState(project?.assignedTo?._id || project?.assignedTo || '');
  const [clients,         setClients]         = useState([]);
  const [employees,       setEmployees]       = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [errors,          setErrors]          = useState({});

  useEffect(() => {
    clientsApi.getAll({ limit: 100 }).then(r => setClients(r.data.data.clients)).catch(() => {});
    employeesApi.getAll({ limit: 100 }).then(r => setEmployees(r.data.data?.employees || [])).catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!clientId)     e.client = 'Client is required';
    if (isRecurring && !billingCycle)    e.billingCycle = 'Billing cycle required';
    if (isRecurring && !recurringAmount) e.recurringAmount = 'Amount required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = {
        title, description, client: clientId, status,
        serviceType: serviceType || undefined,
        priority:    priority    || undefined,
        startDate:   startDate   || undefined,
        endDate:     endDate     || undefined,
        budget:      budget !== '' ? Number(budget) : null,
        assignedTo:  assignedTo  || null,
        isRecurring,
        billingCycle:    isRecurring ? billingCycle            : undefined,
        recurringAmount: isRecurring ? Number(recurringAmount) : undefined,
        nextBillingDate: isRecurring && nextBillingDate ? nextBillingDate : undefined,
      };
      if (project) { await projectsApi.update(project._id, payload); toast.success('Project updated!'); }
      else         { await projectsApi.create(payload);               toast.success('Project created!'); }
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const clientOptions   = clients.map(c => ({ value: c._id, label: c.name + (c.company ? ` — ${c.company}` : '') }));
  const employeeOptions = [{ value: '', label: 'Unassigned' }, ...employees.map(e => ({ value: e._id, label: e.name + (e.role ? ` — ${e.role}` : '') }))];
  const serviceOptions  = SERVICE_TYPES.map(s => ({ value: s, label: s }));
  const statusOptions   = STATUS_TYPES.map(s => ({ value: s, label: s }));
  const billingOptions  = BILLING_CYCLES.map(c => ({ value: c, label: c }));

  return (
    <>
      <style>{`
        :root { --dropdown-bg: #fff; }
        .dark { --dropdown-bg: #1e1b16; }
      `}</style>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Title */}
        <Field label="Project title *" error={errors.title}>
          <input
            autoFocus
            className={inputCls}
            placeholder="Enter project name"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </Field>

        {/* Client */}
        <Field label="Client *" error={errors.client}>
          <CustomSelect
            value={clientId}
            onChange={setClientId}
            options={clientOptions}
            placeholder="Select a client…"
          />
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea
            className={`${inputCls} resize-none leading-relaxed`}
            rows={3}
            placeholder="Brief project description…"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </Field>

        {/* Service + Status */}
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Service type">
            <CustomSelect
              value={serviceType}
              onChange={setServiceType}
              options={serviceOptions}
              placeholder="Select service…"
            />
          </Field>
          <Field label="Status">
            <CustomSelect
              value={status}
              onChange={setStatus}
              options={statusOptions}
              placeholder="Select status…"
            />
          </Field>
        </div>

        {/* Priority chips */}
        <Field label="Priority / type">
          <div className="flex flex-wrap gap-2 mt-0.5">
            {PRIORITY_TYPES.map(p => {
              const cfg = PRIORITY_CFG[p];
              const isActive = priority === p;
              return (
                <button
                  key={p} type="button"
                  onClick={() => setPriority(isActive ? '' : p)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer transition-all"
                  style={{
                    border: `1.5px solid ${isActive ? cfg.border : 'rgb(209,213,219)'}`,
                    background: isActive ? cfg.active : 'transparent',
                    color: isActive ? cfg.text : '#6b7280',
                    boxShadow: isActive ? `0 0 0 2px ${cfg.border}33` : 'none',
                  }}
                >
                  {cfg.emoji} {p}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Start date">
            <input type="date" className={inputCls} value={startDate} onChange={e => setStartDate(e.target.value)}/>
          </Field>
          <Field label="End date">
            <input type="date" className={inputCls} value={endDate} onChange={e => setEndDate(e.target.value)}/>
          </Field>
        </div>

        {/* Assigned To + Budget */}
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Assigned to">
            <CustomSelect
              value={assignedTo}
              onChange={setAssignedTo}
              options={employeeOptions}
              placeholder="Unassigned"
              icon={UserCheck}
            />
          </Field>

          <Field label="Project budget (₹)">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[13px] font-semibold pointer-events-none">₹</span>
              <input
                type="number"
                min="0"
                className={`${inputCls} pl-7`}
                placeholder="e.g. 50000"
                value={budget}
                onChange={e => setBudget(e.target.value)}
              />
            </div>
          </Field>
        </div>

        {budget !== '' && Number(budget) > 0 && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 -mt-2 font-semibold">
            💰 ₹{Number(budget).toLocaleString('en-IN')} total project budget
          </p>
        )}

        {/* Recurring toggle box */}
        <div
          className="rounded-2xl p-4 transition-all"
          style={{
            border: `1.5px solid ${isRecurring ? 'rgba(232,184,75,0.35)' : 'rgb(209,213,219)'}`,
            background: isRecurring ? 'rgba(232,184,75,0.06)' : 'transparent',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: isRecurring ? 'rgba(232,184,75,0.15)' : 'rgb(243,244,246)',
                  border: `1.5px solid ${isRecurring ? 'rgba(232,184,75,0.35)' : 'rgb(229,231,235)'}`,
                }}
              >
                <RefreshCw size={14} color={isRecurring ? 'var(--gold,#e8b84b)' : '#9ca3af'}/>
              </div>
              <div>
                <p className="text-[14px] font-semibold m-0" style={{ color: isRecurring ? 'var(--gold,#e8b84b)' : '#374151', fontFamily: poppins }}>
                  Recurring payment
                </p>
                <p className="text-[11px] text-gray-400 m-0" style={{ fontFamily: poppins }}>For SEO, Ads, Social Media retainers</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsRecurring(r => !r)}
              className="flex-shrink-0 relative cursor-pointer border-none transition-all"
              style={{ width:44, height:24, borderRadius:99, background: isRecurring ? 'var(--gold,#e8b84b)' : '#d1d5db' }}
            >
              <div style={{
                position:'absolute', top:4,
                left: isRecurring ? 24 : 4,
                width:16, height:16, borderRadius:'50%',
                background:'#fff', transition:'left 0.2s ease',
                boxShadow:'0 1px 4px rgba(0,0,0,0.25)',
              }}/>
            </button>
          </div>

          {isRecurring && (
            <div className="flex flex-col gap-3.5 mt-4 pt-4" style={{ borderTop:'1px solid rgba(232,184,75,0.2)' }}>
              <div className="grid grid-cols-2 gap-3.5">
                <Field label="Billing cycle *" error={errors.billingCycle}>
                  <CustomSelect
                    value={billingCycle}
                    onChange={setBillingCycle}
                    options={billingOptions}
                    placeholder="Select cycle…"
                  />
                </Field>
                <Field label="Amount per cycle (₹) *" error={errors.recurringAmount}>
                  <input
                    type="number"
                    className={inputCls}
                    placeholder="15000"
                    value={recurringAmount}
                    onChange={e => setRecurringAmount(e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Next billing date">
                <input type="date" className={inputCls} value={nextBillingDate} onChange={e => setNextBillingDate(e.target.value)}/>
              </Field>

              {billingCycle && recurringAmount && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-[12px] font-semibold"
                  style={{ background:'rgba(232,184,75,0.1)', border:'1.5px solid rgba(232,184,75,0.3)', color:'var(--gold,#e8b84b)', fontFamily: poppins }}
                >
                  💡 ₹{Number(recurringAmount).toLocaleString('en-IN')} every {billingCycle.toLowerCase()}
                  {billingCycle === 'Monthly'     && ` = ₹${Number(recurringAmount).toLocaleString('en-IN')}/mo`}
                  {billingCycle === 'Quarterly'   && ` ≈ ₹${Math.round(recurringAmount/3).toLocaleString('en-IN')}/mo`}
                  {billingCycle === 'Half-yearly' && ` ≈ ₹${Math.round(recurringAmount/6).toLocaleString('en-IN')}/mo`}
                  {billingCycle === 'Yearly'      && ` ≈ ₹${Math.round(recurringAmount/12).toLocaleString('en-IN')}/mo`}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
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
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--gold,#e8b84b)',
              color: '#0a0a0a',
              border: '1.5px solid rgba(232,184,75,0.6)',
              boxShadow: '0 2px 8px rgba(232,184,75,0.25)',
            }}
          >
            <FolderKanban size={13}/>
            {loading ? 'Saving…' : project ? 'Update project' : 'Create project'}
          </button>
        </div>

      </form>
    </>
  );
}