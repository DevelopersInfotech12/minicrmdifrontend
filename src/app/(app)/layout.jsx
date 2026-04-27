'use client';
import Sidebar from '@/components/layout/Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'var(--bg-base)' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ background:'var(--bg-base)' }}>
        <div style={{ minHeight:'100%', padding:'24px 32px', maxWidth:1400, margin:'0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
