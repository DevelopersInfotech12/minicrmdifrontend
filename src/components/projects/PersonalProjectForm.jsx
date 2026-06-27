'use client';
import { useState, useEffect, useRef } from 'react';
import { personalProjectsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Code2, ChevronDown, Check, Globe, Github, X } from 'lucide-react';

const PP_TYPES      = ["Website", "Web App", "Mobile App", "API / Backend", "Chrome Extension", "CLI Tool", "Other"];
const PP_STATUSES   = ["In Progress", "Completed", "On Hold", "Idea"];
const PP_VISIBILITY = ["Public", "Private", "Open Source"];

const TECH_STACKS = [
  "React", "Next.js", "Vue", "Nuxt", "Angular", "Svelte",
  "Node.js", "Express", "FastAPI", "Django", "Laravel", "Rails",
  "React Native", "Flutter", "Swift", "Kotlin",
  "MongoDB", "PostgreSQL", "MySQL", "Supabase", "Firebase",
  "TypeScript", "JavaScript", "Python", "PHP", "Go", "Rust",
  "Tailwind CSS", "Other",
];

const TECH_COLORS = {
  "React": "#61dafb", "Next.js": "#ffffff", "Vue": "#4fc08d", "Nuxt": "#00dc82",
  "Angular": "#dd0031", "Svelte": "#ff3e00", "Node.js": "#68a063", "Express": "#aaa",
  "FastAPI": "#009688", "Django": "#092e20", "Laravel": "#ff2d20", "Rails": "#cc0000",
  "React Native": "#61dafb", "Flutter": "#54c5f8", "Swift": "#f05138", "Kotlin": "#7f52ff",
  "MongoDB": "#47a248", "PostgreSQL": "#336791", "MySQL": "#4479a1", "Supabase": "#3ecf8e",
  "Firebase": "#ffca28", "TypeScript": "#3178c6", "JavaScript": "#f7df1e", "Python": "#3572a5",
  "PHP": "#777bb4", "Go": "#00add8", "Rust": "#ce422b", "Tailwind CSS": "#38bdf8", "Other": "#6b7280",
};

const STATUS_CFG = {
  "In Progress": { bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.35)", color: "#6366f1" },
  "Completed":   { bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.35)",  color: "#22c55e" },
  "On Hold":     { bg: "rgba(234,179,8,0.12)",   border: "rgba(234,179,8,0.35)",  color: "#eab308" },
  "Idea":        { bg: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.35)", color: "#a855f7" },
};

const poppins  = "'Poppins','system-ui',sans-serif";
const labelCls = "block text-[13px] text-gray-500 dark:text-gray-300 mb-1.5";
const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-[13px] font-medium bg-gray-50 dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] text-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/20 dark:focus:ring-yellow-500/20 transition-all";

function Field({ label, children, error }) {
  return (
    <div>
      <label className={labelCls} style={{ fontFamily: poppins }}>{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1.5 font-medium">{error}</p>}
    </div>
  );
}

function CustomSelect({ value, onChange, options, placeholder = 'Select…', icon: Icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const selected    = options.find(o => (o.value ?? o) === value);
  const displayLabel = selected ? (selected.label ?? selected) : null;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`${inputCls} flex items-center justify-between gap-2 text-left ${!displayLabel ? 'text-gray-400 dark:text-gray-600' : ''}`}
        style={{ paddingLeft: Icon ? '2.25rem' : undefined }}
      >
        {Icon && <Icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
        <span className="truncate flex-1">{displayLabel || placeholder}</span>
        <ChevronDown size={14} className="flex-shrink-0 text-gray-400 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl overflow-hidden shadow-lg"
          style={{ border: '1.5px solid rgba(232,184,75,0.3)', background: 'var(--dropdown-bg,#fff)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
          <div className="py-1 max-h-52 overflow-y-auto">
            {options.map((opt) => {
              const val = opt.value ?? opt; const lbl = opt.label ?? opt; const isActive = val === value;
              return (
                <button key={val} type="button" onClick={() => { onChange(val); setOpen(false); }}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-[13px] font-medium text-left transition-colors hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                  style={{ background: isActive ? 'rgba(232,184,75,0.1)' : undefined, color: isActive ? 'var(--gold,#e8b84b)' : 'inherit', fontFamily: poppins }}>
                  <span className="truncate">{lbl}</span>
                  {isActive && <Check size={13} className="flex-shrink-0" style={{ color: 'var(--gold,#e8b84b)' }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* Tech stack multi-select chips */
function TechStackPicker({ value, onChange }) {
  const [search, setSearch] = useState('');
  const filtered = TECH_STACKS.filter(t => t.toLowerCase().includes(search.toLowerCase()) && !value.includes(t));
  const toggle = (t) => onChange(value.includes(t) ? value.filter(x => x !== t) : [...value, t]);
  return (
    <div className="flex flex-col gap-2">
      {/* selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(t => (
            <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer select-none transition-all"
              style={{ background: `${TECH_COLORS[t]}22`, border: `1.5px solid ${TECH_COLORS[t]}66`, color: TECH_COLORS[t] }}
              onClick={() => toggle(t)}>
              {t} <X size={10} />
            </span>
          ))}
        </div>
      )}
      {/* search + add */}
      <input
        className={inputCls}
        placeholder="Search tech stack…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {search && filtered.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {filtered.slice(0, 12).map(t => (
            <button key={t} type="button" onClick={() => { toggle(t); setSearch(''); }}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all hover:scale-105"
              style={{ background: `${TECH_COLORS[t]}18`, border: `1.5px solid ${TECH_COLORS[t]}55`, color: TECH_COLORS[t] }}>
              + {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PersonalProjectForm({ project, onSuccess, onCancel }) {
  const [title,       setTitle]       = useState(project?.title       || '');
  const [description, setDescription] = useState(project?.description || '');
  const [type,        setType]        = useState(project?.type        || '');
  const [status,      setStatus]      = useState(project?.status      || 'In Progress');
  const [visibility,  setVisibility]  = useState(project?.visibility  || 'Private');
  const [techStack,   setTechStack]   = useState(project?.techStack   || []);
  const [liveUrl,     setLiveUrl]     = useState(project?.liveUrl     || '');
  const [repoUrl,     setRepoUrl]     = useState(project?.repoUrl     || '');
  const [startDate,   setStartDate]   = useState(project?.startDate   ? project.startDate.substring(0, 10) : '');
  const [endDate,     setEndDate]     = useState(project?.endDate     ? project.endDate.substring(0, 10)   : '');
  const [notes,       setNotes]       = useState(project?.notes       || '');
  const [assignedTo,  setAssignedTo]  = useState(project?.assignedTo?.length ? project.assignedTo : ['']);
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState({});

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = {
        title, description, type: type || undefined, status, visibility,
        techStack, liveUrl: liveUrl || undefined, repoUrl: repoUrl || undefined,
        startDate: startDate || undefined, endDate: endDate || undefined, notes: notes || undefined,
        assignedTo: assignedTo.filter(a => a.trim()),
      };
      if (project) { await personalProjectsApi.update(project._id, payload); toast.success('Project updated!'); }
      else         { await personalProjectsApi.create(payload);               toast.success('Project created!'); }
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const typeOptions       = PP_TYPES.map(t => ({ value: t, label: t }));
  const statusOptions     = PP_STATUSES.map(s => ({ value: s, label: s }));
  const visibilityOptions = PP_VISIBILITY.map(v => ({ value: v, label: v }));

  return (
    <>
      <style>{`:root{--dropdown-bg:#fff}.dark{--dropdown-bg:#1e1b16}`}</style>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Title */}
        <Field label="Project title *" error={errors.title}>
          <input autoFocus className={inputCls} placeholder="e.g. Portfolio Website, SaaS Dashboard…"
            value={title} onChange={e => setTitle(e.target.value)} />
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea className={`${inputCls} resize-none leading-relaxed`} rows={2}
            placeholder="What does this project do?" value={description}
            onChange={e => setDescription(e.target.value)} />
        </Field>

        {/* Type + Status */}
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Project type">
            <CustomSelect value={type} onChange={setType} options={typeOptions} placeholder="Select type…" />
          </Field>
          <Field label="Status">
            <CustomSelect value={status} onChange={setStatus} options={statusOptions} placeholder="Select status…" />
          </Field>
        </div>

        {/* Status visual chip */}
        {status && (() => {
          const cfg = STATUS_CFG[status];
          return (
            <div className="flex items-center gap-2 -mt-1">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                ● {status}
              </span>
            </div>
          );
        })()}

        {/* Visibility */}
        <Field label="Visibility">
          <div className="flex gap-2 flex-wrap mt-0.5">
            {PP_VISIBILITY.map(v => (
              <button key={v} type="button" onClick={() => setVisibility(v)}
                className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer transition-all"
                style={{
                  border: `1.5px solid ${visibility === v ? 'rgba(232,184,75,0.5)' : 'rgb(209,213,219)'}`,
                  background: visibility === v ? 'rgba(232,184,75,0.1)' : 'transparent',
                  color: visibility === v ? 'var(--gold,#e8b84b)' : '#6b7280',
                  boxShadow: visibility === v ? '0 0 0 2px rgba(232,184,75,0.15)' : 'none',
                }}>
                {v === 'Public' ? '🌐' : v === 'Open Source' ? '🔓' : '🔒'} {v}
              </button>
            ))}
          </div>
        </Field>

        {/* Tech Stack */}
        <Field label="Tech stack">
          <TechStackPicker value={techStack} onChange={setTechStack} />
        </Field>

        {/* URLs */}
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Live URL">
            <div className="relative">
              <Globe size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input className={`${inputCls} pl-8`} placeholder="https://myapp.com"
                value={liveUrl} onChange={e => setLiveUrl(e.target.value)} />
            </div>
          </Field>
          <Field label="Repo URL">
            <div className="relative">
              <Github size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input className={`${inputCls} pl-8`} placeholder="https://github.com/…"
                value={repoUrl} onChange={e => setRepoUrl(e.target.value)} />
            </div>
          </Field>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Start date">
            <input type="date" className={inputCls} value={startDate} onChange={e => setStartDate(e.target.value)} />
          </Field>
          <Field label="End / target date">
            <input type="date" className={inputCls} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </Field>
        </div>

        {/* Assigned To */}
        <Field label="Assigned to">
          <div className="flex flex-col gap-2">
            {assignedTo.map((name, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  className={`${inputCls} flex-1`}
                  placeholder={`Person ${idx + 1} name…`}
                  value={name}
                  onChange={e => {
                    const updated = [...assignedTo];
                    updated[idx] = e.target.value;
                    setAssignedTo(updated);
                  }}
                />
                {assignedTo.length > 1 && (
                  <button type="button" onClick={() => setAssignedTo(assignedTo.filter((_, i) => i !== idx))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-red-400 hover:text-red-600 bg-gray-50 dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] cursor-pointer transition-all">
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setAssignedTo([...assignedTo, ''])}
              className="self-start flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-all bg-gray-50 dark:bg-[#1e1b16] border border-dashed border-gray-300 dark:border-white/[0.15] text-gray-500 dark:text-gray-400 hover:border-yellow-400 dark:hover:border-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400">
              + Add another person
            </button>
          </div>
        </Field>

        {/* Notes */}
        <Field label="Notes / ideas">
          <textarea className={`${inputCls} resize-none leading-relaxed`} rows={3}
            placeholder="Features, todos, ideas for this project…" value={notes}
            onChange={e => setNotes(e.target.value)} />
        </Field>

        {/* Buttons */}
        <div className="flex gap-2.5 justify-end pt-1">
          <button type="button" onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all bg-white dark:bg-[#1e1b16] border border-gray-200 dark:border-white/[0.09] text-gray-600 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white/20">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--gold,#e8b84b)', color: '#0a0a0a', border: '1.5px solid rgba(232,184,75,0.6)', boxShadow: '0 2px 8px rgba(232,184,75,0.25)' }}>
            <Code2 size={13} />
            {loading ? 'Saving…' : project ? 'Update project' : 'Add project'}
          </button>
        </div>
      </form>
    </>
  );
}
