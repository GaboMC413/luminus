import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = "", id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-wellness-sage-700/80 pl-1"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 text-wellness-sage-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-white/60 hover:bg-white text-sm px-4 py-3.5 ${
              icon ? "pl-11" : "pl-4"
            } pr-4 border rounded-2xl outline-none transition-premium focus:bg-white ${
              error
                ? "border-wellness-clay-300 focus:border-wellness-clay-500 focus:ring-4 focus:ring-wellness-clay-50"
                : "border-wellness-sand-200/90 focus:border-wellness-sage-400 focus:ring-4 focus:ring-wellness-sage-50"
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-wellness-clay-600 pl-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-wellness-sage-500/80 pl-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
