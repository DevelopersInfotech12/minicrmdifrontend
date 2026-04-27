'use client';
import { useState } from 'react';
import { leadsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

const STAGES   = ["New","Called","Meeting Done","Proposal Sent","Converted","Lost"];
const SOURCES  = ["LinkedIn","Instagram","Facebook","Referral","Google Ads","Walk-in","Cold Call","Website Form","WhatsApp"];
const SERVICES = ["Website Development","App Development","SEO","Social Media Marketing","Google Ads","Meta Ads","Branding / Design","Content Writing","Other"];

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

export default function LeadForm({ lead, onSuccess, onCancel }) {
  const [name,          setName]          = useState(lead?.name          || '');
  const [phone,         setPhone]         = useState(lead?.phone         || '');
  const [email,         setEmail]         = useState(lead?.email         || '');
  const [referenceName, setReferenceName] = useState(lead?.referenceName || '');
  const [source,        setSource]        = useState(lead?.source        || '');
  const [services,      setServices]      = useState(lead?.services      || []);
  const [stage,         setStage]         = useState(lead?.stage         || 'New');
  const [budget,        setBudget]        = useState(lead?.budget        || '');
  const [followUpDate,  setFollowUpDate]  = useState(lead?.followUpDate ? lead.followUpDate.substring(0,10) : '');
  const [notes,         setNotes]         = useState(lead?.notes         || '');
  const [loading,       setLoading]       = useState(false);

  const toggleService = (s) =>
    setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim())  return toast.error('Name is required');
    if (!phone.trim()) return toast.error('Phone is required');
    if (!source)       return toast.error('Source is required');
    setLoading(true);
    try {
      const payload = {
        name, phone, email, referenceName, source, services, stage, notes,
        budget:      budget      ? Number(budget) : undefined,
        followUpDate: followUpDate || undefined,
      };
      if (lead) { await leadsApi.update(lead._id, payload); toast.success('Lead updated!'); }
      else      { await leadsApi.create(payload);            toast.success('Lead created!'); }
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Name & Phone */}
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="Full Name *">
          <input autoFocus className={inputCls} placeholder="Enter full name" value={name} onChange={e => setName(e.target.value)}/>
        </Field>
        <Field label="Phone *">
          <input className={inputCls} placeholder="Enter phone number" value={phone} onChange={e => setPhone(e.target.value)}/>
        </Field>
      </div>

      {/* Email & Reference */}
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="Email">
          <input type="email" className={inputCls} placeholder="Enter email address" value={email} onChange={e => setEmail(e.target.value)}/>
        </Field>
        <Field label="Reference / Company">
          <input className={inputCls} placeholder="Enter reference or company name" value={referenceName} onChange={e => setReferenceName(e.target.value)}/>
        </Field>
      </div>

      {/* Source & Stage */}
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="Source *">
          <select className={inputCls} value={source} onChange={e => setSource(e.target.value)}>
            <option value="">Select source…</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Stage">
          <select className={inputCls} value={stage} onChange={e => setStage(e.target.value)}>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      {/* Services chips */}
      <Field label="Services Interested In">
        <div className="flex flex-wrap gap-2 mt-0.5">
          {SERVICES.map(s => {
            const active = services.includes(s);
            return (
              <button
                key={s} type="button"
                onClick={() => toggleService(s)}
                className="px-3 py-1.5 rounded-xl text-[12px] font-semibold cursor-pointer transition-all"
                style={{
                  border: `1.5px solid ${active ? 'rgba(232,184,75,0.55)' : 'rgb(209,213,219)'}`,
                  background: active ? 'rgba(232,184,75,0.12)' : 'transparent',
                  color: active ? 'var(--gold,#e8b84b)' : '#6b7280',
                  boxShadow: active ? '0 0 0 2px rgba(232,184,75,0.15)' : 'none',
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Field>

      {/* Budget & Follow-up */}
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="Budget (₹)">
          <input type="number" min="0" className={inputCls} placeholder="Enter budget in INR" value={budget} onChange={e => setBudget(e.target.value)}/>
        </Field>
        <Field label="Follow-up Date">
          <input type="date" className={`${inputCls} dark:[color-scheme:dark]`} value={followUpDate} onChange={e => setFollowUpDate(e.target.value)}/>
        </Field>
      </div>

      {/* Notes */}
      <Field label="Notes">
        <textarea
          className={`${inputCls} resize-none leading-relaxed`}
          rows={3}
          placeholder="Any initial notes about this lead…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </Field>

      {/* Buttons */}
      <div className="flex gap-2.5 justify-end pt-1 border-t border-gray-100 dark:border-white/[0.06]">
        <button
          type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all bg-white dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20"
        >
          Cancel
        </button>
        <button
          type="submit" disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background:'var(--gold,#e8b84b)', color:'#0a0a0a', border:'1.5px solid rgba(232,184,75,0.6)', boxShadow:'0 2px 8px rgba(232,184,75,0.25)' }}
        >
          <UserPlus size={13}/>
          {loading ? 'Saving…' : lead ? 'Update Lead' : 'Create Lead'}
        </button>
      </div>

    </form>
  );
}