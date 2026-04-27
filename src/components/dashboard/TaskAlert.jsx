'use client';
import { useEffect, useState } from 'react';
import { tasksApi } from '@/lib/api';
import { CheckSquare, AlertCircle, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

export default function TaskAlert() {
  const [data, setData]           = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    tasksApi.getOverdue()
      .then(r => setData(r.data.data))
      .catch(() => {});
  }, []);

  if (!data || dismissed || data.totalOverdue === 0) return null;

  return (
    <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 mb-4 animate-slide-up">
      <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <CheckSquare size={15} className="text-orange-600"/>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-orange-800">
          ⚠️ {data.totalOverdue} task{data.totalOverdue > 1 ? 's' : ''} overdue across projects
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {data.tasks.slice(0, 3).map(t => (
            <Link key={t._id} href={`/projects/${t.project?._id}`}
              className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium hover:bg-orange-200 transition-colors">
              {t.title} — {t.project?.title}
            </Link>
          ))}
          {data.totalOverdue > 3 && <span className="text-[10px] text-orange-500 font-medium">+{data.totalOverdue - 3} more</span>}
        </div>
      </div>
      <button onClick={() => setDismissed(true)} className="p-1 rounded-lg text-orange-400 hover:bg-orange-100 transition-all flex-shrink-0">
        <X size={13}/>
      </button>
    </div>
  );
}
