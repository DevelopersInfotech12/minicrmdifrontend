'use client';
import { useEffect, useState, useRef } from 'react';
import { invoicesApi, milestonesApi } from '@/lib/api';
import api from '@/lib/api';
import {
  Upload, FileText, Download, Trash2, Plus, X, Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const fmtDate = (d) => {
  const dt = new Date(d);
  const day = dt.getDate();
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dt.getMonth()];
  return `${day} ${mon} ${dt.getFullYear()}`;
};
const fmtSize = (b) => b < 1024 * 1024 ? (b / 1024).toFixed(1) + ' KB' : (b / (1024 * 1024)).toFixed(1) + ' MB';

function UploadModal({ projectId, onSuccess, onCancel }) {
  const inputRef = useRef();
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [milestoneId, setMilestoneId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    milestonesApi.getByProject(projectId)
      .then(r => setMilestones(r.data.data?.milestones || []))
      .catch(() => setMilestones([]));
  }, [projectId]);

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Select a file');
    setUploading(true);
    const fd = new FormData();
    fd.append('invoice', file);
    fd.append('projectId', projectId);
    if (milestoneId) fd.append('milestoneId', milestoneId);
    if (label.trim()) fd.append('label', label.trim());
    try {
      await invoicesApi.upload(fd);
      toast.success('Invoice uploaded!');
      onSuccess();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-[#1a1714] border border-gray-200 dark:border-white/[0.07] text-gray-900 dark:text-white focus:outline-none transition-all`;

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${drag ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10' : 'border-gray-200 dark:border-white/[0.09] hover:border-yellow-300 dark:hover:border-yellow-600 hover:bg-gray-50 dark:hover:bg-white/[0.02]'}`}
        >
          <Upload size={22} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Drop invoice here or <span style={{ color: '#e8b84b' }}>browse</span></p>
          <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG — max 10MB</p>
          <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => e.target.files[0] && setFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: 'rgba(232,184,75,0.08)', borderColor: 'rgba(232,184,75,0.3)' }}>
          <FileText size={18} style={{ color: '#e8b84b' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{file.name}</p>
            <p className="text-xs text-gray-400">{fmtSize(file.size)}</p>
          </div>
          <button onClick={() => setFile(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><X size={14} /></button>
        </div>
      )}

      {milestones.length > 0 && (
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 block">Link to Milestone (optional)</label>
          <select className={inputCls} value={milestoneId} onChange={e => setMilestoneId(e.target.value)}>
            <option value="">Project-level invoice</option>
            {milestones.map(m => <option key={m._id} value={m._id}>{m.title} — {m.percentage}%</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 block">Label (optional)</label>
        <input className={inputCls} placeholder="e.g. Invoice #001 — 30% Upfront" value={label} onChange={e => setLabel(e.target.value)} />
      </div>

      <div className="flex gap-3 justify-end pt-1">
        <button onClick={onCancel} disabled={uploading}
          className="px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#1e1b16] text-gray-600 dark:text-gray-300 hover:border-gray-300 transition-all cursor-pointer">
          Cancel
        </button>
        <button onClick={handleUpload} disabled={!file || uploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer disabled:opacity-50 transition-all bg-indigo-500 dark:bg-[#e8b84b] text-white dark:text-black border-none">
          <Upload size={14} />{uploading ? 'Uploading…' : 'Upload Invoice'}
        </button>
      </div>
    </div>
  );
}

export default function InvoiceUploader({ projectId }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await invoicesApi.getByProject(projectId);
      const invs = res.data.data?.invoices || [];
      invs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setInvoices(invs);
    } catch { toast.error('Failed to load invoices'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInvoices(); }, [projectId]);

  const handleDownload = async (inv) => {
    setDownloading(inv._id);
    try {
      const res = await api.get(`/invoices/${inv._id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = inv.fileName; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    } catch { toast.error('Download failed'); }
    finally { setDownloading(null); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await invoicesApi.delete(deleteId);
      toast.success('Invoice deleted');
      setDeleteId(null);
      fetchInvoices();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Uploaded Invoices</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Upload invoices per milestone or for the whole project</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold cursor-pointer border-none transition-all bg-indigo-500 dark:bg-[#e8b84b] text-white dark:text-black"
        >
          <Plus size={13} /> Upload Invoice
        </button>

      </div>

      <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.06] rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
        {loading ? (
          <div className="py-10 text-center text-sm text-gray-400">Loading…</div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] flex items-center justify-center mb-3">
              <Receipt size={22} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No invoices yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Upload your first invoice above</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#0f0e0c] border-b border-gray-300 dark:border-white/[0.06]">
                {['Invoice', 'Milestone', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 dark:text-white uppercase tracking-widest font-sans">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
              {invoices.map(inv => (
                <tr key={inv._id} className="hover:bg-white dark:hover:bg-[#1e1b16] transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 flex items-center justify-center flex-shrink-0">
                        <FileText size={15} className="text-red-500 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-gray-800 dark:text-white leading-none truncate max-w-[200px]">{inv.label || inv.fileName}</p>
                        {inv.label && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[200px]">{inv.fileName}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {inv.milestone
                      ? <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(232,184,75,0.10)', border: '1px solid rgba(232,184,75,0.25)', color: '#b8860b' }}>{inv.milestone.title}</span>
                      : <span className="text-[11px] text-gray-400 dark:text-gray-500">Project-level</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[13px] text-gray-500 dark:text-gray-400">{fmtDate(inv.createdAt)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleDownload(inv)} disabled={downloading === inv._id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.07] text-blue-500 hover:border-blue-400 transition-all cursor-pointer disabled:opacity-40" title="Download">
                        <Download size={13} />
                      </button>
                      <button onClick={() => setDeleteId(inv._id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.07] text-red-400 hover:border-red-400 transition-all cursor-pointer" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Invoice">
        <UploadModal projectId={projectId} onSuccess={() => { setShowUpload(false); fetchInvoices(); }} onCancel={() => setShowUpload(false)} />
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Invoice" message="Permanently delete this invoice file? This cannot be undone." />
    </div>
  );
}
