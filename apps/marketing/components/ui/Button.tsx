import React, { forwardRef } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "soft" | "pink";
type ButtonSize = "default" | "sm" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  asExternal?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-black text-white border border-black rounded-full hover:bg-neutral-900 shadow-soft hover:shadow-medium hover:-translate-y-[1px] transition-all duration-200",
  secondary: "bg-white text-black border border-black rounded-full hover:bg-slate-50 hover:-translate-y-[1px] transition-all duration-200",
  soft: "bg-slate-50 text-black border border-slate-200 rounded-full hover:bg-slate-100 hover:-translate-y-[1px] transition-all duration-200",
  pink: "bg-[#FFE0FC] text-[#B832B4] border border-[#FF80FC]/30 rounded-full hover:bg-[#FF80FC]/20 hover:-translate-y-[1px] transition-all duration-200",
};

const sizes: Record<ButtonSize, string> = {
  default: "px-8 py-3.5 text-base",
  sm: "px-4 py-2 text-sm",
  lg: "px-10 py-4.5 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "default", href, asExternal, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-bold font-display transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    if (href) {
      if (asExternal || href.startsWith("http") || href.startsWith("#")) {
        return (
          <a href={href} className={classes}>
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
