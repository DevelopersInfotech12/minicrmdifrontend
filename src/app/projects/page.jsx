'use client';
import { useEffect, useState, useCallback } from 'react';
import { projectsApi, clientsApi } from '@/lib/api';
import { FolderKanban, Plus, Search, Pencil, Trash2, Eye, RefreshCw, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import ProjectForm from '@/components/projects/ProjectForm';

const SERVICE_EMOJI = {
  "Website Development": "🌐", "App Development": "📱", "SEO": "🔍",
  "Social Media Marketing": "📣", "Google Ads": "🔎", "Meta Ads": "📘",
  "Branding / Design": "🎨", "Content Writing": "✍️", "Other": "📦",
};

const PRIORITY_CFG = {
  "Urgent": { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#ef4444' },
  "Long-term": { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', color: '#60a5fa' },
  "One-time": { bg: 'rgba(160,160,160,0.12)', border: 'rgba(160,160,160,0.3)', color: '#9ca3af' },
  "Retainer": { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)', color: '#a78bfa' },
};

const fmtD = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  const day = dt.getDate();
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dt.getMonth()];
  return `${day} ${mon}`;
};
const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Active');
  const [filterService, setFilterService] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterRecurring, setFilterRecurring] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [clientsList, setClientsList] = useState([]);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 10;

  useEffect(() => {
    clientsApi.getAll({ limit: 100 }).then(r => setClientsList(r.data.data.clients || [])).catch(() => { });
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectsApi.getAll({
        page, limit,
        search: search || undefined,
        status: filterStatus || undefined,
        serviceType: filterService || undefined,
        priority: filterPriority || undefined,
        isRecurring: filterRecurring || undefined,
        clientName: filterClient || undefined,
      });
      console.log('projects response:', res.data);
      const data = res.data.data;
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setTotal(data.pagination?.total ?? 0);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  }, [page, search, filterStatus, filterService, filterPriority, filterRecurring, filterClient]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDelete = async () => {
    setDeleting(true);
    try { await projectsApi.delete(deleteId); toast.success('Project deleted'); setDeleteId(null); fetchProjects(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const totalPages = Math.ceil(total / limit);

  const statusGradient = {
    Active: 'linear-gradient(135deg,#6366f1,#4338ca)',
    Completed: 'linear-gradient(135deg,#6366f1,#4338ca)',
    'On Hold': 'linear-gradient(135deg,#6366f1,#4338ca)',
  };

  const selectCls = `
    px-4 py-2.5 rounded-xl text-sm font-medium min-w-[130px]
    bg-white dark:bg-[#1a1714]
    border border-gray-200 dark:border-white/[0.07]
    text-gray-700 dark:text-gray-300
    focus:outline-none focus:border-[#e8b84b]
    focus:ring-2 focus:ring-[#e8b84b]/20
    transition-all cursor-pointer
  `.replace(/\s+/g, ' ').trim();

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle={`${total} project${total !== 1 ? 's' : ''}`}
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="dark:bg-[#e8b84b] bg-indigo-500 dark:text-black text-white font-semibold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm cursor-pointer">
            <Plus size={15} strokeWidth={2.5} /> New Project
          </button>
        }
      />

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium
              bg-white dark:bg-[#1a1714]
              border border-gray-200 dark:border-white/[0.07]
              text-gray-900 dark:text-white
              placeholder:text-gray-400 dark:placeholder:text-gray-400
              focus:outline-none focus:border-[#e8b84b] dark:focus:border-[#e8b84b]
              focus:ring-2 focus:ring-[#e8b84b]/20 transition-all"
            placeholder="Search projects…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Dropdowns */}
        <select className={selectCls} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>

        <select className={selectCls} value={filterService} onChange={e => { setFilterService(e.target.value); setPage(1); }}>
          <option value="">All Services</option>
          <option value="Website Development">🌐 Website Dev</option>
          <option value="App Development">📱 App Dev</option>
          <option value="SEO">🔍 SEO</option>
          <option value="Social Media Marketing">📣 Social Media</option>
          <option value="Google Ads">🔎 Google Ads</option>
          <option value="Meta Ads">📘 Meta Ads</option>
          <option value="Branding / Design">🎨 Branding</option>
          <option value="Content Writing">✍️ Content</option>
        </select>

        <select className={selectCls} value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setPage(1); }}>
          <option value="">All Priority</option>
          <option value="Urgent">🔴 Urgent</option>
          <option value="Long-term">🔵 Long-term</option>
          <option value="One-time">⚪ One-time</option>
          <option value="Retainer">🟣 Retainer</option>
        </select>

        <select className={selectCls} value={filterRecurring} onChange={e => { setFilterRecurring(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="true">🔄 Recurring</option>
          <option value="false">One-time</option>
        </select>

        <select className={selectCls} value={filterClient} onChange={e => { setFilterClient(e.target.value); setPage(1); }}>
          <option value="">All Clients</option>
          {clientsList.map(c => (
            <option key={c._id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl overflow-x-auto shadow-card dark:shadow-card-dark">
        {loading ? <TableSkeleton rows={5} /> : projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects found"
            description="Create your first project."
            action={
              <button onClick={() => setShowCreate(true)}
                className="dark:bg-[#e8b84b] bg-indigo-500 dark:text-black text-white font-semibold inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer">
                <Plus size={14} /> New Project
              </button>
            }
          />
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#1e1b16] border-b border-gray-200 dark:border-white/[0.09]">
                  {['Project', 'Client', 'Service', 'Priority', 'Status', 'Budget', 'Recurring', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-100 font-sans border-r border-gray-200 dark:border-white/[0.06] last:border-r-0 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                {projects.map(p => (
                  <tr key={p._id} className=" border-b border-gray-100 dark:border-white/[0.06] transition-colors hover:bg-white dark:hover:bg-[#1e1b16] group">

                    {/* Project */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                          style={{
                            background: statusGradient[p.status] || 'linear-gradient(135deg,#6366f1,#4338ca)'
                          }}>
                          {p.title[0]}
                        </div>
                        {/* ── FIX: min-w-0 stops flex overflow; name + date each on own row ── */}
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-gray-800 dark:text-white leading-none truncate">
                            {p.title}
                          </p>
                          {(p.startDate || p.endDate) && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1 whitespace-nowrap">
                              <Clock size={9} />
                              {p.startDate && fmtD(p.startDate)}
                              {p.startDate && p.endDate && ' → '}
                              {p.endDate && fmtD(p.endDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Client */}
                    <td className="px-5 py-4">
                      {p.client
                        ? <Link href={`/clients/${p.client._id}`} className="text-[13px] font-semibold text-amber-600 dark:text-amber-400 hover:underline no-underline">{p.client.name}</Link>
                        : <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>

                    {/* Service */}
                    <td className="px-5 py-4">
                      {p.serviceType ? (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                          style={{ background: 'rgba(212,168,67,0.10)', border: '1px solid rgba(212,168,67,0.25)', color: '#b8860b' }}>
                          {SERVICE_EMOJI[p.serviceType]} {p.serviceType}
                        </span>
                      ) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>

                    {/* Priority */}
                    <td className="px-1 py-4">
                      {p.priority ? (() => {
                        const cfg = PRIORITY_CFG[p.priority];
                        return (
                          <span
                            className="text-[11px] font-semibold px-4 py-0.5 rounded-full whitespace-nowrap"
                            style={{
                              background: cfg.bg,
                              border: `1px solid ${cfg.border}`,
                              color: cfg.color,
                            }}
                          >
                            {p.priority}
                          </span>
                        );
                      })() : <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} />
                    </td>

                    {/* Budget */}
                    <td className="px-5 py-4">
                      {p.budget ? (
                        <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{Number(p.budget).toLocaleString('en-IN')}
                        </span>
                      ) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>

                    {/* Recurring */}
                    <td className="px-5 py-4">
                      {p.isRecurring ? (
                        <div className="flex items-start gap-2">
                          <RefreshCw
                            size={11}
                            className="mt-0.5 text-amber-500 dark:text-amber-400"
                          />

                          <div className="flex flex-col">
                            <span className="text-[13px] font-semibold text-amber-600 dark:text-amber-400">
                              {p.billingCycle}
                            </span>

                            {p.recurringAmount && (
                              <span className="text-[12px] text-gray-400 dark:text-gray-500">
                                {fmt(p.recurringAmount)}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/projects/${p._id}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center
                            bg-gray-100 dark:bg-white/[0.06]
                            border border-gray-200 dark:border-white/[0.07]
                            text-amber-500 hover:border-amber-400 transition-all">
                          <Eye size={13} />
                        </Link>
                        <button onClick={() => setEditProject(p)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center
                            bg-gray-100 dark:bg-white/[0.06]
                            border border-gray-200 dark:border-white/[0.07]
                            text-gray-400 dark:text-gray-500 hover:border-gray-400 dark:hover:border-gray-400 transition-all cursor-pointer">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteId(p._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center
                            bg-gray-100 dark:bg-white/[0.06]
                            border border-gray-200 dark:border-white/[0.07]
                            text-red-400 hover:border-red-400 transition-all cursor-pointer">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-200 dark:border-white/[0.06]">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold
                      bg-gray-100 dark:bg-white/[0.06]
                      text-gray-600 dark:text-gray-400
                      border border-gray-200 dark:border-white/[0.07]
                      cursor-pointer disabled:opacity-40 hover:border-[#e8b84b] transition-all">
                    Previous
                  </button>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold
                      bg-gray-100 dark:bg-white/[0.06]
                      text-gray-600 dark:text-gray-400
                      border border-gray-200 dark:border-white/[0.07]
                      cursor-pointer disabled:opacity-40 hover:border-[#e8b84b] transition-all">
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Project" size="lg">
        <ProjectForm onSuccess={() => { setShowCreate(false); fetchProjects(); }} onCancel={() => setShowCreate(false)} />
      </Modal>
      <Modal open={!!editProject} onClose={() => setEditProject(null)} title="Edit Project" size="lg">
        <ProjectForm project={editProject} onSuccess={() => { setEditProject(null); fetchProjects(); }} onCancel={() => setEditProject(null)} />
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Project" message="Delete this project permanently? This cannot be undone." />
    </div>
  );
}