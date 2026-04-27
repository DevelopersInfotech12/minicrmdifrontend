'use client';
import { useEffect, useState } from 'react';
import { milestoneApi } from '@/lib/api';
import { AlertCircle, Calendar, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function AlertBanner() {
  const [alerts, setAlerts]       = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    milestoneApi.getAlerts()
      .then(r => setAlerts(r.data.data))
      .catch(() => {});
  }, []);

  if (!alerts || dismissed) return null;
  if (alerts.overdueCount === 0 && alerts.upcomingCount === 0) return null;

  return (
    <div className="mb-6 space-y-2 animate-slide-up">
      {alerts.overdueCount > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={16} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800">
              🔴 {alerts.overdueCount} payment{alerts.overdueCount > 1 ? 's' : ''} overdue
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {fmt(alerts.totalMilestonePending)} total pending across all milestones
            </p>
          </div>
          <Link href="/payments" className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap">
            View <ChevronRight size={13} />
          </Link>
          <button onClick={() => setDismissed(true)} className="p-1 rounded-lg text-red-400 hover:bg-red-100 transition-all">
            <X size={14} />
          </button>
        </div>
      )}

      {alerts.upcomingCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Calendar size={16} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              🟡 {alerts.upcomingCount} payment{alerts.upcomingCount > 1 ? 's' : ''} due this week
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {alerts.upcomingMilestones?.slice(0, 3).map(m => (
                <span key={m._id} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  {m.project?.title} — {new Date(m.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              ))}
            </div>
          </div>
          <Link href="/payments" className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 whitespace-nowrap">
            View <ChevronRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}