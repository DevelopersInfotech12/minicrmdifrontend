'use client';
import { useEffect, useState, useCallback } from 'react';
import { meetingsApi, clientsApi, leadsApi, projectsApi } from '@/lib/api';
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, Video, User, Briefcase, UserPlus, Pencil, Trash2, CheckCircle2, XCircle, RotateCcw, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const TYPE_CFG = {
  'Meeting':   { color:'#6366f1', bg:'rgba(99,102,241,0.12)',  border:'rgba(99,102,241,0.3)'  },
  'Call':      { color:'#10b981', bg:'rgba(16,185,129,0.12)',  border:'rgba(16,185,129,0.3)'  },
  'Follow-up': { color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  border:'rgba(245,158,11,0.3)'  },
  'Demo':      { color:'#8b5cf6', bg:'rgba(139,92,246,0.12)',  border:'rgba(139,92,246,0.3)'  },
  'Review':    { color:'#3b82f6', bg:'rgba(59,130,246,0.12)',  border:'rgba(59,130,246,0.3)'  },
  'Other':     { color:'#9ca3af', bg:'rgba(156,163,175,0.12)', border:'rgba(156,163,175,0.3)' },
};

const STATUS_CFG = {
  'Scheduled':   { color:'#6366f1', label:'Scheduled'  },
  'Completed':   { color:'#10b981', label:'Completed'  },
  'Cancelled':   { color:'#ef4444', label:'Cancelled'  },
  'Rescheduled': { color:'#f59e0b', label:'Rescheduled'},
};

const PRIORITY_CFG = {
  High:   { color:'#ef4444', dot:'bg-red-500'    },
  Medium: { color:'#f59e0b', dot:'bg-amber-400'  },
  Low:    { color:'#10b981', dot:'bg-emerald-500'},
};

const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-[#1a1714] border border-gray-200 dark:border-white/12 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 dark:focus:border-gold-400 focus:ring-2 focus:ring-indigo-500/15 transition-all";
const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#c8b896] mb-1.5";
const selectCls = `${inputCls} cursor-pointer`;

function MeetingForm({ meeting, onSuccess, onCancel, clients, leads, projects }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    title:       meeting?.title       || '',
    description: meeting?.description || '',
    date:        meeting?.date ? new Date(meeting.date).toISOString().split('T')[0] : today,
    startTime:   meeting?.startTime   || '10:00',
    endTime:     meeting?.endTime     || '11:00',
    type:        meeting?.type        || 'Meeting',
    status:      meeting?.status      || 'Scheduled',
    priority:    meeting?.priority    || 'Medium',
    location:    meeting?.location    || '',
    meetingLink: meeting?.meetingLink || '',
    client:      meeting?.client?._id || meeting?.client || '',
    lead:        meeting?.lead?._id   || meeting?.lead   || '',
    project:     meeting?.project?._id|| meeting?.project|| '',
    notes:       meeting?.notes       || '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.startTime)
      return toast.error('Title, date and start time are required');
    setLoading(true);
    try {
      const payload = { ...form, client: form.client||null, lead: form.lead||null, project: form.project||null };
      if (meeting) { await meetingsApi.update(meeting._id, payload); toast.success('Meeting updated!'); }
      else         { await meetingsApi.create(payload);              toast.success('Meeting booked!'); }
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save meeting');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className={labelCls}>Meeting Title *</label>
        <input className={inputCls} placeholder="e.g. Project kickoff call" value={form.title} onChange={e=>set('title',e.target.value)} />
      </div>

      {/* Type + Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Type</label>
          <select className={selectCls} value={form.type} onChange={e=>set('type',e.target.value)}>
            {['Meeting','Call','Follow-up','Demo','Review','Other'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Priority</label>
          <select className={selectCls} value={form.priority} onChange={e=>set('priority',e.target.value)}>
            {['Low','Medium','High'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Date + Times */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Date *</label>
          <input type="date" className={inputCls} value={form.date} onChange={e=>set('date',e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Start Time *</label>
          <input type="time" className={inputCls} value={form.startTime} onChange={e=>set('startTime',e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>End Time</label>
          <input type="time" className={inputCls} value={form.endTime} onChange={e=>set('endTime',e.target.value)} />
        </div>
      </div>

      {/* Location + Link */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Location</label>
          <input className={inputCls} placeholder="Office / Google Meet / Zoom" value={form.location} onChange={e=>set('location',e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Meeting Link</label>
          <input className={inputCls} placeholder="https://meet.google.com/..." value={form.meetingLink} onChange={e=>set('meetingLink',e.target.value)} />
        </div>
      </div>

      {/* Linked records */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Client</label>
          <select className={selectCls} value={form.client} onChange={e=>set('client',e.target.value)}>
            <option value="">None</option>
            {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Lead</label>
          <select className={selectCls} value={form.lead} onChange={e=>set('lead',e.target.value)}>
            <option value="">None</option>
            {leads.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Project</label>
          <select className={selectCls} value={form.project} onChange={e=>set('project',e.target.value)}>
            <option value="">None</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
        </div>
      </div>

      {/* Status (edit only) */}
      {meeting && (
        <div>
          <label className={labelCls}>Status</label>
          <select className={selectCls} value={form.status} onChange={e=>set('status',e.target.value)}>
            {['Scheduled','Completed','Cancelled','Rescheduled'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      )}

      {/* Description */}
      <div>
        <label className={labelCls}>Description</label>
        <textarea className={inputCls} rows={2} placeholder="Meeting agenda or details…" value={form.description} onChange={e=>set('description',e.target.value)} />
      </div>

      {/* Notes */}
      <div>
        <label className={labelCls}>Notes</label>
        <textarea className={inputCls} rows={2} placeholder="Pre-meeting notes…" value={form.notes} onChange={e=>set('notes',e.target.value)} />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-white/08 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/12 cursor-pointer hover:border-indigo-400 transition-all">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-500 hover:bg-indigo-600 text-white border-none cursor-pointer transition-all disabled:opacity-60">
          {loading ? 'Saving…' : meeting ? 'Update Meeting' : 'Book Meeting'}
        </button>
      </div>
    </form>
  );
}

function MeetingCard({ meeting, onEdit, onDelete, onStatusChange }) {
  const type = TYPE_CFG[meeting.type]     || TYPE_CFG.Other;
  const stat = STATUS_CFG[meeting.status] || STATUS_CFG.Scheduled;
  const prio = PRIORITY_CFG[meeting.priority] || PRIORITY_CFG.Medium;
  const isPast = new Date(meeting.date) < new Date() && meeting.status === 'Scheduled';

  return (
    <div className={`rounded-xl p-4 border transition-all ${isPast ? 'border-amber-300/40 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/05' : 'border-gray-200 dark:border-white/08 bg-white dark:bg-[#161410]'}`}>
      <div className="flex items-start gap-3">
        {/* Type color bar */}
        <div className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0" style={{ background: type.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{meeting.title}</h3>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${prio.dot}`} title={meeting.priority} />
              </div>
              {/* Time + location */}
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <Clock size={11} />
                  {meeting.startTime}{meeting.endTime ? ` – ${meeting.endTime}` : ''}
                </span>
                {meeting.location && (
                  <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 truncate max-w-[150px]">
                    <MapPin size={11} />{meeting.location}
                  </span>
                )}
                {meeting.meetingLink && (
                  <a href={meeting.meetingLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-indigo-500 font-medium hover:underline">
                    <Video size={11} />Join
                  </a>
                )}
              </div>
              {/* Linked items */}
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {meeting.client && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                    <User size={10} />{meeting.client.name}
                  </span>
                )}
                {meeting.lead && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                    <UserPlus size={10} />{meeting.lead.name}
                  </span>
                )}
                {meeting.project && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                    <Briefcase size={10} />{meeting.project.title}
                  </span>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {/* Status badge */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                style={{ color: stat.color, background:`${stat.color}12`, borderColor:`${stat.color}30` }}>
                {stat.label}
              </span>
              {/* Type badge */}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ color: type.color, background: type.bg }}>
                {meeting.type}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-white/06">
            {meeting.status === 'Scheduled' && (
              <>
                <button onClick={() => onStatusChange(meeting._id, 'Completed')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/12 px-2.5 py-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all cursor-pointer border-none">
                  <CheckCircle2 size={11} />Done
                </button>
                <button onClick={() => onStatusChange(meeting._id, 'Cancelled')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 dark:bg-red-500/12 px-2.5 py-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-all cursor-pointer border-none">
                  <XCircle size={11} />Cancel
                </button>
                <button onClick={() => onStatusChange(meeting._id, 'Rescheduled')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/12 px-2.5 py-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all cursor-pointer border-none">
                  <RotateCcw size={11} />Reschedule
                </button>
              </>
            )}
            <div className="flex items-center gap-1.5 ml-auto">
              <button onClick={() => onEdit(meeting)}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/08 text-gray-500 dark:text-gray-400 hover:text-indigo-500 cursor-pointer border-none transition-all">
                <Pencil size={12} />
              </button>
              <button onClick={() => onDelete(meeting._id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/08 text-red-400 hover:text-red-500 cursor-pointer border-none transition-all">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const today    = new Date();
  const [view,   setView]   = useState('month'); // month | list
  const [current, setCurrent] = useState({ month: today.getMonth(), year: today.getFullYear() });
  const [selectedDate, setSelectedDate] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [todayMeetings, setTodayMeetings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMeeting, setEditMeeting] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [clients,  setClients]  = useState([]);
  const [leads,    setLeads]    = useState([]);
  const [projects, setProjects] = useState([]);

  // Fetch support data once
  useEffect(() => {
    Promise.all([
      clientsApi.getAll({ limit: 100 }),
      leadsApi.getAll({ limit: 100 }),
      projectsApi.getAll({ limit: 100 }),
    ]).then(([c, l, p]) => {
      setClients(c.data.data.clients  || []);
      setLeads(l.data.data.leads      || []);
      setProjects(p.data.data.projects|| []);
    }).catch(() => {});
  }, []);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, tRes] = await Promise.all([
        meetingsApi.getAll({ month: current.month + 1, year: current.year }),
        meetingsApi.getToday(),
      ]);
      setMeetings(mRes.data.data.meetings || []);
      setTodayMeetings(tRes.data.data.meetings || []);
    } catch { toast.error('Failed to load meetings'); }
    finally { setLoading(false); }
  }, [current]);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  const handleStatusChange = async (id, status) => {
    try {
      await meetingsApi.updateStatus(id, status);
      toast.success(`Marked as ${status}`);
      fetchMeetings();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await meetingsApi.delete(deleteId); toast.success('Meeting deleted'); setDeleteId(null); fetchMeetings(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const prevMonth = () => setCurrent(c => c.month === 0 ? { month:11, year:c.year-1 } : { ...c, month:c.month-1 });
  const nextMonth = () => setCurrent(c => c.month === 11 ? { month:0, year:c.year+1 } : { ...c, month:c.month+1 });

  // Build calendar grid
  const firstDay  = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const getMeetingsForDay = (day) => {
    if (!day) return [];
    return meetings.filter(m => {
      const d = new Date(m.date);
      return d.getDate() === day && d.getMonth() === current.month && d.getFullYear() === current.year;
    });
  };

  const isToday = (day) => {
    return day === today.getDate() && current.month === today.getMonth() && current.year === today.getFullYear();
  };

  const selectedMeetings = selectedDate ? getMeetingsForDay(selectedDate) : [];

  // Stats
  const totalThisMonth = meetings.length;
  const scheduled      = meetings.filter(m => m.status === 'Scheduled').length;
  const completed      = meetings.filter(m => m.status === 'Completed').length;
  const todayCount     = todayMeetings.length;

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Schedule and manage your meetings"
        action={
          <button onClick={() => { setEditMeeting(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-500 hover:bg-indigo-600 text-white border-none cursor-pointer transition-all shadow-lg shadow-indigo-500/25">
            <Plus size={15} strokeWidth={2.5} /> Book Meeting
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        {[
          { label:'This Month',  value:totalThisMonth, color:'#6366f1', icon:Calendar },
          { label:"Today's",     value:todayCount,     color:'#10b981', icon:Clock    },
          { label:'Scheduled',   value:scheduled,      color:'#f59e0b', icon:Calendar },
          { label:'Completed',   value:completed,      color:'#34d399', icon:CheckCircle2 },
        ].map(({ label, value, color, icon:Icon }) => (
          <div key={label} className="bg-gray-100 dark:bg-[#161410] border border-gray-200 dark:border-white/09 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
              style={{ background:`${color}15`, borderColor:`${color}25` }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <p className="font-display font-extrabold text-xl text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-500">{label} Meetings</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">

        {/* Calendar grid */}
        <div className="col-span-2 bg-gray-100 dark:bg-[#161410] border border-gray-200 dark:border-white/09 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/08">
            <h2 className="font-display font-bold text-base text-gray-900 dark:text-white">
              {MONTHS[current.month]} {current.year}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-white/08 border border-gray-200 dark:border-white/12 text-gray-500 dark:text-gray-400 cursor-pointer hover:border-indigo-400 transition-all">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setCurrent({ month: today.getMonth(), year: today.getFullYear() })}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-white/08 border border-gray-200 dark:border-white/12 text-gray-600 dark:text-gray-300 cursor-pointer hover:border-indigo-400 transition-all">
                Today
              </button>
              <button onClick={nextMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-white/08 border border-gray-200 dark:border-white/12 text-gray-500 dark:text-gray-400 cursor-pointer hover:border-indigo-400 transition-all">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-white/08">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              const dayMeetings = getMeetingsForDay(day);
              const selected    = selectedDate === day;
              const todayCell   = isToday(day);
              return (
                <div key={idx}
                  onClick={() => day && setSelectedDate(selected ? null : day)}
                  className={`min-h-[80px] p-1.5 border-b border-r border-gray-200 dark:border-white/06 transition-all
                    ${day ? 'cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-500/05' : ''}
                    ${selected ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''}
                  `}>
                  {day && (
                    <>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 mx-auto
                        ${todayCell ? 'bg-indigo-500 text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayMeetings.slice(0,3).map(m => {
                          const t = TYPE_CFG[m.type] || TYPE_CFG.Other;
                          return (
                            <div key={m._id} className="truncate text-[10px] font-semibold px-1.5 py-0.5 rounded"
                              style={{ background: t.bg, color: t.color }}>
                              {m.startTime} {m.title}
                            </div>
                          );
                        })}
                        {dayMeetings.length > 3 && (
                          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-600 pl-1">
                            +{dayMeetings.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Today's meetings */}
          <div className="bg-gray-100 dark:bg-[#161410] border border-gray-200 dark:border-white/09 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-white/08 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white">
                {selectedDate
                  ? `${MONTHS[current.month]} ${selectedDate}`
                  : "Today's Schedule"}
              </h3>
              <span className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/12 px-2 py-0.5 rounded-full">
                {selectedDate ? selectedMeetings.length : todayCount} meetings
              </span>
            </div>
            <div className="p-3 space-y-2 max-h-[320px] overflow-y-auto">
              {(selectedDate ? selectedMeetings : todayMeetings).length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar size={28} className="mx-auto text-gray-300 dark:text-gray-700 mb-2" />
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-600">No meetings {selectedDate ? 'this day' : 'today'}</p>
                  <button onClick={() => setShowForm(true)}
                    className="mt-2 text-xs font-semibold text-indigo-500 hover:underline cursor-pointer bg-transparent border-none">
                    Book one →
                  </button>
                </div>
              ) : (
                (selectedDate ? selectedMeetings : todayMeetings).map(m => {
                  const t    = TYPE_CFG[m.type]     || TYPE_CFG.Other;
                  const stat = STATUS_CFG[m.status] || STATUS_CFG.Scheduled;
                  return (
                    <div key={m._id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#1e1b16] border border-gray-100 dark:border-white/06">
                      <div className="w-1 h-full min-h-[36px] rounded-full flex-shrink-0" style={{ background: t.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{m.title}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-0.5">{m.startTime}{m.endTime?` – ${m.endTime}`:''}</p>
                        {m.client && <p className="text-[10px] text-gray-400 mt-0.5">{m.client.name}</p>}
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ color: stat.color, background:`${stat.color}15` }}>
                        {stat.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming */}
          <div className="bg-gray-100 dark:bg-[#161410] border border-gray-200 dark:border-white/09 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-white/08">
              <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white">All This Month</h3>
            </div>
            <div className="p-3 space-y-2 max-h-[280px] overflow-y-auto">
              {meetings.filter(m => m.status === 'Scheduled').slice(0,8).map(m => {
                const t = TYPE_CFG[m.type] || TYPE_CFG.Other;
                const d = new Date(m.date);
                return (
                  <div key={m._id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#1e1b16] border border-gray-100 dark:border-white/06 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all"
                    onClick={() => { setSelectedDate(d.getDate()); setCurrent({ month: d.getMonth(), year: d.getFullYear() }); }}>
                    <div className="w-8 h-8 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
                      style={{ background: t.bg }}>
                      <span className="text-[10px] font-bold leading-none" style={{ color: t.color }}>{MONTHS[d.getMonth()].slice(0,3)}</span>
                      <span className="text-sm font-extrabold leading-none font-display" style={{ color: t.color }}>{d.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{m.title}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-600">{m.startTime} · {m.type}</p>
                    </div>
                  </div>
                );
              })}
              {meetings.filter(m => m.status === 'Scheduled').length === 0 && (
                <p className="text-xs text-center text-gray-400 py-6">No upcoming meetings</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* All meetings list */}
      {meetings.length > 0 && (
        <div className="mt-6">
          <h3 className="font-display font-bold text-base text-gray-900 dark:text-white mb-3">
            All Meetings — {MONTHS[current.month]}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {meetings.map(m => (
              <MeetingCard key={m._id} meeting={m}
                onEdit={m => { setEditMeeting(m); setShowForm(true); }}
                onDelete={setDeleteId}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Book/Edit Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditMeeting(null); }}
        title={editMeeting ? 'Edit Meeting' : 'Book Meeting'} size="lg">
        <MeetingForm
          meeting={editMeeting}
          clients={clients} leads={leads} projects={projects}
          onSuccess={() => { setShowForm(false); setEditMeeting(null); fetchMeetings(); }}
          onCancel={() => { setShowForm(false); setEditMeeting(null); }}
        />
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} loading={deleting}
        title="Delete Meeting" message="Delete this meeting permanently?" />
    </div>
  );
}
