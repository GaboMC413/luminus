import React from 'react';

export interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
}

export const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(({
  id,
  label,
  className = '',
  error,
  helperText,
  maxLength,
  showCount = false,
  value,
  rows = 4,
  ...props
}, ref) => {
  const currentLength = typeof value === 'string' ? value.length : 0;

  const defaultStyles = `w-full p-3.5 bg-white border ${
    error
      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
      : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900'
  } rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors font-sans text-xs sm:text-sm disabled:bg-slate-50 disabled:border-slate-200/90 disabled:text-slate-600 disabled:cursor-default resize-none`;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <div className="flex justify-between items-center">
          <label
            htmlFor={id}
            className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none"
          >
            {label}
          </label>
          {showCount && maxLength && (
            <span className="text-[11px] font-medium text-slate-400 font-sans">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}
      <div className="relative w-full">
        <textarea
          id={id}
          ref={ref}
          rows={rows}
          maxLength={maxLength}
          value={value}
          {...props}
          className={`${defaultStyles} ${className}`}
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-rose-600 mt-0.5 px-0.5">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] font-medium text-slate-400 mt-0.5 px-0.5 font-sans">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

TextAreaField.displayName = 'TextAreaField';
export default TextAreaField;
