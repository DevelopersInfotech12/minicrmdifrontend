export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} style={{ minHeight: 16 }} />;
}
export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-white/06">
          <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <div className="skeleton h-3.5 w-2/5 rounded mb-1.5" />
            <div className="skeleton h-3 w-1/4 rounded" />
          </div>
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
