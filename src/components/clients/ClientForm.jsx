'use client';
import { useState } from 'react';
import { clientsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';

const poppins = "'Poppins', 'system-ui', sans-serif";

const labelCls = "block text-[13px] text-gray-500 dark:text-gray-300 mb-1.5";
const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-[13px] font-medium bg-gray-50 dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] text-gray-500 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/20 dark:focus:ring-yellow-500/20 transition-all";

function Field({ label, error, children }) {
  return (
    <div>
      <label className={labelCls} style={{ fontFamily: poppins }}>{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1.5 font-medium">{error}</p>}
    </div>
  );
}

export default function ClientForm({ client, onSuccess, onCancel }) {
  const [name,    setName]    = useState(client?.name    || '');
  const [email,   setEmail]   = useState(client?.email   || '');
  const [phone,   setPhone]   = useState(client?.phone   || '');
  const [company, setCompany] = useState(client?.company || '');
  const [address, setAddress] = useState(client?.address || '');
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim())  e.name  = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (!phone.trim()) e.phone = 'Phone is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (client) { await clientsApi.update(client._id, { name, email, phone, company, address }); toast.success('Client updated!'); }
      else        { await clientsApi.create({ name, email, phone, company, address });              toast.success('Client created!'); }
      onSuccess();
    } catch (err) { toast.error(err?.response?.data?.message || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Name & Phone */}
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="Name *" error={errors.name}>
          <input
            autoFocus
            className={inputCls}
            placeholder="Enter client name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </Field>
        <Field label="Phone *" error={errors.phone}>
          <input
            className={inputCls}
            placeholder="Enter client number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </Field>
      </div>

      {/* Email */}
      <Field label="Email *" error={errors.email}>
        <input
          type="email"
          className={inputCls}
          placeholder="Enter client email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </Field>

      {/* Company & Address */}
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="Company">
          <input
            className={inputCls}
            placeholder="Enter company name"
            value={company}
            onChange={e => setCompany(e.target.value)}
          />
        </Field>
        <Field label="Address">
          <input
            className={inputCls}
            placeholder="Enter client address"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </Field>
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
          <Users size={13}/>
          {loading ? 'Saving…' : client ? 'Update client' : 'Create client'}
        </button>
      </div>

    </form>
  );
}