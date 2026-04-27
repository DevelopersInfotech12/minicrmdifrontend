'use client';
import { useState, useEffect } from 'react';
import { tasksApi } from '@/lib/api';
import {
  Plus, Trash2, Pencil, CheckCircle2, Circle, Clock,
  AlertCircle, Calendar, User, ChevronDown, ChevronUp,
  Flag, Timer, GripVertical, X, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const PRIORITIES = ["High", "Medium", "Low"];
const STATUSES   = ["To Do", "In Progress", "Done"];

const PRIORITY_CFG = {
  High:   { color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-900/20',     border: 'border-red-200 dark:border-red-800/40',     dot: 'bg-red-500'   },
  Medium: { color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800/40', dot: 'bg-amber-500' },
  Low:    { color: 'text-gray-400',  bg: 'bg-gray-100 dark:bg-white/[0.06]', border: 'border-gray-200 dark:border-white/[0.09]',  dot: 'bg-gray-400'  },
};

const STATUS_CFG = {
  "To Do":       { color: 'text-gray-500 dark:text-gray-400',   bg: 'bg-gray-100 dark:bg-white/[0.06]',    border: 'border-gray-200 dark:border-white/[0.09]'  },
  "In Progress": { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800/40' },
  "Done":        { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/40' },
};

const fmtD = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

// ── Inline Task Form ──────────────────────────────────────────────────────────
function TaskForm({ task, projectId, onSuccess, onCancel }) {
  const [title,          setTitle]          = useState(task?.title          || '');
  const [description,    setDescription]    = useState(task?.description    || '');
  const [priority,       setPriority]       = useState(task?.priority       || 'Medium');
  const [status,         setStatus]         = useState(task?.status         || 'To Do');
  const [assignedTo,     setAssignedTo]     = useState(task?.assignedTo     || '');
  const [dueDate,        setDueDate]        = useState(task?.dueDate ? task.dueDate.substring(0,10) : '');
  const [estimatedHours, setEstimatedHours] = useState(task?.estimatedHours || '');
  const [loading,        setLoading]        = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    setLoading(true);
    try {
      const payload = {
        title, description, priority, status, assignedTo,
        dueDate:        dueDate        || undefined,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
      };
      if (task) { await tasksApi.update(task._id, payload); toast.success('Task updated!'); }
      else       { await tasksApi.create({ ...payload, project: projectId }); toast.success('Task created!'); }
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const inputCls = "w-full px-3 py-2 rounded-xl text-[13px] font-medium bg-gray-50 dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 transition-colors";
  const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5";

  return (
    <form onSubmit={handleSubmit}
      className="bg-white dark:bg-[#161410] rounded-2xl border border-gray-200 dark:border-white/[0.09] shadow-card dark:shadow-card-dark p-5 space-y-4 animate-scale-in"
    >
      <div>
        <input autoFocus className={inputCls} placeholder="Task title…" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div>
        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Description (optional)…" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Priority</label>
          <select className={inputCls} value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select className={inputCls} value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Assigned To</label>
          <input className={inputCls} placeholder="Name" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Due Date</label>
          <input type="date" className={inputCls} value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Est. Hours</label>
          <input type="number" min="0" step="0.5" className={inputCls} placeholder="2.5" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl text-[13px] font-bold border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#1e1b16] text-gray-600 dark:text-gray-300 cursor-pointer transition-all hover:border-gray-300 dark:hover:border-white/20"
        >
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="px-4 py-2 rounded-xl text-[13px] font-bold cursor-pointer transition-all disabled:opacity-60"
          style={{ background: 'var(--gold, #e8b84b)', color: '#0a0a0a', border: '1.5px solid rgba(232,184,75,0.6)' }}
        >
          {loading ? 'Saving…' : task ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  );
}

// ── Task Card (list row) ──────────────────────────────────────────────────────
function TaskRow({ task, onToggle, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
  const pCfg = PRIORITY_CFG[task.priority] || PRIORITY_CFG.Medium;

  return (
    <div className={clsx(
      'rounded-2xl border transition-all',
      'bg-white dark:bg-[#1e1b16]',
      task.status === 'Done'
        ? 'border-emerald-100 dark:border-emerald-800/30 opacity-75'
        : isOverdue
          ? 'border-red-200 dark:border-red-800/40'
          : 'border-gray-200 dark:border-white/[0.09] hover:border-gray-300 dark:hover:border-white/20'
    )}>
      <div className="flex items-center gap-3 p-3.5">
        {/* Toggle */}
        <button onClick={() => onToggle(task._id)} className="flex-shrink-0 transition-transform hover:scale-110">
          {task.status === 'Done'
            ? <CheckCircle2 size={20} className="text-emerald-500"/>
            : <Circle size={20} className="text-gray-300 dark:text-gray-600 hover:text-yellow-400 transition-colors"/>
          }
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={clsx('text-sm font-semibold', task.status === 'Done' ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-white')}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={clsx('inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border', pCfg.bg, pCfg.border, pCfg.color)}>
              <span className={clsx('w-1.5 h-1.5 rounded-full', pCfg.dot)}/>{task.priority}
            </span>
            {task.status !== 'To Do' && (
              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border', STATUS_CFG[task.status]?.bg, STATUS_CFG[task.status]?.border, STATUS_CFG[task.status]?.color)}>
                {task.status}
              </span>
            )}
            {task.assignedTo && (
              <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                <User size={9}/>{task.assignedTo}
              </span>
            )}
            {task.dueDate && (
              <span className={clsx('flex items-center gap-1 text-[10px] font-medium', isOverdue ? 'text-red-500' : 'text-gray-400 dark:text-gray-500')}>
                {isOverdue && <AlertCircle size={9}/>}
                <Calendar size={9}/>{fmtD(task.dueDate)}
              </span>
            )}
            {task.estimatedHours && (
              <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                <Timer size={9}/>{task.estimatedHours}h
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {task.description && (
            <button onClick={() => setExpanded(e => !e)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all cursor-pointer">
              {expanded ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
            </button>
          )}
          <button onClick={() => onEdit(task)}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#161410] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all cursor-pointer">
            <Pencil size={12}/>
          </button>
          <button onClick={() => onDelete(task._id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#161410] text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer">
            <Trash2 size={12}/>
          </button>
        </div>
      </div>

      {/* Description */}
      {expanded && task.description && (
        <div className="px-12 pb-3.5">
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/[0.06] pt-2.5">
            {task.description}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Kanban Column ─────────────────────────────────────────────────────────────
function KanbanColumn({ status, tasks, onToggle, onEdit, onDelete, onStatusChange }) {
  const cfg = STATUS_CFG[status];
  const [draggingOver, setDraggingOver] = useState(false);

  return (
    <div
      className={clsx(
        'flex-1 min-w-0 rounded-2xl p-3 transition-all border',
        draggingOver
          ? 'border-yellow-400 dark:border-yellow-500 border-dashed bg-yellow-50/30 dark:bg-yellow-900/10'
          : 'bg-gray-50 dark:bg-[#161410] border-gray-200 dark:border-white/[0.09]'
      )}
      onDragOver={e => { e.preventDefault(); setDraggingOver(true); }}
      onDragLeave={() => setDraggingOver(false)}
      onDrop={e => {
        e.preventDefault();
        setDraggingOver(false);
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) onStatusChange(taskId, status);
      }}
    >
      {/* Column header */}
      <div className={clsx('flex items-center justify-between px-3 py-2 rounded-xl mb-3 border', cfg.bg, cfg.border)}>
        <span className={clsx('text-xs font-bold', cfg.color)}>{status}</span>
        <span className={clsx('text-xs font-black', cfg.color)}>{tasks.length}</span>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {tasks.length === 0 && (
          <div className="h-20 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/[0.09] flex items-center justify-center">
            <p className="text-xs text-gray-300 dark:text-gray-600 font-medium">Drop here</p>
          </div>
        )}
        {tasks.map(task => {
          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
          const pCfg = PRIORITY_CFG[task.priority] || PRIORITY_CFG.Medium;
          return (
            <div
              key={task._id}
              draggable
              onDragStart={e => { e.dataTransfer.setData('taskId', task._id); }}
              className={clsx(
                'bg-white dark:bg-[#1e1b16] rounded-xl border p-3 cursor-grab active:cursor-grabbing transition-all group',
                isOverdue
                  ? 'border-red-200 dark:border-red-800/40'
                  : 'border-gray-200 dark:border-white/[0.09] hover:border-gray-300 dark:hover:border-white/20'
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical size={12} className="text-gray-300 dark:text-gray-600 flex-shrink-0"/>
                  <button onClick={() => onToggle(task._id)} className="flex-shrink-0">
                    {task.status === 'Done'
                      ? <CheckCircle2 size={15} className="text-emerald-500"/>
                      : <Circle size={15} className="text-gray-300 dark:text-gray-600 hover:text-yellow-400 transition-colors"/>
                    }
                  </button>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(task)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/[0.09] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer transition-all">
                    <Pencil size={10}/>
                  </button>
                  <button onClick={() => onDelete(task._id)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/[0.09] text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-all">
                    <Trash2 size={10}/>
                  </button>
                </div>
              </div>

              <p className={clsx('text-xs font-semibold leading-snug mb-2', task.status === 'Done' ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-white')}>
                {task.title}
              </p>
              {task.description && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed mb-2 line-clamp-2">{task.description}</p>
              )}
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded-full border', pCfg.bg, pCfg.border, pCfg.color)}>
                  {task.priority}
                </span>
                <div className="flex items-center gap-2">
                  {task.assignedTo && <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-0.5"><User size={9}/>{task.assignedTo}</span>}
                  {task.dueDate && (
                    <span className={clsx('text-[10px] flex items-center gap-0.5 font-medium', isOverdue ? 'text-red-500' : 'text-gray-400 dark:text-gray-500')}>
                      {isOverdue && <AlertCircle size={9}/>}
                      <Calendar size={9}/>{fmtD(task.dueDate)}
                    </span>
                  )}
                  {task.estimatedHours && <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-0.5"><Timer size={9}/>{task.estimatedHours}h</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main TaskManager ──────────────────────────────────────────────────────────
export default function TaskManager({ projectId }) {
  const [tasks, setTasks]     = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState('list');
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask]     = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');

  const fetchTasks = async () => {
    try {
      const res = await tasksApi.getByProject(projectId);
      setTasks(res.data.data.tasks);
      setStats(res.data.data.stats);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (projectId) fetchTasks(); }, [projectId]);

  const handleToggle = async (id) => {
    try { await tasksApi.toggle(id); fetchTasks(); }
    catch { toast.error('Failed to update task'); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try { await tasksApi.update(taskId, { status: newStatus }); toast.success(`Moved to ${newStatus}`); fetchTasks(); }
    catch { toast.error('Failed to move task'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await tasksApi.delete(deleteId); toast.success('Task deleted'); setDeleteId(null); fetchTasks(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const filtered = tasks.filter(t => {
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterStatus   && t.status   !== filterStatus)   return false;
    return true;
  });

  const grouped = {};
  STATUSES.forEach(s => { grouped[s] = filtered.filter(t => t.status === s); });

  if (loading) return <div className="py-8 text-center text-sm text-gray-400">Loading tasks…</div>;

  return (
    <div className="space-y-4">

      {/* ── Progress header ── */}
      {stats && stats.total > 0 && (
        <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-5 shadow-card dark:shadow-card-dark">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Task Progress</p>
              <p className="text-xl font-black mt-0.5 text-gray-800 dark:text-white">
                {stats.done} <span className="text-gray-400 dark:text-gray-500 text-base font-normal">/ {stats.total} tasks done</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-emerald-500 dark:text-emerald-400">{stats.completionPct}%</p>
              {stats.overdue > 0 && (
                <p className="text-xs text-red-500 mt-0.5 font-semibold">⚠️ {stats.overdue} overdue</p>
              )}
            </div>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
              style={{ width: `${stats.completionPct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            {[
              { label: 'To Do',       count: stats.total - stats.done - stats.inProgress, color: 'text-gray-500 dark:text-gray-400' },
              { label: 'In Progress', count: stats.inProgress, color: 'text-yellow-500 dark:text-yellow-400' },
              { label: 'Done',        count: stats.done,       color: 'text-emerald-500 dark:text-emerald-400' },
            ].map(({ label, count, color }) => (
              <div key={label} className="border-r border-gray-200 dark:border-white/[0.06] last:border-0">
                <p className={clsx('text-lg font-black', color)}>{count}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2.5 flex-wrap">

        {/* List / Board toggle — same as leads page */}
        <div className="flex bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-xl p-0.5 gap-0.5 flex-shrink-0">
          {['list', 'kanban'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer border-none transition-all"
              style={view === v
                ? { background: 'var(--gold, #e8b84b)', color: '#0a0a0a' }
                : { background: 'transparent', color: '#6b7280' }
              }>
              {v === 'list' ? '☰ List' : '⊞ Board'}
            </button>
          ))}
        </div>

        {/* Filter selects — same as leads page */}
        <select
          className="min-w-[120px] px-3 py-2 rounded-xl text-[13px] font-medium bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] text-gray-500 dark:text-gray-300 outline-none focus:border-yellow-400 transition-colors cursor-pointer"
          value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
        >
          <option value="">All Priority</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          className="min-w-[120px] px-3 py-2 rounded-xl text-[13px] font-medium bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] text-gray-500 dark:text-gray-300 outline-none focus:border-yellow-400 transition-colors cursor-pointer"
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="flex-1"/>

        {/* Add Task — yellow bg like "Add Lead" */}
        <button
          onClick={() => setShowCreate(s => !s)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold cursor-pointer border-none transition-all"
          style={showCreate
            ? { background: 'transparent', border: '1.5px solid #d1d5db', color: '#374151' }
            : { background: 'var(--gold, #e8b84b)', color: '#0a0a0a', border: '1.5px solid rgba(232,184,75,0.6)' }
          }
        >
          {showCreate ? <><X size={13}/> Cancel</> : <><Plus size={13}/> Add Task</>}
        </button>
      </div>

      {/* ── Create form ── */}
      {showCreate && (
        <TaskForm projectId={projectId} onSuccess={() => { setShowCreate(false); fetchTasks(); }} onCancel={() => setShowCreate(false)} />
      )}

      {/* ── Edit form ── */}
      {editTask && (
        <TaskForm task={editTask} projectId={projectId} onSuccess={() => { setEditTask(null); fetchTasks(); }} onCancel={() => setEditTask(null)} />
      )}

      {/* ── Empty state ── */}
      {tasks.length === 0 && !showCreate && (
        <div className="text-center py-14 bg-gray-50 dark:bg-[#161410] rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/[0.09]">
          <CheckCircle2 size={28} className="text-gray-300 dark:text-gray-600 mx-auto mb-2"/>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No tasks yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Add tasks to track project work and progress</p>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && filtered.length > 0 && (
        <div className="space-y-2">
          {STATUSES.map(status => {
            const group = filtered.filter(t => t.status === status);
            if (group.length === 0) return null;
            const cfg = STATUS_CFG[status];
            return (
              <div key={status}>
                <div className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-xl mb-2 w-fit border', cfg.bg, cfg.border)}>
                  <span className={clsx('text-xs font-bold', cfg.color)}>{status}</span>
                  <span className={clsx('text-xs font-black', cfg.color)}>{group.length}</span>
                </div>
                <div className="space-y-2">
                  {group.map(task => (
                    <TaskRow key={task._id} task={task} onToggle={handleToggle} onEdit={setEditTask} onDelete={setDeleteId} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── KANBAN VIEW ── */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {STATUSES.map(status => (
            <KanbanColumn key={status} status={status} tasks={grouped[status] || []} onToggle={handleToggle} onEdit={setEditTask} onDelete={setDeleteId} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Task" message="Delete this task permanently?" />
    </div>
  );
}