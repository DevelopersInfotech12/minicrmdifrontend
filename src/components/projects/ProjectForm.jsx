'use client';
import { useState, useEffect } from 'react';
import { projectsApi, clientsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { RefreshCw, FolderKanban } from 'lucide-react';

const SERVICE_TYPES  = ["Website Development","App Development","SEO","Social Media Marketing","Google Ads","Meta Ads","Branding / Design","Content Writing","Other"];
const PRIORITY_TYPES = ["Urgent","Long-term","One-time","Retainer"];
const BILLING_CYCLES = ["Monthly","Quarterly","Half-yearly","Yearly"];

const PRIORITY_CFG = {
  "Urgent":    { emoji:'🔴', active:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.45)',   text:'#ef4444' },
  "Long-term": { emoji:'🔵', active:'rgba(96,165,250,0.12)',  border:'rgba(96,165,250,0.45)',  text:'#60a5fa' },
  "One-time":  { emoji:'⚪', active:'rgba(160,160,160,0.12)', border:'rgba(160,160,160,0.45)', text:'#6b7280' },
  "Retainer":  { emoji:'🟣', active:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.45)', text:'#a78bfa' },
};

const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2";
const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-[13px] font-medium bg-gray-50 dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/20 dark:focus:ring-yellow-500/20 transition-all";

function Field({ label, children, error }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1.5 font-medium">{error}</p>}
    </div>
  );
}

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
  const [clients,         setClients]         = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [errors,          setErrors]          = useState({});

  useEffect(() => {
    clientsApi.getAll({ limit: 100 }).then(r => setClients(r.data.data.clients)).catch(() => {});
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Title */}
      <Field label="Project Title *" error={errors.title}>
        <input
          autoFocus
          className={inputCls}
          placeholder="Website Redesign"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </Field>

      {/* Client */}
      <Field label="Client *" error={errors.client}>
        <select className={inputCls} value={clientId} onChange={e => setClientId(e.target.value)}>
          <option value="">Select a client…</option>
          {clients.map(c => (
            <option key={c._id} value={c._id}>
              {c.name}{c.company ? ` — ${c.company}` : ''}
            </option>
          ))}
        </select>
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
        <Field label="Service Type">
          <select className={inputCls} value={serviceType} onChange={e => setServiceType(e.target.value)}>
            <option value="">Select service…</option>
            {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className={inputCls} value={status} onChange={e => setStatus(e.target.value)}>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </Field>
      </div>

      {/* Priority chips */}
      <Field label="Priority / Type">
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
        <Field label="Start Date">
          <input type="date" className={inputCls} value={startDate} onChange={e => setStartDate(e.target.value)}/>
        </Field>
        <Field label="End Date">
          <input type="date" className={inputCls} value={endDate} onChange={e => setEndDate(e.target.value)}/>
        </Field>
      </div>

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
              <p className="text-[14px] font-semibold m-0" style={{ color: isRecurring ? 'var(--gold,#e8b84b)' : '#374151' }}>
                Recurring Payment
              </p>
              <p className="text-[11px] text-gray-400 m-0">For SEO, Ads, Social Media retainers</p>
            </div>
          </div>

          {/* Toggle pill */}
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

        {/* Recurring fields */}
        {isRecurring && (
          <div className="flex flex-col gap-3.5 mt-4 pt-4" style={{ borderTop:'1px solid rgba(232,184,75,0.2)' }}>
            <div className="grid grid-cols-2 gap-3.5">
              <Field label="Billing Cycle *" error={errors.billingCycle}>
                <select className={inputCls} value={billingCycle} onChange={e => setBillingCycle(e.target.value)}>
                  <option value="">Select cycle…</option>
                  {BILLING_CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
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

            <Field label="Next Billing Date">
              <input type="date" className={inputCls} value={nextBillingDate} onChange={e => setNextBillingDate(e.target.value)}/>
            </Field>

            {/* Summary pill */}
            {billingCycle && recurringAmount && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-[12px] font-semibold"
                style={{ background:'rgba(232,184,75,0.1)', border:'1.5px solid rgba(232,184,75,0.3)', color:'var(--gold,#e8b84b)' }}
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
          className="px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all bg-white dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20"
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
          {loading ? 'Saving…' : project ? 'Update Project' : 'Create Project'}
        </button>
      </div>

    </form>
  );
}