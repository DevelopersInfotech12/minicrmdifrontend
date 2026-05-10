'use client';
import { Banknote, Clock, Sparkles } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

export default function PayrollPage() {
  return (
    <div>
      <PageHeader title="Payroll" subtitle="Employee salary and compensation management" />
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-3xl flex items-center justify-center mx-auto"
            style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow:'0 20px 60px rgba(99,102,241,0.35)' }}>
            <Banknote size={52} color="#fff" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg">
            <Sparkles size={16} color="#fff" />
          </div>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/12 border border-indigo-200 dark:border-indigo-500/25 mb-5">
          <Clock size={13} className="text-indigo-500" />
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Coming Soon</span>
        </div>
        <h2 className="font-display font-extrabold text-3xl text-gray-900 dark:text-white tracking-tight mb-3">
          Payroll Management
        </h2>
        <p className="text-base text-gray-500 dark:text-gray-500 max-w-md leading-relaxed">
          We're building a powerful payroll system. Manage salaries, deductions, bonuses and payslips — all in one place.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-10 max-w-lg w-full">
          {['Salary Management','Tax & Deductions','Payslip Generation'].map((f, i) => (
            <div key={i} className="bg-gray-100 dark:bg-[#161410] border border-gray-200 dark:border-white/08 rounded-2xl p-4 text-center opacity-60">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/12 mx-auto mb-2 flex items-center justify-center">
                <Sparkles size={14} className="text-indigo-400" />
              </div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{f}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
