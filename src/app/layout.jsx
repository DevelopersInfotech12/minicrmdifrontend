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
      <body style={{ margin:0, padding:0, background:'var(--bg-base)' }}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background:'var(--bg-elevated)', color:'var(--text-primary)',
                border:'1px solid var(--border-strong)', borderRadius:14,
                fontSize:13, fontFamily:'Inter, system-ui, sans-serif',
                boxShadow:'var(--shadow-lg)', padding:'12px 16px',
              },
              success:{ iconTheme:{ primary:'#e8b84b', secondary:'var(--bg-elevated)' } },
              error:  { iconTheme:{ primary:'#ef4444', secondary:'var(--bg-elevated)' } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
