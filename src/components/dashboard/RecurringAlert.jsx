'use client';
import { useEffect, useState } from 'react';
import { projectsApi } from '@/lib/api';
import { RefreshCw, AlertCircle, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function RecurringAlert() {
  const [data, setData]           = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    projectsApi.getRecurringDue()
      .then(r => setData(r.data.data))
      .catch(() => {});
  }, []);

  if (!data || dismissed) return null;
  if (data.overdueCount === 0 && data.upcomingCount === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {data.overdueCount > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 animate-slide-up">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={15} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800">
              🔴 {data.overdueCount} recurring renewal{data.overdueCount > 1 ? 's' : ''} overdue
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {fmt(data.monthlyRevenue)}/mo recurring revenue — check renewal schedule
            </p>
          </div>
          <Link href="/recurring" className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap">
            View <ChevronRight size={13} />
          </Link>
          <button onClick={() => setDismissed(true)} className="p-1 rounded-lg text-red-400 hover:bg-red-100 transition-all">
            <X size={13} />
          </button>
        </div>
      )}

      {data.upcomingCount > 0 && (
        <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3 animate-slide-up">
          <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
            <RefreshCw size={15} className="text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-brand-800">
              🔄 {data.upcomingCount} renewal{data.upcomingCount > 1 ? 's' : ''} due this week
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {data.upcoming?.slice(0, 3).map(p => (
                <span key={p._id} className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                  {p.title} — {new Date(p.nextBillingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              ))}
            </div>
          </div>
          <Link href="/recurring" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 whitespace-nowrap">
            View <ChevronRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}