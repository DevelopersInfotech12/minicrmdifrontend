'use client';
import { useState } from 'react';
import { paymentsApi } from '@/lib/api';
import toast from 'react-hot-toast';

const fieldStyle = {
  width:'100%', padding:'10px 14px',
  background:'var(--bg-input)', border:'1px solid var(--border-strong)',
  borderRadius:10, color:'var(--text-primary)', fontSize:13,
  fontFamily:'DM Sans,sans-serif', outline:'none', transition:'all 0.15s ease',
};
const labelStyle = {
  display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.1em',
  textTransform:'uppercase', color:'#c8b896', marginBottom:6,
  fontFamily:'Syne,sans-serif',
};

function Input({ value, onChange, placeholder, type='number' }) {
  const [f, setF] = useState(false);
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{ ...fieldStyle, borderColor:f?'var(--gold)':'var(--border-strong)', boxShadow:f?'0 0 0 3px var(--gold-glow)':'none', background:f?'var(--bg-elevated)':'var(--bg-input)' }}
    />
  );
}

export default function PaymentForm({ payment, projectId, onSuccess, onCancel }) {
  const [totalAmount, setTotalAmount] = useState(payment?.totalAmount || '');
  const [paidAmount,  setPaidAmount]  = useState(payment?.paidAmount  || '');
  const [dueDate,     setDueDate]     = useState(payment?.dueDate ? payment.dueDate.substring(0,10) : '');
  const [loading,     setLoading]     = useState(false);

  const pct     = totalAmount ? Math.min(100, Math.round((Number(paidAmount)/Number(totalAmount))*100)||0) : 0;
  const pending = Math.max(0, Number(totalAmount) - Number(paidAmount||0));

  const getStatus = () => {
    if (!totalAmount) return null;
    if (pct === 100) return { label:'Paid', color:'#10b981' };
    if (dueDate && new Date(dueDate) < new Date()) return { label:'Overdue', color:'#ef4444' };
    if (pct > 0) return { label:'Partial', color:'#f59e0b' };
    return { label:'Pending', color:'var(--text-muted)' };
  };
  const status = getStatus();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!totalAmount) return toast.error('Total amount is required');
    if (Number(paidAmount) > Number(totalAmount)) return toast.error('Paid cannot exceed total');
    setLoading(true);
    try {
      const payload = { totalAmount:Number(totalAmount), paidAmount:Number(paidAmount||0), dueDate:dueDate||undefined };
      if (payment) { await paymentsApi.update(payment._id, payload); toast.success('Payment updated!'); }
      else         { await paymentsApi.create({ ...payload, project:projectId }); toast.success('Payment created!'); }
      onSuccess();
    } catch (err) { toast.error(err?.response?.data?.message || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div><label style={labelStyle}>Total Amount (₹) *</label><Input value={totalAmount} onChange={setTotalAmount} placeholder="50000"/></div>
        <div><label style={labelStyle}>Paid Amount (₹)</label><Input value={paidAmount} onChange={setPaidAmount} placeholder="0"/></div>
      </div>
      <div>
        <label style={labelStyle}>Due Date</label>
        <Input type="date" value={dueDate} onChange={setDueDate} placeholder=""/>
      </div>

      {totalAmount && (
        <div style={{ padding:'14px', borderRadius:12, background:'var(--bg-input)', border:'1px solid var(--border-strong)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>Progress</span>
            {status && <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:99, background:`${status.color}15`, border:`1px solid ${status.color}30`, color:status.color }}>{status.label}</span>}
          </div>
          <div style={{ height:6, background:'var(--border)', borderRadius:99, overflow:'hidden', marginBottom:10 }}>
            <div style={{ height:'100%', width:`${pct}%`, borderRadius:99, background:`linear-gradient(90deg,var(--gold),var(--gold-light))`, transition:'width 0.4s ease' }}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[
              { label:'Total',   val:`₹${Number(totalAmount).toLocaleString('en-IN')}`, color:'var(--text-primary)' },
              { label:'Paid',    val:`₹${Number(paidAmount||0).toLocaleString('en-IN')}`, color:'#10b981' },
              { label:'Pending', val:`₹${pending.toLocaleString('en-IN')}`, color:'#f59e0b' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ textAlign:'center', padding:'8px', background:'var(--bg-elevated)', borderRadius:8 }}>
                <p style={{ fontSize:13, fontWeight:700, color, margin:0 }}>{val}</p>
                <p style={{ fontSize:10, color:'var(--text-muted)', margin:0, marginTop:2 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:4 }}>
        <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding:'10px 20px', borderRadius:10, fontSize:13, cursor:'pointer' }}>Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary" style={{ padding:'10px 24px', borderRadius:10, fontSize:13, cursor:'pointer', opacity:loading?0.6:1 }}>
          {loading ? 'Saving…' : payment ? 'Update Payment' : 'Create Payment'}
        </button>
      </div>
    </form>
  );
}
