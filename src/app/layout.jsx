import './globals.css';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from '@/components/layout/ThemeProvider';

export const metadata = {
  title: 'MiniCRM — Agency Suite',
  description: 'Professional agency management platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('crm-theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark');}catch(e){document.documentElement.classList.add('dark');}})();` }} />
      </head>
      <body className="bg-white dark:bg-[#0d0c0a] text-gray-900 dark:text-white">
        <ThemeProvider>
          {children}
          <Toaster position="top-right" toastOptions={{
            duration: 3500,
            className: '!bg-white dark:!bg-[#1e1b16] !text-gray-900 dark:!text-white !border !border-gray-200 dark:!border-white/12 !rounded-2xl !text-sm !shadow-lg',
            success: { iconTheme: { primary:'#e8b84b', secondary:'#fff' } },
            error:   { iconTheme: { primary:'#ef4444', secondary:'#fff' } },
          }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
