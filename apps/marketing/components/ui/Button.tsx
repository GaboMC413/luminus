import React, { forwardRef } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "pink";
type ButtonSize = "default" | "sm" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  asExternal?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-black text-white shadow-bold hover:shadow-none hover:bg-luminus-orange hover:text-black hover:translate-x-0.5 hover:translate-y-0.5",
  secondary: "bg-white text-black shadow-bold-sm hover:shadow-none hover:bg-luminus-lime hover:translate-x-0.5 hover:translate-y-0.5",
  pink: "bg-white text-black shadow-bold hover:shadow-none hover:bg-luminus-pink hover:translate-x-0.5 hover:translate-y-0.5",
};

const sizes: Record<ButtonSize, string> = {
  default: "px-8 py-4 text-base",
  sm: "px-4 py-2 text-sm",
  lg: "px-10 py-5 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "default", href, asExternal, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-full border-2 border-black font-bold transition-all duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
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
