'use client';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-7 animate-fade-up">
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight leading-tight text-gray-700 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1.5 font-medium text-gray-500 dark:text-[#b8a888]">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}