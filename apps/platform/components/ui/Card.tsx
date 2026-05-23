import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "flat" | "elevated" | "glass" | "outline";
  interactive?: boolean;
  hoverScale?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "elevated",
  interactive = false,
  hoverScale = false,
  className = "",
  ...props
}) => {
  const baseStyles = "rounded-3xl transition-premium overflow-hidden";
  
  const variants = {
    flat: "bg-wellness-sand-50/50 border border-wellness-sand-100",
    elevated: "bg-white border border-wellness-sand-100 shadow-premium",
    glass: "bg-glass",
    outline: "bg-transparent border-2 border-wellness-sand-100"
  };

  const interactiveStyles = interactive
    ? "cursor-pointer hover:shadow-premium-hover hover:border-wellness-sage-200"
    : "";

  const scaleStyles = hoverScale && interactive ? "hover:-translate-y-1 hover:scale-[1.01]" : "";

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${interactiveStyles} ${scaleStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
