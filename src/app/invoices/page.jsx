'use client';
import { useEffect, useState, useRef } from 'react';
import { projectsApi, invoicesApi, milestonesApi } from '@/lib/api';
import api from '@/lib/api';
import {
  Receipt, Search, Plus, Upload, FileText,
  Download, Trash2, X, Building2, FolderKanban
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtSize = (b) => b < 1024 * 1024 ? (b / 1024).toFixed(1) + ' KB' : (b / (1024 * 1024)).toFixed(1) + ' MB';

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ projects, onSuccess, onCancel }) {
  const inputRef = useRef();
  const [file, setFile]             = useState(null);
  const [label, setLabel]           = useState('');
  const [projectId, setProjectId]   = useState('');
  const [milestones, setMilestones] = useState([]);
  const [milestoneId, setMilestoneId] = useState('');
  const [uploading, setUploading]   = useState(false);
  const [drag, setDrag]             = useState(false);

  useEffect(() => {
    if (!projectId) { setMilestones([]); setMilestoneId(''); return; }
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
    if (!projectId) return toast.error('Select a project');
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

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl text-sm font-medium
    bg-white dark:bg-[#1a1714]
    border border-gray-200 dark:border-white/[0.07]
    text-gray-900 dark:text-white
    focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20
    transition-all`;

  return (
    <div className="space-y-4">
      {/* File drop zone */}
      {!file ? (
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
            ${drag
              ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10'
              : 'border-gray-200 dark:border-white/[0.09] hover:border-yellow-300 dark:hover:border-yellow-600 hover:bg-gray-50 dark:hover:bg-white/[0.02]'
            }`}
        >
          <Upload size={22} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Drop invoice here or <span style={{ color: '#e8b84b' }}>browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG — max 10MB</p>
          <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
            onChange={e => e.target.files[0] && setFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-2xl border"
          style={{ background: 'rgba(232,184,75,0.08)', borderColor: 'rgba(232,184,75,0.3)' }}>
          <FileText size={18} style={{ color: '#e8b84b' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{file.name}</p>
            <p className="text-xs text-gray-400">{fmtSize(file.size)}</p>
          </div>
          <button onClick={() => setFile(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Project select */}
      <div>
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 block">Project *</label>
        <select className={inputCls} value={projectId} onChange={e => setProjectId(e.target.value)}>
          <option value="">Select project…</option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>{p.title}{p.client ? ` — ${p.client.name}` : ''}</option>
          ))}
        </select>
      </div>

      {/* Milestone select */}
      {milestones.length > 0 && (
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 block">Link to Milestone (optional)</label>
          <select className={inputCls} value={milestoneId} onChange={e => setMilestoneId(e.target.value)}>
            <option value="">Project-level invoice</option>
            {milestones.map(m => (
              <option key={m._id} value={m._id}>{m.title} — {m.percentage}%</option>
            ))}
          </select>
        </div>
      )}

      {/* Label */}
      <div>
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 block">Label (optional)</label>
        <input
          className={inputCls}
          placeholder="e.g. Invoice #001 — 30% Upfront"
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-1">
        <button onClick={onCancel} disabled={uploading}
          className="px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#1e1b16] text-gray-600 dark:text-gray-300 hover:border-gray-300 transition-all cursor-pointer">
          Cancel
        </button>
        <button onClick={handleUpload} disabled={!file || !projectId || uploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer disabled:opacity-50 transition-all"
          style={{ background: '#e8b84b', color: '#0a0a0a' }}>
          <Upload size={14} />{uploading ? 'Uploading…' : 'Upload Invoice'}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const [projects, setProjects]     = useState([]);
  const [invoices, setInvoices]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [downloading, setDownloading] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const pRes = await projectsApi.getAll({ limit: 100 });
      const projs = Array.isArray(pRes.data.data?.projects) ? pRes.data.data.projects : [];
      setProjects(projs);

      // Fetch invoices for all projects in parallel
      const results = await Promise.allSettled(
        projs.map(p => invoicesApi.getByProject(p._id))
      );

      const all = [];
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          const invs = r.value.data.data?.invoices || [];
          invs.forEach(inv => {
            all.push({ ...inv, _project: projs[i] });
          });
        }
      });

      // Sort newest first
      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setInvoices(all);
    } catch { toast.error('Failed to load invoices'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

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
      fetchAll();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    return (
      inv.label?.toLowerCase().includes(q) ||
      inv.fileName?.toLowerCase().includes(q) ||
      inv._project?.title?.toLowerCase().includes(q) ||
      inv._project?.client?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} invoice${invoices.length !== 1 ? 's' : ''} total`}
        action={
          <button
            onClick={() => setShowUpload(true)}
            className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.5} /> Upload Invoice
          </button>
        }
      />

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium
              bg-white dark:bg-[#1a1714]
              border border-gray-200 dark:border-white/[0.07]
              text-gray-900 dark:text-white placeholder:text-gray-400
              focus:outline-none focus:border-gold-500 dark:focus:border-gold-400
              focus:ring-2 focus:ring-gold-500/20 transition-all"
            placeholder="Search by invoice label, project, client…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.06] rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
        {loading ? <TableSkeleton rows={6} /> : filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No invoices yet"
            description="Upload your first invoice to start tracking."
            action={
              <button onClick={() => setShowUpload(true)}
                className="btn-gold inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer">
                <Plus size={14} /> Upload Invoice
              </button>
            }
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#0f0e0c] border-b border-gray-300 dark:border-white/[0.06]">
                {['Invoice', 'Project', 'Client', 'Milestone', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 dark:text-white uppercase tracking-widest font-sans">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
              {filtered.map(inv => (
                <tr key={inv._id} className="hover:bg-white dark:hover:bg-[#1e1b16] transition-colors group">

                  {/* Invoice */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 flex items-center justify-center flex-shrink-0">
                        <FileText size={15} className="text-red-500 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-gray-800 dark:text-white leading-none truncate max-w-[180px]">
                          {inv.label || inv.fileName}
                        </p>
                        {inv.label && (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[180px]">{inv.fileName}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Project */}
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 dark:text-gray-300">
                      <FolderKanban size={12} className="text-gray-400" />
                      {inv._project?.title || '—'}
                    </span>
                  </td>

                  {/* Client */}
                  <td className="px-5 py-4">
                    {inv._project?.client ? (
                      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-600 dark:text-amber-400">
                        <Building2 size={12} className="text-gray-400" />
                        {inv._project.client.name}
                      </span>
                    ) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                  </td>

                  {/* Milestone */}
                  <td className="px-5 py-4">
                    {inv.milestone ? (
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(232,184,75,0.10)', border: '1px solid rgba(232,184,75,0.25)', color: '#b8860b' }}>
                        {inv.milestone.title}
                      </span>
                    ) : <span className="text-[11px] text-gray-400 dark:text-gray-500">Project-level</span>}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4">
                    <span className="text-[13px] text-gray-500 dark:text-gray-400">{fmtDate(inv.createdAt)}</span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDownload(inv)}
                        disabled={downloading === inv._id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center
                          bg-gray-100 dark:bg-white/[0.06]
                          border border-gray-200 dark:border-white/[0.07]
                          text-blue-500 hover:border-blue-400 transition-all cursor-pointer disabled:opacity-40"
                        title="Download"
                      >
                        <Download size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteId(inv._id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center
                          bg-gray-100 dark:bg-white/[0.06]
                          border border-gray-200 dark:border-white/[0.07]
                          text-red-400 hover:border-red-400 transition-all cursor-pointer"
                        title="Delete"
                      >
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

      {/* Upload Modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Invoice">
        <UploadModal
          projects={projects}
          onSuccess={() => { setShowUpload(false); fetchAll(); }}
          onCancel={() => setShowUpload(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Invoice"
        message="Permanently delete this invoice file? This cannot be undone."
      />
    </div>
  );
}