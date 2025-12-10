import React from 'react';

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  subLabel?: string;
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  rows = 3, 
  subLabel,
  className = ""
}) => {
  return (
    <div className={`mb-5 ${className}`}>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
        {label}
      </label>
      {subLabel && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 italic">{subLabel}</p>
      )}
      <textarea
        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};