import React from 'react';

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
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const defaultStyles = variant === 'clean' 
    ? 'reg-input-clean'
    : 'w-full h-12 px-4 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400 font-sans';

  return (
    <div className="relative w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-700 font-jakarta">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input 
          {...props}
          ref={ref}
          type={inputType}
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
              <span className="material-symbols-outlined text-[18px]">
                visibility_off
              </span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">
                visibility
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
});

InputField.displayName = 'InputField';
export default InputField;
