'use client';
import { useEffect, useState, useCallback } from 'react';
import { personalProjectsApi } from '@/lib/api';
import { Code2, Plus, Search, Pencil, Trash2, ExternalLink, Github, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import PersonalProjectForm from '@/components/projects/PersonalProjectForm';

const STATUS_CFG = {
  "In Progress": { bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.35)", color: "#6366f1" },
  "Completed":   { bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.35)",  color: "#22c55e" },
  "On Hold":     { bg: "rgba(234,179,8,0.12)",    border: "rgba(234,179,8,0.35)",  color: "#eab308" },
  "Idea":        { bg: "rgba(168,85,247,0.12)",   border: "rgba(168,85,247,0.35)", color: "#a855f7" },
};

const TECH_COLORS = {
  "React":"#61dafb","Next.js":"#ffffff","Vue":"#4fc08d","Nuxt":"#00dc82","Angular":"#dd0031",
  "Svelte":"#ff3e00","Node.js":"#68a063","Express":"#aaa","FastAPI":"#009688","Django":"#092e20",
  "Laravel":"#ff2d20","Rails":"#cc0000","React Native":"#61dafb","Flutter":"#54c5f8","Swift":"#f05138",
  "Kotlin":"#7f52ff","MongoDB":"#47a248","PostgreSQL":"#336791","MySQL":"#4479a1","Supabase":"#3ecf8e",
  "Firebase":"#ffca28","TypeScript":"#3178c6","JavaScript":"#f7df1e","Python":"#3572a5","PHP":"#777bb4",
  "Go":"#00add8","Rust":"#ce422b","Tailwind CSS":"#38bdf8","Other":"#6b7280",
};

const TYPE_EMOJI = {
  "Website":"🌐","Web App":"⚡","Mobile App":"📱","API / Backend":"🔌",
  "Chrome Extension":"🧩","CLI Tool":"💻","Other":"📦",
};

const fmtD = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()]} ${dt.getFullYear()}`;
};

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#4338ca)',
  'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  'linear-gradient(135deg,#ec4899,#be185d)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#3b82f6,#1d4ed8)',
];

export default function PersonalProjectsPage() {
  const [projects,    setProjects]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filterStatus,setFilterStatus]= useState('');
  const [filterType,  setFilterType]  = useState('');
  const [page,        setPage]        = useState(1);
  const [showCreate,  setShowCreate]  = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [deleting,    setDeleting]    = useState(false);
  const limit = 12;

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await personalProjectsApi.getAll({
        page, limit,
        search:  search       || undefined,
        status:  filterStatus || undefined,
        type:    filterType   || undefined,
      });
      const data = res.data.data;
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setTotal(data.pagination?.total ?? 0);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  }, [page, search, filterStatus, filterType]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDelete = async () => {
    setDeleting(true);
    try { await personalProjectsApi.delete(deleteId); toast.success('Project deleted'); setDeleteId(null); fetchProjects(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const totalPages = Math.ceil(total / limit);

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
        title="My Projects"
        subtitle={`${total} personal project${total !== 1 ? 's' : ''}`}
        action={
          <button onClick={() => setShowCreate(true)}
            className="dark:bg-[#e8b84b] bg-indigo-500 dark:text-black text-white font-semibold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm cursor-pointer">
            <Plus size={15} strokeWidth={2.5} /> Add Project
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-[#1a1714] border border-gray-200 dark:border-white/[0.07] text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e8b84b] focus:ring-2 focus:ring-[#e8b84b]/20 transition-all"
            placeholder="Search projects…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className={selectCls} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="In Progress">🔵 In Progress</option>
          <option value="Completed">🟢 Completed</option>
          <option value="On Hold">🟡 On Hold</option>
          <option value="Idea">🟣 Idea</option>
        </select>
        <select className={selectCls} value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="Website">🌐 Website</option>
          <option value="Web App">⚡ Web App</option>
          <option value="Mobile App">📱 Mobile App</option>
          <option value="API / Backend">🔌 API / Backend</option>
          <option value="Chrome Extension">🧩 Extension</option>
          <option value="CLI Tool">💻 CLI Tool</option>
          <option value="Other">📦 Other</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl overflow-x-auto shadow-card dark:shadow-card-dark">
        {loading ? <TableSkeleton rows={5} /> : projects.length === 0 ? (
          <EmptyState
            icon={Code2}
            title="No personal projects yet"
            description="Track your own websites, apps and side projects here."
            action={
              <button onClick={() => setShowCreate(true)}
                className="dark:bg-[#e8b84b] bg-indigo-500 dark:text-black text-white font-semibold inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer">
                <Plus size={14} /> Add Project
              </button>
            }
          />
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#1e1b16] border-b border-gray-200 dark:border-white/[0.09]">
                  {['Project', 'Type', 'Status', 'Tech Stack', 'Dates', 'Links', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-100 font-sans border-r border-gray-200 dark:border-white/[0.06] last:border-r-0 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                {projects.map((p, i) => {
                  const statusCfg = STATUS_CFG[p.status] || STATUS_CFG["In Progress"];
                  const grad = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
                  return (
                    <tr key={p._id} className="border-b border-gray-100 dark:border-white/[0.06] transition-colors hover:bg-white dark:hover:bg-[#1e1b16] group">

                      {/* Project */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                            style={{ background: grad }}>
                            {p.title[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-bold text-gray-800 dark:text-white leading-none truncate">{p.title}</p>
                            {p.description && (
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 truncate max-w-[180px]">{p.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">
                        {p.type ? (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                            style={{ background: 'rgba(212,168,67,0.10)', border: '1px solid rgba(212,168,67,0.25)', color: '#b8860b' }}>
                            {TYPE_EMOJI[p.type]} {p.type}
                          </span>
                        ) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap"
                          style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, color: statusCfg.color }}>
                          {p.status}
                        </span>
                      </td>

                      {/* Tech Stack */}
                      <td className="px-5 py-4">
                        {p.techStack?.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {p.techStack.map(t => {
                              const displayName = t === 'React' ? 'React.js' : t;
                              return (
                                <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                                  style={{ background: `${TECH_COLORS[t] || '#6b7280'}18`, border: `1px solid ${TECH_COLORS[t] || '#6b7280'}44`, color: TECH_COLORS[t] || '#6b7280' }}>
                                  {displayName}
                                </span>
                              );
                            })}
                          </div>
                        ) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>

                      {/* Dates */}
                      <td className="px-5 py-4">
                        {(p.startDate || p.endDate) ? (
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            <Clock size={9} />
                            {p.startDate && fmtD(p.startDate)}
                            {p.startDate && p.endDate && ' → '}
                            {p.endDate && fmtD(p.endDate)}
                          </div>
                        ) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>

                      {/* Links */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {p.liveUrl && (
                            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                              className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30 text-emerald-600 dark:text-emerald-400 hover:border-emerald-400 transition-all">
                              <ExternalLink size={11} />
                            </a>
                          )}
                          {p.repoUrl && (
                            <a href={p.repoUrl} target="_blank" rel="noopener noreferrer"
                              className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.07] text-gray-600 dark:text-gray-400 hover:border-gray-400 transition-all">
                              <Github size={11} />
                            </a>
                          )}
                          {!p.liveUrl && !p.repoUrl && <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setEditProject(p)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.07] text-gray-400 dark:text-gray-500 hover:border-gray-400 dark:hover:border-gray-400 transition-all cursor-pointer">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeleteId(p._id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.07] text-red-400 hover:border-red-400 transition-all cursor-pointer">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-200 dark:border-white/[0.06]">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/[0.07] cursor-pointer disabled:opacity-40 hover:border-[#e8b84b] transition-all">
                    Previous
                  </button>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/[0.07] cursor-pointer disabled:opacity-40 hover:border-[#e8b84b] transition-all">
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Personal Project" size="lg">
        <PersonalProjectForm onSuccess={() => { setShowCreate(false); fetchProjects(); }} onCancel={() => setShowCreate(false)} />
      </Modal>
      <Modal open={!!editProject} onClose={() => setEditProject(null)} title="Edit Project" size="lg">
        <PersonalProjectForm project={editProject} onSuccess={() => { setEditProject(null); fetchProjects(); }} onCancel={() => setEditProject(null)} />
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Project" message="Delete this personal project permanently?" />
    </div>
  );
}
