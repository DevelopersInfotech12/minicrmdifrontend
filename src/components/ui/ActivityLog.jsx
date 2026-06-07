'use client';
import { useEffect, useState, useCallback } from 'react';
// import { activityApi } from '@/lib/api';
import {
  Activity, FolderPlus, Pencil, Trash2, RefreshCw,
  CreditCard, CheckCircle, XCircle, UserPlus, CalendarPlus,
  ChevronDown, Loader2, Clock, AlertCircle
} from 'lucide-react';
import { activityApi } from '@/lib/api';

// ── Icon map ──────────────────────────────────────────────────────────────────
const ICON_MAP = {
  'folder-plus':   FolderPlus,
  'pencil':        Pencil,
  'trash-2':       Trash2,
  'refresh-cw':    RefreshCw,
  'credit-card':   CreditCard,
  'check-circle':  CheckCircle,
  'x-circle':      XCircle,
  'user-plus':     UserPlus,
  'calendar-plus': CalendarPlus,
  'activity':      Activity,
};

// ── Action label ──────────────────────────────────────────────────────────────
const ACTION_LABEL = {
  created:         'Created',
  updated:         'Updated',
  deleted:         'Deleted',
  status_changed:  'Status Changed',
  payment_added:   'Payment Added',
  payment_updated: 'Payment Updated',
  assigned:        'Assigned',
  completed:       'Completed',
  cancelled:       'Cancelled',
  rescheduled:     'Rescheduled',
  billed:          'Billed',
};

const ACTION_BG = {
  created:         'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40',
  updated:         'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/40',
  deleted:         'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40',
  status_changed:  'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40',
  payment_added:   'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40',
  payment_updated: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/40',
  completed:       'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40',
  cancelled:       'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40',
  rescheduled:     'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40',
  billed:          'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/40',
  assigned:        'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800/40',
};

// ── Time formatter ────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fullDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Single log item ───────────────────────────────────────────────────────────
function LogItem({ log }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ICON_MAP[log.icon] || Activity;
  const hasChanges = log.changes && log.changes.length > 0;

  return (
    <div className="relative flex gap-3 pb-5 last:pb-0 group">
      {/* Timeline line */}
      <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200 dark:bg-white/[0.06] group-last:hidden" />

      {/* Icon bubble */}
      <div
        className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-white dark:border-white/10"
        style={{ background: log.color || '#6366f1' }}
      >
        <Icon size={14} className="text-white" strokeWidth={2.5} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-medium text-gray-800 dark:text-gray-100 leading-snug">
            {log.description}
          </p>
          <span
            className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${ACTION_BG[log.action] || ACTION_BG.updated}`}
          >
            {ACTION_LABEL[log.action] || log.action}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <Clock size={11} className="text-gray-400 dark:text-gray-500" />
          <span className="text-[11px] text-gray-400 dark:text-gray-500" title={fullDate(log.createdAt)}>
            {timeAgo(log.createdAt)}
          </span>
          {log.entityType && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">
              {log.entityType}
            </span>
          )}
        </div>

        {/* Expandable changes */}
        {hasChanges && (
          <div className="mt-1.5">
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 text-[11px] text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 transition-colors"
            >
              <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
              {expanded ? 'Hide' : 'Show'} changes ({log.changes.length})
            </button>
            {expanded && (
              <div className="mt-1.5 space-y-1">
                {log.changes.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] bg-gray-50 dark:bg-white/[0.03] rounded-lg px-2.5 py-1.5 border border-gray-100 dark:border-white/[0.05]">
                    <span className="font-bold text-gray-600 dark:text-gray-300 capitalize">{c.field}:</span>
                    {c.from !== null && c.from !== '' && (
                      <>
                        <span className="line-through text-red-500 dark:text-red-400">{String(c.from)}</span>
                        <span className="text-gray-400">→</span>
                      </>
                    )}
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{String(c.to)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ActivityLog component ─────────────────────────────────────────────────
/**
 * Props:
 *   mode: "project" | "client" | "page"
 *   id:   projectId | clientId | pageName ("payment" | "calendar" | "recurring")
 *   maxHeight: css string (default "420px")
 *   compact: bool — smaller header
 */
export default function ActivityLog({ mode, id, maxHeight = '420px', compact = false, className = '' }) {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const limit = 20;

  const fetch = useCallback(async (p = 1) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      let res;
      if (mode === 'project') res = await activityApi.getByProject(id, { page: p, limit });
      else if (mode === 'client') res = await activityApi.getByClient(id, { page: p, limit });
      else if (mode === 'page') res = await activityApi.getByPage(id, { page: p, limit });
      else res = await activityApi.getAll({ page: p, limit });

      const data = res.data.data;
      setTotal(data.pagination?.total || 0);
      setLogs(prev => p === 1 ? data.logs : [...prev, ...data.logs]);
    } catch {
      setError('Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [mode, id]);

  useEffect(() => {
    setLogs([]);
    setPage(1);
    fetch(1);
  }, [fetch]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetch(next);
  };

  const hasMore = logs.length < total;

  return (
    <div className={`bg-gray-10 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark ${className}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 border-b border-gray-200 dark:border-white/[0.06] ${compact ? 'py-3' : 'py-4'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center">
            <Activity size={14} className="text-indigo-500 dark:text-indigo-400" />
          </div>
          <h3 className={`font-poppins font-bold text-gray-800 dark:text-white ${compact ? 'text-[13px]' : 'text-[14.5px]'}`}>
            Activity Log
          </h3>
          {total > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
              {total}
            </span>
          )}
        </div>
        <button
          onClick={() => { setLogs([]); setPage(1); fetch(1); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
          title="Refresh"
        >
          <RefreshCw size={13} className="text-gray-400 dark:text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto px-5 py-4" style={{ maxHeight }}>
        {loading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 size={22} className="text-indigo-400 animate-spin" />
            <p className="text-[13px] text-gray-400 dark:text-gray-500">Loading activity...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <AlertCircle size={22} className="text-red-400" />
            <p className="text-[13px] text-red-500">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Activity size={28} className="text-gray-300 dark:text-gray-600" />
            <p className="text-[13px] text-gray-400 dark:text-gray-500">No activity yet</p>
            <p className="text-[11px] text-gray-300 dark:text-gray-600">Actions you take will appear here</p>
          </div>
        ) : (
          <>
            <div className="space-y-0">
              {logs.map(log => <LogItem key={log._id} log={log} />)}
            </div>

            {hasMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/20 rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <ChevronDown size={12} />}
                  Load more ({total - logs.length} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
