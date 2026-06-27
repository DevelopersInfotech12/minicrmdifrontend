'use client';
import { useEffect, useState, useCallback } from 'react';
import { clientsApi } from '@/lib/api';
import { Users, Plus, Search, Phone, Mail, Building2, Pencil, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import ClientForm from '@/components/clients/ClientForm';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive,    setFilterActive]    = useState('');
  const [filterService,   setFilterService]   = useState('');
  const [filterPriority,  setFilterPriority]  = useState('');
  const [filterRecurring, setFilterRecurring] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 10;

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clientsApi.getAll({
        page, limit,
        search:      search      || undefined,
        isActive:    filterActive    || undefined,
        serviceType: filterService   || undefined,
        priority:    filterPriority  || undefined,
        isRecurring: filterRecurring || undefined,
      });
      setClients(res.data.data.clients);
      setTotal(res.data.data.pagination.total);
    } catch { toast.error('Failed to load clients'); }
    finally { setLoading(false); }
  }, [page, search, filterActive, filterService, filterPriority, filterRecurring]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const handleDelete = async () => {
    setDeleting(true);
    try { await clientsApi.delete(deleteId); toast.success('Client deleted'); setDeleteId(null); fetchClients(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`${total} client${total !== 1 ? 's' : ''} total`}
        action={
          <button onClick={() => setShowCreate(true)}
            className="dark:bg-[#e8b84b] bg-indigo-500 dark:text-black text-white font-semibold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm cursor-pointer">
            <Plus size={15} strokeWidth={2.5} /> Add Client
          </button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium
              bg-white dark:bg-[#1a1714] border border-gray-200 dark:border-white/[0.07]
              text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400
              focus:outline-none focus:border-[#e8b84b] dark:focus:border-[#e8b84b]
              focus:ring-2 focus:ring-[#e8b84b]/20 transition-all"
            placeholder="Search by name, email, phone, company…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="px-4 py-2.5 rounded-xl text-sm font-medium min-w-[140px]
            bg-white dark:bg-[#1a1714] border border-gray-200 dark:border-white/[0.07]
            text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#e8b84b]
            focus:ring-2 focus:ring-[#e8b84b]/20 transition-all cursor-pointer"
          value={filterActive} onChange={e => { setFilterActive(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          className="px-4 py-2.5 rounded-xl text-sm font-medium min-w-[160px]
            bg-white dark:bg-[#1a1714] border border-gray-200 dark:border-white/[0.07]
            text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#e8b84b]
            focus:ring-2 focus:ring-[#e8b84b]/20 transition-all cursor-pointer"
          value={filterService} onChange={e => { setFilterService(e.target.value); setPage(1); }}>
          <option value="">All Services</option>
          <option value="Website Development">🌐 Website Dev</option>
          <option value="App Development">📱 App Dev</option>
          <option value="SEO">🔍 SEO</option>
          <option value="Social Media Marketing">📣 Social Media</option>
          <option value="Google Ads">🔎 Google Ads</option>
          <option value="Meta Ads">📘 Meta Ads</option>
          <option value="Branding / Design">🎨 Branding</option>
          <option value="Content Writing">✍️ Content</option>
          <option value="Other">Other</option>
        </select>
        <select
          className="px-4 py-2.5 rounded-xl text-sm font-medium min-w-[140px]
            bg-white dark:bg-[#1a1714] border border-gray-200 dark:border-white/[0.07]
            text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#e8b84b]
            focus:ring-2 focus:ring-[#e8b84b]/20 transition-all cursor-pointer"
          value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setPage(1); }}>
          <option value="">All Priority</option>
          <option value="Urgent">🔴 Urgent</option>
          <option value="Long-term">🔵 Long-term</option>
          <option value="One-time">⚪ One-time</option>
          <option value="Retainer">🟣 Retainer</option>
        </select>
        <select
          className="px-4 py-2.5 rounded-xl text-sm font-medium min-w-[130px]
            bg-white dark:bg-[#1a1714] border border-gray-200 dark:border-white/[0.07]
            text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#e8b84b]
            focus:ring-2 focus:ring-[#e8b84b]/20 transition-all cursor-pointer"
          value={filterRecurring} onChange={e => { setFilterRecurring(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="true">🔄 Recurring</option>
          <option value="false">One-time</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-100 dark:bg-[#1c1917] border border-gray-200/80 dark:border-white/[0.07] rounded-xl overflow-hidden">
        {loading ? <TableSkeleton rows={6} /> : clients.length === 0 ? (
          <EmptyState icon={Users} title="No clients found" description="Add your first client to get started."
            action={<button onClick={() => setShowCreate(true)} className=" bg-indigo-500 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer text-white font-bold"><Plus size={14} />Add Client</button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 800 }}>
                <thead>
                  <tr className="bg-gray-100 dark:bg-[#161410] border-b border-gray-100 dark:border-white/[0.05]">
                    {['Client', 'Contact', 'Company', 'Revenue', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {clients.map(client => (
                    <tr key={client._id} className="bg-gray-50 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">

                      {/* Client */}
                      <td className="px-5 py-4">
                        <Link href={`/clients/${client._id}`} className="flex items-center gap-3 no-underline">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-sm text-white"
                           style={{ background: 'linear-gradient(135deg,#6366f1,#4338ca)' }}

                            >
                            {client.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-display font-bold text-[14px] text-gray-900 dark:text-white leading-none tracking-tight">{client.name}</p>
                            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-1">{new Date(client.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                        </Link>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4" style={{ minWidth: 220 }}>
                        <div className="space-y-1">
                          <a href={`mailto:${client.email}`} className="flex items-start gap-1.5 text-[13px] font-semibold text-gray-600 dark:text-gray-300 no-underline hover:text-[#c4922a]">
                            <Mail size={11} className="text-gray-400 flex-shrink-0 mt-0.5" />
                            <span style={{ wordBreak: 'break-all' }}>{client.email}</span>
                          </a>
                          <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 dark:text-gray-300 no-underline hover:text-[#c4922a]">
                            <Phone size={11} className="text-gray-400 flex-shrink-0" />{client.phone}
                          </a>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="px-5 py-4">
                        {client.company
                          ? <span className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 dark:text-gray-300"><Building2 size={12} className="text-gray-400" />{client.company}</span>
                          : <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>

                      {/* Revenue */}
                      <td className="px-5 py-4">
                        {client.totalBudget > 0 ? (
                          <span className="font-display font-bold text-[13px] text-emerald-600 dark:text-emerald-400">
                            ₹{Number(client.totalBudget).toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={client.isActive} />
                      </td>

                      {/* Actions — inline icon buttons */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">

                          {/* View */}
                          <Link
                            href={`/clients/${client._id}`}
                            title="View Profile"
                            className="w-8 h-8 rounded-lg flex items-center justify-center no-underline
                              bg-amber-50 dark:bg-amber-500/10
                              border border-amber-200 dark:border-amber-500/20
                              text-amber-500 dark:text-amber-400
                              hover:bg-amber-100 dark:hover:bg-amber-500/20
                              transition-all"
                          >
                            <Eye size={13} />
                          </Link>

                          {/* Edit */}
                          <button
                            onClick={() => setEditClient(client)}
                            title="Edit"
                            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer
                              bg-gray-100 dark:bg-white/[0.06]
                              border border-gray-200 dark:border-white/[0.07]
                              text-gray-500 dark:text-gray-400
                              hover:border-[#e8b84b] hover:text-[#e8b84b] dark:hover:text-[#e8b84b]
                              transition-all"
                          >
                            <Pencil size={13} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteId(client._id)}
                            title="Delete"
                            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer
                              bg-red-50 dark:bg-red-500/10
                              border border-red-200 dark:border-red-500/20
                              text-red-400 dark:text-red-400
                              hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-500
                              transition-all"
                          >
                            <Trash2 size={13} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 dark:border-white/[0.05]">
                <p className="text-[12px] font-medium text-gray-400 dark:text-gray-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400
                    border border-gray-200 dark:border-white/[0.07] cursor-pointer disabled:opacity-40 hover:border-[#e8b84b] transition-all">Previous</button>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400
                    border border-gray-200 dark:border-white/[0.07] cursor-pointer disabled:opacity-40 hover:border-[#e8b84b] transition-all">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add New Client">
        <ClientForm onSuccess={() => { setShowCreate(false); fetchClients(); }} onCancel={() => setShowCreate(false)} />
      </Modal>
      <Modal open={!!editClient} onClose={() => setEditClient(null)} title="Edit Client">
        <ClientForm client={editClient} onSuccess={() => { setEditClient(null); fetchClients(); }} onCancel={() => setEditClient(null)} />
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Client" message="Are you sure? This action cannot be undone." />
    </div>
  );
}