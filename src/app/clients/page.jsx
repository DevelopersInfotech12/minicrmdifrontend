'use client';
import { useEffect, useState, useCallback } from 'react';
import { clientsApi } from '@/lib/api';
import { Users, Plus, Search, Phone, Mail, Building2, MoreHorizontal, Pencil, Trash2, ToggleLeft, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import ClientForm from '@/components/clients/ClientForm';
import { createPortal } from 'react-dom';

// Portal dropdown to escape overflow-hidden
function ActionMenu({ client, onEdit, onToggle, onDelete, onClose }) {
  const [pos, setPos] = useState(null);
  const btnRef = useCallback(node => {
    if (node) {
      const r = node.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY + 4, right: window.innerWidth - r.right });
    }
  }, []);

  if (!pos) return <button ref={btnRef} style={{ visibility:'hidden' }} />;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        style={{ position:'absolute', top: 290, right: 30, zIndex: 50 }}
        className="w-44 bg-white dark:bg-[#1e1b16]
          border border-gray-200 dark:border-white/[0.07]
          rounded-xl shadow-lg overflow-hidden p-1 animate-scale-in"
      >
        {[
          { icon: Eye,        label: 'View Profile', href: `/clients/${client._id}`, color: 'text-gray-700 dark:text-gray-300' },
          { icon: Pencil,     label: 'Edit',         onClick: onEdit,               color: 'text-gray-700 dark:text-gray-300' },
          { icon: ToggleLeft, label: 'Status Change',onClick: onToggle,             color: 'text-gray-700 dark:text-gray-300' },
          { icon: Trash2,     label: 'Delete',       onClick: onDelete,             color: 'text-red-500' },
        ].map(({ icon: Icon, label, href, onClick, color }) =>
          href ? (
            <Link key={label} href={href} onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium no-underline hover:bg-gray-50 dark:hover:bg-white/08 transition-colors ${color}`}>
              <Icon size={13} />{label}
            </Link>
          ) : (
            <button key={label} onClick={onClick}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium bg-transparent border-none cursor-pointer hover:bg-gray-50 dark:hover:bg-white/08 transition-colors ${color}`}>
              <Icon size={13} />{label}
            </button>
          )
        )}
      </div>
    </>,
    document.body
  );
}

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
  const [openMenu, setOpenMenu] = useState(null);
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

  const handleToggle = async (id) => {
    try { await clientsApi.toggleStatus(id); toast.success('Status updated'); fetchClients(); }
    catch { toast.error('Failed'); }
    setOpenMenu(null);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`${total} client${total !== 1 ? 's' : ''} total`}
        action={
          <button onClick={() => setShowCreate(true)}
            className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm cursor-pointer">
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
              focus:outline-none focus:border-gold-500 dark:focus:border-gold-400
              focus:ring-2 focus:ring-gold-500/20 transition-all"
            placeholder="Search by name, email, phone, company…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="px-4 py-2.5 rounded-xl text-sm font-medium min-w-[140px]
            bg-white dark:bg-[#1a1714] border border-gray-200 dark:border-white/[0.07]
            text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold-500
            focus:ring-2 focus:ring-gold-500/20 transition-all cursor-pointer"
          value={filterActive} onChange={e => { setFilterActive(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          className="px-4 py-2.5 rounded-xl text-sm font-medium min-w-[160px]
            bg-white dark:bg-[#1a1714] border border-gray-200 dark:border-white/[0.07]
            text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold-500
            focus:ring-2 focus:ring-gold-500/20 transition-all cursor-pointer"
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
            text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold-500
            focus:ring-2 focus:ring-gold-500/20 transition-all cursor-pointer"
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
            text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold-500
            focus:ring-2 focus:ring-gold-500/20 transition-all cursor-pointer"
          value={filterRecurring} onChange={e => { setFilterRecurring(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="true">🔄 Recurring</option>
          <option value="false">One-time</option>
        </select>
      </div>

      {/* Table — no overflow-hidden so portal dropdown isn't clipped */}
      <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.06] rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
        {loading ? <TableSkeleton rows={6} /> : clients.length === 0 ? (
          <EmptyState icon={Users} title="No clients found" description="Add your first client to get started."
            action={<button onClick={() => setShowCreate(true)} className="btn-gold inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer"><Plus size={14} />Add Client</button>}
          />
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#0f0e0c] border-b border-gray-300 dark:border-white/[0.06]">
                  {['Client', 'Contact', 'Company', 'Revenue', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 dark:text-white uppercase tracking-widest font-sans">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                {clients.map(client => (
                  <tr key={client._id} className="hover:bg-gray-50 dark:hover:bg-[#1e1b16] transition-colors group">
                    <td className="px-5 py-4">
                      <Link href={`/clients/${client._id}`} className="flex items-center gap-3 no-underline">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-sm text-[#0a0a0a]"
                          style={{ background: 'linear-gradient(135deg,#e8b84b,#9a7020)' }}>
                          {client.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-gray-700 dark:text-white leading-none">{client.name}</p>
                          <p className="text-xs text-gray-500 font-semibold dark:text-gray-500 mt-1">{new Date(client.createdAt).toLocaleDateString()}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 dark:text-gray-300 no-underline hover:text-gold-600">
                          <Mail size={11} className="text-gray-400" />{client.email}
                        </a>
                        <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 dark:text-gray-300 no-underline hover:text-gold-600">
                          <Phone size={11} className="text-gray-400" />{client.phone}
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {client.company
                        ? <span className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 dark:text-gray-300"><Building2 size={12} className="text-gray-400" />{client.company}</span>
                        : <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      {client.totalBudget > 0 ? (
                        <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{Number(client.totalBudget).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={client.isActive} /></td>
                    <td className="px-5 py-4">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenMenu(openMenu === client._id ? null : client._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center
                            bg-gray-100 dark:bg-white/[0.06]
                            border border-gray-200 dark:border-white/[0.07]
                            text-gray-500 dark:text-gray-400 cursor-pointer hover:border-gold-400 transition-all"
                        >
                          <MoreHorizontal size={14} />
                        </button>

                        {openMenu === client._id && (
                          <ActionMenu
                            client={client}
                            onClose={() => setOpenMenu(null)}
                            onEdit={() => { setEditClient(client); setOpenMenu(null); }}
                            onToggle={() => handleToggle(client._id)}
                            onDelete={() => { setDeleteId(client._id); setOpenMenu(null); }}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-200 dark:border-white/[0.06]">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400
                    border border-gray-200 dark:border-white/[0.07] cursor-pointer disabled:opacity-40 hover:border-gold-400 transition-all">Previous</button>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400
                    border border-gray-200 dark:border-white/[0.07] cursor-pointer disabled:opacity-40 hover:border-gold-400 transition-all">Next</button>
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