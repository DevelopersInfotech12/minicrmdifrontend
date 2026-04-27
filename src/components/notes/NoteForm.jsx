'use client';
import { useState } from 'react';
import { notesApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { StickyNote, Sparkles } from 'lucide-react';

const QUICK_TEMPLATES = [
  { label: '📞 Call', text: 'Called the client. Discussed: \nKey points: \nNext steps: ' },
  { label: '🤝 Meeting', text: 'Meeting summary:\nAttendees: \nDiscussed: \nAction items: ' },
  { label: '📧 Email', text: 'Sent email regarding: \nClient response: \nFollow-up needed: ' },
  { label: '✅ Update', text: 'Project update:\nCompleted: \nIn progress: \nBlocked: ' },
];

export default function NoteForm({ note, projectId, onSuccess, onCancel }) {
  const [content, setContent] = useState(note?.content || '');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const charCount = content.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return toast.error('Note cannot be empty');
    setLoading(true);
    try {
      if (note) { await notesApi.update(note._id, { content }); toast.success('Note updated!'); }
      else       { await notesApi.create({ content, project: projectId }); toast.success('Note added!'); }
      onSuccess();
    } catch (err) { toast.error(err?.response?.data?.message || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Quick templates — only for new notes */}
      {!note && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
            Quick Templates
          </p>
          <div className="flex gap-2 flex-wrap">
            {QUICK_TEMPLATES.map(t => (
              <button
                key={t.label}
                type="button"
                onClick={() => setContent(t.text)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-all border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#1e1b16] text-gray-600 dark:text-gray-300 hover:border-yellow-400 dark:hover:border-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Textarea */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
          Note Content *
        </label>
        <div
          className="relative rounded-2xl overflow-hidden transition-all"
          style={{
            border: focused
              ? '1.5px solid var(--gold, #e8b84b)'
              : '1.5px solid rgb(209,213,219)',
            boxShadow: focused ? '0 0 0 3px rgba(232,184,75,0.15)' : 'none',
          }}
        >
          {/* Top accent bar when focused */}
          {focused && (
            <div
              className="h-0.5 w-full"
              style={{ background: 'linear-gradient(90deg, var(--gold-dark,#9a7020), var(--gold,#e8b84b), var(--gold-light,#f5d98b))' }}
            />
          )}

          <textarea
            autoFocus
            rows={6}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write an activity note, call summary, meeting notes…"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full px-4 py-3.5 resize-none outline-none text-[13px] leading-relaxed bg-gray-50 dark:bg-[#161410] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium"
            style={{ fontFamily: 'DM Sans, sans-serif', border: 'none' }}
          />

          {/* Bottom bar: icon + char count */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#1e1b16] border-t border-gray-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <StickyNote size={12} className="text-gray-300 dark:text-gray-600"/>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                {note ? 'Editing note' : 'New note'}
              </span>
            </div>
            <span className={`text-[11px] font-semibold ${charCount > 800 ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'}`}>
              {charCount} chars
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2.5 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all bg-white dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'var(--gold, #e8b84b)',
            color: '#0a0a0a',
            border: '1.5px solid rgba(232,184,75,0.6)',
            boxShadow: '0 2px 8px rgba(232,184,75,0.25)',
          }}
        >
          <StickyNote size={13}/>
          {loading ? 'Saving…' : note ? 'Update Note' : 'Add Note'}
        </button>
      </div>
    </form>
  );
}