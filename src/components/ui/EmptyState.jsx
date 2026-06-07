import React from "react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/05
        border border-gray-200 dark:border-white/08
        flex items-center justify-center mb-4"
      >
        {React.isValidElement(Icon) ? (
          Icon
        ) : Icon ? (
          <Icon
            size={28}
            className="text-gray-400 dark:text-gray-600"
          />
        ) : null}
      </div>

      <h3 className="font-display font-bold text-base text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-500 max-w-xs leading-relaxed mb-6">
        {description}
      </p>

      {action}
    </div>
  );
}