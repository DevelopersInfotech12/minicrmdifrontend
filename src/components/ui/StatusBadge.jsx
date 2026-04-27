const cfg = {
  Active:      { dot:'bg-emerald-500', cls:'bg-emerald-50 dark:bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' },
  Completed:   { dot:'bg-blue-400',    cls:'bg-blue-50 dark:bg-blue-500/12 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30' },
  'On Hold':   { dot:'bg-amber-400',   cls:'bg-amber-50 dark:bg-amber-500/12 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' },
  true:        { dot:'bg-emerald-500', cls:'bg-emerald-50 dark:bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' },
  false:       { dot:'bg-gray-400',    cls:'bg-gray-100 dark:bg-white/08 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/12' },
  Paid:        { dot:'bg-emerald-500', cls:'bg-emerald-50 dark:bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' },
  Partial:     { dot:'bg-amber-400',   cls:'bg-amber-50 dark:bg-amber-500/12 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' },
  Overdue:     { dot:'bg-red-500',     cls:'bg-red-50 dark:bg-red-500/12 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30' },
  Pending:     { dot:'bg-gray-400',    cls:'bg-gray-100 dark:bg-white/08 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/12' },
};

export default function StatusBadge({ status }) {
  const c = cfg[status] || cfg.Pending;
  const label = status === true ? 'Active' : status === false ? 'Inactive' : status;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {label}
    </span>
  );
}
