'use client';
import { useEffect, useState } from 'react';
import { meetingsApi } from '@/lib/api';
import { Calendar, Clock, MapPin, Video, User, FolderKanban, CheckCircle2, XCircle, RotateCcw, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_CFG = {
  'Meeting':   { color:'#6366f1', bg:'rgba(99,102,241,0.10)',  border:'rgba(99,102,241,0.25)'  },
  'Call':      { color:'#10b981', bg:'rgba(16,185,129,0.10)',  border:'rgba(16,185,129,0.25)'  },
  'Follow-up': { color:'#f59e0b', bg:'rgba(245,158,11,0.10)',  border:'rgba(245,158,11,0.25)'  },
  'Demo':      { color:'#8b5cf6', bg:'rgba(139,92,246,0.10)',  border:'rgba(139,92,246,0.25)'  },
  'Review':    { color:'#3b82f6', bg:'rgba(59,130,246,0.10)',  border:'rgba(59,130,246,0.25)'  },
  'Other':     { color:'#9ca3af', bg:'rgba(156,163,175,0.10)', border:'rgba(156,163,175,0.25)' },
};

const STATUS_CFG = {
  'Scheduled':   { color:'#6366f1', bg:'rgba(99,102,241,0.1)',  label:'Scheduled',   icon: Calendar },
  'Completed':   { color:'#10b981', bg:'rgba(16,185,129,0.1)',  label:'Completed',   icon: CheckCircle2 },
  'Cancelled':   { color:'#ef4444', bg:'rgba(239,68,68,0.1)',   label:'Cancelled',   icon: XCircle },
  'Rescheduled': { color:'#f59e0b', bg:'rgba(245,158,11,0.1)',  label:'Rescheduled', icon: RotateCcw },
};

const PRIORITY_CFG = {
  High:   { color:'#ef4444' },
  Medium: { color:'#f59e0b' },
  Low:    { color:'#10b981' },
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', weekday:'short' });

function MeetingCard({ meeting }) {
  const type     = TYPE_CFG[meeting.type]     || TYPE_CFG['Other'];
  const status   = STATUS_CFG[meeting.status] || STATUS_CFG['Scheduled'];
  const priority = PRIORITY_CFG[meeting.priority];
  const StatusIcon = status.icon;

  return (
    <div className="bg-white dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-4 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-card dark:shadow-card-dark">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: type.bg, border: `1.5px solid ${type.border}` }}>
          <Calendar size={15} style={{ color: type.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[14px] font-bold text-gray-800 dark:text-white leading-snug">{meeting.title}</p>
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: status.bg, color: status.color }}>
              <StatusIcon size={10} />{status.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
              <Calendar size={11} className="text-gray-400" />{fmtDate(meeting.date)}
            </span>
            <span className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
              <Clock size={11} className="text-gray-400" />{meeting.startTime}{meeting.endTime ? ` – ${meeting.endTime}` : ''}
            </span>
            {priority && <span className="text-[11px] font-bold" style={{ color: priority.color }}>● {meeting.priority}</span>}
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: type.bg, color: type.color, border: `1px solid ${type.border}` }}>
              {meeting.type}
            </span>
          </div>
          {(meeting.location || meeting.meetingLink) && (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {meeting.location && (
                <span className="flex items-center gap-1 text-[12px] text-gray-400 dark:text-gray-500">
                  <MapPin size={11} />{meeting.location}
                </span>
              )}
              {meeting.meetingLink && (
                <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[12px] font-semibold no-underline hover:underline"
                  style={{ color:'var(--gold,#e8b84b)' }}>
                  <Video size={11} />Join Meeting
                </a>
              )}
            </div>
          )}
          {(meeting.client || meeting.project) && (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {meeting.client && (
                <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                  <User size={10} />{meeting.client.name || meeting.client}
                </span>
              )}
              {meeting.project && (
                <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                  <FolderKanban size={10} />{meeting.project.title || meeting.project}
                </span>
              )}
            </div>
          )}
          {meeting.description && (
            <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{meeting.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MeetingsList({ clientId, projectId }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);
      try {
        const res = await meetingsApi.getAll();
        let data = res.data.data?.meetings || res.data.data || [];
        if (clientId) {
          data = data.filter(m => {
            const c = m.client;
            if (!c) return false;
            return (typeof c === 'string' ? c : c._id) === clientId;
          });
        }
        if (projectId) {
          data = data.filter(m => {
            const p = m.project;
            if (!p) return false;
            return (typeof p === 'string' ? p : p._id) === projectId;
          });
        }
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMeetings(data);
      } catch { toast.error('Failed to load meetings'); }
      finally { setLoading(false); }
    };
    fetchMeetings();
  }, [clientId, projectId]);

  const now = new Date();
  const filtered = meetings.filter(m => {
    if (filter === 'upcoming')  return ['Scheduled','Rescheduled'].includes(m.status) && new Date(m.date) >= now;
    if (filter === 'completed') return m.status === 'Completed';
    return true;
  });

  const counts = {
    all:       meetings.length,
    upcoming:  meetings.filter(m => ['Scheduled','Rescheduled'].includes(m.status) && new Date(m.date) >= now).length,
    completed: meetings.filter(m => m.status === 'Completed').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Meetings</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        <a href="/calendar"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold no-underline transition-all border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#1e1b16] text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20">
          <Plus size={13} />Book Meeting
        </a>
      </div>

      {meetings.length > 0 && (
        <div className="flex gap-1.5 mb-4">
          {[
            { key:'all',       label:`All (${counts.all})` },
            { key:'upcoming',  label:`Upcoming (${counts.upcoming})` },
            { key:'completed', label:`Completed (${counts.completed})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer border transition-all"
              style={filter === f.key
                ? { background:'var(--gold,#e8b84b)', color:'#0a0a0a', borderColor:'transparent' }
                : { background:'transparent', color:'#6b7280', borderColor:'#e5e7eb' }
              }>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center bg-gray-50 dark:bg-[#161410] border-2 border-dashed border-gray-200 dark:border-white/[0.09] rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] flex items-center justify-center mb-3">
            <Calendar size={22} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {filter === 'all' ? 'No meetings yet' : `No ${filter} meetings`}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Book a meeting from the Calendar page</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(m => <MeetingCard key={m._id} meeting={m} />)}
        </div>
      )}
    </div>
  );
}
