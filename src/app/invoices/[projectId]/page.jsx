'use client';
import { useEffect, useState } from 'react';

import { projectsApi, milestonesApi, clientsApi } from '@/lib/api';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';

const fmt = (n) => 'Rs.' + Number(n || 0).toLocaleString('en-IN');

const STATUS_COLOR = { Paid: '#10b981', Partial: '#f59e0b', Overdue: '#ef4444', Pending: '#94a3b8' };

export default function InvoicePrintPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const invoiceNo = `INV-${projectId.slice(-6).toUpperCase()}`;
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    Promise.all([
      projectsApi.getById(projectId),
      milestonesApi.getByProject(projectId),
    ]).then(async ([pRes, mRes]) => {
      const proj = pRes.data.data.project;
      setProject(proj);
      setMilestones(mRes.data.data.milestones);
      if (proj.client?._id) {
        const cRes = await clientsApi.getById(proj.client._id);
        setClient(cRes.data.data.client);
      }
    }).catch(() => { toast.error('Failed to load invoice'); router.push('/projects'); })
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400 text-sm">Loading invoice…</p>
    </div>
  );

  const totalAmount = milestones.reduce((s, m) => s + m.amount, 0);
  const totalPaid = milestones.reduce((s, m) => s + m.paidAmount, 0);
  const totalPending = totalAmount - totalPaid;

  return (
    <div>
      {/* Toolbar */}
      <div className="print:hidden flex items-center gap-3 mb-6">
        <Link href={`/projects/${projectId}`} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white border border-slate-200 transition-all">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-900">Invoice Preview</h1>
          <p className="text-sm text-slate-400">{project?.title}</p>
        </div>
        <button onClick={() => window.print()} className="btn-primary">
          <Download size={15} /> Download PDF
        </button>
      </div>

      {/* Invoice */}
      <div className="bg-white rounded-2xl shadow-elevated max-w-3xl mx-auto overflow-hidden print:shadow-none" id="invoice">
        {/* Top accent */}
        <div style={{ height: 6, background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#a5b4fc)' }} />

        <div className="p-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-black" style={{ background: 'linear-gradient(135deg,#6366f1,#4338ca)' }}>⚡</div>
                <div>
                  <p className="font-black text-xl text-slate-900">Cliento Agency</p>
                  <p className="text-xs text-slate-400">Your Digital Growth Partner</p>
                </div>
              </div>
              <div className="text-xs text-slate-500 leading-relaxed mt-4">
                <p>123 Agency Street, Mumbai</p>
                <p>contact@Cliento.io · +91 98765 43210</p>
                <p>GST: 22AAAAA0000A1Z5</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-black text-brand-600 tracking-tight">INVOICE</p>
              <p className="text-sm text-slate-400 mt-1">#{invoiceNo}</p>
              <p className="text-xs text-slate-400 mt-0.5">Date: {today}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-0.5 rounded-full mb-8" style={{ background: 'linear-gradient(90deg,#6366f1,#e2e8f0)' }} />

          {/* Bill To + Project */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bill To</p>
              <p className="font-bold text-lg text-slate-900">{client?.name}</p>
              {client?.company && <p className="text-sm text-slate-500">{client.company}</p>}
              <p className="text-sm text-slate-500">{client?.email}</p>
              <p className="text-sm text-slate-500">{client?.phone}</p>
              {client?.address && <p className="text-sm text-slate-500">{client.address}</p>}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Project</p>
              <p className="font-bold text-lg text-slate-900">{project?.title}</p>
              {project?.description && <p className="text-sm text-slate-500 mt-1">{project.description}</p>}
              <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${project?.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                {project?.status}
              </span>
              {project?.startDate && (
                <p className="text-xs text-slate-400 mt-1.5">
                  {new Date(project.startDate).toLocaleDateString('en-IN')}
                  {project.endDate && ` → ${new Date(project.endDate).toLocaleDateString('en-IN')}`}
                </p>
              )}
            </div>
          </div>

          {/* Milestone Table */}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Payment Schedule</p>
          <table className="w-full mb-8">
            <thead>
              <tr className="bg-slate-50 rounded-xl">
                <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide rounded-l-xl">#</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Milestone</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Due Date</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wide">Amount</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wide">Paid</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wide">Pending</th>
                <th className="px-3 py-2.5 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((m, i) => (
                <tr key={m._id} className="border-b border-slate-50">
                  <td className="px-3 py-3 text-sm text-slate-400 font-semibold">{i + 1}</td>
                  <td className="px-3 py-3">
                    <p className="text-sm font-semibold text-slate-800">{m.title}</p>
                    <p className="text-xs text-slate-400">{m.percentage}% of total{m.notes ? ` · ${m.notes}` : ''}</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">
                    {m.dueDate ? new Date(m.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-3 py-3 text-sm font-bold text-slate-900 text-right">{fmt(m.amount)}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-emerald-600 text-right">{fmt(m.paidAmount)}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-right" style={{ color: m.pendingAmount > 0 ? '#f59e0b' : '#10b981' }}>{fmt(m.pendingAmount || 0)}</td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: STATUS_COLOR[m.status], background: STATUS_COLOR[m.status] + '18' }}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-10">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm text-slate-500 py-1.5 border-b border-slate-100">
                <span>Subtotal</span><span className="font-semibold text-slate-800">{fmt(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500 py-1.5 border-b border-slate-100">
                <span>Total Received</span><span className="font-semibold text-emerald-600">{fmt(totalPaid)}</span>
              </div>
              <div className={`flex justify-between items-center px-4 py-3 rounded-xl mt-2 ${totalPending > 0 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                <span className={`font-bold ${totalPending > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                  {totalPending > 0 ? 'Balance Due' : 'Fully Paid'}
                </span>
                <span className={`text-xl font-black ${totalPending > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{fmt(totalPending)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 pt-5 text-center">
            <p className="text-sm text-slate-400">Thank you for your business!</p>
            <p className="text-xs text-slate-300 mt-1">For payment queries: contact@Cliento.io</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white; }
          #invoice { box-shadow: none; border-radius: 0; }
        }
      `}</style>
    </div>
  );
}