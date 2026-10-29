import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'slate' | 'small' | 'back' | 'secondary' | 'soft' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

// --- STANDARD BUTTON COMPONENT ---
// Used for general actions, forms, and primary/secondary navigation buttons.
export function Button({ variant = 'primary', size, children, className = '', ...props }: ButtonProps) {
  // Base styles for standard buttons
  const baseStyles = "transition-all outline-none flex items-center justify-center font-jakarta duration-200 ease-out active:scale-[0.99] cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

  const sizeOverrides = {
    sm: "!h-9 !px-3.5 !text-xs sm:!text-sm",
    md: "!h-10 !px-4 !text-xs sm:!text-sm",
    lg: "!h-11 !px-5 !text-sm",
  };

  const variants = {
    primary: "w-full h-11 px-5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-black shadow-none border-none",
    outline: "w-full h-11 px-5 rounded-xl text-sm font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-none",
    secondary: "w-full h-11 px-5 rounded-xl text-sm font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-none",
    soft: "h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/60 shadow-none",
    ghost: "h-10 px-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-none shadow-none",
    danger: "w-full h-11 px-5 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-none border-none",
    slate: "h-9 px-4 rounded-lg text-sm font-medium bg-slate-400 text-white hover:bg-slate-500 gap-2 shadow-none border-none",
    small: "h-8 md:h-9 px-4 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 shadow-none",
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
        <span className="text-slate-400 text-sm font-bold group-hover:text-slate-900 transition-colors font-jakarta">
          {children || 'Volver'}
        </span>
      </button>
    );
  }

  const sizeClass = size ? sizeOverrides[size] : "";

  return (
    <button className={`${baseStyles} ${variants[variant as keyof typeof variants]} ${sizeClass} ${className}`} {...props}>
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
export const ProfileButton = React.forwardRef<HTMLButtonElement, ProfileButtonProps>(
  function ProfileButton({ icon, label, showDot, className = "", ...props }, ref) {
    if (!label && icon !== "photo_camera") {
      return (
        <button
          ref={ref}
          {...props}
          className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-black hover:bg-slate-100 transition-all duration-200 cursor-pointer shadow-none ${className}`}
        >
          {showDot && (
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white shrink-0" />
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
        className={`h-10 md:h-11 ${label ? 'px-3 md:px-4 min-w-[100px] md:min-w-[120px]' : 'w-10 md:w-11'} bg-slate-50/80 hover:bg-black border border-slate-200 hover:border-black text-slate-700 hover:text-white rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-none ${className}`}
      >
        {showDot && (
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white shrink-0" />
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
      className={`group relative flex items-center justify-between w-full p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all duration-200 cursor-pointer shadow-none ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 transition-colors">
          <span className="material-symbols-rounded text-[20px]">{icon || "add"}</span>
        </div>
        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors font-jakarta">
          {label}
        </span>
      </div>
      <span className="material-symbols-rounded text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all text-[20px]">
        chevron_right
      </span>
    </button>
  );
}

// --- SQUARE ICON BUTTON COMPONENT ---
// Used for compact, icon-only square actions (e.g. mobile headers and toolbars)
export interface SquareButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  variant?: 'outline' | 'secondary' | 'primary';
}

export const SquareButton = React.forwardRef<HTMLButtonElement, SquareButtonProps>(
  function SquareButton({ icon, variant = 'outline', className = '', ...props }, ref) {
    const variants = {
      outline: "bg-white text-slate-500 hover:text-slate-800 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-none",
      secondary: "bg-slate-100 text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-200 shadow-none",
      primary: "bg-slate-900 text-white hover:bg-black border-transparent shadow-none",
    };

    return (
      <button
        ref={ref}
        {...props}
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-all duration-200 active:scale-[0.98] cursor-pointer select-none outline-none ${variants[variant]} ${className}`}
      >
        <span className="material-symbols-outlined text-[20px] select-none leading-none flex items-center justify-center">{icon}</span>
      </button>
    );
  }
);

export default Button;
