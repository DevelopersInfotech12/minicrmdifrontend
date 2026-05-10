import Sidebar from '@/components/layout/Sidebar';
export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0d0c0a]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-white dark:bg-[#0d0c0a]">
        <div className="min-h-full p-6 lg:p-8 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
