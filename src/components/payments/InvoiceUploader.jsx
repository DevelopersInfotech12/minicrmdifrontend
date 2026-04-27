'use client';
import { useState, useEffect, useRef } from 'react';
import { invoiceApi, milestoneApi } from '@/lib/api';
import {
  Upload, FileText, Download, Trash2, Plus,
  CheckCircle2, File, AlertCircle, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const fmtSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function UploadZone({ onFile }) {
  const inputRef  = useRef();
  const [drag, setDrag] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
        ${drag ? 'border-brand-400 bg-brand-50 scale-[1.01]' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'}`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${drag ? 'bg-brand-100' : 'bg-slate-100'}`}>
          <Upload size={22} className={drag ? 'text-brand-600' : 'text-slate-400'} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">Drop invoice here or <span className="text-brand-600">browse</span></p>
          <p className="text-xs text-slate-400 mt-0.5">PDF, JPG, PNG — max 10MB</p>
        </div>
      </div>
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
    </div>
  );
}

function UploadForm({ projectId, milestones, onSuccess, onCancel }) {
  const [file, setFile]         = useState(null);
  const [label, setLabel]       = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file');
    setUploading(true);

    const formData = new FormData();
    formData.append('invoice', file);
    formData.append('projectId', projectId);
    if (milestoneId) formData.append('milestoneId', milestoneId);
    if (label.trim()) formData.append('label', label.trim());

    try {
      // Simulate progress
      const interval = setInterval(() => setProgress(p => Math.min(p + 15, 85)), 200);
      await invoiceApi.upload(formData);
      clearInterval(interval);
      setProgress(100);
      toast.success('Invoice uploaded!');
      setTimeout(() => onSuccess(), 300);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <UploadZone onFile={setFile} />
      ) : (
        <div className="flex items-center gap-3 p-4 bg-brand-50 border border-brand-100 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-card">
            <FileText size={18} className="text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
            <p className="text-xs text-slate-400">{fmtSize(file.size)}</p>
          </div>
          <button onClick={() => setFile(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-all">
            <X size={14} />
          </button>
        </div>
      )}

      {milestones.length > 0 && (
        <div>
          <label className="label">Link to Milestone (optional)</label>
          <select className="input" value={milestoneId} onChange={e => setMilestoneId(e.target.value)}>
            <option value="">Project-level invoice (no milestone)</option>
            {milestones.map(m => (
              <option key={m._id} value={m._id}>
                {m.title} — {m.percentage}%
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="label">Label / Description (optional)</label>
        <input
          className="input"
          placeholder="e.g. Invoice #001 — 30% Upfront"
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
      </div>

      {uploading && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Uploading…</span><span>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-1">
        <button onClick={onCancel} className="btn-secondary" disabled={uploading}>Cancel</button>
        <button onClick={handleUpload} disabled={!file || uploading} className="btn-primary disabled:opacity-60">
          {uploading ? 'Uploading…' : <><Upload size={14} /> Upload Invoice</>}
        </button>
      </div>
    </div>
  );
}

export default function InvoiceUploader({ projectId }) {
  const [invoices, setInvoices]     = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [downloading, setDownloading] = useState(null);

  const fetchData = async () => {
    try {
      const [invRes, milRes] = await Promise.all([
        invoiceApi.getByProject(projectId),
        milestoneApi.getByProject(projectId),
      ]);
      setInvoices(invRes.data.data.invoices);
      setMilestones(milRes.data.data.milestones);
    } catch { toast.error('Failed to load invoices'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (projectId) fetchData(); }, [projectId]);

  const handleDownload = async (inv) => {
    setDownloading(inv._id);
    try {
      const res = await invoiceApi.download(inv._id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: inv.mimeType || 'application/pdf' }));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = inv.fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    } catch { toast.error('Download failed'); }
    finally { setDownloading(null); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await invoiceApi.delete(deleteId);
      toast.success('Invoice deleted');
      setDeleteId(null);
      fetchData();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const isPDF = (inv) => inv.mimeType === 'application/pdf';

  if (loading) return <div className="py-6 text-center text-sm text-slate-400">Loading invoices…</div>;

  // Group by milestone
  const grouped = {};
  invoices.forEach(inv => {
    const key = inv.milestone?._id || '__project__';
    if (!grouped[key]) grouped[key] = { label: inv.milestone ? `${inv.milestone.title} (${inv.milestone.percentage}%)` : 'Project Invoice', invoices: [] };
    grouped[key].invoices.push(inv);
  });

  return (
    <div className="space-y-4">
      {/* Upload button */}
      {!showUpload && (
        <button onClick={() => setShowUpload(true)} className="btn-secondary w-full justify-center gap-2">
          <Plus size={15} /> Upload Invoice
        </button>
      )}

      {/* Upload form */}
      {showUpload && (
        <div className="card p-5 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-800">Upload Invoice</p>
            <button onClick={() => setShowUpload(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
              <X size={14} />
            </button>
          </div>
          <UploadForm
            projectId={projectId}
            milestones={milestones}
            onSuccess={() => { setShowUpload(false); fetchData(); }}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}

      {/* Grouped invoice list */}
      {invoices.length === 0 && !showUpload ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <FileText size={28} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-500">No invoices uploaded yet</p>
          <p className="text-xs text-slate-400 mt-0.5">Upload PDF invoices for this project or per milestone</p>
        </div>
      ) : (
        Object.entries(grouped).map(([key, group]) => (
          <div key={key} className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{group.label}</p>
            {group.invoices.map(inv => (
              <div key={inv._id} className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-glass transition-all group">
                {/* File icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPDF(inv) ? 'bg-red-50' : 'bg-blue-50'}`}>
                  <FileText size={18} className={isPDF(inv) ? 'text-red-500' : 'text-blue-500'} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {inv.label || inv.fileName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{inv.fileName}</span>
                    <span className="text-slate-200">·</span>
                    <span className="text-xs text-slate-400">{fmtSize(inv.fileSize)}</span>
                    <span className="text-slate-200">·</span>
                    <span className="text-xs text-slate-400">{fmtDate(inv.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(inv)}
                    disabled={downloading === inv._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 text-xs font-semibold hover:bg-brand-100 transition-all disabled:opacity-60"
                  >
                    {downloading === inv._id ? (
                      <span>…</span>
                    ) : (
                      <><Download size={12} /> Download</>
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteId(inv._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Invoice"
        message="This will permanently delete the invoice file. This cannot be undone."
      />
    </div>
  );
}
