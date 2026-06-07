'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';

const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" />
      <div className={`relative w-full ${sizes[size]} max-h-[calc(100vh-40px)] flex flex-col animate-scale-in
        bg-white dark:bg-[#1e1b16] border border-gray-200 dark:border-white/10
        rounded-2xl shadow-2xl overflow-hidden`}>
        {/* Gold top strip — consistent across all modals */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#e8b84b] to-transparent flex-shrink-0" />
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.08] flex-shrink-0">
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white tracking-tight">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/[0.08]
            text-gray-500 dark:text-gray-400 hover:text-[#e8b84b] dark:hover:text-[#e8b84b]
            hover:border-[#e8b84b] border border-transparent transition-all duration-150">
            <X size={14} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
