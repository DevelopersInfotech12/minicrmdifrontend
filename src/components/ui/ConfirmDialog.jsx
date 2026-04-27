'use client';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/12 border border-red-200 dark:border-red-500/25
          flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={18} className="text-red-500" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-1">{message}</p>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-white/08
          text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/12 transition-all cursor-pointer">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600
          text-white border-none cursor-pointer transition-all disabled:opacity-50">
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}
