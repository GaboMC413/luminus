import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'clean' | 'bordered';
  showPassword?: boolean;
  onTogglePassword?: () => void;
  textAlign?: 'left' | 'center' | 'right';
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(({ 
  className = '', 
  type, 
  variant = 'bordered',
  showPassword, 
  onTogglePassword,
  textAlign = 'left',
  ...props 
}, ref) => {
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const variantClass = variant === 'clean' ? 'reg-input-clean' : 'reg-input-bordered';

  return (
    <div className="relative w-full">
      <input 
        {...props}
        ref={ref}
        type={inputType}
        className={`${variantClass} ${alignmentClasses[textAlign]} ${className} ${isPassword && onTogglePassword ? 'pr-14' : ''} text-black disabled:text-slate-500 placeholder:text-slate-400`}
      />
      {isPassword && onTogglePassword && (
        <button 
          type="button"
          onClick={onTogglePassword}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            /* Open Eye - Visible state */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          ) : (
            /* Slashed Eye - Non-visible state */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          )}
        </button>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';
export default InputField;
