import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'slate' | 'small' | 'back' | 'secondary';
  children?: React.ReactNode;
}

// --- STANDARD BUTTON COMPONENT ---
// Used for general actions, forms, and primary/secondary navigation buttons.
export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  // Base styles for standard buttons
  const baseStyles = "transition-all outline-none flex items-center justify-center font-jakarta duration-300 ease-out active:scale-95 cursor-pointer select-none disabled:bg-slate-200 disabled:text-slate-400 disabled:border-transparent disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:bg-slate-200 disabled:hover:text-slate-400";

  const variants = {
    primary: "w-full h-11 md:h-12 px-5 sm:px-6 rounded-xl text-button font-medium bg-black text-white hover:bg-zinc-900",
    outline: "w-full h-11 md:h-12 px-5 sm:px-6 rounded-xl text-button font-medium bg-white text-secondary border border-slate-200 hover:bg-slate-50",
    secondary: "w-full h-11 md:h-12 px-5 sm:px-6 rounded-xl text-button font-medium bg-slate-50 text-secondary border border-slate-200 hover:bg-slate-100",
    slate: "h-9 px-4 rounded-lg text-button font-medium bg-slate-400 text-white hover:bg-slate-500 gap-2",
    small: "h-8 md:h-9 px-4 rounded-lg text-label font-semibold bg-slate-100 text-secondary border border-slate-200 hover:bg-slate-200",
    back: "flex items-center gap-1.5 group w-fit !bg-transparent !border-none !p-0"
  };

  if (variant === 'back') {
    return (
      <button className={`${variants.back} ${className}`} {...props}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-slate-400 group-hover:text-slate-900 transition-colors"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span className="text-slate-400 text-[14px] font-bold group-hover:text-slate-900 transition-colors">
          {children || 'Volver'}
        </span>
      </button>
    );
  }

  return (
    <button className={`${baseStyles} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
    </button>
  );
}

interface ProfileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  label?: string;
  showDot?: boolean;
}

// --- PROFILE/ACTION BUTTON COMPONENT ---
// Used for edit actions, section triggers, and icon-based buttons with a premium aesthetic.
// Features a glassmorphism style (slate-50 background, backdrop-blur).
export const ProfileButton = React.forwardRef<HTMLButtonElement, ProfileButtonProps>(
  function ProfileButton({ icon, label, showDot, className = "", ...props }, ref) {
  if (!label && icon !== "photo_camera") {
    return (
      <button
        ref={ref}
        {...props}
        className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-black hover:bg-slate-100 transition-all duration-300 cursor-pointer shadow-none ${className}`}
      >
        {showDot && (
          <div className="w-3 h-3 rounded-full bg-[#FF4B4B] border-2 border-white shrink-0 shadow-sm" />
        )}
        <span className="material-symbols-rounded text-[18px] md:text-[22px] shrink-0">{icon}</span>
        {label && <span className="truncate">{label}</span>}
      </button>
    );
  }

  return (
    <button
      ref={ref}
      {...props}
      className={`h-10 md:h-11 ${label ? 'px-3 md:px-4 min-w-[100px] md:min-w-[120px]' : 'w-10 md:w-11'} bg-[#F8FAFC] hover:bg-black border border-slate-200 hover:border-black text-slate-700 hover:text-white rounded-lg text-[13px] md:text-[14px] font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-none ${className}`}
    >
      {showDot && (
        <div className="w-3 h-3 rounded-full bg-[#FF4B4B] border-2 border-white shrink-0 shadow-sm" />
      )}
      <span className="material-symbols-rounded text-[18px] md:text-[22px] shrink-0">{icon}</span>
      {label && <span className="truncate">{label}</span>}
    </button>
  );
  }
);

// --- EMPTY PROFILE BUTTON COMPONENT ---
// Used for empty state profile actions with a notification dot
export interface EmptyProfileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: string;
}

export function EmptyProfileButton({ label, icon, className = "", ...props }: EmptyProfileButtonProps) {
  return (
    <button
      {...props}
      className={`relative flex items-center justify-start h-7 md:h-8 px-2 bg-white hover:bg-slate-50 text-slate-400 text-[11px] md:text-[12px] font-bold rounded-lg transition-all w-fit gap-2 ${className}`}
    >
      <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 z-10 w-3 h-3 bg-[#FF4B4B] rounded-full border-2 border-white"></span>
      {icon && (
        <span className="material-symbols-rounded text-[10px] md:text-[12px] shrink-0">{icon}</span>
      )}
      {label}
    </button>
  );
}

export default Button;
