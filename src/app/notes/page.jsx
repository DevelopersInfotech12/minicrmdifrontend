'use client';
import { useEffect, useState, useCallback } from 'react';
import { projectsApi, notesApi } from '@/lib/api';
import { StickyNote, Plus, Pencil, Trash2, FolderKanban } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import NoteForm from '@/components/notes/NoteForm';

export default function NotesPage() {
  const [projects,        setProjects]        = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [notes,           setNotes]           = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [showCreate,      setShowCreate]      = useState(false);
  const [editNote,        setEditNote]        = useState(null);
  const [deleteId,        setDeleteId]        = useState(null);
  const [deleting,        setDeleting]        = useState(false);

  useEffect(() => {
    projectsApi.getAll({ limit:100 }).then(r => {
      setProjects(r.data.data.projects);
      if (r.data.data.projects[0]) setSelectedProject(r.data.data.projects[0]._id);
    }).catch(() => {});
  }, []);

  const fetchNotes = useCallback(async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      const res = await notesApi.getByProject(selectedProject);
      setNotes(res.data.data.notes);
    } catch { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  }, [selectedProject]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleDelete = async () => {
    setDeleting(true);
    try { await notesApi.delete(deleteId); toast.success('Note deleted'); setDeleteId(null); fetchNotes(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const currentProject = projects.find(p => p._id === selectedProject);

  return (
    <div>
      <PageHeader
        title="Activity Notes"
        subtitle="Track all project activity and communications"
        action={selectedProject && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer border-none transition-all"
            style={{ background:'var(--gold,#e8b84b)', color:'#0a0a0a', border:'1.5px solid rgba(232,184,75,0.6)' }}
          >
            <Plus size={15} strokeWidth={2.5}/> Add Note
          </button>
        )}
      />

      {/* ── Project selector ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background:'rgba(232,184,75,0.12)', border:'1.5px solid rgba(232,184,75,0.3)' }}>
          <FolderKanban size={16} color="var(--gold,#e8b84b)"/>
        </div>
        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-xl text-[13px] font-medium bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] text-gray-700 dark:text-gray-200 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 transition-colors cursor-pointer"
        >
          <option value="">Select a project…</option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>
              {p.title}{p.client ? ` — ${p.client.name}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* ── No project selected ── */}
      {!selectedProject ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-[#161410] border-2 border-dashed border-gray-200 dark:border-white/[0.09] rounded-2xl">
          <StickyNote size={28} className="text-gray-300 dark:text-gray-600 mx-auto mb-3"/>
          <p className="font-display font-bold text-[15px] text-gray-700 dark:text-gray-200 mb-1">Select a project</p>
          <p className="text-[13px] text-gray-400 dark:text-gray-500">Choose a project above to view and manage its notes.</p>
        </div>
      ) : (

        /* ── Notes panel ── */
        <div className="bg-gray-50 dark:bg-[#161410] border border-gray-200 dark:border-white/[0.09] rounded-2xl overflow-hidden shadow-card dark:shadow-card-dark">

          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/[0.06]">
            <div>
              <p className="font-display font-bold text-[16px] text-gray-900 dark:text-white m-0">{currentProject?.title}</p>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5 m-0">
                {notes.length} note{notes.length !== 1 ? 's' : ''}
              </p>
            </div>
            {currentProject && (
              <Link
                href={`/projects/${currentProject._id}`}
                className="text-[13px] font-semibold no-underline flex items-center gap-1 transition-colors"
                style={{ color:'var(--gold,#e8b84b)' }}
              >
                View Project →
              </Link>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="p-5 flex flex-col gap-3">
              {Array.from({length:3}).map((_,i) => (
                <div key={i} className="flex gap-3">
                  <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0"/>
                  <div className="flex-1">
                    <div className="skeleton h-3.5 w-4/5 rounded mb-2"/>
                    <div className="skeleton h-3.5 w-3/5 rounded mb-2"/>
                    <div className="skeleton h-2.5 w-1/4 rounded"/>
                  </div>
                </div>
              ))}
            </div>

          /* Empty */
          ) : notes.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-13 h-13 rounded-2xl bg-gray-100 dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] flex items-center justify-center mx-auto mb-3"
                style={{ width:52, height:52 }}>
                <StickyNote size={22} className="text-gray-300 dark:text-gray-600"/>
              </div>
              <p className="font-display font-bold text-[15px] text-gray-700 dark:text-gray-200 mb-1">No notes yet</p>
              <p className="text-[13px] text-gray-400 dark:text-gray-500 mb-5">Add the first note to this project.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer border-none transition-all"
                style={{ background:'var(--gold,#e8b84b)', color:'#0a0a0a' }}
              >
                <Plus size={14}/> Add Note
              </button>
            </div>

          /* Notes list */
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
              {notes.map(note => (
                <div
                  key={note._id}
                  className="flex items-start gap-3.5 px-5 py-4 hover:bg-white dark:hover:bg-[#1e1b16] transition-colors group"
                >
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background:'rgba(232,184,75,0.1)', border:'1.5px solid rgba(232,184,75,0.25)' }}>
                    <StickyNote size={15} color="var(--gold,#e8b84b)"/>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-gray-700 dark:text-gray-200 leading-relaxed m-0">{note.content}</p>
                    <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1.5">
                      {new Date(note.createdAt).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' })}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditNote(note)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#161410] text-gray-400 hover:text-yellow-500 hover:border-yellow-400 dark:hover:border-yellow-500 transition-all cursor-pointer"
                    >
                      <Pencil size={13}/>
                    </button>
                    <button
                      onClick={() => setDeleteId(note._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#161410] text-red-400 hover:text-red-600 hover:border-red-300 dark:hover:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
                    >
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Note">
        <NoteForm projectId={selectedProject} onSuccess={() => { setShowCreate(false); fetchNotes(); }} onCancel={() => setShowCreate(false)}/>
      </Modal>
      <Modal open={!!editNote} onClose={() => setEditNote(null)} title="Edit Note">
        <NoteForm note={editNote} projectId={selectedProject} onSuccess={() => { setEditNote(null); fetchNotes(); }} onCancel={() => setEditNote(null)}/>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Note" message="Delete this note permanently?"/>
    </div>
  );
}