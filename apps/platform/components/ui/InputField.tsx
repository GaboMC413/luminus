import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: 'clean' | 'bordered';
  showPassword?: boolean;
  onTogglePassword?: () => void;
  textAlign?: 'left' | 'center' | 'right';
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  rightIcon?: React.ReactNode;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(({ 
  label,
  className = '', 
  type, 
  variant = 'bordered',
  showPassword, 
  onTogglePassword,
  textAlign = 'left',
  rightIcon,
  ...props 
}, ref) => {
  
  const isPassword = type === 'password';

  const defaultStyles = variant === 'bordered'
    ? 'w-full h-11 px-3.5 bg-white border border-zinc-200/90 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-sans text-xs sm:text-sm'
    : 'w-full h-11 border-b border-input-border text-base text-primary placeholder:text-placeholder focus:outline-none focus:border-primary transition-colors bg-transparent';

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-700 font-jakarta">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          ref={ref}
          type={isPassword && showPassword ? 'text' : type}
          {...props}
          className={`${defaultStyles} ${alignmentClasses[textAlign]} ${className} ${isPassword && onTogglePassword ? 'pr-11' : rightIcon ? 'pr-11' : ''} text-slate-900 disabled:text-slate-400`}
        />
        {rightIcon && !isPassword && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-slate-400">
            {rightIcon}
          </div>
        )}
        {isPassword && onTogglePassword && (
          <button 
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 bg-transparent border-none cursor-pointer flex items-center justify-center"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-slate-400" />
            ) : (
              <Eye className="w-4 h-4 text-slate-400" />
            )}
          </button>
        )}
      </div>
    </div>
  );
});

InputField.displayName = 'InputField';
export default InputField;
